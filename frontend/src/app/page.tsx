import { Metadata } from 'next'
import HomeContentWrapper from './HomeContent'
import { Product } from '@/types'

// SEO fix: the homepage previously fetched everything client-side, so the
// server-rendered HTML sent to crawlers contained no product listings —
// just an empty shell that filled in after the browser ran JS. This file
// now fetches page-1 products + categories on the server, so the initial
// HTML response already contains real listings, titles, and images.
// The interactive parts (search, filters, geolocation, favorites) still
// live in the client component, which receives this data as initial state.

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export const metadata: Metadata = {
  title: 'TapnBazaar - Buy New, Sell Used. All in One Place',
  description:
    'Browse thousands of local listings across electronics, vehicles, property, fashion, furniture and more. Buy new or sell used, all in one place on TapnBazaar.',
  alternates: {
    canonical: '/',
  },
}

interface Category {
  id: string
  name: string
  slug: string
  icon: string
  children: { id: string; name: string; slug: string; icon: string }[]
}

const CATEGORY_ORDER = [
  'vehicles', 'electronics', 'property', 'fashion', 'furniture',
  'jobs', 'pets', 'sports', 'kids', 'education', 'services', 'agriculture',
]

async function fetchInitialProducts(): Promise<{ products: Product[]; totalPages: number; total: number }> {
  try {
    const res = await fetch(`${API_URL}/products?page=1&limit=20&sortBy=createdAt&order=desc`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return { products: [], totalPages: 1, total: 0 }
    const data = await res.json()
    return {
      products: data.products ?? [],
      totalPages: data.pagination?.totalPages ?? 1,
      total: data.pagination?.total ?? 0,
    }
  } catch {
    return { products: [], totalPages: 1, total: 0 }
  }
}

async function fetchInitialCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_URL}/categories`, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const data = await res.json()
    const categories: Category[] = data.categories ?? []
    return [...categories].sort((a, b) => {
      const ai = CATEGORY_ORDER.indexOf(a.slug)
      const bi = CATEGORY_ORDER.indexOf(b.slug)
      if (ai === -1 && bi === -1) return a.name.localeCompare(b.name)
      if (ai === -1) return 1
      if (bi === -1) return -1
      return ai - bi
    })
  } catch {
    return []
  }
}

export default async function Page() {
  const [{ products, totalPages, total }, categories] = await Promise.all([
    fetchInitialProducts(),
    fetchInitialCategories(),
  ])

  return (
    <HomeContentWrapper
      initialProducts={products}
      initialPagination={{ totalPages, total }}
      initialCategories={categories}
    />
  )
}