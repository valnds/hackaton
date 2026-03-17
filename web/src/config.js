export const API_URL = 'https://olympik.fun/api';
export const WS_URL = 'wss://olympik.fun';

export const testConnection = async () => {
  try {
    const response = await fetch(`${API_URL}/stats`, { method: 'GET' });
    return response.ok;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
};

