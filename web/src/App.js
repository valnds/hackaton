import React, { useEffect } from 'react';
import Router from './router/Router';
import { initTelegram } from './utils/telegram';

function App() {
  useEffect(() => {
    const tg = initTelegram();
    if (tg) {
      document.body.style.backgroundColor = tg.themeParams.bg_color || '#ffffff';
      document.body.style.color = tg.themeParams.text_color || '#000000';
    }
  }, []);

  return <Router />;
}

export default App;
