import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import cv2
import time
from pathlib import Path


class PhotoSaver:
    
    def __init__(self, save_dir: str = 'photos', interval: float = 60.0):
        self.save_dir = Path(save_dir)
        self.save_dir.mkdir(exist_ok=True)
        self.interval = interval
        self.last_save_time = 0
    
    def should_save(self) -> bool:
        now = time.time()
        if now - self.last_save_time >= self.interval:
            self.last_save_time = now
            return True
        return False
    
    def save_photo(self, frame, prefix: str = 'frame') -> str:
        timestamp = time.strftime('%Y%m%d_%H%M%S')
        filename = f'{prefix}_{timestamp}.jpg'
        filepath = self.save_dir / filename
        cv2.imwrite(str(filepath), frame)
        return str(filepath)

