'use client'

import { motion, Variants } from 'framer-motion'
import { ShieldCheck, BadgeCheck, CreditCard, Wallet, Headset } from 'lucide-react'

const CARDS = [
  {
    icon:  ShieldCheck,
    title: 'Verified Sellers',
    desc:  'Trusted and verified sellers across India.',
  },
  {
    icon:  BadgeCheck,
    title: 'Manually Reviewed Listings',
    desc:  'Listings are reviewed to maintain quality and authenticity.',
  },
  {
    icon:  CreditCard,
    title: 'Secure Payments & EMI',
    desc:  'Safe payments through UPI, Cards, Net Banking, Wallets and EMI.',
  },
  {
    icon:  Wallet,
    title: 'Cash on Delivery',
    desc:  'Flexible payment options including COD on eligible products.',
  },
  {
    icon:  Headset,
    title: '24×7 Customer Support',
    desc:  'Dedicated support team available whenever you need assistance.',
  },
]

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
}

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export default function TrustSection() {
  return (
    <section
      aria-labelledby="trust-heading"
      className="bg-white border-t border-slate-200 py-10 sm:py-16 px-4 pb-14 sm:pb-16"
    >
      <div className="max-w-7xl mx-auto">

        {/* Heading with inline badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 sm:mb-12"
        >
          <h2
            id="trust-heading"
            className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-3 flex items-center justify-center gap-2 flex-wrap"
            style={{ color: '#001B5E' }}
          >
            <span>Why Trust <span style={{ color: '#FF6B00' }}>TapnBazaar?</span></span>
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
        </motion.div>

        {/* Mobile — horizontal swipeable slider, 2 cards per view */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          className="trust-slider flex sm:hidden gap-3 overflow-x-auto snap-x snap-mandatory -mx-4 px-4"
        >
          {CARDS.map((card) => {
            const Icon = card.icon
            return (
              <motion.article
                key={card.title}
                variants={cardVariant}
                tabIndex={0}
                aria-label={card.title}
                className="trust-card-mobile group bg-white rounded-2xl border border-slate-100 shadow-sm p-3.5 flex flex-col items-center justify-center flex-shrink-0 snap-center focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2.5 bg-green-50">
                  <Icon className="w-5 h-5 text-green-500" strokeWidth={1.8} />
                </div>
                <h3 className="text-xs font-bold text-center leading-tight" style={{ color: '#001B5E' }}>
                  {card.title}
                </h3>
              </motion.article>
            )
          })}
        </motion.div>

        {/* Scroll dots — mobile only */}
        <div className="flex sm:hidden justify-center gap-1.5 mt-4 mb-2">
          {CARDS.map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-200" />
          ))}
        </div>

        {/* Desktop — full grid with descriptions, 5th card centered */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-5"
        >
          {CARDS.map((card, i) => {
            const Icon = card.icon
            const isLastOdd = i === CARDS.length - 1 && CARDS.length % 2 !== 0
            return (
              <motion.article
                key={card.title}
                variants={cardVariant}
                tabIndex={0}
                aria-label={card.title}
                className={
                  "group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 p-6 flex flex-col items-center text-center focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 dark:bg-slate-800 dark:border-slate-700" +
                  (isLastOdd ? " sm:col-span-2 sm:mx-auto sm:w-1/2 lg:col-span-1 lg:w-auto" : "")
                }
              >
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 bg-green-50 group-hover:bg-green-100 transition-colors">
                  <Icon className="w-7 h-7 text-green-500" strokeWidth={1.8} />
                </div>
                <h3 className="text-base font-bold mb-2 dark:text-white" style={{ color: '#001B5E' }}>
                  {card.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed dark:text-slate-400">
                  {card.desc}
                </p>
              </motion.article>
            )
          })}
        </motion.div>
      </div>

      <style jsx>{`
        .trust-card-mobile {
          width: 44%;
        }
        .trust-slider::-webkit-scrollbar {
          display: none;
        }
        .trust-slider {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  )
}
