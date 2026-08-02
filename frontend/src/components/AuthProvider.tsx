'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, logout, loadFromStorage } = useAuthStore()

  useEffect(() => {
    loadFromStorage()
    const token = localStorage.getItem('token')
    if (!token) return
    api.get('/auth/me')
      .then((res) => { if (res.data?.user) setAuth(res.data.user, token) })
      .catch(() => logout())
  }, [])

  return <>{children}</>
}
