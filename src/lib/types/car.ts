
import { Timestamp } from 'firebase/firestore'

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
  nickname?: string
  vin?: string
  
  // Hero-блок
  coverImage?: string
  coverVideo?: string
  photos: string[]
  photoUrl?: string;
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
  date: Timestamp
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
