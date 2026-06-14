import { Metadata } from 'next'
import ProductDetailClient from './ProductDetailClient'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const res = await fetch(`${API_URL}/products/${params.id}`, { next: { revalidate: 60 } })
    if (!res.ok) return {}
    const { product } = await res.json()
    const description = (product.description as string).slice(0, 160)
    const title       = `${product.title} — Rs.${product.price.toLocaleString('en-IN')}`
    const image       = product.images?.[0] ?? null
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
  } catch {
    return {}
  }
}

export default function ProductDetailPage() {
  return <ProductDetailClient />
}
