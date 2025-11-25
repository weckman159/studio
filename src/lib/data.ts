
export interface User {
  id: string;
  name: string;
  email: string;
  avatarId: string;
  bio: string;
  nickname?: string;
  currentCarIds?: string[];
  stats: {
    posts: number;
    likes: number;
    wins: number;
  };
}

export interface Car {
  id: string;
  userId: string;
  brand: string;
  model: string;
  year: number;
  imageId: string;
  engine: string;
  isCarOfTheDay?: boolean;
}

export interface Post {
  id: string;
  userId: string;
  carId: string;
  title: string;
  content: string;
  imageUrl?: string; // Replaces imageId for direct URL storage
  imageId?: string; // Keep for fallback or existing data
  tags: string[];
  likes: number;
  comments: number;
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
    stats: { posts: 12, likes: 345, wins: 2 },
  },
  {
    id: '2',
    name: 'Elena Petrova',
    email: 'elena@example.com',
    avatarId: 'avatar2',
    bio: 'Путешествую на машине по самым красивым местам.',
    stats: { posts: 5, likes: 189, wins: 1 },
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
    engine: '2.0 L SR20DET I4',
  },
  {
    id: '3',
    userId: '2',
    brand: 'Toyota',
    model: 'Land Cruiser 300',
    year: 2022,
    imageId: 'car3',
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
    imageId: 'post1',
    tags: ['тюнинг', 'ремонт'],
    likes: 152,
    comments: 23,
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
    likes: 210,
    comments: 45,
    createdAt: '2024-05-18T15:30:00Z',
  },
   {
    id: '3',
    userId: '1',
    carId: '2',
    title: 'Подготовка к дрифт-сезону',
    content: 'Начинаем готовить Silvia к летнему дрифт-сезону. Полностью перебрали подвеску, установили выворот. \n\nВпереди настройка и первые тесты на треке.',
    imageId: 'post3',
    tags: ['тюнинг', 'спорт'],
    likes: 98,
    comments: 12,
    createdAt: '2024-05-15T09:00:00Z',
  },
];
