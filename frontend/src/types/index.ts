// src/types/index.ts
// Single source of truth for all shared frontend types.
//
// Fix #13: User was defined twice — here and in authStore.ts — with different,
// incomplete fields. authStore.ts now imports User from here instead of
// defining its own version. This eliminates the (as any) casts at every
// role/ban/trust check and keeps both in sync automatically.

export interface User {
  id:            string
  name:          string
  email:         string
  phone?:        string
  avatar?:       string
  bio?:          string
  city?:         string
  state?:        string
  isVerified:    boolean
  isAdmin:       boolean   // was missing — caused admin page guard to need (as any)
  isBanned:      boolean   // was missing — needed for client-side banned check
  isTrusted:     boolean   // was missing — needed for trusted badge display
  phoneVerified: boolean   // was missing — needed for PhoneVerifyModal logic
  emailVerified: boolean   // was missing — needed for verification banner
  createdAt:     string
  _count?: {
    products: number
  }
}

export interface Category {
  id:           string
  name:         string
  slug:         string
  icon?:        string
  description?: string
}

export interface Product {
  id:           string
  title:        string
  description:  string
  price:        number
  condition:    'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR'
  status:       'ACTIVE' | 'SOLD' | 'INACTIVE'
  city:         string
  state:        string
  locality?:    string
  area?:        string
  pincode?:     string
  latitude?:    number
  longitude?:   number
  images:       string[]
  views:        number
  createdAt:    string
  updatedAt:    string
  userId:       string
  categoryId:   string
  listingType?:  'local' | 'dropship'
  supplierInfo?: string
  supplierCost?: number
  deliveryDays?: string
  returnPolicy?: string
  shippingNote?: string
  user: {
    id:        string
    name:      string
    avatar?:   string
    phone?:    string
    city?:     string
    createdAt?: string
  }
  category: Category
  _count?: {
    favorites: number
  }
}

export interface PaginationInfo {
  total:      number
  page:       number
  limit:      number
  totalPages: number
}

export interface ApiResponse<T> {
  success:  boolean
  message?: string
  data?:    T
}