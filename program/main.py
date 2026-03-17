#!/usr/bin/env python3

import sys
import argparse
from core.client import MultiCameraClient
import config


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument('-s', '--server', default=config.DEFAULT_SERVER_URL, help='Server URL')
    parser.add_argument('-c', '--cameras', default=None, help='Camera list: device_id:name,device_id:name')
    parser.add_argument('-n', '--name', default=None, help='Camera name (old format)')
    parser.add_argument('-d', '--device', type=int, default=None, help='Device ID (old format)')
    parser.add_argument('-f', '--fps', type=int, default=config.DEFAULT_FPS, help='FPS')
    parser.add_argument('-q', '--quality', type=int, default=config.DEFAULT_JPEG_QUALITY, help='JPEG quality')
    return parser.parse_args()


def main():
    args = parse_args()
    
    if args.cameras:
        cameras = []
        for cam in args.cameras.split(','):
            parts = cam.split(':')
            device_id = int(parts[0])
            name = parts[1] if len(parts) > 1 else f'Камера {device_id}'
            cameras.append({'device_id': device_id, 'name': name})
    elif args.device is not None or args.name is not None:
        device_id = args.device if args.device is not None else config.DEFAULT_DEVICE_ID
        name = args.name if args.name else config.DEFAULT_CAMERA_NAME
        cameras = [{'device_id': device_id, 'name': name}]
    else:
        cameras = [{'device_id': config.DEFAULT_DEVICE_ID, 'name': config.DEFAULT_CAMERA_NAME}]
    
    print(f'\n=== Запуск системы видеонаблюдения ===')
    print(f'Сервер: {args.server}')
    print(f'Камеры: {cameras}')
    print(f'FPS: {args.fps}, Качество: {args.quality}')
    print(f'=====================================\n')
    
    client = MultiCameraClient(
        server_url=args.server,
        cameras=cameras,
        fps=args.fps,
        quality=args.quality
    )
    
    success = client.run()
    if not success:
        print('\n[ОШИБКА] Не удалось запустить клиент')
        sys.exit(1)


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('\n\n[ВЫХОД] Программа остановлена пользователем')
        sys.exit(0)
    except Exception as e:
        print(f'\n[ОШИБКА] {e}')
        import traceback
        traceback.print_exc()
        sys.exit(1)

