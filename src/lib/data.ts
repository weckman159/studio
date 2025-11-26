
export interface User {
  id: string;
  name: string;
  age?: number;
  displayName?: string; // from firebase auth
  role?: 'admin' | 'user';
  email?: string;
  photoURL?: string;
  bio?: string;
  nickname?: string;
  location?: string;
  createdAt?: any;
  updatedAt?: any;
  currentCarIds?: string[];
  stats?: {
    posts?: number;
    likes?: number;
    wins?: number;
    followers?: number;
    following?: number;
    drive?: number;
    reposts?: number;
  };
}

export interface Car {
  id: string;
  userId: string;
  brand: string;
  model: string;
  year: number;
  engine: string;
  description?: string;
  photoUrl?: string; // mainPhotoURL
  photos?: string[]; // gallery
  isCarOfTheDay?: boolean;
}

export interface Post {
  id: string;
  authorId: string; // userId
  authorName: string;
  authorAvatar?: string;
  carId: string;
  title: string;
  content: string;
  imageUrl?: string;
  imageUrls?: string[];
  imageIds?: string[];
  tags: string[];
  type: string; // 'Блог', 'Фотоотчет', 'Вопрос', 'Мой опыт', 'Обзор'
  likesCount: number;
  likedBy: string[];
  commentsCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Comment {
    id: string;
    postId: string;
    authorId: string; // userId
    authorName: string;
    authorAvatar?: string;
    content: string;
    createdAt: string;
}

export interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  fullDescription?: string;
  price: number;
  currency: string;
  category: string;
  condition: string;
  location: string;
  imageUrl?: string;
  gallery?: string[]; // Дополнительные фото
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  sellerPhone?: string;
  sellerEmail?: string;
  createdAt: any;
  views?: number; // Количество просмотров
}

export interface Workshop {
  id: string;
  name: string;
  city: string;
  address: string;
  specialization: string;
  phone?: string;
  rating: number;
  reviewsCount: number;
  imageUrl?: string;
  description?: string;
  website?: string;
  source?: string;
  updatedAt?: any;
  lat?: number;
  lng?: number;
  createdBy?: string;
}

export interface Feedback {
  id: string;
  email?: string;
  msg: string;
  createdAt: any;
}


export const users: User[] = [
  {
    id: '1',
    name: 'Alexey Novikov',
    age: 34,
    email: 'alex@example.com',
    photoURL: 'https://images.unsplash.com/photo-1607031542107-f6f46b5d54e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxtYW4lMjBwb3J0cmFpdHxlbnwwfHx8fDE3NjM5MjU3NzF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    bio: 'Люблю скорость и тюнинг. Владелец нескольких интересных проектов.',
    nickname: 'ANovikov',
    role: 'admin',
    location: 'Москва',
    currentCarIds: ['1'],
    stats: { posts: 12, likes: 345, wins: 2, followers: 150, following: 42, drive: 85, reposts: 18 },
  },
  {
    id: '2',
    name: 'Elena Petrova',
    age: 28,
    email: 'elena@example.com',
    photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8d29tYW4lMjBwb3J0cmFpdHxlbnwwfHx8fDE3NjM5NTk2MjN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    bio: 'Путешествую на машине по самым красивым местам.',
    nickname: 'LenaOnWheels',
    role: 'user',
    location: 'Санкт-Петербург',
    stats: { posts: 5, likes: 189, wins: 1, followers: 88, following: 12, drive: 42, reposts: 3 },
  },
];

export const cars: Car[] = [
  {
    id: '1',
    userId: '1',
    brand: 'BMW',
    model: 'M3 G80',
    year: 2023,
    photoUrl: 'https://images.unsplash.com/photo-1628519592419-bf288f08cef5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxzcG9ydHMlMjBjYXJ8ZW58MHx8fHwxNzYzOTc2NTgyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    photos: ['https://images.unsplash.com/photo-1628519592419-bf288f08cef5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxzcG9ydHMlMjBjYXJ8ZW58MHx8fHwxNzYzOTc2NTgyfDA&ixlib=rb-4.1.0&q=80&w=1080'],
    engine: '3.0 L S58 twin-turbo I6',
    isCarOfTheDay: true,
  },
  {
    id: '2',
    userId: '1',
    brand: 'Nissan',
    model: 'Silvia S15',
    year: 2002,
    photoUrl: 'https://images.unsplash.com/photo-1605906457463-5eb60f753738?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxqZG0lMjBjYXJ8ZW58MHx8fHwxNzYzOTE5NTE0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    photos: ['https://images.unsplash.com/photo-1605906457463-5eb60f753738?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxqZG0lMjBjYXJ8ZW58MHx8fHwxNzYzOTE5NTE0fDA&ixlib=rb-4.1.0&q=80&w=1080'],
    engine: '2.0 L SR20DET I4',
  },
  {
    id: '3',
    userId: '2',
    brand: 'Toyota',
    model: 'Land Cruiser 300',
    year: 2022,
    photoUrl: 'https://images.unsplash.com/photo-1667029187427-7a018063cc53?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxzdXYlMjBtb3VudGFpbnN8ZW58MHx8fHwxNzYzOTYwMzUwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    photos: ['https://images.unsplash.com/photo-1667029187427-7a018063cc53?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxzdXYlMjBtb3VudGFpbnN8ZW58MHx8fHwxNzYzOTYwMzUwfDA&ixlib=rb-4.1.0&q=80&w=1080'],
    engine: '3.4 L V35A-FTS twin-turbo V6',
  },
];

export const posts: Post[] = [
  {
    id: '1',
    authorId: '1',
    authorName: 'Alexey Novikov',
    carId: '1',
    title: 'Новая выхлопная система!',
    content: 'Установил полный титановый выхлоп от Akrapovič. Звук просто космос! Машина стала дышать легче, а отстрелы радуют слух. \n\nДальше в планах чип-тюнинг Stage 2.',
    imageUrl: 'https://images.unsplash.com/photo-1615644359756-d1058b89608a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxjYXIlMjBleGhhdXN0fGVufDB8fHx8MTc2MzkxNjA3MHww&ixlib=rb-4.1.0&q=80&w=1080',
    imageUrls: ['https://images.unsplash.com/photo-1615644359756-d1058b89608a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxjYXIlMjBleGhhdXN0fGVufDB8fHx8MTc2MzkxNjA3MHww&ixlib=rb-4.1.0&q=80&w=1080', 'https://images.unsplash.com/photo-1628519592419-bf288f08cef5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxzcG9ydHMlMjBjYXJ8ZW58MHx8fHwxNzYzOTc2NTgyfDA&ixlib=rb-4.1.0&q=80&w=1080'],
    tags: ['тюнинг', 'ремонт'],
    type: 'Блог',
    likesCount: 152,
    likedBy: ['2'],
    commentsCount: 2,
    createdAt: '2024-05-20T10:00:00Z',
  },
  {
    id: '2',
    authorId: '2',
    authorName: 'Elena Petrova',
    carId: '3',
    title: 'Поездка на Алтай',
    content: 'Совершили большое путешествие на Алтай. Land Cruiser показал себя отлично на бездорожье. Проехали более 5000 км, посетили самые красивые озера и перевалы. \n\nВ следующем году планируем поехать на Байкал!',
    imageUrl: 'https://images.unsplash.com/photo-1629538745524-5b748fddac9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxjYXIlMjByb2FkfGVufDB8fHx8MTc2MzkyNDg1MHww&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['путешествия'],
    type: 'Фотоотчет',
    likesCount: 210,
    likedBy: [],
    commentsCount: 1,
    createdAt: '2024-05-18T15:30:00Z',
  },
   {
    id: '3',
    authorId: '1',
    authorName: 'Alexey Novikov',
    carId: '2',
    title: 'Подготовка к дрифт-сезону',
    content: 'Начинаем готовить Silvia к летнему дрифт-сезону. Полностью перебрали подвеску, установили выворот. \n\nВпереди настройка и первые тесты на треке.',
    imageUrl: 'https://images.unsplash.com/photo-1541443724873-8ba49db7a737?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxjYXIlMjBkcmlmdHxlbnwwfHx8fDE3NjQwMDQ1MTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    imageUrls: ['https://images.unsplash.com/photo-1541443724873-8ba49db7a737?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxjYXIlMjBkcmlmdHxlbnwwfHx8fDE3NjQwMDQ1MTV8MA&ixlib=rb-4.1.0&q=80&w=1080', 'https://images.unsplash.com/photo-1605906457463-5eb60f753738?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxqZG0lMjBjYXJ8ZW58MHx8fHwxNzYzOTE5NTE0fDA&ixlib=rb-4.1.0&q=80&w=1080'],
    tags: ['тюнинг', 'спорт'],
    type: 'Блог',
    likesCount: 98,
    likedBy: [],
    commentsCount: 0,
    createdAt: '2024-05-15T09:00:00Z',
  },
];

export const comments: Comment[] = [
    { id: '1', postId: '1', authorId: '2', authorName: 'Elena Petrova', content: 'Звук наверное пушка! 🔥', createdAt: '2024-05-20T11:00:00Z' },
    { id: '2', postId: '1', authorId: '1', authorName: 'Alexey Novikov', content: 'Да, очень доволен!', createdAt: '2024-05-20T11:05:00Z' },
    { id: '3', postId: '2', authorId: '1', authorName: 'Alexey Novikov', content: 'Какие красивые места! Тоже мечтаю там побывать.', createdAt: '2024-05-18T16:00:00Z' },
]






    
    

    
