import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import cv2
import time
from typing import Optional, Tuple
import config


class CameraCapture:
    
    def __init__(self, device_id: int = 0, width: int = None, height: int = None, fps: int = None):
        self.device_id = device_id
        self.width = width or config.VIDEO_WIDTH
        self.height = height or config.VIDEO_HEIGHT
        self.fps = fps or config.DEFAULT_FPS
        self.camera: Optional[cv2.VideoCapture] = None
        self.is_opened = False
        self.error_count = 0
        self.max_errors = 10
        
    def open(self) -> bool:
        try:
            self.camera = cv2.VideoCapture(self.device_id, cv2.CAP_DSHOW)
            if not self.camera.isOpened():
                self.camera = cv2.VideoCapture(self.device_id)
            if not self.camera.isOpened():
                return False
            self.camera.set(cv2.CAP_PROP_FRAME_WIDTH, self.width)
            self.camera.set(cv2.CAP_PROP_FRAME_HEIGHT, self.height)
            self.camera.set(cv2.CAP_PROP_FPS, self.fps)
            self.camera.set(cv2.CAP_PROP_BUFFERSIZE, 1)
            self.camera.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc('M', 'J', 'P', 'G'))
            self.is_opened = True
            self.error_count = 0
            return True
        except:
            return False
    
    def read(self) -> Tuple[bool, Optional[any]]:
        if not self.camera or not self.is_opened:
            return False, None
        try:
            ret, frame = self.camera.read()
            if not ret:
                self.error_count += 1
                if self.error_count >= self.max_errors:
                    self.release()
                    time.sleep(1)
                    self.open()
                return False, None
            self.error_count = 0
            return True, frame
        except:
            self.error_count += 1
            return False, None
    
    def release(self):
        if self.camera:
            try:
                self.camera.release()
            except:
                pass
            self.is_opened = False

