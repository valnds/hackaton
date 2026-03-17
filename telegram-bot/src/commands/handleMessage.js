module.exports = (bot) => (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === '/start') {
    const keyboard = {
      inline_keyboard: [
        [
          { 
            text: 'Сияние', 
            web_app: { url: 'https://olympik.fun/' } 
          }
        ]
      ]
    };

    const welcomeText = 
      `🌟 Добро пожаловать в систему "Сияние"!\n\n` +
      `🎯 Возможности:\n` +
      `• 📹 Видеонаблюдение в реальном времени\n` +
      `• 👤 Распознавание лиц\n` +
      `• 🐕 Детекция животных\n` +
      `• 🚨 Система тревоги\n` +
      `• 💳 Оплата ЖКХ\n` +
      `• 🗺 Карта территории\n\n` +
      `Поддержите проект, если он вам нравится! 💚`;

    bot.sendMessage(chatId, welcomeText, { reply_markup: keyboard });
  }
};

