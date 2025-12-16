
import type { Timestamp } from 'firebase/firestore';

// --- NEW TYPES FROM ARCHITECTURE DOC ---

// From lib/types/user.ts
export interface UserRoles {
  isPremium: boolean;
  isFirm: boolean;
  isModerator: boolean;
  isAdmin: boolean;
}

// MERGED User type
export interface User {
  id: string; // from old type
  uid: string; // from new type
  displayName: string;
  email?: string;
  roles: UserRoles; // from new type
  status?: 'active' | 'banned'; // from old type
  
  photoURL?: string;
  coverUrl?: string;
  bio?: string;
  nickname?: string;
  location?: string;

  createdAt: any; // Date or Timestamp
  updatedAt: any; // Date or Timestamp

  // Keeping old stats structure for now
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
      telegram?: string;
  }
}


// From lib/types/profile.ts
export interface ProfileLocation {
  city: string;
  region: string;
  country: string;
}

export interface MarketplaceStats {
  activeCount: number;
  soldCount: number;
  soldSumEUR: number;
  listedSumEUR: number;
  avgPriceEUR: number;
}

export interface PrivacySettings {
  showSoldPublicly: boolean;
}

export interface Profile {
  uid: string;
  bio: string;
  location: ProfileLocation;
  avatarBlobUrl: string;
  marketplaceStats: MarketplaceStats;
  privacy: PrivacySettings;
  favoritesLimit: number; // 20 base, -1 premium
  createdAt: Date;
  updatedAt: Date;
}

// From lib/types/garage.ts
export interface TUVStatus {
  date: Date;
  daysRemaining: number;
  status: 'valid' | 'warning' | 'expired'; // 🟢🟡🔴
  reportPdfUrl?: string; // Premium only
  reportPhotos?: string[]; // Premium only
}

export interface TUVHistory {
  date: Date;
  status: string;
  reportUrl?: string;
}

export interface CarExpense {
  id: string;
  date: Date;
  category: 'fuel' | 'maintenance' | 'insurance' | 'tuning' | 'other';
  amountEUR: number;
  description: string;
  receiptUrl?: string;
}

// REPLACED Car type
export interface Car {
  id: string;
  uid: string; // owner id
  vin: string;
  make: string; // brand
  model: string;
  year: number;
  photos: string[];
  tuv: TUVStatus;
  tuvHistory?: TUVHistory[]; // Premium only
  expenses: CarExpense[];
  totalExpensesEUR: number;
  createdAt: Date;
  updatedAt: Date;
  // For compatibility with old components temporarily
  brand: string;
  userId: string;
  photoUrl?: string;
  engine?: string;
  description?: string;
}

// From lib/types/marketplace.ts
export interface Listing {
  id: string;
  uid: string;
  carId: string;
  title: string;
  description: string;
  priceEUR: number;
  photos: string[];
  status: 'active' | 'sold' | 'expired';
  createdAt: Date;
  expiresAt: Date; // 30 days from creation
  updatedAt: Date;
  viewCount?: number; // Premium only
  priceHistory?: PriceChange[]; // Premium only
  soldAt?: Date;
  soldPriceEUR?: number;
}

export interface PriceChange {
  date: Date;
  oldPriceEUR: number;
  newPriceEUR: number;
}

export interface Favorite {
  id: string;
  uid: string;
  listingId: string;
  createdAt: Date;
  notifyOnPriceChange: boolean;
  notifyOnSold: boolean;
}

// From lib/types/notifications.ts
export type NotificationType =
  | 'garage_tuv_expiring'
  | 'marketplace_listing_expiring'
  | 'marketplace_listing_sold'
  | 'marketplace_price_dropped'
  | 'favorite_price_changed'
  | 'favorite_sold'
  | 'event_reminder'
  | 'event_new_attendee'
  | 'community_new_post'
  | 'community_post_reply'
  | 'community_mention'
  | 'voting_new_poll'
  | 'voting_poll_ended';

// Renamed to avoid conflict with existing Notification type
export interface DashboardNotification {
  id: string;
  uid: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}


// --- OLD TYPES TO PRESERVE FUNCTIONALITY ---

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

export interface FeaturedCar {
  date: string;
  carId: string;
  userId: string;
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

// Keep old Garage 2.0 types for now, might be needed for migration
export type CarStatus = 'owned' | 'sold' | 'project' | 'dream' | 'parted'
export type FitmentStatus = 'flush' | 'tucked' | 'poke'
export type TimelineType = 'purchase' | 'maintenance' | 'tuning' | 'accident' | 'sale'
export type ModCategory = 'engine' | 'suspension' | 'exterior' | 'interior' | 'audio'

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

    