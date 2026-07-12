import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import ConditionalFooter from '@/components/layout/ConditionalFooter'
import BottomNav from '@/components/layout/BottomNav'
import AuthProvider from '@/components/AuthProvider'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
})

const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL || 'https://tapnbazaar.com'
const SITE_NAME = 'TapnBazaar'
const TAGLINE    = 'Buy New, Sell Used. All in One Place'

// SEO fix: previously only the product detail page set OG/Twitter tags,
// so sharing any other page (home, categories, profile, etc.) on
// WhatsApp/Facebook/Twitter showed no preview image/description at all —
// social platforms fall back to these root-level defaults when a page
// doesn't set its own. metadataBase also lets every page's relative
// canonical/OG URLs resolve correctly instead of falling back to
// localhost in some environments.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:  `${SITE_NAME} - ${TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: `Browse thousands of local listings across electronics, vehicles, property, fashion, furniture and more. ${TAGLINE} on ${SITE_NAME}.`,
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: `${SITE_NAME} - ${TAGLINE}`,
    description: TAGLINE,
    images: [{ url: '/tapnbazaar-logo.png' }],
  },
  twitter: {
    card: 'summary',
    title: `${SITE_NAME} - ${TAGLINE}`,
    description: TAGLINE,
    images: ['/tapnbazaar-logo.png'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

// Site-wide structured data: Organization identifies the business entity
// to Google, and WebSite + the SearchAction is what enables the sitelinks
// search box that can appear directly under your result in Google search.
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/tapnbazaar-logo.png`,
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/?search={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className={inter.variable + ' font-sans'}>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { background: '#363636', color: '#fff' },
            }}
          />
          <div className="min-h-screen flex flex-col">
            <main className="flex-1 pb-16 sm:pb-0">
              {children}
            </main>
            <ConditionalFooter />
            <BottomNav />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
