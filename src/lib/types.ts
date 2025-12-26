
// src/lib/types.ts
import type { Timestamp } from 'firebase/firestore';

// --- BRANDED TYPES ---
export type UserId = string & { readonly __brand: 'UserId' };
export type PostId = string & { readonly __brand: 'PostId' };
export type CarId = string & { readonly __brand: 'CarId' };
export type CommentId = string & { readonly __brand: 'CommentId' };
export type CommunityId = string & { readonly __brand: 'CommunityId' };
export type ListingId = string & { readonly __brand: 'ListingId' };
export type EventId = string & { readonly __brand: 'EventId' };
export type NotificationId = string & { readonly __brand: 'NotificationId' };
export type WorkshopId = string & { readonly __brand: 'WorkshopId' };
export type ReviewId = string & { readonly __brand: 'ReviewId' };
export type VotingId = string & { readonly __brand: 'VotingId' };
export type NewsId = string & { readonly __brand: 'NewsId' };
export type FeedbackId = string & { readonly __brand: 'FeedbackId' };
export type DialogId = string & { readonly __brand: 'DialogId' };
export type MessageId = string & { readonly __brand: 'MessageId' };
export type AchievementId = string & { readonly __brand: 'AchievementId' };
export type TimelineEntryId = string & { readonly __brand: 'TimelineEntryId' };
export type ExpenseId = string & { readonly __brand: 'ExpenseId' };
export type InventoryItemId = string & { readonly __brand: 'InventoryItemId' };


// --- ENUMS AND TYPES FROM OLDER CAR.TS ---
export type CarStatus = 'owned' | 'sold' | 'project' | 'dream' | 'parted';
export type FitmentStatus = 'flush' | 'tucked' | 'poke';
export type TimelineType = 'purchase' | 'maintenance' | 'tuning' | 'accident' | 'sale';
export type ModCategory = 'engine' | 'suspension' | 'exterior' | 'interior' | 'audio';
export type CarStatusConfig = { label: string, color: string };

export interface WheelSetup {
  et: number;
  width: number;
  tire: string;
  spacers?: number;
}

export interface Modification {
  id: string; // Keep as string for sub-collection items without brand
  part: string;
  brand: string;
  model: string;
  price?: number;
  installedAt?: Timestamp;
  postId?: PostId;
  affiliateLink?: string;
}

// --- NEW TYPES FROM ARCHITECTURE DOC & MERGED ---

export interface UserRoles {
  isPremium: boolean;
  isFirm: boolean;
  isModerator: boolean;
  isAdmin: boolean;
}

export interface Achievement {
  id: AchievementId;
  icon: string;
  title: string;
  unlocked: boolean;
}

// Merged User type
export interface User {
  id: UserId;
  uid: UserId;
  displayName: string;
  name: string; // for compatibility
  email?: string;
  roles: UserRoles;
  status?: 'active' | 'banned';
  
  photoURL?: string;
  coverUrl?: string;
  bio?: string;
  nickname?: string;
  location?: string;
  profileVisibility?: 'public' | 'private';
  achievements?: Achievement[];
  skills?: string[];

  createdAt: any;
  updatedAt: any;

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
  };
  // Deprecated, replaced by roles object. Kept for graceful migration.
  role?: 'user' | 'moderator' | 'admin';
}

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
  id: ExpenseId;
  date: Date;
  category: 'fuel' | 'maintenance' | 'insurance' | 'tuning' | 'other';
  amountEUR: number;
  description: string;
  receiptUrl?: string;
}

// MERGED Car type
export interface Car {
  id: CarId;
  uid: UserId;
  vin?: string;
  make: string;
  model: string;
  year: number;
  photos: { url: string; blurhash?: string; }[];
  tuv?: TUVStatus;
  tuvHistory?: TUVHistory[];
  expenses?: CarExpense[];
  totalExpensesEUR?: number;
  createdAt: any;
  updatedAt: any;
  
  // Merged from old type for compatibility
  brand: string; // Redundant with 'make', but needed for old components
  userId: UserId; // Redundant with 'uid', but needed for old components
  description?: string;
  photoUrl?: string;
  engine?: string;
  generation?: string;
  nickname?: string;
  badges?: string[];
  coverVideo?: string;
  coverImage?: string;
  views?: number;
  likes?: number;
  comments?: number;
  status: CarStatus;
  fitment?: {
    front: WheelSetup;
    rear: WheelSetup;
    status: FitmentStatus;
  };
  modifications: Record<ModCategory, Modification[]>;
  specs: {
    stockHP: number;
    currentHP: number;
    acceleration: number;
    clearance: number;
    mileage: number;
    lastMileageUpdate: Timestamp;
  };
}

export interface Listing {
  id: ListingId;
  uid: UserId;
  carId: CarId;
  title: string;
  description: string;
  priceEUR: number;
  photos: string[];
  status: 'active' | 'sold' | 'expired';
  createdAt: Date;
  expiresAt: Date; // 30 days from creation
  updatedAt: Date;
  viewCount?: number; // Premium only
  soldAt?: Date;
  soldPriceEUR?: number;
}

export interface Favorite {
  id: string; // Subcollection doc id can be string
  uid: UserId;
  listingId: ListingId;
  createdAt: Date;
  notifyOnPriceChange: boolean;
  notifyOnSold: boolean;
}

export type DashboardNotificationType =
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

export interface DashboardNotification {
  id: NotificationId;
  uid: UserId;
  type: DashboardNotificationType;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}


// --- OLD TYPES TO PRESERVE FUNCTIONALITY (with Branded Types) ---

export interface Post {
  id: PostId;
  authorId: UserId;
  authorName: string;
  authorAvatar?: string;
  carId?: CarId;
  title: string;
  content: string; // Main HTML content
  imageUrl?: string; // The primary image for the post
  blurhash?: string; // Blurhash for the primary image
  tags?: string[];
  category: string;
  status: 'published' | 'hidden' | 'draft';
  likesCount: number;
  commentsCount: number;
  views: number;
  createdAt: any; // Can be server or client timestamp
  updatedAt?: any;
  communityId?: CommunityId;
}

export interface FeaturedCar {
  date: string;
  carId: CarId;
  userId: UserId;
}

export interface Comment {
    id: CommentId;
    postId: PostId;
    authorId: UserId; // userId
    authorName: string;
    authorAvatar?: string;
    content: string;
    createdAt: any;
}

export interface Community {
  id: CommunityId;
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
  adminId: UserId;
  memberIds: UserId[];
}

export interface Voting {
  id: VotingId;
  question: string;
  options: string[];
  votes: number[] | { [key: string]: number }; // number[] for polls, object for car voting
  votedUserIds?: UserId[];
  contenderCarIds?: CarId[]; // optional for car of the day
  isActive: boolean;
  createdAt: any;
  endsAt?: any;
  totalVotes: number;
  authorId?: UserId;
}

export interface MarketplaceItem {
  id: ListingId;
  title: string;
  brand?: string;
  model?: string;
  year?: number;
  description: string;
  fullDescription?: string;
  price: number;
  currency: string;
  category: string;
  condition: string;
  location: string;
  imageUrl?: string;
  gallery?: { url: string; blurhash?: string }[];
  sellerId: UserId;
  sellerName: string;
  sellerAvatar?: string;
  sellerPhone?: string;
  sellerEmail?: string;
  createdAt: any;
  updatedAt?: any;
  views?: number; // Количество просмотров
}


export interface Workshop {
  id: WorkshopId;
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
  createdBy?: UserId;
}

export interface Review {
  id: ReviewId;
  workshopId?: WorkshopId;
  userId: UserId;
  userName: string;
  userAvatar?: string;
  rating: number;
  text: string;
  createdAt: any;
}

export interface Feedback {
  id: FeedbackId;
  email?: string;
  msg: string;
  createdAt: any;
}

export interface Event {
  id: EventId;
  title: string;
  description: string;
  fullDescription?: string;
  location: string;
  address?: string;
  startDate: any;
  endDate?: any;
  category: string;
  imageUrl?: string;
  organizerId: UserId;
  organizerName: string;
  organizerAvatar?: string;
  participantIds: UserId[];
  participantsCount: number;
  maxParticipants?: number;
  createdAt: any;
  requirements?: string;
  schedule?: string;
}

export interface Notification {
  id: NotificationId;
  recipientId: UserId;
  senderId?: UserId;
  senderData?: {
    displayName: string;
    photoURL?: string;
  };
  type: 'like' | 'comment' | 'follow' | 'mention' | 'car_of_day' | 'system';
  title: string;
  message: string;
  actionURL?: string;
  relatedEntityId?: PostId | CarId | CommentId;
  relatedEntityType?: 'post' | 'car' | 'comment';
  read: boolean;
  createdAt: any;
}

export interface AutoNews {
  id: NewsId;
  title: string;
  description: string;
  imageUrl?: string;
  source: string;
  sourceUrl: string;
  category: string;
  publishedAt: any;
  fetchedAt?: any;
}

export interface TimelineEntry {
  id: TimelineEntryId;
  carId: CarId;
  date: any;
  type: TimelineType;
  title: string;
  description: string;
  mileage: number;
  cost?: number;
  photos: string[];
  documents: string[];
  isPublic: boolean;
}

export interface InventoryItem {
  id: InventoryItemId;
  carId: CarId;
  name: string;
  category: string;
  quantity: number;
  photo?: string;
  purchasePrice?: number;
  forSale: boolean;
  salePrice?: number;
}

export interface Report {
    id: string;
    entityId: string;
    entityType: 'post' | 'comment' | 'user';
    entityTitle: string;
    reportedBy: UserId;
    status: 'open' | 'resolved' | 'dismissed';
    createdAt: any;
}

export interface Dialog {
  id: DialogId,
  participantIds: UserId[];
  lastMessageText?: string;
  lastMessageAt?: any;
  unreadCount?: { [key: string]: number };
}

export interface Message {
  id: MessageId,
  dialogId: DialogId,
  authorId: UserId,
  text: string;
  createdAt: any;
}
