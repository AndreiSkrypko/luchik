# 📂 Структура проекта "Детский центр Лучик"

```
luchik/
│
├── 📁 backend/                    # Django REST API
│   ├── 📁 luchik/                # Основные настройки Django
│   │   ├── __init__.py
│   │   ├── settings.py           # Настройки проекта
│   │   ├── urls.py               # Основные URL маршруты
│   │   ├── wsgi.py               # WSGI конфигурация
│   │   └── asgi.py               # ASGI конфигурация
│   │
│   ├── 📁 api/                   # API приложение
│   │   ├── __init__.py
│   │   ├── models.py             # Модели (Course, Contact)
│   │   ├── serializers.py        # Сериализаторы для API
│   │   ├── views.py              # Views и ViewSets
│   │   ├── urls.py               # URL маршруты API
│   │   ├── admin.py              # Настройки админ-панели
│   │   └── apps.py               # Конфигурация приложения
│   │
│   ├── manage.py                 # Django management команды
│   ├── requirements.txt          # Python зависимости
│   ├── .env.example              # Пример конфигурации
│   └── README.md                 # Документация backend
│
├── 📁 frontend/                  # Next.js приложение
│   ├── 📁 app/                   # App Router (Next.js 14)
│   │   ├── layout.tsx            # Корневой layout
│   │   ├── page.tsx              # Главная страница
│   │   ├── page.module.css       # Стили главной страницы
│   │   └── globals.css           # Глобальные стили
│   │
│   ├── 📁 components/            # React компоненты
│   │   ├── Navbar.tsx            # 🎈 Навбар с воздушными шариками
│   │   ├── Navbar.module.css     # Стили навбара
│   │   ├── Footer.tsx            # Футер
│   │   └── Footer.module.css     # Стили футера
│   │
│   ├── package.json              # Node.js зависимости
│   ├── tsconfig.json             # TypeScript конфигурация
│   ├── next.config.js            # Next.js конфигурация
│   ├── next-env.d.ts             # TypeScript типы Next.js
│   ├── .eslintrc.json            # ESLint конфигурация
│   └── README.md                 # Документация frontend
│
├── 📄 README.md                  # Главная документация
├── 📄 QUICKSTART.md              # Руководство по быстрому старту
├── 📄 PROJECT_STRUCTURE.md       # Этот файл
├── 🚀 install.bat                # Скрипт установки (Windows)
├── 🚀 start.bat                  # Скрипт запуска (Windows)
└── .gitignore                    # Git ignore правила
```

## 🎯 Основные компоненты

### Backend (Django)

#### Models (`backend/api/models.py`)
- **Course** - Модель курсов детского центра
  - title, description, age_from, age_to, duration, price
- **Contact** - Контактная информация
  - address, phone, email, working_hours

#### API Endpoints
- `GET /api/home/` - Данные главной страницы
- `GET /api/courses/` - Список всех курсов
- `GET /api/contacts/` - Контактная информация
- `/admin/` - Административная панель

### Frontend (Next.js)

#### Компоненты

**Navbar** (`frontend/components/Navbar.tsx`)
- 🎈 Анимированные воздушные шарики
- Интерактивное меню при клике на шарик
- 5 разделов с разными цветами:
  - Главная (красный)
  - Курсы (бирюзовый)
  - Контакты (желтый)
  - О нас (мятный)
  - Галерея (розовый)

**Footer** (`frontend/components/Footer.tsx`)
- Контактная информация
- Социальные сети
- Навигационные ссылки
- Анимированные звездочки

**Home Page** (`frontend/app/page.tsx`)
- Hero секция с анимацией
- Карточки направлений
- Информационные блоки
- Call-to-action секция

## 🎨 Технологии и библиотеки

### Backend
- **Django 4.2** - Веб-фреймворк
- **Django REST Framework** - API
- **django-cors-headers** - CORS настройки
- **SQLite** - База данных (dev)

### Frontend
- **Next.js 14** - React фреймворк
- **React 18** - UI библиотека
- **TypeScript** - Типизация
- **Framer Motion** - Анимации
- **CSS Modules** - Модульные стили

## 🎯 Особенности анимации

### Воздушные шарики в Navbar
- Плавное появление при загрузке (stagger эффект)
- Постоянное движение вверх-вниз
- Увеличение при наведении
- Анимация клика
- Выпадающее меню с fade-in эффектом
- CSS-стилизованные шарики с бликами и ниточками

### Главная страница
- Fade-in анимация для всех секций
- Плавающие звездочки и эмодзи
- Pulse эффект для заголовков
- Hover эффекты для карточек
- Анимированные кнопки

## 📱 Адаптивность

- Полностью responsive дизайн
- Оптимизация для мобильных устройств
- Адаптивная сетка для карточек
- Уменьшенные элементы на малых экранах
- Touch-friendly интерфейс

## 🔧 Конфигурация

### CORS
Backend настроен на работу с frontend:
- Разрешены запросы с localhost:3000
- Включены credentials

### TypeScript
- Strict режим включен
- Полная типизация компонентов
- Path aliases (@/*)

### ESLint
- Next.js рекомендации
- Проверка качества кода

