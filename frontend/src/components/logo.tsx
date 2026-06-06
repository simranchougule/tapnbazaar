'use client'

import Link from 'next/link'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  variant?: 'dark' | 'light'
}

export default function Logo({ size = 'md', showText = true, variant = 'light' }: LogoProps) {
  const sizes = {
    sm: { icon: 32, text: 'text-lg' },
    md: { icon: 40, text: 'text-xl' },
    lg: { icon: 56, text: 'text-3xl' },
  }

  const s = sizes[size]

  return (
    <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Dark navy background */}
        <rect width="100" height="100" rx="20" fill="#0f172a"/>

        {/* Shopping bag body */}
        <path
          d="M25 42 L30 80 L70 80 L75 42 Z"
          fill="url(#bagGrad)"
        />

        {/* Bag handle */}
        <path
          d="M38 42 C38 42 38 28 50 28 C62 28 62 42 62 42"
          stroke="#f97316"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />

        {/* White T letter */}
        <text
          x="50"
          y="70"
          textAnchor="middle"
          fontSize="28"
          fontWeight="900"
          fill="white"
          fontFamily="system-ui, sans-serif"
        >
          T
        </text>

        {/* Green arrow */}
        <path
          d="M32 76 Q50 68 70 56"
          stroke="#22c55e"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M64 52 L70 56 L66 63"
          stroke="#22c55e"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="bagGrad" x1="25" y1="42" x2="75" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f97316"/>
            <stop offset="50%" stopColor="#ea580c"/>
            <stop offset="100%" stopColor="#1e3a5f"/>
          </linearGradient>
        </defs>
      </svg>

      {showText && (
        <div>
          <div className={s.text + " font-black tracking-tight leading-none"}>
            <span className={variant === 'dark' ? 'text-white' : 'text-gray-900'}>Tapn</span>
            <span className="text-orange-500">Bazaar</span>
          </div>
          <p className={"text-xs -mt-0.5 " + (variant === 'dark' ? 'text-gray-400' : 'text-gray-400')}>
            Buy. Sell. Locally.
          </p>
        </div>
      )}
    </Link>
  )
}