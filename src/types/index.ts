export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  currency: 'PKR' | 'EUR' | 'GBP'
  images: ProductImage[]
  category: 'mirrors' | 'disco-balls' | 'wall-art' | 'accessories'
  materials?: string[]
  dimensions?: {
    width: number
    height: number
    depth?: number
    unit: 'cm' | 'in'
  }
  featured: boolean
  inStock: boolean
  quantity: number
  visible: boolean
  externalCheckoutUrl?: string
  createdAt: string
}

export interface ProductImage {
  src: string
  alt?: string
  width: number
  height: number
  isPrimary: boolean
  isLazyLoad?: boolean // Flag to indicate if image needs to be lazy loaded
}

export interface Event {
  id: string
  title: string
  date: string
  endDate?: string
  location: string
  description: string
  image: string
  gallery: string[]
  createdAt: string
  price?: number | string
  currency?: string
  performer?: string
  eventStatus?: string
  eventAttendanceMode?: string
}

export interface ReviewImage {
  src: string
  alt?: string
  width: number
  height: number
}

export interface Review {
  id: string
  productId: string
  productSlug: string

  // Anonymous reviewer info
  reviewerName: string
  reviewerEmail: string

  // Review content
  rating: number // 1-5 stars
  reviewText: string
  images: ReviewImage[]

  // Admin response
  adminResponse?: {
    text: string
    respondedAt: string
    respondedBy: string
  }

  // Metadata
  isVisible: boolean
  createdAt: string
  updatedAt: string
}

export interface ReviewStats {
  averageRating: number
  totalReviews: number
  ratingDistribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}

export interface AboutSection {
  id: string
  title: string
  content: string
}

export interface AboutContent {
  id: string
  sections: AboutSection[]
  updatedAt: string
}
