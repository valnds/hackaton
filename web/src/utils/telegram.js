export const initTelegram = () => {
  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.ready();
    tg.expand();
    tg.enableClosingConfirmation();
    return tg;
  }
  return null;
};

export const getTelegramUser = () => {
  const tg = window.Telegram?.WebApp;
  return tg?.initDataUnsafe?.user || null;
};

export const isTelegramWebApp = () => {
  return !!window.Telegram?.WebApp;
};
