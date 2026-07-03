'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { ChevronRight, ArrowLeft, User, Lock, Bell, ShieldCheck, Globe, MapPin, Navigation, Moon } from 'lucide-react'
import Link from 'next/link'

import { useLanguage } from '@/lib/languageContext'

const INDIAN_LANGUAGES = [
  { value: 'en',  label: '🇬🇧 English' },
  { value: 'hi',  label: '🇮🇳 Hindi — हिन्दी' },
  { value: 'bn',  label: '🇮🇳 Bengali — বাংলা' },
  { value: 'te',  label: '🇮🇳 Telugu — తెలుగు' },
  { value: 'mr',  label: '🇮🇳 Marathi — मराठी' },
  { value: 'ta',  label: '🇮🇳 Tamil — தமிழ்' },
  { value: 'ur',  label: '🇮🇳 Urdu — اردو' },
  { value: 'gu',  label: '🇮🇳 Gujarati — ગુજરાતી' },
  { value: 'kn',  label: '🇮🇳 Kannada — ಕನ್ನಡ' },
  { value: 'ml',  label: '🇮🇳 Malayalam — മലയാളം' },
  { value: 'pa',  label: '🇮🇳 Punjabi — ਪੰਜਾਬੀ' },
  { value: 'or',  label: '🇮🇳 Odia — ଓଡ଼ିଆ' },
  { value: 'as',  label: '🇮🇳 Assamese — অসমীয়া' },
  { value: 'mai', label: '🇮🇳 Maithili — मैथिली' },
  { value: 'sat', label: '🇮🇳 Santali — ᱥᱟᱱᱛᱟᱲᱤ' },
  { value: 'ks',  label: '🇮🇳 Kashmiri — کٲشُر' },
  { value: 'ne',  label: '🇮🇳 Nepali — नेपाली' },
  { value: 'sd',  label: '🇮🇳 Sindhi — سنڌي' },
  { value: 'kok', label: '🇮🇳 Konkani — कोंकणी' },
  { value: 'doi', label: '🇮🇳 Dogri — डोगरी' },
  { value: 'mni', label: '🇮🇳 Meitei — মৈতৈলোন্' },
  { value: 'bo',  label: '🇮🇳 Bodo — बड़ो' },
]

const SECTIONS = [
  { id: 'personal',      icon: User,         label: 'Personal Information',     desc: 'Manage your name, phone & profile details' },
  { id: 'password',      icon: Lock,         label: 'Change Password',          desc: 'Update your account password' },
  { id: 'notifications', icon: Bell,         label: 'Notification Preferences', desc: 'Control what alerts you receive' },
  { id: 'privacy',       icon: ShieldCheck,  label: 'Privacy Settings',         desc: 'Manage who can see your activity' },
  { id: 'language',      icon: Globe,        label: 'Language Preferences',     desc: 'Choose your preferred language', showActive: true },
  { id: 'addresses',     icon: MapPin,       label: 'Saved Addresses',          desc: 'Manage your saved delivery addresses' },
  { id: 'location',      icon: Navigation,   label: 'Location Preferences',     desc: 'Set your default search location' },
  { id: 'darkmode',      icon: Moon,         label: 'Dark Mode',                desc: 'Switch between light and dark themes', badge: 'Coming Soon' },
]

export default function SettingsPage() {
  const router = useRouter()
  const { user, setAuth } = useAuthStore()
  const [active, setActive] = useState<string | null>(null)
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [notifPrefs, setNotifPrefs] = useState({ messages: true, deals: true, system: true })
  const [privacyPrefs, setPrivacyPrefs] = useState({ showPhone: true, showLocation: true })
  const { language, setLanguage } = useLanguage()

  useEffect(() => {
    const saved = localStorage.getItem('preferred_language')
    if (saved) document.documentElement.lang = saved
  }, [])

  const [addresses, setAddresses] = useState<string[]>([])
  const [newAddress, setNewAddress] = useState('')

  const handleChangePassword = async () => {
    if (!passwordForm.current || !passwordForm.next) { toast.error('Fill all fields'); return }
    if (passwordForm.next !== passwordForm.confirm) { toast.error('Passwords do not match'); return }
    if (passwordForm.next.length < 6) { toast.error('Password must be at least 6 characters'); return }
    try {
      setSaving(true)
      await api.put('/auth/change-password', { currentPassword: passwordForm.current, newPassword: passwordForm.next })
      toast.success('Password updated!')
      setPasswordForm({ current: '', next: '', confirm: '' })
      setActive(null)
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to update password')
    } finally { setSaving(false) }
  }

  const handleAddAddress = () => {
    if (!newAddress.trim()) return
    setAddresses(prev => [...prev, newAddress.trim()])
    setNewAddress('')
    toast.success('Address saved!')
  }

  const renderContent = () => {
    switch (active) {
      case 'personal':
        return (
          <div className="p-1">
            <p className="text-sm text-gray-500 mb-4">Update your profile from the main <Link href="/profile" className="text-orange-500 underline">Profile page</Link>.</p>
            {user && (
              <div className="space-y-3">
                {[
                  { label: 'Name',   value: user.name },
                  { label: 'Email',  value: user.email },
                  { label: 'Phone',  value: user.phone || '—' },
                  { label: 'City',   value: user.city  || '—' },
                  { label: 'State',  value: user.state || '—' },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-500">{row.label}</span>
                    <span className="text-sm font-medium text-gray-800">{row.value}</span>
                  </div>
                ))}
                <Link href="/profile" className="inline-block mt-3 text-sm text-orange-500 border border-orange-200 px-4 py-2 rounded-xl hover:bg-orange-50 transition-colors">
                  Edit Profile →
                </Link>
              </div>
            )}
          </div>
        )

      case 'password':
        return (
          <div className="space-y-3 max-w-sm">
            {[
              { label: 'Current Password', key: 'current' as const, placeholder: '••••••••' },
              { label: 'New Password',     key: 'next'    as const, placeholder: 'Min. 6 characters' },
              { label: 'Confirm Password', key: 'confirm' as const, placeholder: 'Re-enter new password' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                <input
                  type="password"
                  placeholder={f.placeholder}
                  value={passwordForm[f.key]}
                  onChange={e => setPasswordForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
                />
              </div>
            ))}
            <button onClick={handleChangePassword} disabled={saving}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors">
              {saving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-1">
            {[
              { key: 'messages' as const, label: 'New Messages',    desc: 'Get notified when someone messages you' },
              { key: 'deals'    as const, label: 'Deals & Offers',  desc: 'Receive promotional alerts and offers' },
              { key: 'system'   as const, label: 'System Alerts',   desc: 'Important account and security notices' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
                <button
                  onClick={() => setNotifPrefs(p => ({ ...p, [item.key]: !p[item.key] }))}
                  className={'relative w-11 h-6 rounded-full transition-colors ' + (notifPrefs[item.key] ? 'bg-orange-500' : 'bg-gray-200')}
                >
                  <span className={'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ' + (notifPrefs[item.key] ? 'left-6' : 'left-1')} />
                </button>
              </div>
            ))}
          </div>
        )

      case 'privacy':
        return (
          <div className="space-y-1">
            {[
              { key: 'showPhone'    as const, label: 'Show Phone Number', desc: 'Visible to buyers on your listings' },
              { key: 'showLocation' as const, label: 'Show Location',     desc: 'Display your city on your profile' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
                <button
                  onClick={() => setPrivacyPrefs(p => ({ ...p, [item.key]: !p[item.key] }))}
                  className={'relative w-11 h-6 rounded-full transition-colors ' + (privacyPrefs[item.key] ? 'bg-orange-500' : 'bg-gray-200')}
                >
                  <span className={'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ' + (privacyPrefs[item.key] ? 'left-6' : 'left-1')} />
                </button>
              </div>
            ))}
          </div>
        )

      case 'language':
        return (
          <div className="space-y-2 max-w-sm">
            <p className="text-xs text-gray-500 mb-3">Select a language — the page will reload and translate automatically.</p>
            <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
              {INDIAN_LANGUAGES.map(opt => (
                <label key={opt.value} className={'flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ' +
                  (language === opt.value ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-orange-200')}>
                  <input type="radio" name="language" value={opt.value} checked={language === opt.value}
                    onChange={() => setLanguage(opt.value)} className="accent-orange-500" />
                  <span className="text-sm text-gray-700">{opt.label}</span>
                  {language === opt.value && (
                    <span className="ml-auto text-xs text-orange-500 font-medium">Active</span>
                  )}
                </label>
              ))}
            </div>
          </div>
        )

      case 'addresses':
        return (
          <div className="space-y-3 max-w-sm">
            <div className="flex gap-2">
              <input
                value={newAddress}
                onChange={e => setNewAddress(e.target.value)}
                placeholder="Enter address..."
                className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
              />
              <button onClick={handleAddAddress}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
                Add
              </button>
            </div>
            {addresses.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No saved addresses yet.</p>
            ) : (
              <ul className="space-y-2">
                {addresses.map((addr, i) => (
                  <li key={i} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                    <span className="text-sm text-gray-700">{addr}</span>
                    <button onClick={() => setAddresses(prev => prev.filter((_, j) => j !== i))}
                      className="text-xs text-red-400 hover:text-red-600">Remove</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )

      case 'location':
        return (
          <div className="space-y-3 max-w-sm">
            <p className="text-sm text-gray-500">Your location determines which listings appear first. You can update it from your profile or the homepage.</p>
            {user?.city && (
              <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-100 rounded-xl">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-700">Current: {user.city}{user.state ? ', ' + user.state : ''}</span>
              </div>
            )}
            <Link href="/profile" className="inline-block text-sm text-orange-500 border border-orange-200 px-4 py-2 rounded-xl hover:bg-orange-50 transition-colors">
              Update Location →
            </Link>
          </div>
        )

      case 'darkmode':
        return (
          <div className="text-center py-8">
            <Moon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-semibold">Dark Mode</p>
            <p className="text-gray-400 text-sm mt-1">Coming soon — we're working on it!</p>
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

        {/* Back link */}
        <Link href="/profile" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-500 mb-5 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Profile
        </Link>

        <div className="flex flex-col sm:flex-row gap-5">

          {/* Left: section list */}
          <div className="sm:w-64 flex-shrink-0 bg-white rounded-2xl shadow-sm overflow-hidden self-start">
            <div className="px-4 py-3 border-b border-gray-50">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">⚙️ Settings</span>
            </div>
            <ul>
              {SECTIONS.map(s => (
                <li key={s.id}>
                  <button
                    onClick={() => setActive(active === s.id ? null : s.id)}
                    className={'w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-orange-50 ' +
                      (active === s.id ? 'text-orange-500 bg-orange-50 font-semibold' : 'text-gray-600')}
                  >
                    <s.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1 text-left">{s.label}</span>
                    {s.badge
                      ? <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{s.badge}</span>
                      : (s as any).showActive
                        ? <span className="text-xs bg-orange-50 text-orange-500 border border-orange-100 px-2 py-0.5 rounded-full font-medium">
                            {INDIAN_LANGUAGES.find(l => l.value === language)?.label.split(' ')[1] || 'English'}
                          </span>
                        : <ChevronRight className={'w-3.5 h-3.5 transition-transform ' + (active === s.id ? 'rotate-90 text-orange-400' : 'text-gray-300')} />
                    }
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: content panel */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm p-6 min-h-[200px]">
            {active ? (
              <>
                <h2 className="text-base font-bold text-gray-800 mb-4">
                  {SECTIONS.find(s => s.id === active)?.label}
                </h2>
                <p className="text-xs text-gray-400 mb-5">{SECTIONS.find(s => s.id === active)?.desc}</p>
                {renderContent()}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <p className="text-gray-400 text-sm">Select a setting from the left to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
