// src/app/sitemap.ts
// Fix #15: Dynamic sitemap — previously no sitemap.xml existed at all.
// Next.js serves this automatically at /sitemap.xml.
// Includes static pages + all active product listing URLs + category pages.
//
// Also fixes: previously capped at a single page of 500 products, silently
// excluding anything beyond that from the sitemap. Now paginates through
// every page the API reports, up to a safety cap so a runaway `totalPages`
// value can't turn this into an unbounded fetch loop at build time.

import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tapnbazaar.com'
const API_URL  = process.env.NEXT_PUBLIC_API_URL  || 'http://localhost:5000/api'
const PAGE_SIZE = 500
const MAX_PAGES  = 40 // safety cap: up to 20,000 products in the sitemap

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}`,                  lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE_URL}/categories`,       lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE_URL}/login`,            lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/register`,         lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/forgot-password`,  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.2 },
  ]

  // Category + subcategory pages
  let categoryPages: MetadataRoute.Sitemap = []
  try {
    const res = await fetch(`${API_URL}/categories`, { next: { revalidate: 3600 } })
    if (res.ok) {
      const data = await res.json()
      const categories: { slug: string; children?: { slug: string }[] }[] = data.categories ?? []
      categoryPages = categories.flatMap((cat) => [
        {
          url:             `${BASE_URL}/categories/${cat.slug}`,
          lastModified:    new Date(),
          changeFrequency: 'daily' as const,
          priority:        0.8,
        },
        ...(cat.children ?? []).map((sub) => ({
          url:             `${BASE_URL}/categories/${sub.slug}`,
          lastModified:    new Date(),
          changeFrequency: 'daily' as const,
          priority:        0.7,
        })),
      ])
    }
  } catch {
    // If API is unreachable during build, skip category URLs gracefully
  }

  // Dynamic product pages — paginate through all active products
  let productPages: MetadataRoute.Sitemap = []
  try {
    let page = 1
    let totalPages = 1
    do {
      const res = await fetch(`${API_URL}/products?limit=${PAGE_SIZE}&page=${page}`, {
        next: { revalidate: 3600 }, // rebuild sitemap at most once per hour
      })
      if (!res.ok) break
      const data = await res.json()
      const pageProducts = (data.products || []).map((p: { id: string; updatedAt: string }) => ({
        url:             `${BASE_URL}/products/${p.id}`,
        lastModified:    new Date(p.updatedAt),
        changeFrequency: 'weekly' as const,
        priority:        0.7,
      }))
      productPages = productPages.concat(pageProducts)
      totalPages = data.pagination?.totalPages ?? 1
      page += 1
    } while (page <= totalPages && page <= MAX_PAGES)
  } catch {
    // If API is unreachable during build, skip product URLs gracefully
  }

  return [...staticPages, ...categoryPages, ...productPages]
}