const database = require('../database');
const telegramBot = require('../telegram-bot');

module.exports = async (req, res) => {
  try {
    const { userId, username, firstName, lastName, address } = req.body;
    console.log('Получен запрос на доступ:', { userId, username, firstName, lastName, address });

    const row = await database.checkUser(userId);

    if (row) {
      if (row.status === 'authorized') return res.json({ success: true, authorized: true, message: 'Уже авторизован' });
      if (row.status === 'pending') return res.json({ success: false, message: 'Запрос уже отправлен' });
      if (row.status === 'denied') await database.updatePendingStatus(userId);
    } else {
      await database.addUser(userId, username, firstName, lastName, address);
    }

    const sent = await telegramBot.sendAuthRequest(userId, username, firstName, lastName, address);

    if (sent) res.json({ success: true, message: 'Запрос отправлен' });
    else res.status(500).json({ success: false, error: 'Ошибка отправки в Telegram' });
  } catch (error) {
    console.error('Ошибка request-access:', error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
};

