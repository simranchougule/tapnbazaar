'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Mail, MapPin, Clock, Instagram, Facebook, Twitter, ArrowRight } from 'lucide-react'

const CATEGORIES = [
  { name: 'Vehicles',    slug: 'vehicles' },
  { name: 'Electronics', slug: 'electronics' },
  { name: 'Property',    slug: 'property' },
  { name: 'Fashion',     slug: 'fashion' },
  { name: 'Furniture',   slug: 'furniture' },
]

const QUICK_LINKS = [
  { name: 'Home',           href: '/' },
  { name: 'Post a listing', href: '/products/new' },
  { name: 'All Categories', href: '/categories' },
  { name: 'My Profile',     href: '/profile' },
  { name: 'Login',          href: '/login' },
]

const SOCIAL_LINKS = [
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Facebook,  href: 'https://facebook.com',  label: 'Facebook' },
  { icon: Twitter,   href: 'https://twitter.com',   label: 'Twitter' },
]

function InlineLinkRow({ items, hrefBuilder }: { items: { name: string; slug?: string; href?: string }[]; hrefBuilder: (item: any) => string }) {
  return (
    <div className="flex flex-wrap items-center gap-y-1.5 text-sm leading-relaxed">
      {items.map((item, i) => (
        <span key={item.name} className="flex items-center">
          <Link href={hrefBuilder(item)} className="text-slate-700 hover:text-orange-600 font-medium transition-colors">
            {item.name}
          </Link>
          {i < items.length - 1 && <span className="text-slate-300 mx-2">|</span>}
        </span>
      ))}
    </div>
  )
}

function BrandBlock() {
  return (
    <div>
      <Link href="/" className="inline-block mb-3">
        <Image src="/tapnbazaar-logo.png" alt="TapnBazaar" width={1637} height={723} className="h-10 w-auto object-contain" />
      </Link>
      <p className="text-sm text-slate-600 leading-relaxed max-w-md">
        Buy New, Sell Used. All in One Place — Safe, simple and free across India.
      </p>

      <Link
        href="/products/new"
        className="flex sm:inline-flex items-center justify-center gap-2 mt-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-semibold px-5 py-3 sm:py-2.5 rounded-xl transition-all shadow-sm shadow-orange-200"
      >
        Post Free Ad
        <ArrowRight className="w-4 h-4" />
      </Link>

      <div className="flex items-center gap-3 mt-5">
        {SOCIAL_LINKS.map(social => {
          const Icon = social.icon
          return (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className="w-11 h-11 sm:w-9 sm:h-9 rounded-full bg-orange-50 hover:bg-orange-500 text-orange-500 hover:text-white flex items-center justify-center transition-all"
            >
              <Icon className="w-5 h-5 sm:w-4 sm:h-4" />
            </a>
          )
        })}
      </div>
    </div>
  )
}

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <div className="bg-slate-50 border-t-4 border-orange-500 mt-0">
      <div className="max-w-7xl mx-auto px-4 py-8 pb-28 sm:pb-10">

        {/* ── MOBILE layout ── */}
        <div className="sm:hidden">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <BrandBlock />
          </div>

          <div className="mt-5 bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-5">
            <div>
              <h3 className="text-[11px] font-bold text-orange-500 uppercase tracking-wider mb-2">Categories</h3>
              <InlineLinkRow items={CATEGORIES} hrefBuilder={c => '/?category=' + c.slug} />
            </div>

            <div className="h-px bg-slate-100" />

            <div>
              <h3 className="text-[11px] font-bold text-orange-500 uppercase tracking-wider mb-2">Quick Links</h3>
              <InlineLinkRow items={QUICK_LINKS} hrefBuilder={l => l.href} />
            </div>

            <div className="h-px bg-slate-100" />

            <div>
              <h3 className="text-[11px] font-bold text-orange-500 uppercase tracking-wider mb-2">Contact</h3>
              <div className="space-y-2.5">
                <a href="mailto:support@tapnbazaar.com" className="flex items-center gap-2 text-sm text-slate-700 font-medium hover:text-orange-600">
                  <Mail className="w-4 h-4 text-orange-400 flex-shrink-0" />
                  support@tapnbazaar.com
                </a>
                <p className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                  <MapPin className="w-4 h-4 text-orange-400 flex-shrink-0" />
                  Pune, Maharashtra
                </p>
                <p className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                  <Clock className="w-4 h-4 text-orange-400 flex-shrink-0" />
                  Mon–Sat, 9am–6pm
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── DESKTOP: grid layout ── */}
        <div className="hidden sm:grid sm:grid-cols-4 gap-8">
          <BrandBlock />

          <div>
            <h3 className="text-[11px] font-bold text-orange-500 uppercase tracking-wider mb-3">Categories</h3>
            <ul className="space-y-2.5">
              {CATEGORIES.map(cat => (
                <li key={cat.slug}>
                  <Link
                    href={'/?category=' + cat.slug}
                    className="text-sm text-slate-700 font-medium hover:text-orange-600 transition-colors relative inline-block group"
                  >
                    {cat.name}
                    <span className="absolute left-0 -bottom-0.5 w-0 h-px bg-orange-500 group-hover:w-full transition-all duration-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-bold text-orange-500 uppercase tracking-wider mb-3">Quick Links</h3>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-700 font-medium hover:text-orange-600 transition-colors relative inline-block group"
                  >
                    {link.name}
                    <span className="absolute left-0 -bottom-0.5 w-0 h-px bg-orange-500 group-hover:w-full transition-all duration-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-bold text-orange-500 uppercase tracking-wider mb-3">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                <a href="mailto:support@tapnbazaar.com" className="text-sm text-slate-700 font-medium hover:text-orange-600 transition-colors">
                  support@tapnbazaar.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-slate-700 font-medium">Pune, Maharashtra</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-slate-700 font-medium">Mon–Sat, 9am – 6pm</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-slate-200 mt-6 sm:mt-8 pt-5 flex flex-col items-start sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-slate-500 font-medium">© {year} TapnBazaar. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-xs text-slate-500 font-medium hover:text-orange-600 transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-xs text-slate-500 font-medium hover:text-orange-600 transition-colors">Terms of Service</Link>
            <Link href="#" className="text-xs text-slate-500 font-medium hover:text-orange-600 transition-colors">Help Center</Link>
          </div>
        </div>

      </div>
    </div>
  )
}
