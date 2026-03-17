#!/usr/bin/env python3
import cv2
import face_recognition
import pickle
from pathlib import Path
import sys

def add_face_from_camera(name):
    known_faces_dir = Path('known_faces')
    known_faces_dir.mkdir(exist_ok=True)
    encodings_file = known_faces_dir / 'encodings.pkl'
    if encodings_file.exists():
        with open(encodings_file, 'rb') as f:
            data = pickle.load(f)
            known_encodings, known_names = data['encodings'], data['names']
    else:
        known_encodings, known_names = [], []
    cap = cv2.VideoCapture(0)
    print(f'\n=== Добавление лица: {name} ===\nНажмите ПРОБЕЛ для захвата фото\nНажмите Q для выхода\n')
    while True:
        ret, frame = cap.read()
        if not ret: break
        cv2.imshow('Камера - Нажмите ПРОБЕЛ для фото', frame)
        key = cv2.waitKey(1) & 0xFF
        if key == ord(' '):
            print('Обработка...')
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            face_locations = face_recognition.face_locations(rgb_frame)
            if not face_locations:
                print('❌ Лицо не найдено! Попробуйте ещё раз.')
                continue
            face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)
            if face_encodings:
                known_encodings.append(face_encodings[0])
                known_names.append(name)
                with open(encodings_file, 'wb') as f:
                    pickle.dump({'encodings': known_encodings, 'names': known_names}, f)
                photo_path = known_faces_dir / f'{name}.jpg'
                cv2.imwrite(str(photo_path), frame)
                print(f'✅ Лицо {name} добавлено в БД!\n📷 Фото сохранено: {photo_path}\n📊 Всего лиц в БД: {len(known_names)}')
                break
        elif key == ord('q'): break
    cap.release()
    cv2.destroyAllWindows()

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Использование: python add_face.py "Имя Фамилия"')
        sys.exit(1)
    add_face_from_camera(sys.argv[1])

