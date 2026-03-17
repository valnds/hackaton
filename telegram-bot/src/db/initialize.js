module.exports = function() {
  return new Promise((resolve, reject) => {
    this.db.serialize(() => {
      this.db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT UNIQUE NOT NULL,
        username TEXT,
        firstName TEXT,
        lastName TEXT,
        address TEXT,
        status TEXT NOT NULL CHECK(status IN ('authorized', 'pending', 'denied')),
        requestTime TEXT,
        approvedTime TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) return reject(err);
      });

      this.db.run(`CREATE INDEX IF NOT EXISTS idx_userId ON users(userId)`, (err) => {
        if (err) return reject(err);
      });

      this.db.run(`CREATE INDEX IF NOT EXISTS idx_status ON users(status)`, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  });
};

