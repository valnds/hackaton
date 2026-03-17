import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import cv2
import mediapipe as mp
import face_recognition
import time
import pickle
from pathlib import Path
import numpy as np
import config


class FaceRecognizer:
    
    def __init__(self, known_faces_dir: str = 'known_faces', tolerance: float = 0.7, check_interval: float = 0.1, min_detection_confidence: float = 0.5):
        self.known_faces_dir = Path(known_faces_dir)
        self.known_faces_dir.mkdir(exist_ok=True)
        self.tolerance = tolerance
        self.known_encodings = []
        self.known_names = []
        self.encodings_file = self.known_faces_dir / 'encodings.pkl'
        self.last_check_time = 0
        self.check_interval = check_interval
        self.last_recognition_time = 0
        self.recognition_interval = 2.0
        self.cached_results = []
        
        self.mpFaceDetection = mp.solutions.face_detection
        self.faceDetection = self.mpFaceDetection.FaceDetection(min_detection_confidence=min_detection_confidence)
        
        self.load_known_faces()
    
    def load_known_faces(self):
        if self.encodings_file.exists():
            try:
                with open(self.encodings_file, 'rb') as f:
                    data = pickle.load(f)
                    self.known_encodings = data['encodings']
                    self.known_names = data['names']
                    print(f'[FaceRecognizer] Загружено {len(self.known_names)} проверенных лиц из БД')
            except:
                print('[FaceRecognizer] Ошибка загрузки БД лиц, создаю новую')
                self.known_encodings = []
                self.known_names = []
        else:
            for image_path in self.known_faces_dir.glob('*.jpg'):
                image = face_recognition.load_image_file(str(image_path))
                encodings = face_recognition.face_encodings(image)
                if encodings:
                    self.known_encodings.append(encodings[0])
                    self.known_names.append(image_path.stem)
            if self.known_encodings:
                self.save_encodings()
                print(f'[FaceRecognizer] Создана БД с {len(self.known_names)} лицами')
    
    def save_encodings(self):
        with open(self.encodings_file, 'wb') as f:
            pickle.dump({'encodings': self.known_encodings, 'names': self.known_names}, f)
    
    def add_known_face(self, image_path: str, name: str):
        image = face_recognition.load_image_file(image_path)
        encodings = face_recognition.face_encodings(image)
        if encodings:
            self.known_encodings.append(encodings[0])
            self.known_names.append(name)
            self.save_encodings()
            return True
        return False
    
    def recognize_faces(self, frame):
        now = time.time()
        if now - self.last_check_time < self.check_interval:
            return None
        self.last_check_time = now
        
        try:
            imgRGB = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.faceDetection.process(imgRGB)
            
            if not results.detections:
                return []
        except Exception as e:
            print(f'[FaceRecognizer] Ошибка детекции: {e}')
            return []
        
        detections = []
        do_recognition = (now - self.last_recognition_time) >= self.recognition_interval
        
        for detection in results.detections:
            bboxC = detection.location_data.relative_bounding_box
            ih, iw, ic = frame.shape
            x = int(bboxC.xmin * iw)
            y = int(bboxC.ymin * ih)
            w = int(bboxC.width * iw)
            h = int(bboxC.height * ih)
            
            x = max(0, x)
            y = max(0, y)
            w = min(w, iw - x)
            h = min(h, ih - y)
            
            name = "неизвестный"
            status = "неизвестный"
            known = False
            
            if do_recognition and len(self.known_encodings) > 0:
                try:
                    face_location = (y, x+w, y+h, x)
                    face_encodings = face_recognition.face_encodings(imgRGB, [face_location])
                    if face_encodings:
                        face_encoding = face_encodings[0]
                        face_distances = face_recognition.face_distance(self.known_encodings, face_encoding)
                        best_match_index = np.argmin(face_distances)
                        best_distance = face_distances[best_match_index]
                        print(f'[FaceRecognizer] Дистанция: {best_distance:.3f}, порог: {self.tolerance}')
                        if best_distance < self.tolerance:
                            name = self.known_names[best_match_index]
                            status = "проверенный"
                            known = True
                except Exception as e:
                    print(f'[FaceRecognizer] Ошибка распознавания: {e}')
            
            detections.append({
                'bbox': [x, y, w, h],
                'name': name,
                'status': status,
                'known': known,
                'confidence': float(detection.score[0])
            })
        
        if do_recognition:
            self.last_recognition_time = now
            self.cached_results = detections
        elif self.cached_results and len(detections) == len(self.cached_results):
            for i, det in enumerate(detections):
                det['name'] = self.cached_results[i]['name']
                det['status'] = self.cached_results[i]['status']
                det['known'] = self.cached_results[i]['known']
        
        if detections:
            print(f'[FaceRecognizer] Обнаружено лиц: {len(detections)} - {[d["status"] for d in detections]}')
        
        return detections

