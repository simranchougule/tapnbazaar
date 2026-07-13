// src/app/register/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { Eye, EyeOff, UserPlus, CheckCircle2, XCircle } from 'lucide-react'
import { INDIA_STATES } from '@/lib/constants'

export default function RegisterPage() {
  const router  = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)

  const [formData, setFormData] = useState({
    name:            '',
    email:           '',
    password:        '',
    confirmPassword: '',
    phone:           '',
    city:            '',
    state:           '',
  })
  const [showPassword,        setShowPassword]        = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading]                         = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Password strength helpers
  const pwLen      = formData.password.length
  const pwStrength = pwLen === 0 ? null : pwLen < 6 ? 'weak' : pwLen < 10 ? 'fair' : 'strong'
  const pwStrengthLabel: Record<string, string> = { weak: 'Too short', fair: 'Good', strong: 'Strong' }
  const pwStrengthColor: Record<string, string> = {
    weak:   'bg-red-400',
    fair:   'bg-yellow-400',
    strong: 'bg-green-500',
  }
  const pwStrengthWidth: Record<string, string> = { weak: 'w-1/3', fair: 'w-2/3', strong: 'w-full' }

  // Confirm password match
  const confirmTouched = formData.confirmPassword.length > 0
  const passwordsMatch = formData.password === formData.confirmPassword && confirmTouched

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      toast.error('Please fill in all required fields')
      return
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (!/^\d{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      toast.error('Please enter a valid 10-digit mobile number')
      return
    }

    try {
      setLoading(true)
      // Don't send confirmPassword to the API
      const { confirmPassword, ...payload } = formData
      const res = await api.post('/auth/register', payload)

      if (res.data.success) {
        setAuth(res.data.user, res.data.token)
        toast.success('Account created! Please check your email to verify your account.')
        router.push('/')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image src="/tapnbazaar-logo.png" alt="TapnBazaar" width={1637} height={723} className="h-16 w-40 object-contain mx-auto" />
          </Link>
          <p className="text-gray-500 mt-2">Create your free account</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                  name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Simran Chougule"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                  name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength bar */}
              {pwStrength && (
                <div className="mt-2 space-y-1">
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${pwStrengthColor[pwStrength]} ${pwStrengthWidth[pwStrength]}`}
                    />
                  </div>
                  <p className={`text-xs font-medium ${
                    pwStrength === 'weak' ? 'text-red-500' :
                    pwStrength === 'fair' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {pwStrengthLabel[pwStrength]}
                  </p>
                </div>
              )}

              {/* Password rules hint */}
              <ul className="mt-2 space-y-0.5">
                <li className={`flex items-center gap-1.5 text-xs transition-colors ${pwLen >= 6 ? 'text-green-600' : 'text-gray-400'}`}>
                  <CheckCircle2 className={`w-3 h-3 ${pwLen >= 6 ? 'text-green-500' : 'text-gray-300'}`} />
                  At least 6 characters
                </li>
                <li className={`flex items-center gap-1.5 text-xs transition-colors ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                  <CheckCircle2 className={`w-3 h-3 ${/[A-Z]/.test(formData.password) ? 'text-green-500' : 'text-gray-300'}`} />
                  One uppercase letter (recommended)
                </li>
                <li className={`flex items-center gap-1.5 text-xs transition-colors ${/\d/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                  <CheckCircle2 className={`w-3 h-3 ${/\d/.test(formData.password) ? 'text-green-500' : 'text-gray-300'}`} />
                  One number (recommended)
                </li>
              </ul>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onPaste={(e) => e.preventDefault()}
                  placeholder="Re-enter your password"
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-1 transition-colors pr-20 ${
                    !confirmTouched
                      ? 'border-gray-200 focus:border-orange-500 focus:ring-orange-500'
                      : passwordsMatch
                      ? 'border-green-400 focus:border-green-500 focus:ring-green-500'
                      : 'border-red-300 focus:border-red-400 focus:ring-red-400'
                  }`}
                />
                {/* Show/hide toggle */}
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                {/* Match indicator icon */}
                {confirmTouched && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2">
                    {passwordsMatch
                      ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                      : <XCircle className="w-4 h-4 text-red-400" />
                    }
                  </span>
                )}
              </div>
              {confirmTouched && !passwordsMatch && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
              {passwordsMatch && (
                <p className="text-xs text-green-600 mt-1">Passwords match ✓</p>
              )}
            </div>

            {/* Phone — now required */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 border border-r-0 border-gray-200 rounded-l-xl bg-gray-50 text-gray-500 text-sm select-none">
                  +91
                </span>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  maxLength={10}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-r-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Required to post listings. You&apos;ll verify this via OTP.</p>
            </div>

            {/* City and State */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Pune"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white"
                >
                  <option value="">Select state</option>
                  {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || (confirmTouched && !passwordsMatch)}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-orange-500 font-medium hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
