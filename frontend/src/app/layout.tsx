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

export const metadata: Metadata = {
  title: 'TapnBazaar - Buy New, Sell Used. All in One Place',
  description: 'Buy New, Sell Used. All in One Place — TapnBazaar',
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
