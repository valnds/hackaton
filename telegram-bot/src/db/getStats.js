module.exports = function() {
  return new Promise((resolve, reject) => {
    this.db.get(
      'SELECT COUNT(CASE WHEN status = "authorized" THEN 1 END) as authorized, ' +
      'COUNT(CASE WHEN status = "pending" THEN 1 END) as pending, ' +
      'COUNT(CASE WHEN status = "denied" THEN 1 END) as denied, ' +
      'COUNT(*) as total FROM users',
      [],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
};

