import axios from 'axios';

const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    const hostname = window.location.hostname;

    if (hostname.includes('reg.ru') || hostname.includes('logistics-storage-app.ru')) {
      return `${window.location.protocol}//${hostname}/api`;
    }

    if (hostname === '213.189.201.170') {
      return `${window.location.protocol}//${hostname}/api`;
    }

    return `${window.location.protocol}//${hostname}/api`;
  }

  return 'http://localhost:8000/api';
};

const API = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
});

API.interceptors.request.use((config) => {
  if (
    !config.url.endsWith('/login/') &&
    !config.url.endsWith('/register/')
  ) {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
  }
  if (config.data instanceof FormData) {
    if (config.headers['Content-Type']) {
      delete config.headers['Content-Type'];
    }
  } else {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    console.error('Current baseURL:', API.defaults.baseURL);

    if (!error.response && error.config) {
      const url = error.config.url;
      console.log('Server unavailable, using demo mode for:', url);

      if (url.includes('/files/')) {
        return Promise.resolve({
          data: {
            files: [],
            message: 'API недоступен. Демо режим активен.'
          }
        });
      }

      if (url.includes('/register/')) {
        return Promise.resolve({
          data: {
            success: true,
            message: 'Регистрация недоступна (демо режим)',
            user: { id: 1, username: 'demo' }
          }
        });
      }

      if (url.includes('/login/')) {
        localStorage.setItem('token', 'demo-token');
        return Promise.resolve({
          data: {
            success: true,
            message: 'Вход выполнен (демо режим)',
            token: 'demo-token',
            user: { id: 1, username: 'demo' }
          }
        });
      }

      if (url.includes('/upload/')) {
        return Promise.resolve({
          data: {
            success: true,
            message: 'Загрузка недоступна в демо режиме',
            file: { id: Date.now(), original_name: 'demo.txt' }
          }
        });
      }
    }

    if (error.response?.status === 404) {
      console.warn('API endpoint not found:', error.config.url);
    }

    if (error.response?.status === 401) {
    }

    return Promise.reject(error);
  }
);

console.log('API baseURL:', getApiBaseUrl());

export default API;

