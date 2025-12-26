// Shared Types for Bimo Yacht

export interface YachtMedia {
  id: string
  yachtId?: string
  url: string
  publicId?: string | null
  type: 'IMAGE' | 'VIDEO'
  isCover: boolean
  order: number
  createdAt?: Date
}

export interface Yacht {
  id: string
  slug: string
  title: string
  type: 'SALE' | 'CHARTER'
  status: 'AVAILABLE' | 'SOLD' | 'CHARTERED' | 'UNAVAILABLE'
  featured: boolean
  showPrice: boolean
  priceOnRequest: boolean
  brand?: string | null
  model?: string | null
  year?: number | null
  lengthFeet?: number | null
  lengthMeters?: number | null
  beam?: number | null
  draft?: number | null
  builder?: string | null
  cabins?: number | null
  bathrooms?: number | null
  guestCapacity?: number | null
  crewCapacity?: number | null
  engines?: string | null
  maxSpeed?: number | null
  cruiseSpeed?: number | null
  fuelCapacity?: number | null
  range?: number | null
  currency: string
  price?: number | null
  charterPricePerWeek?: number | null
  charterPricePerSeasonWinter?: number | null
  charterPricePerSeasonSummer?: number | null
  descriptionEn?: string | null
  descriptionAr?: string | null
  highlightsEn?: string[]
  highlightsAr?: string[]
  amenitiesEn?: string[]
  amenitiesAr?: string[]
  charterRoutes?: string[]
  priority: number
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date | null
  media: YachtMedia[]
}

export interface YachtWithMedia extends Yacht {
  media: YachtMedia[]
}

export interface Inquiry {
  id: string
  yachtId?: string | null
  name: string
  email?: string | null
  phone?: string | null
  message?: string | null
  source?: string | null
  userAgent?: string | null
  ipAddress?: string | null
  referrer?: string | null
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CLOSED'
  notes?: string | null
  createdAt: Date
  updatedAt: Date
  yacht?: Yacht | null
}

// Card props types
export interface YachtCardData {
  id: string
  slug: string
  title: string
  type: string
  price?: number | null
  priceOnRequest?: boolean
  charterPricePerWeek?: number | null
  currency: string
  lengthFeet?: number | null
  brand?: string | null
  year?: number | null
  cabins?: number | null
  guestCapacity?: number | null
  featured: boolean
  showPrice: boolean
  media: {
    url: string
    type: string
    isCover: boolean
  }[]
}
