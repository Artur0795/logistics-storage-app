import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';
import './AuthForm.css';

const Login = ({ setIsAuthenticated, setIsAdmin }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Отладочные логи
    console.log('Отправляемые данные для входа:', formData);

    try {
      const response = await API.post('/login/', formData);
      console.log('Полный ответ сервера:', response);
      console.log('Данные ответа сервера:', response.data);
      console.log('Статус ответа:', response.status);

      // Если статус 200, значит авторизация прошла успешно
      if (response.status === 200 && response.data) {
        // Различные форматы ответа от Django views
        const responseData = response.data;
        
        // Вариант 1: ответ содержит token напрямую
        if (responseData.token || responseData.access_token || responseData.key) {
          const token = responseData.token || responseData.access_token || responseData.key;
          const userData = responseData.user || responseData;
          const isAdminUser = responseData.is_admin || userData.is_admin || false;
          const userDisplayName = userData.full_name || userData.username || formData.username;

          // Сохраняем данные в localStorage
          localStorage.setItem('token', token);
          localStorage.setItem('userName', userDisplayName);
          localStorage.setItem('userRole', isAdminUser ? 'admin' : 'user');

          // Обновляем состояние приложения
          setIsAuthenticated(true);
          setIsAdmin(isAdminUser);

          console.log('Успешная авторизация, перенаправление...');
          
          // Перенаправляем пользователя
          navigate(isAdminUser ? '/admin' : '/profile');
          return;
        }
        
        // Вариант 2: ответ содержит success: true
        if (responseData.success === true || responseData.status === 'success') {
          const userData = responseData.user || responseData.data || responseData;
          const isAdminUser = responseData.is_admin || userData.is_admin || false;
          const userDisplayName = userData.full_name || userData.username || formData.username;
          const token = responseData.token || responseData.session_id || 'authenticated';

          localStorage.setItem('token', token);
          localStorage.setItem('userName', userDisplayName);
          localStorage.setItem('userRole', isAdminUser ? 'admin' : 'user');

          setIsAuthenticated(true);
          setIsAdmin(isAdminUser);

          console.log('Успешная авторизация (success=true), перенаправление...');
          navigate(isAdminUser ? '/admin' : '/profile');
          return;
        }

        // Вариант 3: просто данные пользователя без явного success
        if (responseData.username || responseData.id) {
          const userData = responseData;
          const isAdminUser = userData.is_admin || false;
          const userDisplayName = userData.full_name || userData.username || formData.username;
          const token = responseData.token || `session_${Date.now()}`;

          localStorage.setItem('token', token);
          localStorage.setItem('userName', userDisplayName);
          localStorage.setItem('userRole', isAdminUser ? 'admin' : 'user');

          setIsAuthenticated(true);
          setIsAdmin(isAdminUser);

          console.log('Успешная авторизация (данные пользователя), перенаправление...');
          navigate(isAdminUser ? '/admin' : '/profile');
          return;
        }

        // Если ни один вариант не подошел
        console.error('Неожиданный формат ответа от сервера:', responseData);
        setError('Неожиданный формат ответа от сервера');
      } else {
        setError('Неверные учетные данные');
      }
    } catch (error) {
      console.error('Полная ошибка при входе:', error);
      console.error('Ответ сервера при ошибке:', error.response);

      if (error.response?.status === 400) {
        // 400 статус обычно означает ошибку валидации
        const errorData = error.response.data;
        
        if (errorData.non_field_errors) {
          setError(errorData.non_field_errors[0]);
        } else if (errorData.detail) {
          setError(errorData.detail);
        } else if (errorData.error) {
          setError(errorData.error);
        } else if (typeof errorData === 'string') {
          setError(errorData);
        } else {
          setError('Неверные учетные данные');
        }
      } else if (error.response?.status === 401) {
        setError('Неверные учетные данные');
      } else if (error.request) {
        setError('Ошибка подключения к серверу');
      } else {
        setError('Произошла ошибка при входе');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2 className="auth-title">Вход</h2>
          <div className="auth-field">
            <label>Логин:</label>
            <input
              type="text"
              name="username"
              placeholder="Имя пользователя"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="auth-field">
            <label>Пароль:</label>
            <input
              type="password"
              name="password"
              placeholder="Пароль"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
          {error && <div className="auth-error">{error}</div>}
        </form>
        <p>
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
        <Link to="/">← На главную</Link>
      </div>
    </div>
  );
};

export default Login;
