import { Metadata } from 'next'
import ProductDetailClient from './ProductDetailClient'
import { Product } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Single fetch shared by both generateMetadata and the page render.
// Previously each called GET /products/:id independently — doubling
// DB load and incrementing the view count twice on every visit.
async function fetchProductData(id: string): Promise<{ product: Product; related: Product[] } | null> {
  try {
    const res = await fetch(`${API_URL}/products/${id}`, { next: { revalidate: 60 } })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const data = await fetchProductData(params.id)
  if (!data?.product) return {}

  const { product } = data
  const description  = (product.description as string).slice(0, 160)
  const title        = `${product.title} — Rs.${product.price.toLocaleString('en-IN')}`
  const image        = product.images?.[0] ?? null

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(image && { images: [{ url: image }] }),
    },
    twitter: {
      card:        'summary_large_image',
      title,
      description,
      ...(image && { images: [image] }),
    },
  }
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const data = await fetchProductData(params.id)
  // Pass the server-fetched data as props so the client component
  // does not need to re-fetch — eliminating the double view-count increment.
  return <ProductDetailClient initialProduct={data?.product ?? null} initialRelated={data?.related ?? []} />
}
