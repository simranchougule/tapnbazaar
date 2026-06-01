'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <div className="bg-slate-50 border-t border-slate-200 mt-10">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">

          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-orange-500 text-white font-bold text-xl px-3 py-1 rounded-lg">
                TB
              </div>
              <span className="font-bold text-xl text-slate-900">TapnBazaar</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Buy and sell second-hand items locally across India. Safe, simple and free.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Categories</h3>
            <ul className="space-y-2">
              {[
                { name: 'Electronics', slug: 'electronics' },
                { name: 'Cars',        slug: 'cars' },
                { name: 'Furniture',   slug: 'furniture' },
                { name: 'Fashion',     slug: 'fashion' },
                { name: 'Books',       slug: 'books' },
              ].map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={"/?category=" + cat.slug}
                    className="text-sm text-gray-500 hover:text-orange-500 transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { name: 'Home',           href: '/' },
                { name: 'Post a listing', href: '/products/new' },
                { name: 'My Profile',     href: '/profile' },
                { name: 'Login',          href: '/login' },
                { name: 'Register',       href: '/register' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-orange-500 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Contact</h3>
            <ul className="space-y-2">
              <li className="text-sm text-gray-500">support@tapnbazaar.com</li>
              <li className="text-sm text-gray-500">Pune, Maharashtra</li>
              <li className="text-sm text-gray-500">Mon-Sat, 9am - 6pm</li>
            </ul>
            <div className="mt-4">
              <Link
                href="/products/new"
                className="inline-block bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
              >
                Post Free Ad
              </Link>
            </div>
          </div>

        </div>

        <div className="border-t border-gray-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            2024 TapnBazaar. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-xs text-slate-400 hover:text-orange-500 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-xs text-gray-400 hover:text-orange-500 transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="text-xs text-gray-400 hover:text-orange-500 transition-colors">
              Help Center
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}