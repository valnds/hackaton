const express = require('express');
const cors = require('cors');
const checkUser = require('./routes/checkUser');
const requestAccess = require('./routes/requestAccess');
const authorizedUsers = require('./routes/authorizedUsers');
const authorizeUser = require('./routes/authorizeUser');
const stats = require('./routes/stats');
const health = require('./routes/health');
const test = require('./routes/test');
const sendAlert = require('./routes/sendAlert');

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.post('/check-user', checkUser);
app.post('/request-access', requestAccess);
app.get('/authorized-users', authorizedUsers);
app.post('/authorize-user', authorizeUser);
app.get('/stats', stats);
app.get('/health', health);
app.get('/test', test);
app.post('/send-alert', sendAlert);

app.use((req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Not Found', path: req.path });
});

module.exports = app;

