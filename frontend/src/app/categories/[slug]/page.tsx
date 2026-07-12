import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CategoryContent from './CategoryContent'
import { Product } from '@/types'

// SEO fix: category browsing previously only happened via query params on
// the homepage (`/?category=slug`), which search engines treat as one
// generic page rather than distinct, indexable pages per category. This
// route gives every category (and subcategory) its own real URL, title,
// description, canonical, and OG/Twitter tags — the highest-leverage
// remaining SEO gap for long-tail search traffic (e.g. "used bikes near
// me" style queries landing directly on a relevant category page).

const API_URL  = process.env.NEXT_PUBLIC_API_URL  || 'http://localhost:5000/api'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tapnbazaar.com'

interface SubCategory { id: string; name: string; slug: string; icon: string }
interface CategoryInfo { id: string; name: string; slug: string; icon: string; children: SubCategory[] }

async function fetchCategory(slug: string): Promise<CategoryInfo | null> {
  try {
    const res = await fetch(`${API_URL}/categories/${slug}`, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    const data = await res.json()
    return data.category ?? null
  } catch {
    return null
  }
}

async function fetchCategoryProducts(slug: string): Promise<{ products: Product[]; totalPages: number; total: number }> {
  try {
    const res = await fetch(
      `${API_URL}/products?category=${slug}&page=1&limit=20&sortBy=createdAt&order=desc`,
      { next: { revalidate: 60 } }
    )
    if (!res.ok) return { products: [], totalPages: 1, total: 0 }
    const data = await res.json()
    return {
      products:   data.products ?? [],
      totalPages: data.pagination?.totalPages ?? 1,
      total:      data.pagination?.total ?? 0,
    }
  } catch {
    return { products: [], totalPages: 1, total: 0 }
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const category = await fetchCategory(params.slug)
  if (!category) return {}

  const title       = `${category.name} for Sale — Buy & Sell Near You`
  const description = `Browse local ${category.name.toLowerCase()} listings on TapnBazaar. Buy new or sell used ${category.name.toLowerCase()} near you — verified sellers, easy chat, no fees.`

  return {
    title,
    description,
    alternates: {
      canonical: `/categories/${category.slug}`,
    },
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

function buildBreadcrumbJsonLd(category: CategoryInfo) {
  return {
    '@context': 'https://schema.org',
    '@type':    'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',       item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Categories', item: `${SITE_URL}/categories` },
      { '@type': 'ListItem', position: 3, name: category.name, item: `${SITE_URL}/categories/${category.slug}` },
    ],
  }
}

export default async function CategorySlugPage({ params }: { params: { slug: string } }) {
  const category = await fetchCategory(params.slug)
  if (!category) notFound()

  const { products, totalPages, total } = await fetchCategoryProducts(params.slug)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(category)) }}
      />
      <CategoryContent
        category={category}
        initialProducts={products}
        initialPagination={{ totalPages, total }}
      />
    </>
  )
}
