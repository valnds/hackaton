const config = require('../config');

module.exports = async (bot, userId, username, firstName, lastName, address) => {
  const displayName = username ? `@${username}` : firstName;
  const fullName = lastName ? `${firstName} ${lastName}` : firstName;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '✅ Одобрить', callback_data: `approve:${userId}` },
        { text: '❌ Отклонить', callback_data: `deny:${userId}` }
      ]
    ]
  };

  try {
    await bot.sendMessage(
      config.ADMIN_CHAT_ID,
      `🔔 Новый запрос на доступ к системе "Сияние"\n\n` +
      `👤 Пользователь: ${displayName}\n` +
      `📝 Имя: ${fullName}\n` +
      `🆔 ID: ${userId}\n` +
      `🏠 Адрес: ${address || 'Не указан'}\n` +
      `⏰ Время: ${new Date().toLocaleString('ru-RU')}`,
      { reply_markup: keyboard }
    );
    console.log('Сообщение отправлено в Telegram');
    return true;
  } catch (error) {
    console.error('Ошибка отправки сообщения:', error);
    return false;
  }
};

