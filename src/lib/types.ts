
import type { Timestamp } from 'firebase/firestore';

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface User {
  id: string;
  name: string;
  age?: number;
  displayName: string; // from firebase auth
  role?: 'user' | 'moderator' | 'admin';
  status?: 'active' | 'banned';
  email?: string;
  photoURL?: string;
  coverUrl?: string; // profile cover
  bio?: string;
  nickname?: string;
  location?: string;
  createdAt?: any;
  updatedAt?: any;
  profileVisibility?: 'public' | 'private';
  currentCarIds?: string[];
  achievements?: Achievement[];
  stats?: {
    postsCount?: number;
    likes?: number;
    wins?: number;
    followersCount?: number;
    followingCount?: number;
    carsCount?: number;
    reputation?: number;
  };
  socials?: {
      instagram?: string;
      youtube?: string;
      tiktok?: string;
  }
}

// =====================================================================
//  CAR TYPES (from garage 2.0)
// =====================================================================

export type CarStatus = 'owned' | 'sold' | 'project' | 'dream' | 'parted'
export type FitmentStatus = 'flush' | 'tucked' | 'poke'
export type TimelineType = 'purchase' | 'maintenance' | 'tuning' | 'accident' | 'sale'
export type ModCategory = 'engine' | 'suspension' | 'exterior' | 'interior' | 'audio'

export interface Car {
  id: string
  userId: string
  status: CarStatus
  
  // Основные данные
  brand: string
  model: string
  generation: string
  year: number
  engine: string;
  nickname?: string
  vin?: string
  
  // Hero-блок
  coverImage?: string
  coverVideo?: string
  photos: string[]
  photoUrl?: string; // main photo
  badges?: string[] // ['car-of-the-day', 'top-10-region', 'stage-2']
  
  // Спеки
  specs: {
    stockHP: number
    currentHP: number
    acceleration: number
    clearance: number
    mileage: number
    lastMileageUpdate: Timestamp
  }
  
  // Фитмент
  fitment?: {
    front: WheelSetup
    rear: WheelSetup
    status: FitmentStatus
  }

  description?: string;
  
  // Модификации
  modifications: Record<ModCategory, Modification[]>
  
  // Статистика
  views: number
  likes: number
  comments: number
  
  // Метаданные
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface WheelSetup {
  et: number
  width: number
  tire: string
  spacers?: number
}

export interface Modification {
  id: string
  part: string
  brand: string
  model: string
  price?: number
  installedAt?: Timestamp
  postId?: string
  affiliateLink?: string
}

export interface TimelineEntry {
  id: string
  carId: string
  date: any // Can be Timestamp or Date object
  type: TimelineType
  title: string
  description: string
  mileage: number
  cost?: number
  photos: string[]
  documents: string[]
  isPublic: boolean
}

export interface InventoryItem {
  id: string
  carId: string
  name: string
  category: string
  quantity: number
  photo?: string
  purchasePrice?: number
  forSale: boolean
  salePrice?: number
}


// =====================================================================
//  OTHER TYPES
// =====================================================================


export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  carId?: string;
  title: string;
  content: string; // Main HTML content
  imageUrl?: string; // The primary image for the post
  tags?: string[];
  category: string;
  status: 'published' | 'hidden' | 'draft';
  likesCount: number;
  commentsCount: number;
  views: number;
  createdAt: any; // Can be server or client timestamp
  updatedAt?: any;
  communityId?: string;
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
  fullDescription?: string;
  rules?: string;
  category: string;
  membersCount: number;
  imageUrl?: string;
  coverUrl?: string;
  createdAt: any;
  updatedAt?: any;
  isPrivate: boolean;
  adminId: string;
  memberIds: string[];
}

export interface Voting {
  id: string;
  question: string;
  options: string[];
  votes: number[] | { [key: string]: number }; // number[] for polls, object for car voting
  votedUserIds?: string[];
  contenderCarIds?: string[]; // optional for car of the day
  isActive: boolean;
  createdAt: any;
  endsAt?: any;
  totalVotes: number;
  authorId?: string;
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

export interface Review {
  id: string;
  workshopId?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  text: string;
  createdAt: any;
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

export interface Notification {
  id: string;
  recipientId: string;
  senderId?: string;
  senderData?: {
    displayName: string;
    photoURL?: string;
  };
  type: 'like' | 'comment' | 'follow' | 'mention' | 'car_of_day' | 'system';
  title: string;
  message: string;
  actionURL?: string;
  relatedEntityId?: string;
  relatedEntityType?: 'post' | 'car' | 'comment';
  read: boolean;
  createdAt: any;
}

export interface AutoNews {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  source: string;
  sourceUrl: string;
  category: string;
  publishedAt: any;
  fetchedAt?: any;
}
