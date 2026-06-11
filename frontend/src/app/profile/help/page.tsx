'use client'
import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import { ArrowLeft, ChevronDown, HelpCircle, MessageSquare, AlertTriangle, ShieldCheck, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const FAQS = [
  { q: 'How do I post a listing?',            a: 'Tap "Sell Now" in the top navigation, fill in the details, add photos, and publish. It\'s free!' },
  { q: 'Is TapnBazaar free to use?',          a: 'Yes! Posting and browsing listings is completely free. We may introduce premium features in the future.' },
  { q: 'How do I contact a seller?',          a: 'Open any listing and tap the "Chat with Seller" button to start a conversation directly.' },
  { q: 'How do I mark my item as sold?',      a: 'Go to My Profile → My Listings, then tap the "Sold" button on the listing card.' },
  { q: 'Can I edit a listing after posting?', a: 'Yes. Go to My Listings, tap "Edit" on the listing, make your changes, and save.' },
  { q: 'How do I report a suspicious listing?', a: 'Open the listing and tap the flag icon, or use Report a Problem in this Help section.' },
]

const SAFETY_TIPS = [
  { icon: '🤝', tip: 'Meet in a safe, public place' },
  { icon: '💰', tip: 'Never pay in advance or wire money' },
  { icon: '🔍', tip: 'Inspect items before handing over payment' },
  { icon: '📞', tip: 'Verify the seller\'s contact details before meeting' },
  { icon: '🚫', tip: 'Do not share personal financial information' },
  { icon: '🛡️', tip: 'Trust your instincts — if it seems too good, be cautious' },
]

const HELP_SECTIONS = [
  { id: 'faqs',    icon: HelpCircle,     label: 'FAQs',              desc: 'Answers to common questions' },
  { id: 'contact', icon: MessageSquare,  label: 'Contact Support',   desc: 'Reach out to our team' },
  { id: 'report',  icon: AlertTriangle,  label: 'Report a Problem',  desc: 'Tell us about an issue' },
  { id: 'safety',  icon: ShieldCheck,    label: 'Safety Tips',       desc: 'Stay safe while buying & selling' },
]

export default function HelpPage() {
  const [active, setActive]       = useState<string | null>(null)
  const [openFaq, setOpenFaq]     = useState<number | null>(null)
  const [reportForm, setReportForm] = useState({ type: '', description: '', email: '' })
  const [submitting, setSubmitting] = useState(false)
  const [contactForm, setContactForm] = useState({ subject: '', message: '', email: '' })

  const handleReport = async () => {
    if (!reportForm.description.trim()) { toast.error('Please describe the problem'); return }
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 800))
    toast.success('Report submitted! We\'ll review it shortly.')
    setReportForm({ type: '', description: '', email: '' })
    setSubmitting(false)
  }

  const handleContact = async () => {
    if (!contactForm.subject.trim() || !contactForm.message.trim()) { toast.error('Please fill all fields'); return }
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 800))
    toast.success('Message sent! We\'ll get back to you within 24 hours.')
    setContactForm({ subject: '', message: '', email: '' })
    setSubmitting(false)
  }

  const renderContent = () => {
    switch (active) {
      case 'faqs':
        return (
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-800 pr-4">{faq.q}</span>
                  <ChevronDown className={'w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ' + (openFaq === i ? 'rotate-180' : '')} />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-3 text-sm text-gray-500 border-t border-gray-50 pt-2">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        )

      case 'contact':
        return (
          <div className="space-y-3 max-w-sm">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Your Email</label>
              <input
                value={contactForm.email}
                onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                placeholder="your@email.com"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Subject</label>
              <input
                value={contactForm.subject}
                onChange={e => setContactForm(f => ({ ...f, subject: e.target.value }))}
                placeholder="What's this about?"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Message</label>
              <textarea
                value={contactForm.message}
                onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                rows={4}
                placeholder="Describe your issue..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 resize-none"
              />
            </div>
            <button onClick={handleContact} disabled={submitting}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors">
              {submitting ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        )

      case 'report':
        return (
          <div className="space-y-3 max-w-sm">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Problem Type</label>
              <select
                value={reportForm.type}
                onChange={e => setReportForm(f => ({ ...f, type: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 bg-white"
              >
                <option value="">Select a type...</option>
                <option value="scam">Scam or Fraud</option>
                <option value="inappropriate">Inappropriate Content</option>
                <option value="bug">App Bug or Error</option>
                <option value="account">Account Issue</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Your Email (optional)</label>
              <input
                value={reportForm.email}
                onChange={e => setReportForm(f => ({ ...f, email: e.target.value }))}
                placeholder="For follow-up"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Description *</label>
              <textarea
                value={reportForm.description}
                onChange={e => setReportForm(f => ({ ...f, description: e.target.value }))}
                rows={4}
                placeholder="Describe the problem in detail..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 resize-none"
              />
            </div>
            <button onClick={handleReport} disabled={submitting}
              className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors">
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        )

      case 'safety':
        return (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 mb-2">Your safety is our top priority. Follow these tips when buying or selling.</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {SAFETY_TIPS.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
                  <span className="text-xl leading-none">{item.icon}</span>
                  <p className="text-sm text-gray-700">{item.tip}</p>
                </div>
              ))}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6">

        <Link href="/profile" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-500 mb-5 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Profile
        </Link>

        <div className="flex flex-col sm:flex-row gap-5">

          {/* Left nav */}
          <div className="sm:w-64 flex-shrink-0 bg-white rounded-2xl shadow-sm overflow-hidden self-start">
            <div className="px-4 py-3 border-b border-gray-50">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">❓ Help &amp; Support</span>
            </div>
            <ul>
              {HELP_SECTIONS.map(s => (
                <li key={s.id}>
                  <button
                    onClick={() => setActive(active === s.id ? null : s.id)}
                    className={'w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-orange-50 ' +
                      (active === s.id ? 'text-orange-500 bg-orange-50 font-semibold' : 'text-gray-600')}
                  >
                    <s.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1 text-left">{s.label}</span>
                    <ChevronRight className={'w-3.5 h-3.5 transition-transform ' + (active === s.id ? 'rotate-90 text-orange-400' : 'text-gray-300')} />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Right content */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm p-6 min-h-[200px]">
            {active ? (
              <>
                <h2 className="text-base font-bold text-gray-800 mb-1">
                  {HELP_SECTIONS.find(s => s.id === active)?.label}
                </h2>
                <p className="text-xs text-gray-400 mb-5">{HELP_SECTIONS.find(s => s.id === active)?.desc}</p>
                {renderContent()}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <HelpCircle className="w-8 h-8 text-gray-200 mb-2" />
                <p className="text-gray-400 text-sm">Select a topic from the left to get help.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
