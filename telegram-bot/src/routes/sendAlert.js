const telegramBot = require('../telegram-bot');

module.exports = async (req, res) => {
  try {
    const { userId, username, address } = req.body;
    console.log('Получен запрос тревоги:', { userId, username, address });
    
    const sent = await telegramBot.sendAlert(userId, username, address);
    
    if (sent) res.json({ success: true, message: 'Тревога отправлена' });
    else res.status(500).json({ success: false, error: 'Ошибка отправки тревоги' });
  } catch (error) {
    console.error('Ошибка send-alert:', error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
};

