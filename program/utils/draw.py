import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import cv2
import config


def draw_face_boxes(frame, faces):
    if not faces:
        return frame
    
    for face in faces:
        status = face.get('status', 'неизвестный')
        name = face.get('name', 'неизвестный')
        print(f'  Лицо: {status} [{name}]')
    
    return frame


def draw_object_boxes(frame, objects):
    return frame


def draw_all_boxes(frame, faces, objects):
    frame = draw_face_boxes(frame, faces)
    frame = draw_object_boxes(frame, objects)
    return frame

