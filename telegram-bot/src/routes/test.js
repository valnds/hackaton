module.exports = (req, res) => {
  res.json({ success: true, message: 'API доступен', timestamp: Date.now() });
};

