import axios from 'axios';

// Определяем базовый URL для API
const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    const hostname = window.location.hostname;

    // Для reg.ru и других хостингов
    if (hostname.includes('reg.ru') || hostname.includes('logistics-storage-app.ru')) {
      return `${window.location.protocol}//${hostname}/api`;
    }

    // Для IP адреса
    if (hostname === '89.111.175.147') {
      return 'http://89.111.175.147:8000/api';
    }

    // По умолчанию для production
    return `${window.location.protocol}//${hostname}/api`;
  }

  return 'http://localhost:8000/api';
};

const API = axios.create({
  baseURL: getApiBaseUrl(),
  // Удаляем Content-Type, чтобы axios сам выставил его для FormData
  timeout: 15000,
});

// Добавление токена авторизации к запросам
API.interceptors.request.use((config) => {
  // Не добавлять токен для login и register
  if (
    !config.url.endsWith('/login/') &&
    !config.url.endsWith('/register/')
  ) {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
  }
  // Если отправляем FormData, не выставляем Content-Type вручную
  if (config.data instanceof FormData) {
    if (config.headers['Content-Type']) {
      delete config.headers['Content-Type'];
    }
  } else {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

// Улучшаем обработку ошибок для хостинга
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    console.error('Current baseURL:', API.defaults.baseURL);

    // Если сервер недоступен на хостинге, показываем демо режим
    if (!error.response && error.config) {
      const url = error.config.url;
      console.log('Server unavailable, using demo mode for:', url);

      // Mock для файлов
      if (url.includes('/files/')) {
        return Promise.resolve({
          data: {
            files: [],
            message: 'API недоступен. Демо режим активен.'
          }
        });
      }

      // Mock для регистрации
      if (url.includes('/register/')) {
        return Promise.resolve({
          data: {
            success: true,
            message: 'Регистрация недоступна (демо режим)',
            user: { id: 1, username: 'demo' }
          }
        });
      }

      // Mock для входа
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

      // Mock для загрузки файлов
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

    // Для ошибок 404 на хостинге
    if (error.response?.status === 404) {
      console.warn('API endpoint not found:', error.config.url);
    }

    // Очистить токен при ошибке авторизации
    if (error.response?.status === 401) {
      // localStorage.removeItem('token');
      // sessionStorage.removeItem('token');
      // Можно добавить редирект на страницу входа, если нужно
      // window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

console.log('API baseURL:', getApiBaseUrl());

export default API;

// Всё ок, токен добавляется к каждому запросу.
