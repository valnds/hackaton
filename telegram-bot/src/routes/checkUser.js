const database = require('../database');

module.exports = async (req, res) => {
  try {
    const { userId } = req.body;
    const row = await database.getUser(userId);

    if (!row) return res.json({ authorized: false, message: 'Требуется запрос доступа' });
    if (row.status === 'authorized') return res.json({ authorized: true, address: row.address });
    if (row.status === 'pending') return res.json({ authorized: false, message: 'Запрос уже отправлен. Ожидайте подтверждения.' });
    if (row.status === 'denied') return res.json({ authorized: false, message: 'Доступ отклонен' });

    res.json({ authorized: false, message: 'Требуется запрос доступа' });
  } catch (error) {
    console.error('Ошибка check-user:', error);
    res.status(500).json({ error: 'Ошибка БД' });
  }
};

