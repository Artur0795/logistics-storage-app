import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './AuthForm.css';

const validateLogin = login =>
  /^[A-Za-z][A-Za-z0-9]{3,19}$/.test(login);

const validateEmail = email =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validatePassword = password =>
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}$/.test(password);

const Register = () => {
  const [form, setForm] = useState({ login: '', name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState(''); 
  const navigate = useNavigate(); 

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    let newErrors = {};
    if (!validateLogin(form.login)) newErrors.login = 'Логин: только латиница и цифры, от 4 до 20 символов, первый символ — буква.';
    if (!form.name) newErrors.name = 'Введите полное имя.';
    if (!validateEmail(form.email)) newErrors.email = 'Некорректный email.';
    if (!validatePassword(form.password)) newErrors.password = 'Пароль: минимум 6 символов, заглавная буква, цифра, спецсимвол.';
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    try {
      const response = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: form.login,
          password: form.password,
          full_name: form.name,
          email: form.email
        })
      });
      const data = await response.json();
      if (response.ok) {
        setSuccessMsg('Регистрация успешно пройдена.');
        setErrors({}); 
        setTimeout(() => {
          navigate('/login'); 
        }, 1000);
      } else {
        setErrors({ server: data.error || 'Ошибка регистрации' });
      }
    } catch (err) {
      setErrors({ server: 'Ошибка соединения с сервером' });
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2 className="auth-title">Регистрация</h2>
          <div className="auth-field">
            <label>Логин:</label>
            <input name="login" value={form.login} onChange={handleChange} />
            {errors.login && <div className="auth-error">{errors.login}</div>}
          </div>
          <div className="auth-field">
            <label>Полное имя:</label>
            <input name="name" value={form.name} onChange={handleChange} />
            {errors.name && <div className="auth-error">{errors.name}</div>}
          </div>
          <div className="auth-field">
            <label>Email:</label>
            <input name="email" value={form.email} onChange={handleChange} />
            {errors.email && <div className="auth-error">{errors.email}</div>}
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
            {errors.password && <div className="auth-error">{errors.password}</div>}
          </div>
          {errors.server && <div className="auth-error">{errors.server}</div>}
          <button type="submit" className="auth-btn">Зарегистрироваться</button>
        </form>
        {successMsg && <div className="auth-success">{successMsg}</div>} {}
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
