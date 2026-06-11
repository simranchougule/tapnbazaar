'use client'
import { useState } from 'react'
import { X, Phone, ShieldCheck } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

interface Props {
  onVerified: () => void
  onClose:    () => void
}

export default function PhoneVerifyModal({ onVerified, onClose }: Props) {
  const { user, setAuth } = useAuthStore()
  const [step, setStep]   = useState<'phone' | 'otp'>(user?.phone ? 'otp' : 'phone')
  const [phone, setPhone] = useState(user?.phone || '')
  const [otp, setOtp]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendOtp = async () => {
    if (!/^\d{10}$/.test(phone.replace(/\s/g, ''))) { toast.error('Enter a valid 10-digit number'); return }
    try {
      setLoading(true)
      await api.post('/auth/send-otp', { phone })
      toast.success('OTP sent to your registered email!')
      setStep('otp')
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to send OTP')
    } finally { setLoading(false) }
  }

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) { toast.error('Enter the 6-digit OTP'); return }
    try {
      setLoading(true)
      const res = await api.post('/auth/verify-otp', { otp })
      const token = localStorage.getItem('token') || ''
      setAuth(res.data.user, token)
      toast.success('Phone verified! ✅')
      onVerified()
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Invalid OTP')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Verify Your Phone</h3>
              <p className="text-xs text-gray-400">Required to post listings</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {step === 'phone' ? (
          <>
            <p className="text-sm text-gray-500 mb-4">Enter your phone number and we'll send a verification OTP to your email.</p>
            <div className="flex items-center border-2 border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-orange-400 mb-4">
              <Phone className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
              <input
                type="tel" maxLength={10} value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="9876543210"
                className="flex-1 focus:outline-none text-sm text-gray-800"
              />
            </div>
            <button onClick={handleSendOtp} disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 rounded-xl transition-colors">
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-1">Enter the 6-digit OTP sent to your email.</p>
            <p className="text-xs text-orange-500 mb-4 font-medium">{user?.email}</p>
            <input
              type="text" maxLength={6} value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="_ _ _ _ _ _"
              className="w-full text-center text-2xl font-bold tracking-[12px] border-2 border-gray-200 rounded-xl py-3 focus:outline-none focus:border-orange-400 mb-4"
            />
            <button onClick={handleVerifyOtp} disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 rounded-xl transition-colors mb-3">
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button onClick={() => { setStep('phone'); setOtp('') }}
              className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors">
              ← Change phone number
            </button>
          </>
        )}
      </div>
    </div>
  )
}
