// src/lib/api.ts
// This is our axios instance
// Think of it like a pre-configured phone
// that always dials the right number (our backend)
// and always carries our ID card (token)

import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// This runs before every request
// It automatically adds the token from localStorage
// So we don't have to manually add it every time
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// This runs after every response
// If token is expired (401) → redirect to login
// Exception: a 401 from the login endpoint itself just means
// "wrong password" — that's not a session expiry, so let the
// login page handle it normally with an inline error instead
// of force-reloading the page.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login')
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api