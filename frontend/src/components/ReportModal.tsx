'use client'

// Fix #12 — now uses the shared <Modal> wrapper which provides:
// role="dialog", aria-modal, aria-labelledby, focus trap, Escape-to-close,
// body scroll lock, and focus restoration on close.

import { useState } from 'react'
import { Flag } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import Modal from './Modal'

const PRODUCT_REASONS = ['Fake Product', 'Fraud', 'Wrong Category', 'Duplicate Listing', 'Inappropriate Content']
const USER_REASONS    = ['Scam', 'Harassment', 'Fake Account', 'Spam', 'Other']

interface Props {
  type:        'product' | 'user'
  targetId:    string
  targetName?: string
  onClose:     () => void
}

export default function ReportModal({ type, targetId, targetName, onClose }: Props) {
  const [reason, setReason]   = useState('')
  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(false)

  const reasons = type === 'product' ? PRODUCT_REASONS : USER_REASONS

  const handleSubmit = async () => {
    if (!reason) { toast.error('Please select a reason'); return }
    try {
      setLoading(true)
      const endpoint = type === 'product'
        ? `/reports/product/${targetId}`
        : `/reports/user/${targetId}`
      await api.post(endpoint, { reason, details })
      toast.success('Report submitted. Thank you!')
      onClose()
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to submit report')
    } finally { setLoading(false) }
  }

  const title = (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center" aria-hidden="true">
        <Flag className="w-4 h-4 text-red-500" />
      </div>
      <div>
        <span>{type === 'product' ? 'Report Listing' : 'Report Seller'}</span>
        {targetName && (
          <p className="text-xs text-gray-400 font-normal truncate max-w-[180px]">{targetName}</p>
        )}
      </div>
    </div>
  )

  return (
    <Modal onClose={onClose} title={title}>
      <p className="text-xs text-gray-500 mb-4">
        Select the reason for your report. Our team reviews all reports within 24 hours.
      </p>

      <div className="space-y-2 mb-4" role="radiogroup" aria-label="Report reason">
        {reasons.map(r => (
          <label
            key={r}
            className={'flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ' +
              (reason === r ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-red-200')}
          >
            <input
              type="radio"
              name="reason"
              value={r}
              checked={reason === r}
              onChange={() => setReason(r)}
              className="accent-red-500"
            />
            <span className="text-sm text-gray-700">{r}</span>
          </label>
        ))}
      </div>

      <textarea
        value={details}
        onChange={e => setDetails(e.target.value)}
        placeholder="Additional details (optional)..."
        rows={2}
        aria-label="Additional details"
        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 resize-none mb-4"
      />

      <button
        onClick={handleSubmit}
        disabled={loading || !reason}
        className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-200 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
      >
        {loading ? 'Submitting...' : 'Submit Report'}
      </button>
    </Modal>
  )
}
