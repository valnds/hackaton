import face_recognition
import pickle
from pathlib import Path

known_faces_dir = Path('known_faces')
encodings_file = known_faces_dir / 'encodings.pkl'
known_encodings, known_names = [], []

for image_path in known_faces_dir.glob('*.jpg'):
    print(f'Обработка: {image_path.name}')
    image = face_recognition.load_image_file(str(image_path))
    face_locations = face_recognition.face_locations(image)
    if not face_locations:
        print(f'  ❌ Лицо не найдено на фото {image_path.name}')
        continue
    encodings = face_recognition.face_encodings(image, face_locations)
    if encodings:
        known_encodings.append(encodings[0])
        known_names.append(image_path.stem)
        print(f'  ✅ Добавлено: {image_path.stem}')
    else:
        print(f'  ❌ Не удалось создать энкодинг для {image_path.name}')

if known_encodings:
    with open(encodings_file, 'wb') as f:
        pickle.dump({'encodings': known_encodings, 'names': known_names}, f)
    print(f'\n✅ База обновлена! Всего лиц: {len(known_names)}\nИмена: {known_names}')
else:
    print('\n❌ Не найдено ни одного лица!')
