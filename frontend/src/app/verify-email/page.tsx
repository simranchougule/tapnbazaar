'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import api from '@/lib/api'
import { CheckCircle, XCircle, Loader } from 'lucide-react'
import Link from 'next/link'

export default function VerifyEmailPage() {
  const params = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = params.get('token')
    if (!token) { setStatus('error'); setMessage('Invalid verification link.'); return }

    api.get('/auth/verify-email?token=' + token)
      .then(res => { setStatus('success'); setMessage(res.data.message) })
      .catch(e  => { setStatus('error');   setMessage(e?.response?.data?.message || 'Verification failed.') })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm p-10 max-w-sm w-full text-center">
        {status === 'loading' && (
          <>
            <Loader className="w-12 h-12 text-orange-400 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600 font-semibold">Verifying your email…</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Email Verified!</h2>
            <p className="text-gray-500 text-sm mb-6">{message}</p>
            <Link href="/login" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
              Continue to Login
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Verification Failed</h2>
            <p className="text-gray-500 text-sm mb-6">{message}</p>
            <Link href="/register" className="text-orange-500 text-sm font-medium hover:underline">
              Back to Register
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
