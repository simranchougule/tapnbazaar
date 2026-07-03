import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tapnbazaar.com'
const API_URL  = process.env.NEXT_PUBLIC_API_URL  || 'http://localhost:5000/api'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}`,                 lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE_URL}/categories`,      lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE_URL}/login`,           lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/register`,        lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/forgot-password`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.2 },
  ]

  const productPages: MetadataRoute.Sitemap = []
  try {
    let page = 1
    const limit = 100
    while (true) {
      const res = await fetch(`${API_URL}/products?limit=${limit}&page=${page}`, {
        next: { revalidate: 3600 },
      })
      if (!res.ok) break
      const data = await res.json()
      const products: { id: string; updatedAt: string }[] = data.products || []
      if (products.length === 0) break
      for (const p of products) {
        productPages.push({
          url:             `${BASE_URL}/products/${p.id}`,
          lastModified:    new Date(p.updatedAt),
          changeFrequency: 'weekly',
          priority:        0.7,
        })
      }
      if (page >= (data.pagination?.totalPages ?? 1)) break
      page++
    }
  } catch {
    // API unreachable during build — skip product URLs gracefully
  }

  return [...staticPages, ...productPages]
}
