'use client'
import { usePathname } from 'next/navigation'
import Footer from './Footer'

const HIDE_FOOTER_ON = ['/login', '/register', '/forgot-password', '/reset-password']

export default function ConditionalFooter() {
  const pathname = usePathname()
  if (HIDE_FOOTER_ON.includes(pathname)) return null
  return <Footer />
}