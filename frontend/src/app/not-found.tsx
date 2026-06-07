'use client'

import Link from 'next/link'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">

        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-8xl font-bold text-orange-500 mb-2">404</div>
          <div className="text-6xl mb-4">🛍️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Page Not Found</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Oops! The page you're looking for doesn't exist or has been removed.
            It might have been sold already! 😄
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 border border-orange-500 text-orange-500 hover:bg-orange-50 px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            <Search className="w-4 h-4" />
            Browse Listings
          </Link>
        </div>

        <button
          onClick={() => window.history.back()}
          className="flex items-center justify-center gap-2 text-gray-400 hover:text-gray-600 text-sm mt-6 mx-auto transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>

      </div>
    </div>
  )
}
