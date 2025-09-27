import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ isAuthenticated, onLogout }) => (
  <>
    <header className="navbar-header">
      <div className="navbar-brand">
        <span className="navbar-logo">🚚</span>
        <span className="navbar-title">Logistics Storage</span>
      </div>
      <nav className="navbar-nav">
        <Link className="navbar-link" to="/">Главная</Link>
        {isAuthenticated ? (
          <>
            <Link className="navbar-link" to="/dashboard">Файлы</Link>
            <button
              className="navbar-btn"
              onClick={() => {
                onLogout();
                window.location.href = '/'; // обновить страницу и перейти на главную
              }}
            >Выход</button>
          </>
        ) : (
          <>
            <Link className="navbar-link" to="/login">Вход</Link>
            <Link className="navbar-link" to="/register">Регистрация</Link>
          </>
        )}
      </nav>
    </header>
  </>
);

export default Navbar;
