import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import cv2
import base64
import config


def encode_frame_to_base64(frame, quality: int = config.DEFAULT_JPEG_QUALITY) -> str:
    encode_param = [
        int(cv2.IMWRITE_JPEG_QUALITY), quality,
        int(cv2.IMWRITE_JPEG_OPTIMIZE), 0,
        int(cv2.IMWRITE_JPEG_PROGRESSIVE), 0
    ]
    _, buffer = cv2.imencode('.jpg', frame, encode_param)
    jpg_as_text = base64.b64encode(buffer).decode('utf-8')
    return f'data:image/jpeg;base64,{jpg_as_text}'

