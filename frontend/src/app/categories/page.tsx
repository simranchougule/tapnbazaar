import { Metadata } from 'next'
import CategoriesContent from './CategoriesContent'

// SEO fix: previously this page was entirely client-rendered ('use client'
// + useEffect fetch), so it had no page-specific metadata (it fell back to
// the generic root title/description) and crawlers received no category
// list in the initial HTML. This server component now fetches categories
// up front, sets dedicated metadata + a canonical URL, and hands the data
// to the client component for the interactive sidebar/grid UI.

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export const metadata: Metadata = {
  title: 'All Categories - Browse Electronics, Vehicles, Property & More',
  description:
    'Browse all TapnBazaar categories — vehicles, electronics, property, fashion, furniture, jobs, pets, and more. Find local buy and sell listings by category.',
  alternates: {
    canonical: '/categories',
  },
}

interface SubCategory {
  id: string
  name: string
  slug: string
  icon: string
}

interface Category {
  id: string
  name: string
  slug: string
  icon: string
  children: SubCategory[]
}

const CATEGORY_ORDER = [
  'vehicles', 'electronics', 'property', 'fashion',
  'furniture', 'jobs', 'pets', 'sports', 'kids',
  'education', 'services', 'agriculture',
]

async function fetchCategories(): Promise<Category[]> {
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

export default async function CategoriesPage() {
  const categories = await fetchCategories()
  return <CategoriesContent initialCategories={categories} />
}
