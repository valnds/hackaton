module.exports = function(userId) {
  return new Promise((resolve, reject) => {
    this.db.run(
      'UPDATE users SET status = ?, requestTime = ? WHERE userId = ?',
      ['pending', new Date().toISOString(), userId],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
};

