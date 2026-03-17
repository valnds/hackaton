module.exports = function() {
  return new Promise((resolve, reject) => {
    this.db.close((err) => {
      if (err) {
        console.error('Ошибка закрытия БД:', err);
        reject(err);
      } else {
        console.log('База данных закрыта');
        resolve();
      }
    });
  });
};

