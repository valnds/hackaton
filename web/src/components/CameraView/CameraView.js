import React from 'react';
import './CameraView.css';

function CameraView({ cameraId, cameraName, frame, stats }) {
  const {
    unknownFaces = 0,
    knownFaces = 0,
    personCount = 0,
    animalCount = 0,
    fps = 0
  } = stats;

  return (
    <div className="camera-view">
      <div className="camera-header">
        <h3>{cameraName}</h3>
        {fps > 0 && <span className="badge badge-fps">📊 {fps} FPS</span>}
        {unknownFaces > 0 && <span className="badge badge-unknown">❌ Неизвестен: {unknownFaces}</span>}
        {knownFaces > 0 && <span className="badge badge-known">✅ Известен: {knownFaces}</span>}
        {personCount > 0 && <span className="badge badge-person">👤 Людей: {personCount}</span>}
        {animalCount > 0 && <span className="badge badge-animal">🐾 Животных: {animalCount}</span>}
      </div>
      <div className="video-container">
        {frame ? (
          <img src={frame} alt={cameraName} className="video" />
        ) : (
          <div className="placeholder">
            <svg className="camera-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p>Нет сигнала</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CameraView;
