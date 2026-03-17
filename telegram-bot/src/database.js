const connect = require('./db/connect');
const checkUser = require('./db/checkUser');
const getUser = require('./db/getUser');
const addUser = require('./db/addUser');
const updateUserStatus = require('./db/updateUserStatus');
const updatePendingStatus = require('./db/updatePendingStatus');
const getAllUsers = require('./db/getAllUsers');
const getStats = require('./db/getStats');
const close = require('./db/close');

class Database {
  constructor() {
    this.db = null;
  }

  connect() { return connect.call(this); }
  checkUser(userId) { return checkUser.call(this, userId); }
  getUser(userId) { return getUser.call(this, userId); }
  addUser(userId, username, firstName, lastName, address) { return addUser.call(this, userId, username, firstName, lastName, address); }
  updateUserStatus(userId, status) { return updateUserStatus.call(this, userId, status); }
  updatePendingStatus(userId) { return updatePendingStatus.call(this, userId); }
  getAllUsers() { return getAllUsers.call(this); }
  getStats() { return getStats.call(this); }
  close() { return close.call(this); }
}

module.exports = new Database();

