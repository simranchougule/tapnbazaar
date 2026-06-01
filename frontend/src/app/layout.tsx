import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Footer from '@/components/layout/Footer'
import BottomNav from '@/components/layout/BottomNav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TapnBazaar - Buy & Sell Locally',
  description: 'Find great deals on second-hand items in your city',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        <div className="min-h-screen flex flex-col">
          <main className="flex-1 pb-16 sm:pb-0">
            {children}
          </main>
          <Footer />
          <BottomNav />
        </div>
      </body>
    </html>
  )
}