# 🚗 AutoSphere - Социальная платформа для автолюбителей

> Полнофункциональная социальная сеть для автолюбителей с гаражом, маркетплейсом, событиями и сообществами

[![Next.js](https://img.shields.io/badge/Next.js-15.3-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-11.9-orange)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)

## ✨ Возможности

### 🏠 Основной функционал
- 📝 **Посты и журналы** - Делитесь историями, фотоотчетами и вопросами
- 🚙 **Виртуальный гараж** - Управление автомобилями с timeline модификаций
- 🏆 **Автомобиль дня** - Голосование и соревнования
- 👥 **Сообщества** - Создавайте и вступайте в тематические группы
- 🛒 **Маркетплейс** - Покупка и продажа запчастей
- 🔧 **Мастерские** - Каталог автосервисов с отзывами
- 📅 **События** - Встречи, выставки, автопробеги
- 🗳️ **Голосования** - Опросы сообщества
- 💬 **Личные сообщения** - Чат между пользователями
- 🔔 **Уведомления** - Real-time оповещения

### 🎨 UI/UX
- 🌓 **Темная/Светлая тема** - Автоматическое переключение
- 📱 **Адаптивный дизайн** - Mobile-first подход
- 🎯 **Современный интерфейс** - Radix UI + Tailwind CSS
- ⚡ **Быстрая навигация** - Боковое меню + нижняя панель
- 🖼️ **Оптимизация изображений** - Next.js Image + Vercel Blob

### 🔐 Безопасность
- 🔒 **Firebase Authentication** - Email/Password + OAuth провайдеры
- 🛡️ **Firestore Security Rules** - Строгие правила доступа
- 🔑 **Админ панель** - Модерация контента
- 👤 **Профили пользователей** - Приватность и настройки

## 🚀 Быстрый старт

### Предварительные требования
- Node.js 18+
- npm или yarn
- Firebase проект
- Vercel аккаунт (для Blob Storage)

### Установка

```bash
# Клонировать репозиторий
git clone <your-repo-url>
cd studio

# Установить зависимости
npm install

# Создать .env.local из примера
cp .env.example .env.local

# Заполнить переменные окружения (см. .env.example)
# Запустить локально
npm run dev
```

Откройте [http://localhost:9002](http://localhost:9002)

📖 **Подробная инструкция:** [QUICK_START.md](./QUICK_START.md)

## 📁 Структура проекта

```
studio/
├── src/
│   ├── app/              # Next.js App Router страницы
│   │   ├── api/          # API Routes (upload, firestore-proxy)
│   │   ├── auth/         # Страница авторизации
│   │   ├── garage/       # Гараж пользователя
│   │   ├── posts/        # Посты и журналы
│   │   ├── marketplace/  # Маркетплейс
│   │   └── ...
│   ├── components/       # React компоненты
│   │   ├── ui/           # Radix UI компоненты
│   │   ├── garage/       # Компоненты гаража
│   │   └── profile/      # Компоненты профиля
│   ├── firebase/         # Firebase конфигурация и хуки
│   ├── lib/              # Утилиты и типы
│   └── hooks/            # Custom React hooks
├── docs/                 # Документация
├── functions/            # Firebase Cloud Functions
├── public/               # Статические файлы
└── firestore.rules       # Firestore Security Rules
```

## 🛠️ Технологический стек

### Frontend
- **Framework:** Next.js 15.3.3 (App Router)
- **UI Library:** React 18.3.1
- **Styling:** Tailwind CSS 3.4 + `tailwind-merge`
- **Components:** Radix UI primitives
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod
- **Rich Text:** TipTap Editor
- **State Management:** React Context + Hooks

### Backend & Services
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth
- **File Storage:** Vercel Blob
- **Hosting:** Vercel
- **Functions:** Firebase Cloud Functions (Node.js)
- **AI Integration:** Google Genkit (опционально)

### Development Tools
- **Language:** TypeScript 5
- **Package Manager:** npm
- **Linting:** ESLint
- **Type Checking:** TypeScript strict mode

## 📚 Документация

- 📖 [Быстрый старт](./QUICK_START.md) - Запуск за 30 минут
- 🚀 [Развертывание на Vercel](./VERCEL_DEPLOYMENT.md) - Подробное руководство
- 🔥 [Настройка Firebase](./docs/FIREBASE_SETUP_GUIDE.md) - Firebase конфигурация
- 🏗️ [Обзор кодовой базы](./docs/CODEBASE_OVERVIEW.md) - Архитектура проекта
- 🔍 [Технический аудит](./docs/TECHNICAL_AUDIT_AND_ROADMAP.md) - Оптимизации и roadmap
- 🐛 [Устранение ошибок](./docs/CLIENT_SIDE_EXCEPTIONS_GUIDE.md) - Решение проблем

## 🔧 Доступные команды

```bash
# Разработка
npm run dev              # Запуск dev сервера (порт 9002)
npm run build            # Production build
npm run start            # Запуск production build
npm run lint             # ESLint проверка
npm run typecheck        # TypeScript проверка

# Genkit AI (опционально)
npm run genkit:dev       # Запуск Genkit dev сервера
npm run genkit:watch     # Genkit с hot reload

# Firebase
firebase deploy --only firestore:rules    # Деплой Firestore rules
firebase deploy --only firestore:indexes  # Деплой индексов
firebase deploy --only functions          # Деплой Cloud Functions
```

## 🌍 Переменные окружения

См. [.env.example](./.env.example) для полного списка.

**Основные переменные:**
- `NEXT_PUBLIC_FIREBASE_*` - Firebase клиентская конфигурация
- `FIREBASE_SERVICE_ACCOUNT_KEY` - Firebase Admin SDK (server-side)
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob Storage токен
- `GOOGLE_GENAI_API_KEY` - Google AI (опционально)

## 🤝 Вклад в проект

Вклады приветствуются! Пожалуйста:

1. Fork репозиторий
2. Создайте feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit изменения (`git commit -m 'Add some AmazingFeature'`)
4. Push в branch (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

## 📝 Лицензия

Этот проект создан для образовательных целей.

## 🙏 Благодарности

- [Next.js](https://nextjs.org/) - React фреймворк
- [Firebase](https://firebase.google.com/) - Backend-as-a-Service
- [Vercel](https://vercel.com/) - Hosting и Blob Storage
- [Radix UI](https://www.radix-ui.com/) - Unstyled UI компоненты
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Lucide](https://lucide.dev/) - Иконки

## 📞 Поддержка

Если у вас возникли проблемы:

1. Проверьте [документацию](./docs/)
2. Посмотрите [решения распространенных проблем](./docs/CLIENT_SIDE_EXCEPTIONS_GUIDE.md)
3. Создайте [Issue](../../issues) в репозитории

---

**Создано с ❤️ для автолюбителей**
