import React, { useState, useEffect } from 'react';
import Camera from '../components/Camera/Camera';
import Menu from './Menu';
import { isTelegramWebApp, getTelegramUser } from '../utils/telegram';
import './Home.css';

function Home() {
  const [showMenu, setShowMenu] = useState(true);
  const isTg = isTelegramWebApp();
  const user = getTelegramUser();

  useEffect(() => {
    if (isTg) document.body.classList.add('telegram-app');
  }, [isTg]);

  if (showMenu) return <Menu onCameraClick={() => setShowMenu(false)} />;

  return (
    <div className="home">
      <button className="back-btn" onClick={() => setShowMenu(true)}>
        ← Меню
      </button>
      <div className="container">
        {isTg && user && <div className="telegram-user">Привет, {user.first_name}! 👋</div>}
        {!isTg && <h1 className="title">Детекция людей и животных</h1>}
        <Camera />
      </div>
    </div>
  );
}

export default Home;
