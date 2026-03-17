module.exports = function(userId, username, firstName, lastName, address) {
  return new Promise((resolve, reject) => {
    this.db.run(
      'INSERT INTO users (userId, username, firstName, lastName, address, status, requestTime) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, username, firstName, lastName, address || '', 'pending', new Date().toISOString()],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
};

