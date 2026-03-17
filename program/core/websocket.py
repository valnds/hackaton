import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import socketio
import time


class WebSocketClient:
    
    def __init__(self, server_url: str, camera_name: str):
        self.server_url = server_url
        self.camera_name = camera_name
        self.sio = socketio.Client(reconnection=True, reconnection_attempts=0, reconnection_delay=1)
        self.connected = False
        self._setup_events()
    
    def _setup_events(self):
        @self.sio.on('connect')
        def on_connect():
            self.connected = True
            self.sio.emit('register-camera', {'name': self.camera_name})
        
        @self.sio.on('disconnect')
        def on_disconnect():
            self.connected = False
    
    def connect(self) -> bool:
        if self.connected:
            return True
        try:
            self.sio.connect(self.server_url, transports=['websocket'])
            time.sleep(0.5)
            return self.connected
        except Exception as e:
            return False
    
    def disconnect(self):
        if self.connected:
            try:
                self.sio.disconnect()
            except:
                pass
        self.connected = False
    
    def send_frame(self, base64_frame: str, timestamp: int, faces: list, objects: list, fps: int, stats: dict = None) -> bool:
        if not self.connected:
            return False
        try:
            self.sio.emit('video-frame', {
                'cameraId': self.camera_name,
                'frame': base64_frame,
                'timestamp': timestamp,
                'faces': faces,
                'objects': objects,
                'fps': fps,
                'stats': stats or {}
            })
            return True
        except:
            return False

