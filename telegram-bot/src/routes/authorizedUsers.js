const database = require('../database');

module.exports = async (req, res) => {
  try {
    const rows = await database.getAllUsers();
    const authorized = rows.filter(u => u.status === 'authorized');
    const pending = rows.filter(u => u.status === 'pending');
    const denied = rows.filter(u => u.status === 'denied');

    res.json({ authorized, pending, denied });
  } catch (error) {
    console.error('Ошибка authorized-users:', error);
    res.status(500).json({ error: 'Ошибка БД' });
  }
};

