// src/store/authStore.ts
// Zustand is a simple state manager
// Think of it like a shared box that all components can read from
// When user logs in → we put user info in the box
// Any component that needs user info → reads from the box

import { create } from 'zustand'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  city?: string
  state?: string
  isVerified: boolean
  isAdmin?: boolean
}

interface AuthStore {
  user: User | null
  token: string | null
  isLoggedIn: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
  loadFromStorage: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoggedIn: false,

  // Called when user logs in or registers
  setAuth: (user, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ user, token, isLoggedIn: true })
  },

  // Called when user logs out
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null, isLoggedIn: false })
  },

  // Called when app loads to restore login state
  loadFromStorage: () => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    if (token && userStr) {
      set({
        token,
        user: JSON.parse(userStr),
        isLoggedIn: true,
      })
    }
  },
}))