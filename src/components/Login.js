import React, { useState } from 'react';
import './AuthForm.css';
import API from '../api';
import { useNavigate } from 'react-router-dom';

const Login = ({ setIsAuthenticated, setIsAdmin }) => {
  const [form, setForm] = useState({ username: '', password: '' }); 
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/login/', form); 
      setIsAuthenticated(true);
      setIsAdmin(!!res.data.is_admin);
      localStorage.setItem('userName', res.data.full_name || res.data.username || form.username);
      if (res.data.is_admin) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch {
      setError('Неверный логин или пароль');
    }
  };

  return (
    <div className="auth-bg">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2 className="auth-title">Вход</h2>
        <div className="auth-field">
          <label>Логин:</label>
          <input name="username" value={form.username} onChange={handleChange} /> {}
        </div>
        <div className="auth-field">
          <label>Пароль:</label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              style={{ paddingRight: '32px' }}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '8px',
                cursor: 'pointer',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title={showPassword ? "Скрыть пароль" : "Показать пароль"}
            >
              {showPassword ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" fill="#888"/>
                  <circle cx="12" cy="12" r="2.5" fill="#888"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M1 12c1.73 3.89 6 7 11 7 2.13 0 4.15-.55 5.97-1.5M21 12c-1.73-3.89-6-7-11-7-1.64 0-3.22.31-4.68.88M3 3l18 18" stroke="#888" strokeWidth="2"/>
                </svg>
              )}
            </span>
          </div>
        </div>
        <button type="submit" className="auth-btn">Войти</button>
        {error && <div className="auth-error">{error}</div>}
      </form>
    </div>
  );
};

export default Login;
