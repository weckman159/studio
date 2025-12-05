# ⚡ Быстрый старт AutoSphere

## Минимальная конфигурация для запуска

### 1. Установка зависимостей (5 минут)

```bash
npm install
```

### 2. Настройка Firebase (10 минут)

#### a) Создайте проект Firebase
- Перейдите на https://console.firebase.google.com
- Создайте новый проект
- Включите Authentication (Email/Password)
- Создайте Firestore Database (Production mode)

#### b) Получите конфигурацию
1. **Project Settings** → **General** → **Your apps** → Веб-приложение
2. Скопируйте `firebaseConfig`

#### c) Разверните правила
```bash
npm install -g firebase-tools
firebase login
firebase init
firebase deploy --only firestore:rules,firestore:indexes
```

### 3. Настройка Vercel Blob (5 минут)

1. Откройте https://vercel.com/dashboard
2. **Storage** → **Create Database** → **Blob**
3. Скопируйте **Read-Write Token**

### 4. Создайте .env.local

```env
# Firebase (скопируйте из Project Settings)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (из Service Accounts → Generate new private key)
FIREBASE_SERVICE_ACCOUNT_KEY=

# Vercel Blob (из Vercel Storage)
BLOB_READ_WRITE_TOKEN=
```

### 5. Запуск локально

```bash
npm run dev
```

Откройте http://localhost:9002

---

## Деплой на Vercel (5 минут)

### Вариант 1: Через GitHub

1. Запушьте код в GitHub
2. Vercel Dashboard → **Add New** → **Project**
3. Выберите репозиторий
4. Добавьте переменные окружения
5. **Deploy**

### Вариант 2: Через CLI

```bash
npm i -g vercel
vercel login
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add FIREBASE_SERVICE_ACCOUNT_KEY
vercel env add BLOB_READ_WRITE_TOKEN
# ... добавьте все переменные
vercel --prod
```

---

## Проверка работоспособности

### ✅ Должно работать:
- [x] Регистрация/Вход
- [x] Просмотр постов
- [x] Создание поста
- [x] Загрузка изображений
- [x] Профиль пользователя

### ❌ Если не работает:

**"Firebase is not initialized"**
→ Проверьте переменные `NEXT_PUBLIC_FIREBASE_*`

**"Upload failed"**
→ Проверьте `BLOB_READ_WRITE_TOKEN`

**"Permission denied"**
→ Разверните Firestore rules: `firebase deploy --only firestore:rules`

---

## Полная документация

- **Подробное руководство:** [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
- **Firebase Setup:** [docs/FIREBASE_SETUP_GUIDE.md](./docs/FIREBASE_SETUP_GUIDE.md)
- **Техническая документация:** [docs/TECHNICAL_AUDIT_AND_ROADMAP.md](./docs/TECHNICAL_AUDIT_AND_ROADMAP.md)

---

**Время на полный деплой: ~30 минут**  
**Нужна помощь?** Создайте issue в репозитории
