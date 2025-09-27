# ☁️ MyCloud - приложение для хранения данных

## Описание

Веб-приложение для облачного хранения файлов с административным интерфейсом и управлением пользовательскими хранилищами.  
Бэкенд — Django + PostgreSQL, фронтенд — React.

---

## Требования

- Python >= 3.10
- Django >= 3.0
- Node.js >= 18.0
- PostgreSQL >= 13
- npm >= 8.0

---

## Развертывание проекта

### 1. Клонирование репозитория

```sh
git clone https://github.com/Artur0795/logistics-storage-app.git
cd logistics-storage-app
```

---

### 2. Установка и настройка backend

#### Установка зависимостей

```sh
pip install -r requirements.txt
```

#### Настройка базы данных

- Создать базу данных PostgreSQL:
  ```sh
  createdb -U postgres logistics_db
  ```
- В файле `logistics_backend/settings.py` указать свои параметры подключения к БД:
  - HOST, PORT, USER, PASSWORD

#### Миграции

```sh
python manage.py migrate
```

#### Создание суперпользователя (админ)

```sh
python manage.py createsuperuser
```

#### Запуск backend-сервера

```sh
python manage.py runserver
```

---

### 3. Установка и сборка frontend

#### Установка зависимостей

```sh
cd src
npm install
```

#### Сборка фронтенда для продакшн

```sh
npm run build
```

- Статические файлы будут собраны в папку `src/build`.
- Для продакшн-окружения рекомендуется настроить Django на отдачу статических файлов из этой папки.

---

### 4. Запуск приложения

- Backend: http://localhost:8000/
- Frontend (dev): http://localhost:3000/
- После сборки фронтенда, статические файлы можно обслуживать через Django или nginx.

---

## Структура проекта

- `logistics_backend/` — Django backend
- `src/` — React frontend
- `media/` — пользовательские файлы
- `src/build/` — собранные статические файлы фронтенда

---

## Примеры команд для деплоя

```sh
python manage.py migrate
python manage.py collectstatic
gunicorn logistics_backend.wsgi:application

cd src
npm install
npm run build
```

---

## Дополнительные рекомендации

- Все API-вызовы используют формат JSON.
- Для работы сессий и авторизации убедиться, что запросы отправляются с withCredentials.
- Для продакшн-окружения отключить DEBUG и настроить ALLOWED_HOSTS.

---

## Контакты и поддержка

Вопросы по запуску и настройке — через Issues на GitHub или по почте.

---

## Лицензия

MIT License