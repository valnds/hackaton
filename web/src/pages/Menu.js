import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import './Menu.css';

function Menu({ onCameraClick }) {
  const [showMap, setShowMap] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrText, setQrText] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [showAlertConfirm, setShowAlertConfirm] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [bills, setBills] = useState([]);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const address = localStorage.getItem('address') || '';

  const generateRandomText = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = Math.floor(Math.random() * 20) + 30;
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const generateRandomBills = () => {
    const services = [
      { name: 'Электроэнергия', icon: '💡' },
      { name: 'Водоснабжение', icon: '💧' },
      { name: 'Газ', icon: '🔥' },
      { name: 'Отопление', icon: '🌡️' },
      { name: 'Вывоз мусора', icon: '🗑️' },
      { name: 'Капитальный ремонт', icon: '🏗️' }
    ];
    
    return services.map(service => ({
      ...service,
      amount: (Math.random() * 3000 + 500).toFixed(2)
    }));
  };

  const handleButton1 = () => setShowMap(true);
  
  const handleButton2 = () => {
    setQrText(generateRandomText());
    setShowQR(true);
  };
  
  const handleButton3 = () => window.open('https://t.me/xdeathyouthx', '_blank');
  
  const handleButton4 = () => setShowAlertConfirm(true);
  
  const confirmAlert = async () => {
    setShowAlertConfirm(false);
    
    const userId = localStorage.getItem('userId') || '';
    const username = localStorage.getItem('username') || '';
    const userAddress = localStorage.getItem('address') || '';
    
    const { api } = await import('../utils/api');
    await api.sendAlert(userId, username, userAddress);
    
    setShowAlert(true);
  };
  
  const handleButton5 = () => {
    setBills(generateRandomBills());
    setPaymentSuccess(false);
    setShowPayment(true);
  };
  
  const handleButton6 = () => onCameraClick();

  const handlePayment = () => {
    setPaymentSuccess(true);
    setTimeout(() => {
      setShowPayment(false);
      setPaymentSuccess(false);
    }, 2000);
  };

  const getTotalAmount = () => {
    return bills.reduce((sum, bill) => sum + parseFloat(bill.amount), 0).toFixed(2);
  };

  return (
    <div className="menu-container">
      <h1 className="menu-title">СИЯНИЕ</h1>
      {address && <div className="menu-address">🏠 {address}</div>}
      
      <div className="menu-grid">
        <button className="menu-item" onClick={handleButton1}>
          <div className="menu-icon">🗺️</div>
          <span>Карта</span>
        </button>

        <button className="menu-item" onClick={handleButton2}>
          <div className="menu-icon">📱</div>
          <span>QR Код</span>
        </button>

        <button className="menu-item" onClick={handleButton3}>
          <div className="menu-icon">💬</div>
          <span>Чат</span>
        </button>

        <button className="menu-item" onClick={handleButton4}>
          <div className="menu-icon">🚨</div>
          <span>Тревога</span>
        </button>

        <button className="menu-item" onClick={handleButton5}>
          <div className="menu-icon">💳</div>
          <span>Оплатить ЖКХ</span>
        </button>

        <button className="menu-item" onClick={handleButton6}>
          <div className="menu-icon">📹</div>
          <span>Камеры</span>
        </button>
      </div>

      {showMap && (
        <div className="overlay" onClick={() => setShowMap(false)}>
          <div className="modal map-modal">
            <button className="close-btn" onClick={() => setShowMap(false)}>✕</button>
            <img src="/map.jpg" alt="Карта" className="map-image" />
          </div>
        </div>
      )}

      {showQR && (
        <div className="overlay" onClick={() => setShowQR(false)}>
          <div className="modal qr-modal">
            <button className="close-btn" onClick={() => setShowQR(false)}>✕</button>
            <div className="qr-container">
              <QRCode value={qrText} size={256} />
              <p className="qr-text">{qrText}</p>
            </div>
          </div>
        </div>
      )}

      {showAlertConfirm && (
        <div className="overlay" onClick={() => setShowAlertConfirm(false)}>
          <div className="modal alert-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowAlertConfirm(false)}>✕</button>
            <div className="alert-icon warning">⚠️</div>
            <h2>ПОДТВЕРЖДЕНИЕ</h2>
            <p>Вы уверены, что хотите вызвать тревогу?</p>
            <p className="alert-warning">Сотрудники службы безопасности будут немедленно уведомлены</p>
            <div className="alert-buttons">
              <button className="cancel-button" onClick={() => setShowAlertConfirm(false)}>
                Отмена
              </button>
              <button className="confirm-button" onClick={confirmAlert}>
                🚨 Подтвердить тревогу
              </button>
            </div>
          </div>
        </div>
      )}

      {showAlert && (
        <div className="overlay" onClick={() => setShowAlert(false)}>
          <div className="modal alert-modal">
            <button className="close-btn" onClick={() => setShowAlert(false)}>✕</button>
            <div className="alert-icon">🚨</div>
            <h2>ТРЕВОГА АКТИВИРОВАНА</h2>
            <p>Сотрудники скоро прибудут на вашу геолокацию</p>
            <p className="alert-success">✅ Уведомление отправлено</p>
          </div>
        </div>
      )}

      {showPayment && (
        <div className="overlay" onClick={() => !paymentSuccess && setShowPayment(false)}>
          <div className="modal payment-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowPayment(false)}>✕</button>
            {!paymentSuccess ? (
              <>
                <h2>Оплата ЖКХ</h2>
                <div className="bills-list">
                  {bills.map((bill, index) => (
                    <div key={index} className="bill-item">
                      <span className="bill-icon">{bill.icon}</span>
                      <span className="bill-name">{bill.name}</span>
                      <span className="bill-amount">{bill.amount} ₽</span>
                    </div>
                  ))}
                </div>
                <div className="total-amount">
                  <strong>Итого к оплате:</strong>
                  <strong>{getTotalAmount()} ₽</strong>
                </div>
                <button className="pay-button" onClick={handlePayment}>
                  Оплатить
                </button>
              </>
            ) : (
              <div className="payment-success">
                <div className="success-icon">✓</div>
                <h2>Оплата прошла успешно!</h2>
                <p>Спасибо за оплату</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Menu;

