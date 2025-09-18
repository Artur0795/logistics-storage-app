import React, { useState, useEffect } from 'react';
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

const distances = {
  'Москва': {
    'Санкт-Петербург': 710,
    'Екатеринбург': 1800,
    'Пермь': 1400,
    'Казань': 820,
    'Краснодар': 1350,
    'Нижний Новгород': 420,
  },
  'Санкт-Петербург': {
    'Москва': 710,
    'Екатеринбург': 2200,
    'Пермь': 1800,
    'Казань': 1500,
    'Краснодар': 1920,
    'Нижний Новгород': 1100,
  },
  'Екатеринбург': {
    'Москва': 1800,
    'Санкт-Петербург': 2200,
    'Пермь': 360,
    'Казань': 900,
    'Краснодар': 2600,
    'Нижний Новгород': 1400,
  },
  'Пермь': {
    'Москва': 1400,
    'Санкт-Петербург': 1800,
    'Екатеринбург': 360,
    'Казань': 630,
    'Краснодар': 2100,
    'Нижний Новгород': 950,
  },
  'Казань': {
    'Москва': 820,
    'Санкт-Петербург': 1500,
    'Екатеринбург': 900,
    'Пермь': 630,
    'Краснодар': 1700,
    'Нижний Новгород': 390,
  },
  'Краснодар': {
    'Москва': 1350,
    'Санкт-Петербург': 1920,
    'Екатеринбург': 2600,
    'Пермь': 2100,
    'Казань': 1700,
    'Нижний Новгород': 1600,
  },
  'Нижний Новгород': {
    'Москва': 420,
    'Санкт-Петербург': 1100,
    'Екатеринбург': 1400,
    'Пермь': 950,
    'Казань': 390,
    'Краснодар': 1600,
  },
};

const HomePage = () => {
  const [showChat, setShowChat] = useState(false);
  const [slide, setSlide] = useState(0);
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [volume, setVolume] = useState('');
  const [vehicle, setVehicle] = useState('gazelle');
  const [calcResult, setCalcResult] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const updateUserName = () => {
      const storedName = localStorage.getItem('userName');
      setUserName(storedName || '');
    };
    updateUserName();
    window.addEventListener('storage', updateUserName);
    return () => window.removeEventListener('storage', updateUserName);
  }, []);

  const nextSlide = () => setSlide((slide + 1) % sliderImages.length);
  const prevSlide = () => setSlide((slide - 1 + sliderImages.length) % sliderImages.length);

  const handleCalc = (e) => {
    e.preventDefault();
    if (!fromCity || !toCity || !volume) {
      setCalcResult('Пожалуйста, выберите оба города и укажите объем.');
      return;
    }
    if (fromCity === toCity) {
      setCalcResult('Города отправления и назначения должны отличаться.');
      return;
    }
    const dist = distances[fromCity]?.[toCity];
    if (!dist) {
      setCalcResult('Нет данных о расстоянии между выбранными городами.');
      return;
    }
    const vol = parseFloat(volume);
    if (isNaN(vol) || vol <= 0) {
      setCalcResult('Объем должен быть положительным числом.');
      return;
    }
    const basePrice = vol * 3500;
    const kmPrice = vehicle === 'gazelle' ? dist * 45 : dist * 70;
    const total = Math.round(basePrice + kmPrice);
setCalcResult(
  <>
    Расстояние: {dist} км. Стоимость доставки ({vehicle === 'gazelle' ? 'Газель' : 'Камаз'}): {total.toLocaleString()} руб. (Объем: {vol} м³, {vehicle === 'gazelle' ? '45 руб/км' : '70 руб/км'}, 1 м³ = 3500 руб)
    <br />
    <br />
    *Цена указана с учетом НДС 20%, конечная стоимость может отличаться от заявленной в зависимости от дополнительных услуг и условий перевозки, а также от обёма и веса груза. Также возможны скидки при больших объемах перевозок.
  </>
);
  };

  return (
    <React.Fragment>
      <div className="homepage-slider">
        <img
          src={sliderImages[slide].src}
          alt={sliderImages[slide].alt}
          className="homepage-slider-img"
        />
        <button className="homepage-slider-btn left" onClick={prevSlide}>&lt;</button>
        <button className="homepage-slider-btn right" onClick={nextSlide}>&gt;</button>
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
            Рассчитайте стоимость доставки, отслеживайте свои отправления.<br />
            Для клиентов и администраторов доступны удобные инструменты управления.
          </p>
        </section>
        <section className="homepage-calc">
          <h2>Калькулятор стоимости доставки</h2>
          <form className="calc-form" onSubmit={handleCalc}>
            <select
              className="calc-input"
              value={fromCity}
              onChange={e => setFromCity(e.target.value)}
            >
              <option value="">Город отправления</option>
              {cities.map(city => (
                <option key={city.name} value={city.name}>{city.name}</option>
              ))}
            </select>
            <select
              className="calc-input"
              value={toCity}
              onChange={e => setToCity(e.target.value)}
            >
              <option value="">Город назначения</option>
              {cities.map(city => (
                <option key={city.name} value={city.name}>{city.name}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Объем (м³)"
              className="calc-input"
              min="0"
              value={volume}
              onChange={e => setVolume(e.target.value)}
            />
            <select
              className="calc-input"
              value={vehicle}
              onChange={e => setVehicle(e.target.value)}
            >
              <option value="gazelle">Газель (45 руб/км)</option>
              <option value="kamaz">Камаз (70 руб/км)</option>
            </select>
            <button type="submit" className="calc-btn">Рассчитать</button>
          </form>
          <div className="calc-result">
            {calcResult}
          </div>
        </section>
        <nav className="homepage-nav">
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

      <footer className="homepage-footer-navbar">
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
        <div className="homepage-chat-popup">
          <div className="homepage-chat-header">
            Онлайн-чат
            <button className="homepage-chat-close" onClick={() => setShowChat(false)}>×</button>
          </div>
          <form className="homepage-chat-form">
            <input type="text" placeholder="Ваше имя" className="homepage-chat-input" />
            <textarea placeholder="Ваш вопрос..." className="homepage-chat-input" rows={3} />
            <button type="submit" className="homepage-chat-send-btn">Отправить</button>
          </form>
        </div>
      )}
      <button
        className="homepage-chat-widget"
        onClick={() => setShowChat(true)}
        title="Онлайн-чат"
      >
        💬
      </button>
    </React.Fragment>
  );
};

export default HomePage;