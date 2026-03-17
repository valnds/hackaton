const database = require('../database');

module.exports = async (bot, query, userId) => {
  try {
    const user = await database.getUser(userId);
    if (!user) return;

    await database.updateUserStatus(userId, 'denied');

    const displayName = user.username ? `@${user.username}` : user.firstName;
    const fullName = user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName;

    await bot.answerCallbackQuery(query.id, { 
      text: `Пользователь ${displayName} отклонен` 
    });
    
    await bot.editMessageText(
      `❌ Пользователю отказано в доступе\n\n` +
      `👤 Пользователь: ${displayName}\n` +
      `📝 Имя: ${fullName}\n` +
      `🆔 ID: ${userId}\n` +
      `🏠 Адрес: ${user.address || 'Не указан'}`,
      {
        chat_id: query.message.chat.id,
        message_id: query.message.message_id
      }
    );
  } catch (error) {
    console.error('Ошибка отклонения:', error);
  }
};

