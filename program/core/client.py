import time
import sys
import os
import threading
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.camera import CameraCapture
from core.websocket import WebSocketClient
from core.face_recognizer import FaceRecognizer
from core.object_detector import ObjectDetector
from utils.video import encode_frame_to_base64
from utils.draw import draw_all_boxes
from utils.ultrasound import UltrasoundPlayer
import config


class CameraStream:
    
    def __init__(self, device_id: int, camera_name: str, websocket: WebSocketClient, fps: int, quality: int):
        self.device_id = device_id
        self.camera_name = camera_name
        self.websocket = websocket
        self.fps = fps
        self.quality = quality
        self.camera = None
        self.face_recognizer = FaceRecognizer(check_interval=config.FACE_RECOGNITION_INTERVAL)
        self.object_detector = ObjectDetector(check_interval=config.OBJECT_DETECTION_INTERVAL)
        self.is_streaming = False
        self.thread = None
        self.frame_count = 0
        self.failed_frames = 0
        self.max_failed_frames = 100
        self.last_faces = []
        self.last_objects = []
        self.last_detection_time = 0
        self.fps_counter = 0
        self.fps_start_time = time.time()
        self.current_fps = 0
        self.executor = ThreadPoolExecutor(max_workers=2)
        self.ultrasound = UltrasoundPlayer(
            frequency=config.ULTRASOUND_FREQUENCY,
            duration=config.ULTRASOUND_DURATION
        ) if config.ULTRASOUND_ENABLED else None
        self.face_future = None
        self.object_future = None
    
    def start(self) -> bool:
        self.camera = CameraCapture(device_id=self.device_id, fps=self.fps)
        if not self.camera.open():
            return False
        self.is_streaming = True
        self.thread = threading.Thread(target=self._stream_loop, daemon=True)
        self.thread.start()
        return True
    
    def _stream_loop(self):
        frame_delay = 1.0 / self.fps
        skip_frames = 0
        try:
            while self.is_streaming:
                loop_start = time.time()
                
                for _ in range(skip_frames + 1):
                    ret, frame = self.camera.read()
                    if not ret:
                        break
                
                if not ret:
                    self.failed_frames += 1
                    if self.failed_frames >= self.max_failed_frames:
                        break
                    time.sleep(0.5)
                    skip_frames = 0
                    continue
                self.failed_frames = 0
                current_time = time.time()
                
                if self.face_future is None or self.face_future.done():
                    if self.face_future and self.face_future.done():
                        try:
                            faces = self.face_future.result()
                            if faces is not None:
                                if faces:
                                    self.last_faces = faces
                                    self.last_detection_time = current_time
                                elif current_time - self.last_detection_time > 3.0:
                                    self.last_faces = []
                        except:
                            pass
                    self.face_future = self.executor.submit(self.face_recognizer.recognize_faces, frame.copy())
                
                if self.object_future is None or self.object_future.done():
                    if self.object_future and self.object_future.done():
                        try:
                            objects = self.object_future.result()
                            if objects is not None:
                                if objects:
                                    self.last_objects = objects
                                    self.last_detection_time = current_time
                                    if self.ultrasound and self.object_detector.has_animal(objects):
                                        self.ultrasound.play()
                                elif current_time - self.last_detection_time > 3.0:
                                    self.last_objects = []
                        except:
                            pass
                    self.object_future = self.executor.submit(self.object_detector.detect_objects, frame.copy())
                
                self.fps_counter += 1
                if current_time - self.fps_start_time >= 1.0:
                    self.current_fps = self.fps_counter
                    self.fps_counter = 0
                    self.fps_start_time = current_time
                
                frame_with_boxes = draw_all_boxes(frame, self.last_faces, self.last_objects)
                base64_frame = encode_frame_to_base64(frame_with_boxes, self.quality)
                timestamp = int(time.time() * 1000)
                
                stats = self._calculate_stats()
                
                if not self.websocket.send_frame(base64_frame, timestamp, self.last_faces, self.last_objects, self.current_fps, stats):
                    if not self.websocket.connect():
                        time.sleep(1)
                        continue
                
                self.frame_count += 1
                loop_time = time.time() - loop_start
                sleep_time = frame_delay - loop_time
                
                if loop_time > frame_delay * 1.5:
                    skip_frames = min(skip_frames + 1, 2)
                else:
                    skip_frames = max(skip_frames - 1, 0)
                
                if sleep_time > 0:
                    time.sleep(sleep_time)
        except:
            pass
        finally:
            self.stop()
    
    def _calculate_stats(self):
        unknown_faces = sum(1 for f in self.last_faces if f.get('status') == 'неизвестный')
        known_faces = sum(1 for f in self.last_faces if f.get('status') == 'проверенный')
        person_count = sum(1 for o in self.last_objects if o.get('class') == 'person')
        animal_count = sum(1 for o in self.last_objects if o.get('class') == 'животное')
        
        return {
            'unknownFaces': unknown_faces,
            'knownFaces': known_faces,
            'personCount': person_count,
            'animalCount': animal_count,
            'totalFaces': len(self.last_faces),
            'totalObjects': len(self.last_objects),
            'fps': self.current_fps
        }
    
    def stop(self):
        self.is_streaming = False
        if self.camera:
            self.camera.release()
        self.executor.shutdown(wait=False)
    
    def join(self):
        if self.thread:
            self.thread.join()


class MultiCameraClient:
    
    def __init__(self, server_url: str = config.DEFAULT_SERVER_URL, cameras: list = None, fps: int = config.DEFAULT_FPS, quality: int = config.DEFAULT_JPEG_QUALITY):
        self.server_url = server_url
        self.cameras = cameras or [{'device_id': config.DEFAULT_DEVICE_ID, 'name': config.DEFAULT_CAMERA_NAME}]
        self.fps = max(1, min(fps, 60))
        self.quality = max(1, min(quality, 100))
        self.streams = []
        self.websockets = []
    
    def initialize(self) -> bool:
        for camera_info in self.cameras:
            device_id = camera_info['device_id']
            camera_name = camera_info['name']
            
            print(f'[{camera_name}] Подключение к серверу {self.server_url}...')
            websocket = WebSocketClient(self.server_url, camera_name)
            if not websocket.connect():
                print(f'[{camera_name}] ОШИБКА: Не удалось подключиться к серверу')
                self.cleanup()
                return False
            print(f'[{camera_name}] Подключено к серверу')
            self.websockets.append(websocket)
            time.sleep(0.5)
            
            print(f'[{camera_name}] Открытие камеры {device_id}...')
            stream = CameraStream(device_id, camera_name, websocket, self.fps, self.quality)
            if not stream.start():
                print(f'[{camera_name}] ОШИБКА: Не удалось открыть камеру {device_id}')
                self.cleanup()
                return False
            print(f'[{camera_name}] Камера открыта, начало трансляции')
            self.streams.append(stream)
        return True
    
    def run(self):
        print('\n[КЛИЕНТ] Инициализация...')
        if not self.initialize():
            print('[КЛИЕНТ] Инициализация не удалась')
            return False
        print('[КЛИЕНТ] Инициализация завершена успешно')
        print('[КЛИЕНТ] Трансляция запущена. Нажмите Ctrl+C для остановки.\n')
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print('\n[КЛИЕНТ] Остановка...')
        finally:
            self.cleanup()
            print('[КЛИЕНТ] Очистка завершена')
        return True
    
    def cleanup(self):
        for stream in self.streams:
            stream.stop()
        for stream in self.streams:
            stream.join()
        for websocket in self.websockets:
            websocket.disconnect()

