'use client'

import { ShieldCheck, BadgeCheck, MessageCircle, Headset, Wallet } from 'lucide-react'

const CARDS = [
  { icon: ShieldCheck, title: 'Verified Sellers',            desc: 'Trusted and verified sellers across India.' },
  { icon: BadgeCheck,  title: 'Manually Reviewed Listings',  desc: 'Listings are reviewed to maintain quality and authenticity.' },
  { icon: MessageCircle, title: 'Chat Directly With Sellers', desc: 'Talk to sellers, ask questions and arrange delivery yourself.' },
  { icon: Headset,     title: '24×7 Customer Support',       desc: 'Dedicated support team available whenever you need assistance.' },
  { icon: Wallet,      title: 'Cash on Delivery',            desc: 'Inspect your item and pay cash on delivery — no online payment needed.' },
]

export default function TrustSection() {
  return (
    <section
      aria-labelledby="trust-heading"
      className="bg-white border-t border-slate-200 py-10 sm:py-16 px-4 pb-14 sm:pb-16"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6 sm:mb-12">
          <h2
            id="trust-heading"
            className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-3 flex items-center justify-center gap-2 flex-wrap"
            style={{ color: '#001B5E' }}
          >
            <span>
              Why Trust <span style={{ color: '#FF6B00' }}>TapnBazaar?</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 bg-orange-50 border border-orange-200 text-orange-600 text-xs font-medium px-3 py-1 rounded-full align-middle">
              🇮🇳 Trusted across India
            </span>
          </h2>

          <span className="sm:hidden inline-flex items-center gap-1 bg-orange-50 border border-orange-200 text-orange-600 text-xs font-medium px-3 py-1 rounded-full mb-2">
            🇮🇳 Trusted across India
          </span>

          <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto">
            Buy and sell with confidence across India&apos;s trusted open marketplace.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-5">
          {CARDS.map((card, index) => {
            const Icon = card.icon
            const isLast = index === CARDS.length - 1
            return (
              <article
                key={card.title}
                aria-label={card.title}
                className={`group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 p-6 flex flex-col items-center text-center ${isLast ? 'col-span-2 lg:col-span-1' : ''}`}
              >
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mb-2 sm:mb-4 bg-green-50 group-hover:bg-green-100 transition-colors">
                  <Icon className="w-5 h-5 sm:w-7 sm:h-7 text-green-500" strokeWidth={1.8} />
                </div>

                <h3
                  className="text-xs sm:text-base font-bold mb-1 sm:mb-2"
                  style={{ color: '#001B5E' }}
                >
                  {card.title}
                </h3>

                <p className="hidden sm:block text-sm text-slate-500 leading-relaxed">
                  {card.desc}
                </p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
