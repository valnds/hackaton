const config = require('../config');

module.exports = async (bot, userId, username, address) => {
  const displayName = username || `ID: ${userId}`;

  try {
    await bot.sendMessage(
      config.ADMIN_CHAT_ID,
      `🚨 ТРЕВОГА АКТИВИРОВАНА! 🚨\n\n` +
      `👤 Пользователь: ${displayName}\n` +
      `🏠 Адрес: ${address || 'Не указан'}\n` +
      `⏰ Время: ${new Date().toLocaleString('ru-RU')}\n\n` +
      `⚠️ Требуется немедленная проверка!`
    );
    console.log('Тревога отправлена в Telegram');
    return true;
  } catch (error) {
    console.error('Ошибка отправки тревоги:', error);
    return false;
  }
};

