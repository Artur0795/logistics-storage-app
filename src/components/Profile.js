import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import API from '../api';
import './Profile.css';

const Profile = () => {
  const [userName, setUserName] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }
    
    const fetchProfile = async () => {
      try {
        const response = await API.get('/profile/');
        setUserProfile(response.data);
        setUserName(response.data.full_name || response.data.username);
        localStorage.setItem('userName', response.data.full_name || response.data.username);
      } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
        const storedName = localStorage.getItem('userName');
        setUserName(storedName || 'Пользователь');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-loading">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <header className="profile-header">
        <div className="profile-header-content">
          <h1>Личный кабинет</h1>
          <p className="profile-welcome">Добро пожаловать, {userName}!</p>
          
          {userProfile && (
            <div className="profile-info">
              <div className="profile-details">
                <span className="profile-detail">
                  <strong>Логин:</strong> {userProfile.username}
                </span>
                <span className="profile-detail">
                  <strong>Email:</strong> {userProfile.email}
                </span>
                <span className="profile-detail">
                  <strong>Дата регистрации:</strong> {
                    userProfile.date_joined 
                      ? new Date(userProfile.date_joined).toLocaleDateString('ru-RU')
                      : 'Не указана'
                  }
                </span>
                {userProfile.is_admin && (
                  <span className="profile-admin-badge">Администратор</span>
                )}
              </div>
            </div>
          )}
        </div>
        
      </header>
      
      <main className="profile-main">
        <Dashboard />
      </main>
    </div>
  );
};


export default Profile;