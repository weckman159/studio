
import type { Timestamp } from 'firebase/firestore';

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
    reputation?: number;
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
  
  // Garage 2.0 fields
  generation?: string;
  nickname?: string;
  coverImage?: string;
  coverVideo?: string;
  badges?: string[]; // ['car-of-the-day', 'top-10-region', 'stage-2']
  specs?: {
    stockHP: number;
    currentHP: number;
    acceleration: number;
    clearance: number;
    mileage: number;
    lastMileageUpdate: Timestamp;
  };
  views?: number;
  comments?: number;
  likes?: number;
}


export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  carId?: string;
  carBrand?: string;
  carModel?: string;
  title: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  imageUrl?: string;
  imageUrls?: string[];
  tags?: string[];
  category: string; // 'Все', 'Тюнинг', 'Путешествия', etc.
  type: string; // 'Блог', 'Фотоотчет', 'Вопрос' etc.
  likesCount: number;
  commentsCount: number;
  views: number;
  bookmarks: number;
  createdAt: any;
  isLiked?: boolean;
  isBookmarked?: boolean;
  likedBy?: string[];
  updatedAt?: string;
}

export interface Comment {
    id: string;
    postId: string;
    authorId: string; // userId
    authorName: string;
    authorAvatar?: string;
    content: string;
    createdAt: any;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  membersCount: number;
  imageUrl?: string;
  createdAt: any;
  isPrivate: boolean;
  adminId: string;
  memberIds: string[];
}

export interface Voting {
  id: string;
  question: string;
  options: string[];
  votes?: { [key: string]: number }; // e.g. { carId1: 10, carId2: 15 }
  votedUserIds?: string[];
  contenderCarIds?: string[];
  isActive: boolean;
  createdAt: any;
  endsAt?: any;
  totalVotes: number;
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
  updatedAt?: any;
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

export interface Event {
  id: string;
  title: string;
  description: string;
  fullDescription?: string;
  location: string;
  address?: string;
  startDate: any;
  endDate?: any;
  category: string;
  imageUrl?: string;
  organizerId: string;
  organizerName: string;
  organizerAvatar?: string;
  participantIds: string[];
  participantsCount: number;
  maxParticipants?: number;
  createdAt: any;
  requirements?: string;
  schedule?: string;
}
