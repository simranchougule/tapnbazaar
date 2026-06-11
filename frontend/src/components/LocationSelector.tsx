'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin, ChevronDown } from 'lucide-react'

// ─── Data ─────────────────────────────────────────────────────────────────────

const LOCATION_DATA: Record<string, Record<string, string[]>> = {
  'All India': {},
  Maharashtra: {
    Pune:       ['Wakad', 'Baner', 'Hinjewadi', 'Aundh', 'Kothrud', 'Viman Nagar', 'Koregaon Park', 'Hadapsar', 'Kharadi', 'Pimpri'],
    Mumbai:     ['Andheri', 'Bandra', 'Powai', 'Thane', 'Kurla', 'Dadar', 'Borivali', 'Malad', 'Kandivali', 'Goregaon'],
    Nashik:     ['Cidco', 'Satpur', 'Ambad', 'Gangapur Road', 'College Road'],
    Nagpur:     ['Dharampeth', 'Sitabuldi', 'Sadar', 'Ramdaspeth', 'Bajaj Nagar'],
    Aurangabad: ['Cidco', 'Garkheda', 'Osmanpura', 'Cantonment', 'Waluj'],
  },
  Karnataka: {
    Bangalore:  ['Koramangala', 'Indiranagar', 'Whitefield', 'HSR Layout', 'Jayanagar', 'Marathahalli', 'BTM Layout', 'Electronic City', 'Hebbal', 'Malleshwaram'],
    Mysore:     ['Vijayanagar', 'Gokulam', 'Saraswathipuram', 'Kuvempunagar', 'Hebbal'],
    Hubli:      ['Deshpande Nagar', 'Vidyanagar', 'Gokul Road', 'Navanagar'],
  },
  'Delhi NCR': {
    Delhi:      ['Dwarka', 'Rohini', 'Lajpat Nagar', 'Saket', 'Vasant Kunj', 'Karol Bagh', 'Janakpuri', 'Pitampura', 'Mayur Vihar', 'Preet Vihar'],
    Noida:      ['Sector 18', 'Sector 62', 'Sector 63', 'Greater Noida', 'Sector 137'],
    Gurgaon:    ['DLF Phase 1', 'Sohna Road', 'Golf Course Road', 'Cyber City', 'MG Road'],
  },
  'Tamil Nadu': {
    Chennai:    ['Anna Nagar', 'T. Nagar', 'Velachery', 'Adyar', 'Porur', 'Tambaram', 'Guindy', 'Nungambakkam', 'Perambur', 'Chromepet'],
    Coimbatore: ['RS Puram', 'Gandhipuram', 'Peelamedu', 'Saibaba Colony', 'Singanallur'],
    Madurai:    ['Anna Nagar', 'KK Nagar', 'Tallakulam', 'Palanganatham'],
  },
  Telangana: {
    Hyderabad:  ['Hitech City', 'Gachibowli', 'Banjara Hills', 'Madhapur', 'Kondapur', 'Kukatpally', 'Ameerpet', 'Secunderabad', 'LB Nagar', 'Dilsukhnagar'],
    Warangal:   ['Hanamkonda', 'Kazipet', 'Hunter Road', 'Subedari'],
  },
  'West Bengal': {
    Kolkata:    ['Salt Lake', 'Park Street', 'Ballygunge', 'Dum Dum', 'Howrah', 'New Town', 'Rajarhat', 'Behala', 'Jadavpur', 'Tollygunge'],
  },
  Gujarat: {
    Ahmedabad:  ['Navrangpura', 'Satellite', 'Bopal', 'Vastrapur', 'Maninagar', 'Prahlad Nagar', 'SG Road', 'Thaltej'],
    Surat:      ['Adajan', 'Vesu', 'Pal', 'Katargam', 'Udhna'],
    Vadodara:   ['Alkapuri', 'Fatehgunj', 'Manjalpur', 'Gotri', 'Vasna'],
  },
  Rajasthan: {
    Jaipur:     ['Vaishali Nagar', 'Malviya Nagar', 'C-Scheme', 'Jagatpura', 'Mansarovar', 'Tonk Road'],
    Jodhpur:    ['Ratanada', 'Sardarpura', 'Shastri Nagar', 'Pal Road'],
    Udaipur:    ['Fatehpura', 'Suraj Pole', 'Hiran Magri', 'Pratap Nagar'],
  },
  'Uttar Pradesh': {
    Lucknow:    ['Gomti Nagar', 'Hazratganj', 'Aliganj', 'Indira Nagar', 'Mahanagar', 'Vikas Nagar'],
    Kanpur:     ['Civil Lines', 'Kidwai Nagar', 'Swaroop Nagar', 'Govind Nagar'],
    Agra:       ['Sikandra', 'Kamla Nagar', 'Shahganj', 'Dayalbagh'],
  },
  Punjab: {
    Chandigarh: ['Sector 17', 'Sector 22', 'Sector 35', 'Panchkula', 'Mohali'],
    Ludhiana:   ['Model Town', 'Civil Lines', 'Sarabha Nagar', 'BRS Nagar'],
    Amritsar:   ['Lawrence Road', 'Ranjit Avenue', 'Green Avenue', 'Majitha Road'],
  },
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LocationValue {
  state?: string
  city?: string
  locality?: string
}

interface Props {
  value: LocationValue
  onChange: (loc: LocationValue) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LocationSelector({ value, onChange }: Props) {
  const [open, setOpen] = useState<'state' | 'city' | 'locality' | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const states   = Object.keys(LOCATION_DATA)
  const cities   = value.state && value.state !== 'All India'
    ? Object.keys(LOCATION_DATA[value.state] ?? {})
    : []
  const localities = value.state && value.city
    ? (LOCATION_DATA[value.state]?.[value.city] ?? [])
    : []

  const selectState = (state: string) => {
    onChange(state === 'All India' ? {} : { state })
    setOpen(null)
  }

  const selectCity = (city: string) => {
    onChange({ state: value.state, city })
    setOpen(null)
  }

  const selectLocality = (locality: string) => {
    onChange({ ...value, locality })
    setOpen(null)
  }

  const displayLabel = (() => {
    if (value.locality) return `${value.locality}, ${value.city}`
    if (value.city)     return `${value.city}, ${value.state}`
    if (value.state)    return value.state
    return 'All India'
  })()

  return (
    <div ref={ref} className="flex items-center gap-2 flex-wrap justify-center">

      {/* ── State ── */}
      <Dropdown
        label={value.state || 'All India'}
        icon="🌍"
        isOpen={open === 'state'}
        onToggle={() => setOpen(o => o === 'state' ? null : 'state')}
        active={!!value.state && value.state !== 'All India'}
      >
        {states.map(s => (
          <DropdownItem
            key={s}
            label={s}
            selected={value.state === s || (!value.state && s === 'All India')}
            onClick={() => selectState(s)}
          />
        ))}
      </Dropdown>

      {/* ── City ── */}
      {cities.length > 0 && (
        <>
          <span className="text-white/50 text-sm">›</span>
          <Dropdown
            label={value.city || 'Select City'}
            icon="🏙️"
            isOpen={open === 'city'}
            onToggle={() => setOpen(o => o === 'city' ? null : 'city')}
            active={!!value.city}
          >
            {cities.map(c => (
              <DropdownItem
                key={c}
                label={c}
                selected={value.city === c}
                onClick={() => selectCity(c)}
              />
            ))}
          </Dropdown>
        </>
      )}

      {/* ── Locality ── */}
      {localities.length > 0 && (
        <>
          <span className="text-white/50 text-sm">›</span>
          <Dropdown
            label={value.locality || 'Select Area'}
            icon="📍"
            isOpen={open === 'locality'}
            onToggle={() => setOpen(o => o === 'locality' ? null : 'locality')}
            active={!!value.locality}
          >
            {localities.map(l => (
              <DropdownItem
                key={l}
                label={l}
                selected={value.locality === l}
                onClick={() => selectLocality(l)}
              />
            ))}
          </Dropdown>
        </>
      )}

    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Dropdown({
  label, icon, isOpen, onToggle, active, children,
}: {
  label: string
  icon: string
  isOpen: boolean
  onToggle: () => void
  active: boolean
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
          active
            ? 'bg-white text-orange-600 border-white shadow'
            : 'bg-white/20 text-white border-white/40 hover:bg-white/30'
        }`}
      >
        <span>{icon}</span>
        <span className="max-w-[120px] truncate">{label}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100
                        z-[300] w-52 py-1 max-h-64 overflow-y-auto">
          {children}
        </div>
      )}
    </div>
  )
}

function DropdownItem({
  label, selected, onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 text-sm transition-colors hover:bg-orange-50 hover:text-orange-600 flex items-center justify-between ${
        selected ? 'text-orange-500 font-semibold bg-orange-50' : 'text-gray-600'
      }`}
    >
      <span>{label}</span>
      {selected && <span className="text-orange-500 text-xs">✓</span>}
    </button>
  )
}
