'use client'
import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { Eye, EyeOff, KeyRound, XCircle, CheckCircle2 } from 'lucide-react'

function ResetPasswordForm() {
  const params = useSearchParams()
  const router = useRouter()
  const token  = params.get('token')

  const [password,        setPassword]        = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword,        setShowPassword]        = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Password strength
  const pwLen      = password.length
  const pwStrength = pwLen === 0 ? null : pwLen < 6 ? 'weak' : pwLen < 10 ? 'fair' : 'strong'
  const strengthLabel: Record<string, string> = { weak: 'Too short', fair: 'Good',     strong: 'Strong'      }
  const strengthColor: Record<string, string> = { weak: 'bg-red-400', fair: 'bg-yellow-400', strong: 'bg-green-500' }
  const strengthWidth: Record<string, string> = { weak: 'w-1/3',      fair: 'w-2/3',         strong: 'w-full'      }
  const strengthText:  Record<string, string> = { weak: 'text-red-500', fair: 'text-yellow-600', strong: 'text-green-600' }

  // Confirm match
  const confirmTouched  = confirmPassword.length > 0
  const passwordsMatch  = password === confirmPassword && confirmTouched

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password || !confirmPassword) { toast.error('Please fill in both fields'); return }
    if (password.length < 6)           { toast.error('Password must be at least 6 characters'); return }
    if (password !== confirmPassword)  { toast.error('Passwords do not match'); return }

    try {
      setLoading(true)
      const res = await api.post('/auth/reset-password', { token, newPassword: password })
      if (res.data.success) {
        toast.success('Password reset! Please log in.')
        router.push('/login')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm p-10 max-w-sm w-full text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Invalid Link</h2>
          <p className="text-gray-500 text-sm mb-6">This password reset link is missing a token. Please request a new one.</p>
          <Link href="/forgot-password" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
            Request New Link
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <KeyRound className="w-5 h-5 text-orange-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">Set a new password</h1>
            <p className="text-sm text-gray-400 mt-1">Choose a strong password for your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
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

              {/* Strength bar */}
              {pwStrength && (
                <div className="mt-2 space-y-1">
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${strengthColor[pwStrength]} ${strengthWidth[pwStrength]}`} />
                  </div>
                  <p className={`text-xs font-medium ${strengthText[pwStrength]}`}>
                    {strengthLabel[pwStrength]}
                  </p>
                </div>
              )}

              {/* Rules checklist */}
              <ul className="mt-2 space-y-0.5">
                <li className={`flex items-center gap-1.5 text-xs transition-colors ${pwLen >= 6 ? 'text-green-600' : 'text-gray-400'}`}>
                  <CheckCircle2 className={`w-3 h-3 ${pwLen >= 6 ? 'text-green-500' : 'text-gray-300'}`} />
                  At least 6 characters
                </li>
                <li className={`flex items-center gap-1.5 text-xs transition-colors ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                  <CheckCircle2 className={`w-3 h-3 ${/[A-Z]/.test(password) ? 'text-green-500' : 'text-gray-300'}`} />
                  One uppercase letter (recommended)
                </li>
                <li className={`flex items-center gap-1.5 text-xs transition-colors ${/\d/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                  <CheckCircle2 className={`w-3 h-3 ${/\d/.test(password) ? 'text-green-500' : 'text-gray-300'}`} />
                  One number (recommended)
                </li>
              </ul>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onPaste={(e) => e.preventDefault()}
                  placeholder="Re-enter your new password"
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-1 transition-colors pr-20 ${
                    !confirmTouched
                      ? 'border-gray-200 focus:border-orange-500 focus:ring-orange-500'
                      : passwordsMatch
                      ? 'border-green-400 focus:border-green-500 focus:ring-green-500'
                      : 'border-red-300 focus:border-red-400 focus:ring-red-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
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

            <button
              type="submit"
              disabled={loading || (confirmTouched && !passwordsMatch) || pwLen < 6}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  )
}
