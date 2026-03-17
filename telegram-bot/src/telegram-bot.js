const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');
const handleMessage = require('./commands/handleMessage');
const handleCallback = require('./commands/handleCallback');
const sendAuthRequest = require('./commands/sendAuthRequest');
const sendAlert = require('./commands/sendAlert');

class TelegramBotService {
  constructor() {
    this.bot = new TelegramBot(config.BOT_TOKEN, { polling: true });
    this.setupHandlers();
  }

  setupHandlers() {
    this.bot.on('message', handleMessage(this.bot));
    this.bot.on('callback_query', handleCallback(this.bot));
  }

  async sendAuthRequest(userId, username, firstName, lastName, address) { return await sendAuthRequest(this.bot, userId, username, firstName, lastName, address); }
  async sendAlert(userId, username, address) { return await sendAlert(this.bot, userId, username, address); }
}

module.exports = new TelegramBotService();