'use client'

import { motion } from 'framer-motion'
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

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
}

const cardVariant = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function TrustSection() {
  return (
    <section
      aria-labelledby="trust-heading"
      className="bg-white border-t border-slate-200 py-16 px-4"
    >
      <div className="max-w-7xl mx-auto">

        {/* Trust badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex justify-center mb-6"
        >
          <span className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-600 text-sm font-medium px-4 py-1.5 rounded-full">
            🇮🇳 Trusted by buyers and sellers across India
          </span>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-12"
        >
          <h2
            id="trust-heading"
            className="text-3xl sm:text-4xl font-bold mb-3"
            style={{ color: '#001B5E' }}
          >
            Why Trust <span style={{ color: '#FF6B00' }}>TapnBazaar?</span>
          </h2>
          <p className="text-slate-500 text-base max-w-xl mx-auto">
            Buy and sell with confidence across India&apos;s trusted open marketplace.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5"
        >
          {CARDS.map((card) => {
            const Icon = card.icon
            return (
              <motion.article
                key={card.title}
                variants={cardVariant}
                tabIndex={0}
                aria-label={card.title}
                className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 p-6 flex flex-col items-center text-center focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 dark:bg-slate-800 dark:border-slate-700"
              >
                {/* Icon circle */}
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-4 bg-green-50 group-hover:bg-green-100 transition-colors"
                  aria-hidden="true"
                >
                  <Icon className="w-7 h-7 text-green-500" strokeWidth={1.8} />
                </div>

                <h3
                  className="text-base font-bold mb-2 dark:text-white"
                  style={{ color: '#001B5E' }}
                >
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
    </section>
  )
}
