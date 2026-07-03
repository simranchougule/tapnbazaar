'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { token, setAuth, logout, loadFromStorage } = useAuthStore()

  useEffect(() => {
    // Step 1: restore token from localStorage first
    loadFromStorage()
  }, [])

  useEffect(() => {
    // Step 2: once token is available, fetch fresh user from server
    // This ensures phoneVerified, emailVerified etc are always up to date
    // and stale localStorage data never shows wrong verification status
    if (!token) return

    api.get('/auth/me')
      .then((res) => {
        if (res.data?.user) {
          setAuth(res.data.user, token)
        }
      })
      .catch(() => {
        // Token is invalid or expired — log out cleanly
        logout()
      })
  }, [token])

  return <>{children}</>
}
