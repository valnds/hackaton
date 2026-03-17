import { API_URL } from '../config';

const fetchWithTimeout = async (url, options, timeout = 10000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    if (!response.ok && response.status === 404) throw new Error('API endpoint not found');
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

export const api = {
  async checkUser(userId) {
    try {
      const res = await fetchWithTimeout(`${API_URL}/check-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: String(userId) })
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error('Ошибка checkUser:', error);
      return { authorized: false, message: 'Сервер недоступен', error: true };
    }
  },

  async requestAccess(userId, username, firstName, lastName, address) {
    try {
      const res = await fetchWithTimeout(`${API_URL}/request-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: String(userId), 
          username: username || '', 
          firstName: firstName || '', 
          lastName: lastName || '',
          address: address || ''
        })
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error('Ошибка requestAccess:', error);
      return { success: false, message: 'Сервер недоступен', error: true };
    }
  },

  async checkConnection() {
    try {
      const res = await fetchWithTimeout(`${API_URL}/stats`, { method: 'GET' }, 3000);
      return res.ok;
    } catch {
      return false;
    }
  },

  async sendAlert(userId, username, address) {
    try {
      const res = await fetchWithTimeout(`${API_URL}/send-alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: String(userId), 
          username: username || '', 
          address: address || ''
        })
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error('Ошибка sendAlert:', error);
      return { success: false, message: 'Сервер недоступен', error: true };
    }
  }
};

