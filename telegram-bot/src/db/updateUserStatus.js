module.exports = function(userId, status) {
  return new Promise((resolve, reject) => {
    const approvedTime = status === 'authorized' ? new Date().toISOString() : null;
    const query = approvedTime
      ? 'UPDATE users SET status = ?, approvedTime = ? WHERE userId = ?'
      : 'UPDATE users SET status = ? WHERE userId = ?';
    const params = approvedTime ? [status, approvedTime, userId] : [status, userId];

    this.db.run(query, params, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

