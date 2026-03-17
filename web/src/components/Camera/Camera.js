import React, { useRef, useState, useEffect } from 'react';
import io from 'socket.io-client';
import CameraView from '../CameraView/CameraView';
import './Camera.css';

function Camera() {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [cameraData, setCameraData] = useState({});
  const [error, setError] = useState(null);

  const connectToServer = () => {
    const serverUrl = window.location.origin;
    const isSecure = window.location.protocol === 'https:';
    socketRef.current = io(serverUrl, {
      secure: isSecure,
      rejectUnauthorized: false,
      transports: ['websocket', 'polling'],
      path: '/socket.io/',
      forceNew: true
    });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      setError(null);
      socketRef.current.emit('register-client');
      socketRef.current.emit('request-camera-list');
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
      setCameras([]);
      setCameraData({});
    });

    socketRef.current.on('camera-list', (cameraList) => {
      setCameras(cameraList);
    });

    socketRef.current.on('video-stream', (data) => {
      setCameraData(prev => ({
        ...prev,
        [data.cameraId]: {
          frame: data.frame,
          faces: data.faces || [],
          objects: data.objects || [],
          fps: data.fps || 0,
          stats: data.stats || {}
        }
      }));
    });

    socketRef.current.on('connect_error', (err) => {
      setError('Ошибка подключения к серверу');
    });
  };

  useEffect(() => {
    connectToServer();
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div className="camera-grid-container">
      {error && (
        <div className="error">
          <svg className="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {isConnected && (
        <div className="info info-success">
          <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Подключено | Камер: {cameras.length}</span>
        </div>
      )}

      {cameras.length === 0 && isConnected && (
        <div className="no-cameras">
          <svg className="camera-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p>Ожидание подключения камер...</p>
        </div>
      )}

      {cameras.length > 0 && (
        <div className={`camera-grid camera-grid-${Math.min(cameras.length, 4)}`}>
          {cameras.map((camera) => (
            <CameraView
              key={camera.id}
              cameraId={camera.id}
              cameraName={camera.name}
              frame={cameraData[camera.id]?.frame}
              stats={cameraData[camera.id]?.stats || {}}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Camera;
