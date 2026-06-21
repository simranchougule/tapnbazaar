// src/app/sitemap.ts
// Fix #15: Dynamic sitemap — previously no sitemap.xml existed at all.
// Next.js serves this automatically at /sitemap.xml.
// Includes static pages + all active product listing URLs.

import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tapnbazaar.com'
const API_URL  = process.env.NEXT_PUBLIC_API_URL  || 'http://localhost:5000/api'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}`,                  lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE_URL}/categories`,       lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE_URL}/login`,            lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/register`,         lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/forgot-password`,  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.2 },
  ]

  // Dynamic product pages
  let productPages: MetadataRoute.Sitemap = []
  try {
    const res = await fetch(`${API_URL}/products?limit=500&page=1`, {
      next: { revalidate: 3600 }, // rebuild sitemap at most once per hour
    })
    if (res.ok) {
      const data = await res.json()
      productPages = (data.products || []).map((p: { id: string; updatedAt: string }) => ({
        url:             `${BASE_URL}/products/${p.id}`,
        lastModified:    new Date(p.updatedAt),
        changeFrequency: 'weekly' as const,
        priority:        0.7,
      }))
    }
  } catch {
    // If API is unreachable during build, skip product URLs gracefully
  }

  return [...staticPages, ...productPages]
}