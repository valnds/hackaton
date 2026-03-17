module.exports = function(userId) {
  return new Promise((resolve, reject) => {
    this.db.get('SELECT * FROM users WHERE userId = ?', [userId], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

