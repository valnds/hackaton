export const API_URL = 'https://valndapp.ru/api';

export const testConnection = async () => {
  try {
    const response = await fetch(`${API_URL}/stats`, { method: 'GET' });
    return response.ok;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
};