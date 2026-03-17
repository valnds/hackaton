import React from 'react';
import './Camera.css';

function Camera() {
  return (
    <div className="camera-page">
      <div className="camera-status">Демо-режим</div>

      <div className="camera-view">
        <img
          src="/camera-placeholder.jpg"
          alt="Camera placeholder"
          style={{
            width: '100%',
            maxWidth: '100%',
            display: 'block',
            borderRadius: '16px',
            objectFit: 'cover'
          }}
        />
      </div>
    </div>
  );
}

export default Camera;