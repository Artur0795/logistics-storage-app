import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';
import './AuthForm.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const { username, full_name, email, password, confirmPassword } = formData;

    if (!username.trim() || !full_name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Все поля должны быть заполнены');
      return;
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setLoading(true);

    console.log('Отправляемые данные:', {
      username: username.trim(),
      full_name: full_name.trim(),
      email: email.trim(),
      password
    });

    try {
      const response = await API.post('/register/', {
        username: username.trim(),
        full_name: full_name.trim(),
        email: email.trim(),
        password
      });

      console.log('Ответ сервера:', response.data);
      setMessage('Регистрация прошла успешно! Переходим на страницу входа...');
      setError('');
      setFormData({
        username: '',
        full_name: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      console.error('Ответ сервера:', error.response?.data);

      if (error.response?.data?.details) {
        const details = error.response.data.details;
        let errorMessages = [];

        if (details.username) errorMessages.push(`Имя пользователя: ${details.username[0]}`);
        if (details.full_name) errorMessages.push(`Полное имя: ${details.full_name[0]}`);
        if (details.email) errorMessages.push(`Email: ${details.email[0]}`);
        if (details.password) errorMessages.push(`Пароль: ${details.password[0]}`);

        setError(errorMessages.join('\n'));
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Ошибка при регистрации');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2 className="auth-title">Регистрация</h2>
          <div className="auth-field">
            <label>Имя пользователя:</label>
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
            <label>Полное имя:</label>
            <input
              type="text"
              name="full_name"
              placeholder="Введите ваше полное имя"
              value={formData.full_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="auth-field">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="auth-field">
            <label>Пароль:</label>
            <input
              type="password"
              name="password"
              placeholder="Пароль (минимум 6 символов)"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>
          <div className="auth-field">
            <label>Подтвердите пароль:</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Подтвердите пароль"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
          {error && <div className="auth-error">{error}</div>}
          {message && <div className="auth-message">{message}</div>}
        </form>
        <p>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
        <Link to="/">← На главную</Link>
        <div className="cargo-card">
          <h3>Информация о грузах</h3>
          <ul>
            <li>Доставка по России</li>
            <li>Отслеживание отправлений онлайн</li>
            <li>Безопасное хранение документов</li>
            <li>Выгодные тарифы для бизнеса</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Register;

