import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const cities = [
  { name: 'Москва', left: '17%', top: '41%' },
  { name: 'Санкт-Петербург', left: '25%', top: '30%' },
  { name: 'Екатеринбург', left: '42%', top: '61%' },
  { name: 'Пермь', left: '38%', top: '53%' },
  { name: 'Казань', left: '28%', top: '56%' },
  { name: 'Краснодар', left: '11%', top: '61%' },
  { name: 'Нижний Новгород', left: '28%', top: '48%' },
];

const sliderImages = [
  {
    src: 'photo.avif',
    alt: 'Логистика, фура и контейнеры',
  },
  {
    src: '2.jpg',
    alt: 'Фото 2',
  },
  {
    src: 'fur.png',
    alt: 'Фура',
  },
];

const HomePage = () => {
  const [showChat, setShowChat] = useState(false);
  const [slide, setSlide] = useState(0);
  const [userName, setUserName] = useState('');
  const [chatForm, setChatForm] = useState({ name: '', message: '' });
  const [isAutoSliding, setIsAutoSliding] = useState(true);

  useEffect(() => {
    const updateUserName = () => {
      const storedName = localStorage.getItem('userName');
      setUserName(storedName || '');
    };
    updateUserName();
    window.addEventListener('storage', updateUserName);
    return () => window.removeEventListener('storage', updateUserName);
  }, []);

  // Автоматическое переключение слайдов
  useEffect(() => {
    if (!isAutoSliding) return;
    
    const interval = setInterval(() => {
      setSlide(prev => (prev + 1) % sliderImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoSliding]);

  const nextSlide = useCallback(() => {
    setIsAutoSliding(false);
    setSlide((slide + 1) % sliderImages.length);
    setTimeout(() => setIsAutoSliding(true), 10000); // Возобновить через 10 сек
  }, [slide]);

  const prevSlide = useCallback(() => {
    setIsAutoSliding(false);
    setSlide((slide - 1 + sliderImages.length) % sliderImages.length);
    setTimeout(() => setIsAutoSliding(true), 10000); // Возобновить через 10 сек
  }, [slide]);

  const goToSlide = useCallback((index) => {
    setIsAutoSliding(false);
    setSlide(index);
    setTimeout(() => setIsAutoSliding(true), 10000);
  }, []);

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatForm.name.trim() || !chatForm.message.trim()) return;
    
    // Здесь можно добавить логику отправки сообщения на сервер
    console.log('Отправлено сообщение:', chatForm);
    alert('Сообщение отправлено! Мы свяжемся с вами в ближайшее время.');
    setChatForm({ name: '', message: '' });
    setShowChat(false);
  };

  const handleChatInputChange = (field, value) => {
    setChatForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <React.Fragment>
      <div className="homepage-slider" role="banner">
        <img
          src={sliderImages[slide].src}
          alt={sliderImages[slide].alt}
          className="homepage-slider-img"
        />
        <button 
          className="homepage-slider-btn left" 
          onClick={prevSlide}
          aria-label="Предыдущий слайд"
        >
          &lt;
        </button>
        <button 
          className="homepage-slider-btn right" 
          onClick={nextSlide}
          aria-label="Следующий слайд"
        >
          &gt;
        </button>
        
        {/* Индикаторы слайдов */}
        <div className="homepage-slider-indicators">
          {sliderImages.map((_, index) => (
            <button
              key={index}
              className={`homepage-slider-dot ${slide === index ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Перейти к слайду ${index + 1}`}
            />
          ))}
        </div>

        <div className="homepage-slider-center-text">
          <h1>Logistics Storage App</h1>
          <p>Надёжная логистика для отправки грузов по России!</p>
        </div>
      </div>
      <div className="homepage-cards-row">
        <div className="homepage-card">
          <h3>Международные перевозки</h3>
          <p>
            На протяжении многих лет мы помогаем совершать междугородние сделки и доставлять грузы по России.
          </p>
        </div>
        <div id="about-service" className="homepage-card">
          <h3>Рефрижераторные перевозки</h3>
          <p>
            Бесперебойная холодильная цепь и своевременная доставка охлажденных грузов являются основными требованиями к качеству в логистике холодильного хранения.
          </p>
        </div>
      </div>
      <div className="homepage-container">
        <section className="homepage-info">
          <h2>О сервисе</h2>
          <p>
            Мы — современная логистическая компания, предоставляющая услуги доставки грузов по России.<br />
            Отслеживайте свои отправления.<br />
            Для клиентов и администраторов доступны удобные инструменты управления.
          </p>
        </section>
        <nav className="homepage-nav" role="navigation">
          <Link className="homepage-link" to="/register">Регистрация</Link>
          <span className="homepage-sep">|</span>
          {userName ? (
            <Link className="homepage-link" to="/profile">{userName}</Link>
          ) : (
            <Link className="homepage-link" to="/login">Вход</Link>
          )}
        </nav>
      </div>

      <div className="homepage-geo-section">
        <div className="homepage-geo-title">
          <h2>География доставки</h2>
        </div>
        <div className="homepage-geo-img-map-wrapper">
          <img
            src="/машинка.png"
            alt="Машинка"
            className="homepage-geo-bg"
          />
          <div className="homepage-map-wrapper-on-bg">
            <img
              src="/map.png"
              alt="Карта России"
              className="homepage-map-img-on-bg"
            />
            {cities.map(city => (
              <div
                key={city.name}
                className="homepage-map-city-on-bg"
                style={{ left: city.left, top: city.top }}
              >
                <span className="homepage-map-dot"></span>
                {city.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="homepage-footer-navbar" role="contentinfo">
        <div className="homepage-footer-links">
        <a href="#about-service" className="homepage-footer-link">О компании</a>
<span className="homepage-sep">|</span>
    <span className="homepage-footer-link--plain">Политика конфиденциальности</span>        </div>
        <div className="homepage-footer-social">
          <a
            href="https://t.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="homepage-footer-btn telegram"
            title="Telegram"
          >Telegram</a>
          <a
            href="https://wa.me/79955006179"
            target="_blank"
            rel="noopener noreferrer"
            className="homepage-footer-btn whatsapp"
            title="WhatsApp"
          >WhatsApp</a>
        </div>
      </footer>

      {showChat && (
        <div className="homepage-chat-popup" role="dialog" aria-labelledby="chat-title">
          <div className="homepage-chat-header">
            <span id="chat-title">Онлайн-чат</span>
            <button 
              className="homepage-chat-close" 
              onClick={() => setShowChat(false)}
              aria-label="Закрыть чат"
            >
              ×
            </button>
          </div>
          <form className="homepage-chat-form" onSubmit={handleChatSubmit}>
            <input 
              type="text" 
              placeholder="Ваше имя" 
              className="homepage-chat-input"
              value={chatForm.name}
              onChange={(e) => handleChatInputChange('name', e.target.value)}
              required
              aria-label="Ваше имя"
            />
            <textarea 
              placeholder="Ваш вопрос..." 
              className="homepage-chat-input" 
              rows={3}
              value={chatForm.message}
              onChange={(e) => handleChatInputChange('message', e.target.value)}
              required
              aria-label="Ваш вопрос"
            />
            <button type="submit" className="homepage-chat-send-btn">
              Отправить
            </button>
          </form>
        </div>
      )}
      
      <button
        className="homepage-chat-widget"
        onClick={() => setShowChat(true)}
        title="Онлайн-чат"
        aria-label="Открыть чат поддержки"
      >
        💬
      </button>
    </React.Fragment>
  );
};

export default HomePage;