// src/types/index.ts
// These are TypeScript types
// They define the shape of our data
// Like a contract that says "a Product must have these fields"

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  bio?: string
  city?: string
  state?: string
  isVerified: boolean
  createdAt: string
  _count?: {
    products: number
  }
}

export interface Category {
  id: string
  name: string
  slug: string
  icon?: string
  description?: string
}

export interface Product {
  id: string
  title: string
  description: string
  price: number
  condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR'
  status: 'ACTIVE' | 'SOLD' | 'INACTIVE'
  city: string
  state: string
  images: string[]
  views: number
  createdAt: string
  updatedAt: string
  userId: string
  categoryId: string
  listingType?: 'local' | 'dropship'
  supplierInfo?: string
  supplierCost?: number
  deliveryDays?: string
  returnPolicy?: string
  shippingNote?: string
  user: {
    id: string
    name: string
    avatar?: string
    phone?: string
    city?: string
    createdAt?: string
  }
  category: Category
  _count?: {
    favorites: number
  }
}

export interface PaginationInfo {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}