// src/store/authStore.ts
// Zustand is a simple state manager.
// Think of it like a shared box that all components can read from.
// When user logs in → we put user info in the box.
// Any component that needs user info → reads from the box.
//
// Fix #13: User type is now imported from @/types instead of being
// re-defined here with different/incomplete fields. Previously the two
// definitions had drifted apart — authStore had isAdmin/phoneVerified
// but not isBanned/isTrusted/emailVerified, while types/index.ts had
// none of the admin/verification flags at all.

import { create } from 'zustand'
import { User } from '@/types'

interface AuthStore {
  user:            User | null
  token:           string | null
  isLoggedIn:      boolean
  setAuth:         (user: User, token: string) => void
  logout:          () => void
  loadFromStorage: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user:      null,
  token:     null,
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
    const token   = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    if (token && userStr) {
      set({
        token,
        user:      JSON.parse(userStr),
        isLoggedIn: true,
      })
    }
  },
}))