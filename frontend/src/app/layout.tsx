import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import ConditionalFooter from '@/components/layout/ConditionalFooter'
import BottomNav from '@/components/layout/BottomNav'
import AuthProvider from '@/components/AuthProvider'
import { LanguageProvider } from '@/lib/languageContext'
import Script from 'next/script'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
})

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tapnbazaar.com'

export const metadata: Metadata = {
  title: 'TapnBazaar - Buy New, Sell Used. All in One Place',
  description: 'Buy New, Sell Used. All in One Place — Safe, simple and free across India.',
  metadataBase: new URL(BASE_URL),
  alternates: { canonical: '/' },
  openGraph: {
    siteName: 'TapnBazaar',
    type: 'website',
    locale: 'en_IN',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <Script id="google-translate-init" strategy="afterInteractive">{`
          function googleTranslateElementInit() {
            new google.translate.TranslateElement(
              { pageLanguage: 'en', autoDisplay: false },
              'google_translate_element'
            );
          }
        `}</Script>
        <Script
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
      </head>
      <body className={inter.variable + ' font-sans'}>
        <LanguageProvider>
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
        </LanguageProvider>
      </body>
    </html>
  )
}
