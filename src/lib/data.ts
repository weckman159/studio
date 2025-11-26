

export interface User {
  id: string;
  name: string;
  email: string;
  avatarId: string; // Will be replaced by photoURL
  photoURL?: string;
  bio: string;
  nickname?: string;
  currentCarIds?: string[];
  stats: {
    posts: number;
    likes: number;
    wins: number;
    followers: number;
    following: number;
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
  imageId: string; // Will be replaced by photoUrl
  photoUrl?: string; // mainPhotoURL
  photos?: string[]; // gallery
  photoPath?: string;
  isCarOfTheDay?: boolean;
}

export interface Post {
  id: string;
  userId: string;
  carId: string;
  title: string;
  content: string;
  imageUrl?: string;
  imageUrls?: string[];
  imageId?: string;
  imageIds?: string[];
  tags: string[];
  type: string; // 'Блог', 'Фотоотчет', 'Вопрос', 'Мой опыт', 'Обзор'
  likes: number;
  comments: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Comment {
    id: string;
    postId: string;
    userId: string;
    text: string;
    createdAt: string;
}


export const users: User[] = [
  {
    id: '1',
    name: 'Alexey Novikov',
    email: 'alex@example.com',
    avatarId: 'avatar1',
    bio: 'Люблю скорость и тюнинг. Владелец нескольких интересных проектов.',
    nickname: 'ANovikov',
    currentCarIds: ['1'],
    stats: { posts: 12, likes: 345, wins: 2, followers: 150, following: 42 },
  },
  {
    id: '2',
    name: 'Elena Petrova',
    email: 'elena@example.com',
    avatarId: 'avatar2',
    bio: 'Путешествую на машине по самым красивым местам.',
    stats: { posts: 5, likes: 189, wins: 1, followers: 88, following: 12 },
  },
];

export const cars: Car[] = [
  {
    id: '1',
    userId: '1',
    brand: 'BMW',
    model: 'M3 G80',
    year: 2023,
    imageId: 'car1',
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
    imageId: 'car2',
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
    imageId: 'car3',
    photoUrl: 'https://images.unsplash.com/photo-1667029187427-7a018063cc53?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxzdXYlMjBtb3VudGFpbnN8ZW58MHx8fHwxNzYzOTYwMzUwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    photos: ['https://images.unsplash.com/photo-1667029187427-7a018063cc53?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxzdXYlMjBtb3VudGFpbnN8ZW58MHx8fHwxNzYzOTYwMzUwfDA&ixlib=rb-4.1.0&q=80&w=1080'],
    engine: '3.4 L V35A-FTS twin-turbo V6',
  },
];

export const posts: Post[] = [
  {
    id: '1',
    userId: '1',
    carId: '1',
    title: 'Новая выхлопная система!',
    content: 'Установил полный титановый выхлоп от Akrapovič. Звук просто космос! Машина стала дышать легче, а отстрелы радуют слух. \n\nДальше в планах чип-тюнинг Stage 2.',
    imageIds: ['post1', 'car1'],
    tags: ['тюнинг', 'ремонт'],
    type: 'Блог',
    likes: 152,
    comments: 2,
    createdAt: '2024-05-20T10:00:00Z',
  },
  {
    id: '2',
    userId: '2',
    carId: '3',
    title: 'Поездка на Алтай',
    content: 'Совершили большое путешествие на Алтай. Land Cruiser показал себя отлично на бездорожье. Проехали более 5000 км, посетили самые красивые озера и перевалы. \n\nВ следующем году планируем поехать на Байкал!',
    imageId: 'post2',
    tags: ['путешествия'],
    type: 'Фотоотчет',
    likes: 210,
    comments: 1,
    createdAt: '2024-05-18T15:30:00Z',
  },
   {
    id: '3',
    userId: '1',
    carId: '2',
    title: 'Подготовка к дрифт-сезону',
    content: 'Начинаем готовить Silvia к летнему дрифт-сезону. Полностью перебрали подвеску, установили выворот. \n\nВпереди настройка и первые тесты на треке.',
    imageIds: ['post3', 'car2'],
    tags: ['тюнинг', 'спорт'],
    type: 'Блог',
    likes: 98,
    comments: 0,
    createdAt: '2024-05-15T09:00:00Z',
  },
];

export const comments: Comment[] = [
    { id: '1', postId: '1', userId: '2', text: 'Звук наверное пушка! 🔥', createdAt: '2024-05-20T11:00:00Z' },
    { id: '2', postId: '1', userId: '1', text: 'Да, очень доволен!', createdAt: '2024-05-20T11:05:00Z' },
    { id: '3', postId: '2', userId: '1', text: 'Какие красивые места! Тоже мечтаю там побывать.', createdAt: '2024-05-18T16:00:00Z' },
]
