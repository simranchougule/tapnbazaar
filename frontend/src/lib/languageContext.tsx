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

// Trigger Google Translate to switch to the given language code
function triggerGoogleTranslate(langCode: string) {
  if (langCode === 'en') {
    // Restore original — reload without translate cookie
    const frame = document.querySelector<HTMLIFrameElement>('.goog-te-banner-frame')
    if (frame) {
      const restore = frame.contentDocument?.querySelector<HTMLAnchorElement>('.goog-te-button button')
      restore?.click()
    }
    // Remove Google Translate cookies and reload
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname
    window.location.reload()
    return
  }

  // Set the googtrans cookie that Google Translate reads
  const cookieValue = `/en/${langCode}`
  document.cookie = `googtrans=${cookieValue}; path=/`
  document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname}`

  // Try using the Select element Google Translate injects
  const select = document.querySelector<HTMLSelectElement>('.goog-te-combo')
  if (select) {
    select.value = langCode
    select.dispatchEvent(new Event('change'))
    return
  }

  // Fallback: reload — Google Translate will pick up the cookie
  window.location.reload()
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState('en')

  useEffect(() => {
    const saved = localStorage.getItem('preferred_language') || 'en'
    setLanguageState(saved)
    document.documentElement.lang = saved
  }, [])

  const setLanguage = (lang: string) => {
    setLanguageState(lang)
    localStorage.setItem('preferred_language', lang)
    document.documentElement.lang = lang
    triggerGoogleTranslate(lang)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}
