import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const PUNE   = { lat: 18.5204, lng: 73.8567, city: 'Pune',       state: 'Maharashtra' }
const AURANG = { lat: 19.8762, lng: 75.3433, city: 'Aurangabad', state: 'Maharashtra' }

function offset(baseLat: number, baseLng: number, northKm: number, eastKm: number) {
  return {
    lat: baseLat + (northKm / 111),
    lng: baseLng + (eastKm / (111 * Math.cos(baseLat * Math.PI / 180)))
  }
}

const products = [
  { title: 'Samsung 65 4K TV - Koregaon Park',     desc: 'Excellent condition Samsung QLED 65 inch. Moving abroad, must sell.',         price: 55000,  cond: 'LIKE_NEW', area: 'Koregaon Park', pin: '411001', base: PUNE,   n: 1.5,  e: 1.3,  slug: 'tvs' },
  { title: 'Yamaha FZ-S V3 Bike 2021 - Baner',     desc: '2021 Yamaha FZ-S V3, 15000 km. Single owner, all service done at dealer.',   price: 85000,  cond: 'GOOD',     area: 'Baner',          pin: '411045', base: PUNE,   n: -1.2, e: 1.8,  slug: 'bikes' },
  { title: 'iPhone 14 Pro 128GB - Kothrud',         desc: 'iPhone 14 Pro Deep Purple, 10 months old, battery health 94%.',              price: 78000,  cond: 'LIKE_NEW', area: 'Kothrud',         pin: '411038', base: PUNE,   n: 3.5,  e: 3.5,  slug: 'mobile-phones' },
  { title: 'Sofa Set 3+1+1 - Aundh',               desc: 'L-shaped sofa set in good condition. Beige color, fabric material.',         price: 9500,   cond: 'GOOD',     area: 'Aundh',           pin: '411007', base: PUNE,   n: -3.2, e: -3.8, slug: 'sofas' },
  { title: 'MacBook Air M1 2020 - Wakad',           desc: 'MacBook Air M1, 8GB RAM, 256GB SSD. No scratches, charger included.',        price: 62000,  cond: 'GOOD',     area: 'Wakad',           pin: '411057', base: PUNE,   n: 7,    e: 7,    slug: 'laptops' },
  { title: 'Honda City 2018 Petrol - Hinjewadi',    desc: '2018 Honda City VX CVT, 42000 km. Sunroof, touchscreen.',                   price: 690000, cond: 'GOOD',     area: 'Hinjewadi',       pin: '411057', base: PUNE,   n: -6,   e: -7,   slug: 'cars' },
  { title: 'PS5 with 5 Games - Pimpri',             desc: 'PlayStation 5 disc edition, 6 months old. 5 games included.',               price: 48000,  cond: 'LIKE_NEW', area: 'Pimpri',          pin: '411018', base: PUNE,   n: 17,   e: 18,   slug: 'gaming-consoles' },
  { title: 'Treadmill BH Fitness - Chinchwad',      desc: 'BH Fitness treadmill, 1 year old. Max 18 km/h, incline function.',          price: 22000,  cond: 'GOOD',     area: 'Chinchwad',       pin: '411019', base: PUNE,   n: -16,  e: -19,  slug: 'fitness-equipment' },
  { title: 'Royal Enfield Meteor 350 - Lonavala',   desc: '2022 RE Meteor 350 Fireball Red. 8000 km driven. All accessories fitted.',  price: 165000, cond: 'LIKE_NEW', area: 'Lonavala',        pin: '410401', base: PUNE,   n: 34,   e: 36,   slug: 'bikes' },
  { title: 'Canon EOS 90D DSLR - Talegaon',         desc: 'Canon EOS 90D body only. Shutter count 8000. Always kept in bag.',          price: 72000,  cond: 'GOOD',     area: 'Talegaon',        pin: '410507', base: PUNE,   n: -33,  e: -36,  slug: 'cameras' },
  { title: 'Maruti Ertiga 2020 - Nashik',           desc: '2020 Maruti Ertiga ZXi+, 7 seater, 28000 km. All original, no accidents.',  price: 870000, cond: 'GOOD',     area: 'Nashik Road',     pin: '422101', base: PUNE,   n: 70,   e: 70,   slug: 'cars' },
  { title: 'Sony A6400 Camera Kit - Nashik',        desc: 'Sony A6400 with 16-50mm and 55-210mm lenses. 1.5 years old.',              price: 68000,  cond: 'GOOD',     area: 'Nashik',          pin: '422001', base: PUNE,   n: -68,  e: -68,  slug: 'cameras' },
  { title: 'OnePlus 11 5G - Cidco Aurangabad',      desc: 'OnePlus 11 5G, 16GB RAM, 256GB. 4 months old. Original box included.',     price: 42000,  cond: 'LIKE_NEW', area: 'Cidco',           pin: '431003', base: AURANG, n: 1.4,  e: 1.4,  slug: 'mobile-phones' },
  { title: 'Dining Table 6 Seater - Garkheda',      desc: 'Solid wood dining table with 6 chairs. 3 years old. Good condition.',      price: 14000,  cond: 'GOOD',     area: 'Garkheda',        pin: '431005', base: AURANG, n: -1.3, e: 1.5,  slug: 'dining-tables' },
  { title: 'Dell Inspiron 15 Laptop - Osmanpura',   desc: 'Dell Inspiron 15, i5 11th gen, 8GB RAM, 512GB SSD. 1 year old.',           price: 38000,  cond: 'GOOD',     area: 'Osmanpura',       pin: '431001', base: AURANG, n: 3.5,  e: -3.5, slug: 'laptops' },
  { title: 'Bajaj Pulsar 150 2020 - Waluj',         desc: '2020 Bajaj Pulsar 150, 22000 km. New battery last month.',                 price: 58000,  cond: 'GOOD',     area: 'Waluj',           pin: '431136', base: AURANG, n: -3.8, e: 3.2,  slug: 'bikes' },
  { title: 'LG Washing Machine 8kg - Chikalthana',  desc: 'LG front load 8kg, 2 years old. All programs working.',                    price: 16000,  cond: 'GOOD',     area: 'Chikalthana',     pin: '431210', base: AURANG, n: 7,    e: 7,    slug: 'home-appliances' },
  { title: 'Fender CD-60S Acoustic Guitar',         desc: 'Fender CD-60S acoustic guitar, 1 year old. Hard case included.',           price: 8500,   cond: 'LIKE_NEW', area: 'Aurangabad MIDC', pin: '431136', base: AURANG, n: -6,   e: -7,   slug: 'musical-instruments' },
  { title: 'Maruti Alto K10 2019 - Paithan',        desc: '2019 Alto K10 VXi, 38000 km. Petrol, first owner. AC works fine.',        price: 310000, cond: 'GOOD',     area: 'Paithan Road',    pin: '431101', base: AURANG, n: 17,   e: 18,   slug: 'cars' },
  { title: 'Cricket Kit Full Set - Phulambri',      desc: 'Full cricket kit — SS bat, pads, gloves, helmet, bag.',                   price: 5500,   cond: 'GOOD',     area: 'Phulambri',       pin: '431111', base: AURANG, n: -17,  e: -18,  slug: 'sports-equipment' },
  { title: 'Hero Splendor Plus 2021 - Jalna',       desc: '2021 Hero Splendor Plus, 18000 km. Mileage 65 kmpl. All records.',        price: 48000,  cond: 'GOOD',     area: 'Jalna',           pin: '431203', base: AURANG, n: 0,    e: 50,   slug: 'bikes' },
  { title: 'Redmi Note 12 Pro 5G - Jalna',          desc: 'Redmi Note 12 Pro 5G, 8GB+256GB. 7 months old. Original box.',           price: 18500,  cond: 'LIKE_NEW', area: 'Jalna',           pin: '431203', base: AURANG, n: 2,    e: 50,   slug: 'mobile-phones' },
  { title: 'Hyundai i20 2021 - Latur',              desc: '2021 Hyundai i20 Sportz, 22000 km. Petrol, sunroof variant.',             price: 820000, cond: 'LIKE_NEW', area: 'Latur',           pin: '413512', base: AURANG, n: -70,  e: 0,    slug: 'cars' },
  { title: 'HP Pavilion Gaming Laptop - Latur',     desc: 'HP Pavilion Gaming 15, i5-11th gen, GTX 1650, 8GB RAM. 1.5 years old.',  price: 52000,  cond: 'GOOD',     area: 'Latur',           pin: '413512', base: AURANG, n: -70,  e: 2,    slug: 'laptops' },
]

async function main() {
  console.log('🌱 Seeding nearby products for Pune & Aurangabad...')

  let seedUser = await prisma.user.findFirst({ where: { email: 'seed@tapnbazaar.com' } })
  if (!seedUser) {
    const bcrypt = require('bcryptjs')
    seedUser = await prisma.user.create({
      data: { email: 'seed@tapnbazaar.com', password: await bcrypt.hash('seed123456', 10), name: 'TapnBazaar Demo', city: 'Pune', state: 'Maharashtra' }
    })
  }

  let created = 0
  for (const p of products) {
    const cat = await prisma.category.findUnique({ where: { slug: p.slug } })
    if (!cat) { console.log('⚠️  Not found: ' + p.slug); continue }

    const pos = offset(p.base.lat, p.base.lng, p.n, p.e)
    const dist = Math.round(Math.sqrt(p.n ** 2 + p.e ** 2))

    await prisma.product.create({
      data: {
        title: p.title, description: p.desc, price: p.price,
        condition: p.cond as any, city: p.base.city, state: p.base.state,
        area: p.area, pincode: p.pin,
        latitude: pos.lat, longitude: pos.lng,
        images: [], status: 'ACTIVE',
        userId: seedUser.id, categoryId: cat.id,
      }
    })
    created++
    console.log(`✅ [${p.base.city} ~${dist}km] ${p.title}`)
  }

  console.log(`\n🎉 Done! Created ${created} nearby products`)
  console.log('\n📍 Test URLs:')
  console.log('   Pune    5km: http://localhost:5000/api/products/nearby?lat=18.5204&lng=73.8567&radius=5')
  console.log('   Pune   10km: http://localhost:5000/api/products/nearby?lat=18.5204&lng=73.8567&radius=10')
  console.log('   Pune   25km: http://localhost:5000/api/products/nearby?lat=18.5204&lng=73.8567&radius=25')
  console.log('   Pune   50km: http://localhost:5000/api/products/nearby?lat=18.5204&lng=73.8567&radius=50')
  console.log('   Pune  100km: http://localhost:5000/api/products/nearby?lat=18.5204&lng=73.8567&radius=100')
  console.log('   Aurang 10km: http://localhost:5000/api/products/nearby?lat=19.8762&lng=75.3433&radius=10')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
