# Структура данных Firestore для AutoSphere

## 📦 Коллекции и документы

### 👤 users/{userId}
```typescript
{
  uid: string;
  email: string;
  displayName: string;
  bio?: string;
  photoURL?: string; // URL из Storage
  coverPhotoURL?: string; // URL из Storage
  location?: string;
  website?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Статистика (денормализация)
  stats: {
    postsCount: number;
    carsCount: number;
    followersCount: number;
    followingCount: number;
    likesReceived: number;
  };
  
  // Социальные ссылки
  social?: {
    instagram?: string;
    youtube?: string;
    tiktok?: string;
  };
}
```

**Подколлекции:**
- `/users/{userId}/favorites/{postId}` - избранные посты
- `/users/{userId}/following/{userId}` - подписки
- `/users/{userId}/followers/{userId}` - подписчики

---

### 📝 posts/{postId}
```typescript
{
  id: string;
  userId: string;
  title: string;
  content: string; // HTML из CKEditor
  carId?: string; // Ссылка на автомобиль
  images: string[]; // URLs из Storage
  
  // Денормализация для быстрого отображения
  userData: {
    displayName: string;
    photoURL: string;
  };
  
  carData?: {
    make: string;
    model: string;
    year: number;
    photoURL: string;
  };
  
  // Статистика
  likesCount: number;
  commentsCount: number;
  favoritesCount: number;
  viewsCount: number;
  
  // Метаданные
  createdAt: Timestamp;
  updatedAt: Timestamp;
  tags?: string[];
  isPublished: boolean;
}
```

**Подколлекции:**
- `/posts/{postId}/likes/{userId}` - лайки
- `/posts/{postId}/comments/{commentId}` - комментарии

---

### 💬 posts/{postId}/comments/{commentId}
```typescript
{
  id: string;
  postId: string;
  userId: string;
  text: string;
  parentId?: string; // Для вложенных комментариев
  
  // Денормализация
  userData: {
    displayName: string;
    photoURL: string;
  };
  
  // Метаданные
  createdAt: Timestamp;
  updatedAt: Timestamp;
  likesCount: number;
  repliesCount: number;
}
```

---

### 🚗 cars/{carId}
```typescript
{
  id: string;
  userId: string;
  
  // Основные данные
  make: string;
  model: string;
  year: number;
  variant?: string;
  
  // Технические характеристики
  specs: {
    engine?: string;
    transmission?: string;
    drivetrain?: string;
    horsepower?: number;
    torque?: number;
    fuelType?: string;
    color?: string;
    mileage?: number;
  };
  
  // Медиа
  photos: string[]; // URLs из Storage
  mainPhotoURL: string;
  
  // Модификации
  modifications?: string[];
  
  // Описание
  description?: string;
  nickname?: string;
  
  // Метаданные
  createdAt: Timestamp;
  updatedAt: Timestamp;
  postsCount: number;
  
  // Для голосования "Автомобиль дня"
  votingStats?: {
    totalVotes: number;
    lastVoteDate?: Timestamp;
  };
}
```

---

### 🔔 notifications/{notificationId}
```typescript
{
  id: string;
  recipientId: string;
  senderId?: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'car_of_day';
  
  // Содержание
  title: string;
  message: string;
  actionURL?: string;
  
  // Связанные сущности
  relatedEntityId?: string; // postId, carId и т.д.
  relatedEntityType?: 'post' | 'car' | 'comment';
  
  // Денормализация отправителя
  senderData?: {
    displayName: string;
    photoURL: string;
  };
  
  // Состояние
  read: boolean;
  createdAt: Timestamp;
}
```

---

### 👥 communities/{communityId}
```typescript
{
  id: string;
  name: string;
  description: string;
  coverPhotoURL?: string;
  logoURL?: string;
  
  // Управление
  creatorId: string;
  moderators: string[]; // userIds
  
  // Настройки
  isPrivate: boolean;
  requiresApproval: boolean;
  
  // Статистика
  membersCount: number;
  postsCount: number;
  
  // Метаданные
  createdAt: Timestamp;
  updatedAt: Timestamp;
  tags?: string[];
}
```

**Подколлекции:**
- `/communities/{communityId}/members/{userId}` - участники
- `/communities/{communityId}/posts/{postId}` - посты сообщества

---

### 🛒 listings/{listingId}
```typescript
{
  id: string;
  sellerId: string;
  
  // Тип объявления
  category: 'car' | 'parts' | 'accessories';
  
  // Для автомобилей
  carData?: {
    make: string;
    model: string;
    year: number;
    mileage: number;
    condition: 'new' | 'used' | 'damaged';
    vin?: string;
  };
  
  // Общие поля
  title: string;
  description: string;
  price: number;
  currency: string;
  negotiable: boolean;
  
  // Медиа
  photos: string[];
  
  // Локация
  location: {
    city: string;
    region: string;
    country: string;
  };
  
  // Контакты
  contactPhone?: string;
  contactEmail?: string;
  
  // Статус
  status: 'active' | 'sold' | 'archived';
  
  // Денормализация
  sellerData: {
    displayName: string;
    photoURL: string;
  };
  
  // Метаданные
  createdAt: Timestamp;
  updatedAt: Timestamp;
  viewsCount: number;
  favoritesCount: number;
}
```

---

### 🔧 workshops/{workshopId}
```typescript
{
  id: string;
  ownerId: string;
  
  // Основная информация
  name: string;
  description: string;
  logoURL?: string;
  coverPhotoURL?: string;
  photos: string[];
  
  // Контакты
  contact: {
    phone: string;
    email?: string;
    website?: string;
  };
  
  // Адрес
  address: {
    street: string;
    city: string;
    region: string;
    country: string;
    postalCode?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  
  // Услуги
  services: string[];
  specialization: string[]; // 'painting', 'engine', 'bodywork', 'tuning', etc.
  
  // Рейтинг
  rating: {
    average: number;
    count: number;
  };
  
  // Режим работы
  hours?: {
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    // и т.д.
  };
  
  // Метаданные
  createdAt: Timestamp;
  updatedAt: Timestamp;
  verified: boolean;
}
```

**Подколлекции:**
- `/workshops/{workshopId}/reviews/{reviewId}` - отзывы

---

### 📅 events/{eventId}
```typescript
{
  id: string;
  creatorId: string;
  
  // Основная информация
  title: string;
  description: string;
  coverPhotoURL?: string;
  
  // Тип события
  type: 'meetup' | 'race' | 'exhibition' | 'workshop' | 'other';
  
  // Дата и время
  eventDate: Timestamp;
  startTime?: string;
  endTime?: string;
  
  // Локация
  location: {
    name?: string;
    address: string;
    city: string;
    region: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  
  // Участники
  participantsCount: number;
  maxParticipants?: number;
  
  // Настройки
  isPublic: boolean;
  requiresRegistration: boolean;
  
  // Денормализация
  creatorData: {
    displayName: string;
    photoURL: string;
  };
  
  // Метаданные
  createdAt: Timestamp;
  updatedAt: Timestamp;
  tags?: string[];
}
```

**Подколлекции:**
- `/events/{eventId}/participants/{userId}` - участники

---

### 📰 news/{newsId}
```typescript
{
  id: string;
  authorId: string;
  
  // Контент
  title: string;
  content: string; // HTML
  excerpt: string;
  coverImageURL: string;
  
  // Категория
  category: 'industry' | 'reviews' | 'technology' | 'racing' | 'other';
  
  // Источник (если агрегатор)
  source?: {
    name: string;
    url: string;
  };
  
  // Денормализация
  authorData: {
    displayName: string;
    photoURL: string;
  };
  
  // Статистика
  viewsCount: number;
  likesCount: number;
  
  // Метаданные
  publishedAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  tags?: string[];
  featured: boolean;
}
```

---

### 🏆 voting/{votingId}
```typescript
{
  id: string;
  date: string; // YYYY-MM-DD
  carId: string;
  userId: string;
  
  // Денормализация
  carData: {
    make: string;
    model: string;
    year: number;
    photoURL: string;
  };
  
  userData: {
    displayName: string;
    photoURL: string;
  };
  
  // Голоса
  votesCount: number;
  voters: string[]; // массив userIds
  
  // Метаданные
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## 🔄 Правила денормализации

**Что денормализовать:**
1. **Данные пользователя** (`displayName`, `photoURL`) в постах, комментариях, уведомлениях
2. **Данные автомобиля** (`make`, `model`, `year`, `photoURL`) в постах
3. **Счетчики** (`likesCount`, `commentsCount`, `followersCount`) для быстрого отображения

**Зачем:**
- Уменьшение количества запросов к базе
- Быстрое отображение лент и списков
- Лучшая производительность

**Важно:** При обновлении основных данных (аватар, имя) нужно обновлять денормализованные копии!

---

## 📊 Стратегия обновления счетчиков

Используйте **Cloud Functions** для автоматического обновления счетчиков:

```typescript
// Пример: при создании лайка обновляем счетчик
exports.onLikeCreated = functions.firestore
  .document('posts/{postId}/likes/{likeId}')
  .onCreate(async (snap, context) => {
    const postRef = firestore.collection('posts').doc(context.params.postId);
    await postRef.update({
      likesCount: admin.firestore.FieldValue.increment(1)
    });
  });
```

---

## 🔍 Рекомендации по запросам

### Оптимальные паттерны:
✅ Используйте `limit()` для пагинации  
✅ Создавайте индексы для сложных запросов  
✅ Денормализуйте часто используемые данные  
✅ Кешируйте результаты на клиенте  

### Избегайте:
❌ Запросов без лимита  
❌ Глубокой вложенности (>2 уровней)  
❌ Частых обновлений одного документа  
❌ Хранения больших массивов (>1000 элементов)
