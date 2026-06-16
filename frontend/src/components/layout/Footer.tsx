'use client'

import Link from 'next/link'
import { Mail, MapPin, Clock } from 'lucide-react'

export default function Footer() {
  return (
    <div className="bg-white border-t-4 border-orange-500 mt-0">
      <div className="max-w-7xl mx-auto px-4 py-8 pb-24 sm:pb-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="inline-block mb-3">
              <img
                src="/tapnbazaar-logo.png"
                alt="TapnBazaar"
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed">
              Buy New, Sell Used. All in One Place — Safe, simple and free across India.
            </p>
            <div className="mt-4">
              <Link
                href="/products/new"
                className="inline-block bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
              >
                Post Free Ad
              </Link>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3 text-sm">Categories</h3>
            <ul className="space-y-2">
              {[
                { name: 'Electronics', slug: 'electronics' },
                { name: 'Cars',        slug: 'vehicles' },
                { name: 'Furniture',   slug: 'furniture' },
                { name: 'Fashion',     slug: 'fashion' },
                { name: 'Jobs',        slug: 'jobs' },
              ].map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={'/?category=' + cat.slug}
                    className="text-sm text-gray-500 hover:text-orange-500 transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3 text-sm">Quick Links</h3>
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

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3 text-sm">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-500">support@tapnbazaar.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-500">Pune, Maharashtra</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-500">Mon–Sat, 9am – 6pm</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-gray-100 mt-8 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">© 2024 TapnBazaar. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-xs text-slate-400 hover:text-orange-500 transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-xs text-slate-400 hover:text-orange-500 transition-colors">Terms of Service</Link>
            <Link href="#" className="text-xs text-slate-400 hover:text-orange-500 transition-colors">Help Center</Link>
          </div>
        </div>

      </div>
    </div>
  )
}