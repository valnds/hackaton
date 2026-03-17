const database = require('../database');

module.exports = async (req, res) => {
  try {
    const { userId, username, firstName, lastName, address } = req.body;
    const row = await database.getUser(userId);

    if (row) {
      await database.updateUserStatus(userId, 'authorized');
    } else {
      await database.addUser(userId, username, firstName, lastName, address);
      await database.updateUserStatus(userId, 'authorized');
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка authorize-user:', error);
    res.status(500).json({ success: false, error: 'Ошибка БД' });
  }
};

