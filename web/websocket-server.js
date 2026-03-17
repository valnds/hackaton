const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  maxHttpBufferSize: 1e8,
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 30000,
  allowUpgrades: true,
  transports: ['websocket', 'polling']
});

app.use(cors());
app.use(express.static(path.join(__dirname, 'build')));

const clients = new Map();
const cameras = new Map();

io.on('connection', (socket) => {
  
  socket.on('register-camera', (data) => {
    cameras.set(socket.id, { id: socket.id, name: data.name || 'Камера', ip: socket.handshake.address, connectedAt: new Date() });
    io.emit('camera-list', Array.from(cameras.values()));
  });

  socket.on('register-client', () => {
    clients.set(socket.id, { id: socket.id, connectedAt: new Date() });
    socket.emit('camera-list', Array.from(cameras.values()));
  });

  socket.on('video-frame', (data) => {
    io.emit('video-stream', { 
      cameraId: socket.id, 
      frame: data.frame, 
      timestamp: data.timestamp,
      faces: data.faces || [],
      objects: data.objects || [],
      fps: data.fps || 0,
      stats: data.stats || {}
    });
  });

  socket.on('request-camera-list', () => {
    socket.emit('camera-list', Array.from(cameras.values()));
  });

  socket.on('disconnect', () => {
    if (cameras.has(socket.id)) {
      cameras.delete(socket.id);
      io.emit('camera-list', Array.from(cameras.values()));
    }
    if (clients.has(socket.id)) {
      clients.delete(socket.id);
    }
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 3050;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
  const networkInterfaces = os.networkInterfaces();
  
  console.log(`\n=================================`);
  console.log(`✅ Camera Detection Server`);
  console.log(`=================================`);
  console.log(`\nLocal: http://localhost:${PORT}/`);
  
  console.log(`\nNetwork:`);
  Object.keys(networkInterfaces).forEach((interfaceName) => {
    networkInterfaces[interfaceName].forEach((iface) => {
      if (iface.family === 'IPv4' && !iface.internal) {
        console.log(`  http://${iface.address}:${PORT}/`);
      }
    });
  });
  console.log(`\n=================================\n`);
});
