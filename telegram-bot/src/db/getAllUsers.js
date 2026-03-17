module.exports = function() {
  return new Promise((resolve, reject) => {
    this.db.all('SELECT * FROM users ORDER BY createdAt DESC', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

