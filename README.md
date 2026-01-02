# Cell War

**Cell War** — это пошаговая стратегическая игра в стиле Cyberpunk/Neo-Futurism, вдохновленная классическими играми на бумаге. Проект реализован как полноценное веб-приложение с современной архитектурой и поддержкой онлайн-мультиплеера.

## 🎮 Описание игры

Cell War предлагает тактическую стратегию с элементами экономики и территориальной экспансии. Игроки соревнуются за контроль над картой, развивают экономику через фермы и защищают свои территории. Игра поддерживает несколько режимов: одиночная игра, hot-seat мультиплеер и онлайн-мультиплеер.

### Ключевые особенности:
- **Тактическая экспансия**: Захват территорий, строительство ферм, укрепление обороны
- **Экономическая система**: Доход от ферм, растущая стоимость построек
- **Разнообразные ландшафты**: Трава, холмы, горы, вода с разными характеристиками
- **Система рейтинга**: ELO-рейтинг для онлайн-игры
- **Cyberpunk визуал**: Неоновые цвета, глитч-эффекты, футуристический интерфейс

## 🛠 Технологический стек

### Фронтенд
- **React 19** + **TypeScript** — основной фреймворк
- **Vite** — сборка и dev-сервер
- **Tailwind CSS** — стилизация с кастомной Cyberpunk темой
- **Framer Motion** — анимации и переходы
- **Socket.IO Client** — реалтайм-коммуникация
- **Axios** — HTTP-запросы к API

### Бэкенд
- **Node.js** + **Express** — веб-сервер
- **Socket.IO** — WebSocket-сервер для реалтайм-игры
- **TypeScript** — типобезопасность
- **JWT** — аутентификация
- **UUID** — генерация идентификаторов

### Архитектурные паттерны
- **Socket.IO Rooms** — изоляция игровых сессий
- **Event-Driven Architecture** — обработка игровых событий
- **State Management** — локальное состояние игры
- **Middleware Pattern** — аутентификация и валидация

## 📁 Структура проекта

```
CellWar/
├── backend/                    # Серверная часть (Node.js)
│   ├── src/
│   │   ├── server.ts          # Главный серверный файл
│   │   ├── game/
│   │   │   ├── GameManager.ts # Управление игровыми комнатами
│   │   │   └── Room.ts        # Логика игровой комнаты
│   │   └── middleware/
│   │       └── auth.ts        # JWT аутентификация
│   ├── package.json           # Зависимости бэкенда
│   └── tsconfig.json          # TypeScript конфигурация
├── frontend/                   # Клиентская часть (React)
│   ├── src/
│   │   ├── App.tsx            # Главный компонент приложения
│   │   ├── main.tsx           # Точка входа
│   │   ├── index.css          # Глобальные стили
│   │   ├── types.ts           # TypeScript типы
│   │   ├── components/        # React компоненты
│   │   │   ├── game/          # Игровые компоненты
│   │   │   │   ├── GameArena.tsx    # Игровое поле
│   │   │   │   ├── GridTile.tsx     # Ячейка поля
│   │   │   │   └── ActionPanel.tsx  # Панель действий
│   │   │   ├── layout/        # Макетные компоненты
│   │   │   │   └── GameHUD.tsx      # Игровой HUD
│   │   │   ├── screens/       # Экраны приложения
│   │   │   │   ├── HeroScreen.tsx   # Главный экран
│   │   │   │   └── LobbyBrowser.tsx # Браузер лобби
│   │   │   └── ui/            # UI компоненты
│   │   │       └── NeonButton.tsx   # Неоновая кнопка
│   │   ├── context/           # React Context
│   │   │   └── AuthContext.tsx      # Аутентификация
│   │   ├── hooks/             # Кастомные хуки
│   │   │   └── useGameState.ts      # Игровое состояние
│   │   ├── services/          # Сервисы
│   │   │   ├── api.ts         # HTTP API
│   │   │   └── socket.ts      # WebSocket соединение
│   │   └── utils/             # Утилиты
│   │       └── cn.ts          # Tailwind классы
│   ├── package.json           # Зависимости фронтенда
│   ├── vite.config.ts         # Vite конфигурация
│   └── tsconfig.json          # TypeScript конфигурация
├── docs/                       # Документация
│   ├── GAME_RULES.md          # Правила игры
│   ├── ROADMAP.md             # План разработки
│   └── PLAN_UI_OVERHAUL.md    # Дизайн-документация
└── README.md                   # Этот файл
```

## 🚀 Быстрый старт

### Предварительные требования
- **Node.js** 20+ (рекомендуется)
- **npm** 9+ или **yarn** 1.22+

### Установка и запуск

1. **Клонирование репозитория:**
   ```bash
   git clone <repository-url>
   cd CellWar
   ```

2. **Установка зависимостей:**
   ```bash
   # Установка зависимостей для всего проекта
   npm install
   
   # Или по отдельности:
   cd frontend && npm install && cd ..
   cd backend && npm install && cd ..
   ```

3. **Настройка окружения:**
   Создайте файл `.env` в корне проекта:
   ```env
   # Backend
   PORT=3000
   JWT_SECRET=your-secret-key-here
   FRONTEND_URL=http://localhost:5173
   
   # Frontend (в .env.local)
   VITE_API_URL=http://localhost:3000
   ```

4. **Запуск разработки:**
   ```bash
   # Запуск фронтенда (Vite dev server)
   cd frontend && npm run dev
   
   # В новой вкладке: запуск бэкенда
   cd backend && npm run dev
   ```

5. **Открытие приложения:**
   - Фронтенд: http://localhost:5173
   - Бэкенд API: http://localhost:3000

## 🎯 Архитектура приложения

### Бэкенд архитектура

**Серверный слой (`backend/src/server.ts`):**
- Express HTTP-сервер с CORS
- Socket.IO WebSocket сервер
- Статическая раздача фронтенда
- Централизованная обработка подключений

**Игровая логика (`backend/src/game/`):**
- **GameManager** — управление комнатами и матчмейкингом
- **Room** — логика отдельной игровой сессии
- **Cell** — модель игровой клетки с типами ландшафта
- **Player** — модель игрока с экономикой

**Мидлвары (`backend/src/middleware/`):**
- **auth.ts** — JWT аутентификация для WebSocket

### Фронтенд архитектура

**Компонентная структура:**
- **App.tsx** — главный компонент с роутингом экранов
- **HeroScreen** — главное меню с анимациями
- **LobbyBrowser** — браузер игровых комнат
- **GameArena** — основное игровое поле

**Состояние приложения:**
- **AuthContext** — глобальное состояние аутентификации
- **useGameState** — хук для управления игровым состоянием
- **gameSocket** — централизованное WebSocket соединение

**Сервисы:**
- **api.ts** — HTTP API клиент
- **socket.ts** — WebSocket сервис с типами

## 🎨 Дизайн-система

### Цветовая палитра Cyberpunk
- **Фон**: `#050505` (глубокий черный)
- **Неон Cyan**: `#05d9e8` (голубой)
- **Неон Pink**: `#ff2a6d` (розовый)
- **Неон Yellow**: `#f7f052` (желтый)
- **Текст**: `#ffffff` (белый)

### Компоненты UI
- **NeonButton** — неоновые кнопки с hover-эффектами
- **GridTile** — ячейки поля с визуализацией состояния
- **GameHUD** — информационная панель с системным статусом
- **ActionPanel** — панель действий с контекстной доступностью

### Анимации и эффекты
- **Framer Motion** для плавных переходов
- **CSS Grid** для адаптивной сетки
- **Glitch эффекты** для Cyberpunk атмосферы
- **Hover состояния** с неоновыми свечениями

## 📡 API и WebSocket

### HTTP API Endpoints
- `GET /api/users/leaderboard` — таблица лидеров
- `POST /api/auth/init` — инициализация аутентификации
- `POST /api/auth/complete` — завершение аутентификации
- `POST /api/auth/logout` — выход из системы

### WebSocket Events

**Клиент → Сервер:**
- `join_game` — поиск игры
- `set_ready` — готовность к игре
- `make_move` — выполнение хода
- `leave_game` — выход из игры
- `DEBUG_START` — запуск дебаг-режима

**Сервер → Клиент:**
- `game_state` — обновление состояния игры
- `error` — сообщения об ошибках
- `joined_room` — подтверждение входа в комнату

### Типы данных

**Игровая клетка:**
```typescript
interface Cell {
  x: number;           // Координата X
  y: number;           // Координата Y
  type: CellType;      // Тип ландшафта
  owner: string | null; // Владелец (userId)
  structure: StructureType; // Структура (ферма/пусто)
  defense: number;     // Уровень защиты
}
```

**Игрок:**
```typescript
interface Player {
  id: string;          // Уникальный идентификатор
  color: string;       // Цвет игрока
  gold: number;        // Золото
  ready: boolean;      // Готовность к игре
  farms: number;       // Количество ферм
}
```

## 🛠 Разработка

### Скрипты npm

**Фронтенд:**
```bash
npm run dev        # Запуск dev-сервера
npm run build      # Сборка production
npm run lint       # Проверка кода
npm run preview    # Просмотр build
```

**Бэкенд:**
```bash
npm run dev        # Запуск сервера с nodemon
npm run build      # Компиляция TypeScript
npm start          # Запуск production
```

### TypeScript конфигурация
- **Строгая типизация** во всем проекте
- **ESLint** для проверки кода
- **Prettier** для форматирования
- **Path mapping** для удобных импортов

### Стили и Tailwind
- **Кастомная тема** в `tailwind.config.js`
- **CSS-in-JS** подход с Tailwind утилитами
- **Responsive design** для всех экранов
- **Dark theme** по умолчанию

## 🔧 Настройка окружения

### Переменные окружения

**Backend (.env):**
```env
PORT=3000
JWT_SECRET=your-secret-key-here
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env.local):**
```env
VITE_API_URL=http://localhost:3000
```

### Docker (опционально)
Для контейнеризации можно использовать Docker Compose:
```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - JWT_SECRET=your-secret
```

## 🐛 Тестирование и отладка

### Режим разработки
- **Hot Reload** для фронтенда
- **Nodemon** для бэкенда
- **WebSocket Debug** через `DEBUG_START` событие
- **Console logging** на обоих сторонах

### Инструменты разработки
- **React DevTools** для фронтенда
- **Node.js Inspector** для бэкенда
- **Postman** для API тестирования
- **WebSocket clients** для WebSocket тестирования

### Логирование
- **Console.log** для отладки
- **Error boundaries** в React
- **Try-catch** блоки в бэкенде
- **Middleware logging** для запросов

## 🚀 Деплой

### Production сборка
```bash
# Сборка фронтенда
cd frontend && npm run build

# Сборка бэкенда
cd backend && npm run build

# Запуск production
cd backend && npm start
```

### Хостинг варианты
- **Vercel** для фронтенда
- **Heroku** для бэкенда
- **Docker** для контейнеризации
- **AWS/GCP** для облачного развертывания

### CI/CD
- **GitHub Actions** для автоматической сборки
- **Docker Hub** для образов
- **Environment variables** для секретов

## 📚 Документация

- **[Правила игры](docs/GAME_RULES.md)** — полное описание игровой механики
- **[Дорожная карта](docs/ROADMAP.md)** — план разработки и фичи
- **[Дизайн-система](docs/PLAN_UI_OVERHAUL.md)** — визуальные руководства

## 🤝 Участие в разработке

### Как начать
1. Форкните репозиторий
2. Создайте ветку `feature/your-feature`
3. Сделайте коммиты с описанием изменений
4. Создайте Pull Request

### Стандарты кода
- **ESLint** для проверки
- **Prettier** для форматирования
- **TypeScript** строгая типизация
- **Git conventions** для коммитов

### Тестирование
- **Unit tests** для логики
- **Integration tests** для API
- **E2E tests** для пользовательских сценариев

## 📄 Лицензия

Этот проект лицензирован по MIT License. Подробнее см. в файле [LICENSE](LICENSE).

## 🙏 Благодарности

- **React** за мощный фронтенд фреймворк
- **Socket.IO** за надежную реалтайм коммуникацию
- **Tailwind CSS** за гибкую стилизацию
- **TypeScript** за типобезопасность

---

**Cell War** — это проект, сочетающий современные веб-технологии с классической игровой механикой. Присоединяйтесь к разработке и помогите создать лучшую Cyberpunk стратегию!
