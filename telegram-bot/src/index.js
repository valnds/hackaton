const config = require('./config');
const database = require('./database');
const app = require('./api');
require('./telegram-bot');

async function start() {
  try {
    await database.connect();

    const HOST = '0.0.0.0';
    app.listen(config.PORT, HOST, async () => {
      const stats = await database.getStats();
      
      console.log('========================================');
      console.log('   🚀 Telegram Authorization Bot');
      console.log('========================================');
      console.log(`🤖 Telegram бот активен`);
      console.log(`📱 ID чата: ${config.ADMIN_CHAT_ID}`);
      console.log(`💾 База данных: ${config.DB_FILE}`);
      console.log(`👥 Авторизовано: ${stats.authorized}`);
      console.log(`⏳ Ожидают: ${stats.pending}`);
      console.log(`🟢 API сервер запущен на ${HOST}:${config.PORT}`);
      console.log('========================================');
    });

    process.on('SIGINT', async () => {
      await database.close();
      process.exit(0);
    });

  } catch (error) {
    console.error('Ошибка запуска:', error);
    process.exit(1);
  }
}

start();

