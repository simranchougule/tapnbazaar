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
import { persist } from 'zustand/middleware'
import { User } from '@/types'

interface AuthStore {
  user:            User | null
  token:           string | null
  isLoggedIn:      boolean
  setAuth:         (user: User, token: string) => void
  logout:          () => void
  loadFromStorage: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user:        null,
      token:       null,
      isLoggedIn:  false,

      setAuth: (user, token) => set({ user, token, isLoggedIn: true }),

      logout: () => set({ user: null, token: null, isLoggedIn: false }),

      // kept for compatibility — persist handles hydration automatically
      loadFromStorage: () => {},
    }),
    {
      name: 'auth',
      partialize: (state) => ({ user: state.user, token: state.token, isLoggedIn: state.isLoggedIn }),
    }
  )
)