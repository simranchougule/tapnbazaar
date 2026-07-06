'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface LanguageContextType {
  language: string
  setLanguage: (lang: string) => void
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
})

export function useLanguage() {
  return useContext(LanguageContext)
}

function setCookie(name: string, value: string) {
  const hostname = window.location.hostname
  // Set for both root domain and current hostname
  document.cookie = `${name}=${value}; path=/; max-age=31536000`
  if (hostname !== 'localhost') {
    document.cookie = `${name}=${value}; path=/; domain=.${hostname}; max-age=31536000`
  }
}

function deleteCookie(name: string) {
  const hostname = window.location.hostname
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC`
  if (hostname !== 'localhost') {
    document.cookie = `${name}=; path=/; domain=.${hostname}; expires=Thu, 01 Jan 1970 00:00:00 UTC`
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('preferred_language') || 'en'
    setLanguageState(saved)
    document.documentElement.lang = saved
  }, [])

  const setLanguage = (lang: string) => {
    setLanguageState(lang)
    localStorage.setItem('preferred_language', lang)
    document.documentElement.lang = lang

    if (lang === 'en') {
      deleteCookie('googtrans')
    } else {
      setCookie('googtrans', `/en/${lang}`)
    }

    window.location.reload()
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {/* Google Translate mount point — client only, avoids hydration mismatch */}
      {mounted && (
        <div id="google_translate_element" style={{ position: 'absolute', top: '-9999px', left: '-9999px', width: 0, height: 0, overflow: 'hidden' }} />
      )}
      {children}
    </LanguageContext.Provider>
  )
}
