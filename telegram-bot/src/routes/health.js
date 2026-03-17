module.exports = (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now(), message: 'Telegram Bot API работает!' });
};

