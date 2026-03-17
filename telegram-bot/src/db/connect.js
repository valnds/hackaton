const sqlite3 = require('sqlite3').verbose();
const config = require('../config');
const initialize = require('./initialize');

module.exports = function() {
  return new Promise((resolve, reject) => {
    this.db = new sqlite3.Database(config.DB_FILE, (err) => {
      if (err) {
        console.error('Ошибка подключения к БД:', err);
        reject(err);
      } else {
        console.log('✅ База данных SQLite подключена');
        initialize.call(this).then(resolve).catch(reject);
      }
    });
  });
};

