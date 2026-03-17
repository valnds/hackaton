import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import './Welcome.css';
import '../styles/common.css';

function Welcome() {
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const navigate = useNavigate();
  const statusInterval = useRef(null);

  useEffect(() => {
    return () => {
      if (statusInterval.current) clearInterval(statusInterval.current);
    };
  }, []);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      const user = tg.initDataUnsafe?.user;
      if (user) {
        const displayName = user.username || user.first_name;
        setUsername(displayName);
        setUserId(user.id);
        checkAuthorization(user.id, displayName, user.first_name, user.last_name);
      } else {
        setUsername('Гость');
        setTimeout(() => setLoading(false), 2500);
      }
    } else {
      setUsername('Тестовый пользователь');
      setUserId('123456789');
      checkAuthorization('123456789', 'test_user', 'Тест', '');
    }
  }, []);

  const checkAuthorization = async (id, username, firstName, lastName) => {
    const data = await api.checkUser(id);
    if (data.error) {
      setMessage('⚠️ Сервер авторизации недоступен');
      setMessageType('error');
      setTimeout(() => setLoading(false), 2000);
      return;
    }
    if (data.authorized) {
      localStorage.setItem('authorized', 'true');
      localStorage.setItem('userId', id);
      localStorage.setItem('username', username);
      if (data.address) localStorage.setItem('address', data.address);
      setTimeout(() => navigate('/menu'), 2500);
    } else if (data.status === 'denied') {
      setMessage('🚫 Ваш запрос был отклонен администратором');
      setMessageType('denied');
      setTimeout(() => setLoading(false), 2000);
    } else {
      setMessage(data.message || 'Требуется авторизация');
      setMessageType('warning');
      setTimeout(() => setLoading(false), 2000);
    }
  };

  const checkStatusPeriodically = (id) => {
    let attempts = 0;
    const maxAttempts = 60;
    
    if (statusInterval.current) clearInterval(statusInterval.current);
    
    statusInterval.current = setInterval(async () => {
      attempts++;
      const data = await api.checkUser(id);
      
      if (data.authorized) {
        clearInterval(statusInterval.current);
        statusInterval.current = null;
        localStorage.setItem('authorized', 'true');
        localStorage.setItem('userId', id);
        localStorage.setItem('username', username);
        localStorage.setItem('address', address);
        setMessage('✅ Доступ получен! Перенаправление...');
        setMessageType('success');
        setTimeout(() => navigate('/menu'), 1500);
      } else if (data.status === 'denied') {
        clearInterval(statusInterval.current);
        statusInterval.current = null;
        setChecking(false);
        setMessage('🚫 Ваш запрос был отклонен администратором');
        setMessageType('denied');
      } else if (data.error || attempts >= maxAttempts) {
        clearInterval(statusInterval.current);
        statusInterval.current = null;
        setChecking(false);
        if (attempts >= maxAttempts) {
          setMessage('⏱️ Время ожидания истекло. Попробуйте перезагрузить страницу.');
          setMessageType('error');
        }
      }
    }, 2000);
  };

  const requestAccess = async () => {
    if (checking) return;
    
    if (!address.trim()) {
      setMessage('❌ Укажите адрес дома');
      setMessageType('error');
      return;
    }
    
    setChecking(true);
    setMessage('Проверка подключения...');
    setMessageType('');
    
    const isOnline = await api.checkConnection();
    if (!isOnline) {
      setMessage('❌ Сервер авторизации недоступен');
      setMessageType('error');
      setChecking(false);
      return;
    }

    setMessage('Отправка запроса...');
    const tg = window.Telegram?.WebApp;
    const user = tg?.initDataUnsafe?.user;
    const currentUserId = userId || user?.id || '123456789';
    
    const data = await api.requestAccess(
      currentUserId,
      username || user?.username || user?.first_name || 'test_user',
      user?.first_name || 'Тест',
      user?.last_name || '',
      address
    );
    
    if (data.error) {
      setMessage('❌ Ошибка связи с сервером');
      setMessageType('error');
      setChecking(false);
    } else if (data.success) {
      setMessage('✅ Запрос отправлен! Ожидайте подтверждения...');
      setMessageType('success');
      checkStatusPeriodically(currentUserId);
    } else {
      setMessage(data.message || '❌ Ошибка отправки запроса');
      setMessageType('error');
      setChecking(false);
    }
  };

  if (loading) {
    return (
      <div className="welcome-container">
        <div className="welcome-animation">
          <h1 className="welcome-text">Здравствуйте, {username}!</h1>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="welcome-container">
      <div className="auth-card">
        <h2>Доступ ограничен</h2>
        <p>Для доступа к системе требуется авторизация</p>
        {message && <div className={`auth-message ${messageType}`}>{message}</div>}
        <input 
          type="text"
          className="auth-input"
          placeholder="Введите адрес дома"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          disabled={checking}
        />
        <button 
          className="auth-button" 
          onClick={requestAccess}
          disabled={checking}
        >
          {checking ? 'Отправка...' : 'Запросить доступ'}
        </button>
      </div>
    </div>
  );
}

export default Welcome;

