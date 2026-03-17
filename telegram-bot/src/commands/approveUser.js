const database = require('../database');

module.exports = async (bot, query, userId) => {
  try {
    const user = await database.getUser(userId);
    if (!user) return;

    await database.updateUserStatus(userId, 'authorized');

    const displayName = user.username ? `@${user.username}` : user.firstName;
    const fullName = user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName;

    await bot.answerCallbackQuery(query.id, { 
      text: `Пользователь ${displayName} одобрен` 
    });
    
    await bot.editMessageText(
      `✅ Пользователь одобрен и получил доступ к системе\n\n` +
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
    console.error('Ошибка одобрения:', error);
  }
};

