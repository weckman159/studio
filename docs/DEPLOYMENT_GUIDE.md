# 🚀 Инструкция по развертыванию Firebase для AutoSphere

## Шаг 1: Установка Firebase CLI

```bash
npm install -g firebase-tools
```

Войдите в свой аккаунт:
```bash
firebase login
```

## Шаг 2: Инициализация проекта Firebase

Перейдите в корневую директорию проекта и выполните:

```bash
firebase init
```

Выберите следующие опции:
- ✅ **Firestore** (база данных)
- ✅ **Storage** (хранилище файлов)
- ✅ **Functions** (облачные функции)

Следуйте инструкциям мастера настройки.

## Шаг 3: Развертывание Security Rules

### Firestore Rules

1. Откройте файл `firestore.rules`
2. Скопируйте содержимое из артефакта **"Firebase Security Rules"**
3. Разверните правила:

```bash
firebase deploy --only firestore:rules
```

### Storage Rules

1. Откройте файл `storage.rules`
2. Скопируйте содержимое из артефакта **"Firebase Storage Rules"**
3. Разверните правила:

```bash
firebase deploy --only storage:rules
```

## Шаг 4: Настройка индексов Firestore

1. Откройте файл `firestore.indexes.json`
2. Скопируйте содержимое из артефакта **"Firestore Indexes"**
3. Разверните индексы:

```bash
firebase deploy --only firestore:indexes
```

**Альтернативный способ (через консоль):**
- Перейдите в Firebase Console → Firestore Database → Indexes
- При выполнении запросов Firebase автоматически предложит создать необходимые индексы
- Кликните на ссылку в ошибке для автоматического создания индекса

## Шаг 5: Настройка Cloud Functions

### Установка зависимостей

```bash
cd functions
npm install firebase-functions firebase-admin
cd ..
```

### Копирование кода функций

1. Создайте файл `functions/src/index.ts`
2. Скопируйте содержимое из артефакта **"Firebase Cloud Functions"**

### Компиляция и развертывание

```bash
cd functions
npm run build
cd ..
firebase deploy --only functions
```

**Важно:** Первое развертывание функций может занять 5-10 минут.

## Шаг 6: Включение Storage в Firebase Console

1. Перейдите в Firebase Console
2. Выберите ваш проект
3. Перейдите в раздел **Storage**
4. Нажмите **Get Started**
5. Выберите регион (рекомендуется выбрать тот же, что и для Firestore)
6. Подтвердите создание bucket

## Шаг 7: Настройка CORS для Storage

Создайте файл `cors.json` в корне проекта:

```json
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "maxAgeSeconds": 3600
  }
]
```

Примените конфигурацию:

```bash
gsutil cors set cors.json gs://your-project-id.appspot.com
```

Замените `your-project-id` на ID вашего проекта.

## Шаг 8: Обновление конфигурации Next.js

### Обновите `lib/firebase.ts`:

```typescript
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Инициализация Firebase (только один раз)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
```

### Добавьте переменные окружения в `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Шаг 9: Установка утилит Storage в проект

### Скопируйте файлы:

1. **lib/storage.ts** - утилиты для работы со Storage
2. **hooks/useFileUpload.ts** - React хук для загрузки
3. **components/ImageUpload.tsx** - компонент загрузки

### Установите зависимости:

```bash
npm install lucide-react
```

## Шаг 10: Миграция существующих данных

Если у вас уже есть данные с data URI, создайте скрипт миграции:

```typescript
// scripts/migrateImages.ts
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc } from 'firebase/firestore';
import { migrateDataURItoStorage, isDataURI } from '@/lib/storage';

async function migratePostImages() {
  const postsSnapshot = await getDocs(collection(db, 'posts'));
  
  for (const postDoc of postsSnapshot.docs) {
    const post = postDoc.data();
    
    if (post.images && Array.isArray(post.images)) {
      const migratedImages = [];
      
      for (const image of post.images) {
        if (isDataURI(image)) {
          const result = await migrateDataURItoStorage(
            image,
            'posts',
            postDoc.id,
            `image_${Date.now()}.jpg`
          );
          migratedImages.push(result.url);
        } else {
          migratedImages.push(image);
        }
      }
      
      await updateDoc(postDoc.ref, { images: migratedImages });
      console.log(`Migrated post ${postDoc.id}`);
    }
  }
}

migratePostImages().then(() => {
  console.log('Migration completed!');
});
```

Запустите миграцию:

```bash
npx ts-node scripts/migrateImages.ts
```

## Шаг 11: Тестирование

### Проверьте Security Rules:

```bash
firebase emulators:start --only firestore,storage
```

### Тестирование загрузки:

Создайте тестовый компонент:

```typescript
import { useFileUpload } from '@/hooks/useFileUpload';
import { ImageUpload } from '@/components/ImageUpload';

export default function TestUpload() {
  const { uploadSingleFile, uploading, progress } = useFileUpload();

  const handleUpload = async (files: File[]) => {
    if (files[0]) {
      const result = await uploadSingleFile(files[0], 'posts', 'test-post-id');
      console.log('Uploaded:', result);
    }
  };

  return (
    <ImageUpload
      onFilesSelected={handleUpload}
      uploading={uploading}
      progress={progress}
    />
  );
}
```

## Шаг 12: Мониторинг и отладка

### Firebase Console:
- **Firestore**: Проверьте структуру данных
- **Storage**: Просмотрите загруженные файлы
- **Functions**: Проверьте логи выполнения

### Логи Cloud Functions:

```bash
firebase functions:log
```

### Проверка использования:

```bash
firebase use
```

## ✅ Чеклист развертывания

- [ ] Firebase CLI установлен
- [ ] Проект инициализирован
- [ ] Firestore Rules развернуты
- [ ] Storage Rules развернуты
- [ ] Индексы созданы
- [ ] Cloud Functions развернуты
- [ ] Storage включен
- [ ] CORS настроен
- [ ] Конфигурация обновлена
- [ ] Переменные окружения установлены
- [ ] Утилиты скопированы
- [ ] Зависимости установлены
- [ ] Миграция данных выполнена
- [ ] Тестирование пройдено

## 🚨 Важные замечания

1. **Безопасность**: Никогда не коммитьте `.env.local` в Git
2. **Квоты**: Следите за использованием Storage (бесплатно до 5GB)
3. **Functions**: На бесплатном плане Spark ограничено количество вызовов
4. **Индексы**: Некоторые сложные запросы требуют составных индексов
5. **CORS**: Обязательно настройте для работы с фронтендом

## 📚 Дополнительные ресурсы

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Cloud Storage Security](https://firebase.google.com/docs/storage/security)
- [Cloud Functions Guide](https://firebase.google.com/docs/functions)

## 🆘 Решение проблем

### Ошибка: "Missing or insufficient permissions"
- Проверьте Security Rules
- Убедитесь, что пользователь авторизован
- Проверьте структуру данных

### Ошибка: "CORS policy"
- Настройте CORS для Storage bucket
- Проверьте origin в конфигурации

### Функции не срабатывают
- Проверьте логи: `firebase functions:log`
- Убедитесь, что функции развернуты
- Проверьте план Firebase (некоторые функции требуют Blaze)

### Медленная загрузка изображений
- Используйте сжатие изображений
- Проверьте размер файлов
- Рассмотрите использование CDN
