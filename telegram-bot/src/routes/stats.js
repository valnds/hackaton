const database = require('../database');

module.exports = async (req, res) => {
  try {
    const stats = await database.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Ошибка stats:', error);
    res.status(500).json({ error: 'Ошибка БД' });
  }
};

