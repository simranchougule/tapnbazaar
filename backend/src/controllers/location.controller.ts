import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'

// India location data — States, Cities, Localities
const INDIA_LOCATIONS: Record<string, Record<string, string[]>> = {
  'Maharashtra': {
    'Mumbai': ['Andheri', 'Bandra', 'Borivali', 'Dadar', 'Juhu', 'Kurla', 'Malad', 'Powai', 'Thane', 'Versova', 'Vikhroli', 'Worli'],
    'Pune': ['Aundh', 'Baner', 'Deccan', 'Hadapsar', 'Hinjewadi', 'Kalyani Nagar', 'Kharadi', 'Kothrud', 'Magarpatta', 'Pimple Saudagar', 'Shivajinagar', 'Viman Nagar', 'Wakad', 'Wanowrie'],
    'Nagpur': ['Dharampeth', 'Gandhibagh', 'Hingna', 'Laxmi Nagar', 'Manish Nagar', 'Sadar', 'Sitabuldi', 'Wardha Road'],
    'Nashik': ['Ambad', 'Canada Corner', 'Cidco', 'Deolali', 'Gangapur Road', 'Mhasrul', 'Panchavati', 'Satpur'],
    'Aurangabad': ['Cidco', 'Garkheda', 'Harsul', 'Jalna Road', 'N-1 to N-12', 'Nirala Bazar', 'Osmanpura'],
  },
  'Karnataka': {
    'Bangalore': ['Banashankari', 'Bellandur', 'BTM Layout', 'Electronic City', 'HSR Layout', 'Indiranagar', 'JP Nagar', 'Koramangala', 'Marathahalli', 'Whitefield', 'Yelahanka'],
    'Mysore': ['Hebbal', 'Jayalakshmipuram', 'Kuvempunagar', 'Mysore University', 'Rajivnagar', 'Vijayanagar'],
    'Hubli': ['Deshpande Nagar', 'Gokul Road', 'Keshwapur', 'Navanagar', 'Vidyanagar'],
  },
  'Delhi': {
    'New Delhi': ['Connaught Place', 'Dwarka', 'Greater Kailash', 'Hauz Khas', 'Lajpat Nagar', 'Pitampura', 'Rohini', 'Saket', 'Vasant Kunj'],
    'East Delhi': ['Laxmi Nagar', 'Mayur Vihar', 'Preet Vihar', 'Shahdara', 'Vivek Vihar'],
    'South Delhi': ['Chittaranjan Park', 'Green Park', 'Malviya Nagar', 'Sarita Vihar'],
    'West Delhi': ['Janakpuri', 'Paschim Vihar', 'Rajouri Garden', 'Tilak Nagar'],
  },
  'Tamil Nadu': {
    'Chennai': ['Adyar', 'Anna Nagar', 'Chromepet', 'Guindy', 'Mylapore', 'Nungambakkam', 'OMR', 'Porur', 'T Nagar', 'Tambaram', 'Velachery'],
    'Coimbatore': ['Gandhipuram', 'Peelamedu', 'RS Puram', 'Singanallur', 'Tidel Park'],
    'Madurai': ['Anna Nagar', 'KK Nagar', 'Mattuthavani', 'Palanganatham', 'Tallakulam'],
  },
  'Telangana': {
    'Hyderabad': ['Banjara Hills', 'Gachibowli', 'Hitech City', 'Jubilee Hills', 'Kondapur', 'Kukatpally', 'LB Nagar', 'Madhapur', 'Manikonda', 'Miyapur', 'Secunderabad', 'Tolichowki'],
    'Warangal': ['Hanamkonda', 'Kazipet', 'Shayampet'],
  },
  'Gujarat': {
    'Ahmedabad': ['Bopal', 'C.G Road', 'Gota', 'Maninagar', 'Naroda', 'Navrangpura', 'Prahlad Nagar', 'Satellite', 'SG Highway', 'Thaltej', 'Vastrapur'],
    'Surat': ['Adajan', 'Athwa', 'Katargam', 'Piplod', 'Rander', 'Udhna', 'Vesu'],
    'Vadodara': ['Alkapuri', 'Fatehgunj', 'Gotri', 'Manjalpur', 'Vasna'],
  },
  'Rajasthan': {
    'Jaipur': ['Bapu Nagar', 'C-Scheme', 'Jagatpura', 'Malviya Nagar', 'Mansarovar', 'Raja Park', 'Sanganer', 'Tonk Road', 'Vaishali Nagar'],
    'Jodhpur': ['Chopasni Housing Board', 'Paota', 'Ratanada', 'Sardarpura'],
    'Udaipur': ['Bhuwana', 'Fatehpura', 'Hiran Magri', 'Pratap Nagar'],
  },
  'Uttar Pradesh': {
    'Lucknow': ['Aliganj', 'Alambagh', 'Gomti Nagar', 'Hazratganj', 'Indira Nagar', 'Janakipuram', 'Mahanagar', 'Vibhuti Khand'],
    'Kanpur': ['Arya Nagar', 'Civil Lines', 'Juhi', 'Kakadeo', 'Kidwai Nagar', 'Swaroop Nagar'],
    'Noida': ['Sector 18', 'Sector 62', 'Sector 137', 'Greater Noida', 'Noida Extension'],
    'Agra': ['Bodla', 'Kamla Nagar', 'Shahganj', 'Sikandra'],
  },
  'West Bengal': {
    'Kolkata': ['Ballygunge', 'Behala', 'Dumdum', 'Gariahat', 'Howrah', 'Jadavpur', 'Lake Town', 'New Town', 'Park Street', 'Salt Lake', 'Tollygunge'],
    'Siliguri': ['Burdwan Road', 'Hakimpara', 'Hill Cart Road', 'Sevoke Road'],
  },
  'Madhya Pradesh': {
    'Bhopal': ['Arera Colony', 'Ayodhya Bypass', 'Berasia Road', 'Danish Kunj', 'Habibganj', 'Hoshangabad Road', 'Kolar', 'MP Nagar', 'Shahpura'],
    'Indore': ['Bhawarkua', 'Bypass Road', 'Mahalaxmi Nagar', 'Palasia', 'Rajwada', 'Scheme 54', 'Vijay Nagar'],
  },
  'Punjab': {
    'Chandigarh': ['Manimajra', 'Mohali', 'Panchkula', 'Sector 17', 'Sector 22', 'Sector 35'],
    'Ludhiana': ['BRS Nagar', 'Civil Lines', 'Gurdev Nagar', 'Model Town', 'Sarabha Nagar'],
    'Amritsar': ['Green Avenue', 'Lawrence Road', 'Majitha Road', 'Ranjit Avenue'],
  },
  'Kerala': {
    'Kochi': ['Aluva', 'Edapally', 'Fort Kochi', 'Kakkanad', 'Kaloor', 'MG Road', 'Palarivattom', 'Thrippunithura'],
    'Thiruvananthapuram': ['Kazhakuttam', 'Kesavadasapuram', 'Pattom', 'Sreekaryam', 'Vazhuthacaud'],
    'Kozhikode': ['Calicut University', 'Mavoor Road', 'Medical College', 'Palayam'],
  },
}

// GET /api/locations/states
export const getStates = async (req: Request, res: Response): Promise<void> => {
  const states = Object.keys(INDIA_LOCATIONS).sort()
  res.json({ success: true, states })
}

// GET /api/locations/cities?state=Maharashtra
export const getCities = async (req: Request, res: Response): Promise<void> => {
  const state = req.query.state as string
  if (!state || !INDIA_LOCATIONS[state]) {
    res.status(400).json({ success: false, message: 'Invalid state' })
    return
  }
  const cities = Object.keys(INDIA_LOCATIONS[state]).sort()
  res.json({ success: true, cities })
}

// GET /api/locations/localities?state=Maharashtra&city=Pune
export const getLocalities = async (req: Request, res: Response): Promise<void> => {
  const { state, city } = req.query as { state: string; city: string }
  if (!state || !city || !INDIA_LOCATIONS[state]?.[city]) {
    res.status(400).json({ success: false, message: 'Invalid state or city' })
    return
  }
  const localities = INDIA_LOCATIONS[state][city].sort()
  res.json({ success: true, localities })
}

// GET /api/locations/search?q=Baner
export const searchLocations = async (req: Request, res: Response): Promise<void> => {
  const q = (req.query.q as string || '').toLowerCase().trim()
  if (!q || q.length < 2) {
    res.json({ success: true, results: [] })
    return
  }

  const results: { state: string; city: string; locality?: string; label: string }[] = []

  for (const [state, cities] of Object.entries(INDIA_LOCATIONS)) {
    for (const [city, localities] of Object.entries(cities)) {
      // Match city
      if (city.toLowerCase().includes(q)) {
        results.push({ state, city, label: `${city}, ${state}` })
      }
      // Match locality
      for (const locality of localities) {
        if (locality.toLowerCase().includes(q)) {
          results.push({ state, city, locality, label: `${locality}, ${city}, ${state}` })
        }
      }
    }
  }

  res.json({ success: true, results: results.slice(0, 10) })
}

// GET /api/locations/popular?city=Pune
export const getPopularLocalities = async (req: Request, res: Response): Promise<void> => {
  try {
    const city = req.query.city as string
    if (!city) {
      res.status(400).json({ success: false, message: 'City required' })
      return
    }

    // Get localities with most active products in this city
    const localities = await prisma.product.groupBy({
      by:     ['locality'],
      where:  { city: { contains: city, mode: 'insensitive' }, status: 'ACTIVE', locality: { not: null } },
      _count: { locality: true },
      orderBy: { _count: { locality: 'desc' } },
      take: 8,
    })

    res.json({
      success: true,
      localities: localities
        .filter((l: any) => l.locality)
        .map((l: any) => ({ name: l.locality, count: l._count.locality }))
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Something went wrong' })
  }
}

// GET /api/locations/locality-stats?city=Pune&search=iPhone
export const getLocalityStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { city, search } = req.query as { city: string; search?: string }
    if (!city) {
      res.status(400).json({ success: false, message: 'City required' })
      return
    }

    const where: any = {
      city:     { contains: city,   mode: 'insensitive' },
      status:   'ACTIVE',
      locality: { not: null },
    }

    if (search) {
      where.OR = [
        { title:       { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const stats = await prisma.product.groupBy({
      by:     ['locality'],
      where,
      _count: { locality: true },
      orderBy: { _count: { locality: 'desc' } },
      take: 10,
    })

    res.json({
      success: true,
      stats: stats
        .filter((s: any) => s.locality)
        .map((s: any) => ({ locality: s.locality, count: s._count.locality }))
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Something went wrong' })
  }
}
