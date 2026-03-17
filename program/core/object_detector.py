import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import numpy as np
import time
import config

class ObjectDetector:
    
    def __init__(self, confidence_threshold: float = 0.5, check_interval: float = 0.1):
        self.confidence_threshold = confidence_threshold
        self.last_check_time = 0
        self.check_interval = check_interval
        
        self.animal_categories = ['cat', 'dog', 'horse', 'bird', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe']
        
        model_buffer = self._load_model_buffer()
        base_options = python.BaseOptions(model_asset_buffer=model_buffer)
        options = vision.ObjectDetectorOptions(
            base_options=base_options,
            running_mode=vision.RunningMode.IMAGE,
            max_results=10,
            score_threshold=confidence_threshold
        )
        self.detector = vision.ObjectDetector.create_from_options(options)
        
        print(f'[ObjectDetector] MediaPipe ObjectDetection загружена')
    
    def _load_model_buffer(self):
        model_path = os.path.join(os.getcwd(), 'models', 'efficientdet_lite0.tflite')
        
        if not os.path.exists(model_path):
            os.makedirs(os.path.join(os.getcwd(), 'models'), exist_ok=True)
            self._download_model(model_path)
        
        with open(model_path, 'rb') as f:
            return f.read()
    
    def _download_model(self, model_path):
        import urllib.request
        
        model_url = 'https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite'
        
        try:
            print('Загрузка EfficientDet-Lite0 модели (~4MB)...')
            urllib.request.urlretrieve(model_url, model_path)
            print(f'Модель загружена: {model_path}')
        except Exception as e:
            print(f'Ошибка загрузки модели: {e}')
            raise
    
    def detect_objects(self, frame):
        now = time.time()
        if now - self.last_check_time < self.check_interval:
            return None
        self.last_check_time = now
        
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
        
        detection_result = self.detector.detect(mp_image)
        
        detections = []
        for detection in detection_result.detections:
            category = detection.categories[0]
            category_name = category.category_name.lower()
            score = category.score
            
            if category_name == 'person' or any(animal in category_name for animal in self.animal_categories):
                bbox = detection.bounding_box
                x = bbox.origin_x
                y = bbox.origin_y
                w = bbox.width
                h = bbox.height
                
                display_class = 'животное' if any(animal in category_name for animal in self.animal_categories) else 'person'
                
                detections.append({
                    'class': display_class,
                    'confidence': float(score),
                    'bbox': [int(x), int(y), int(w), int(h)]
                })
        
        return detections
    
    def has_person(self, detections):
        return any(d['class'] == 'person' for d in detections)
    
    def has_animal(self, detections):
        return any(d['class'] == 'животное' for d in detections)

