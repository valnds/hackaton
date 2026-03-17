const approveUser = require('./approveUser');
const denyUser = require('./denyUser');

module.exports = (bot) => async (query) => {
  const action = query.data;
  const [command, userId] = action.split(':');

  if (command === 'approve') await approveUser(bot, query, userId);
  else if (command === 'deny') await denyUser(bot, query, userId);
};

