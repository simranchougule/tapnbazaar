import { PrismaClient, Condition } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {

  // ─── CATEGORIES ────────────────────────────────────────────────────────────
  console.log('🌱 Seeding categories...')
  const categoryData = [
    { name: 'Electronics',  slug: 'electronics',  icon: '📱', description: 'Phones, laptops, TVs and more' },
    { name: 'Cars',         slug: 'cars',          icon: '🚗', description: 'Cars, bikes and vehicles' },
    { name: 'Furniture',    slug: 'furniture',     icon: '🛋️', description: 'Home and office furniture' },
    { name: 'Fashion',      slug: 'fashion',       icon: '👗', description: 'Clothes, shoes and accessories' },
    { name: 'Books',        slug: 'books',         icon: '📚', description: 'Books, magazines and more' },
    { name: 'Sports',       slug: 'sports',        icon: '⚽', description: 'Sports and fitness equipment' },
    { name: 'Home',         slug: 'home',          icon: '🏠', description: 'Home appliances and decor' },
    { name: 'Jobs',         slug: 'jobs',          icon: '💼', description: 'Job listings and services' },
    { name: 'Pets',         slug: 'pets',          icon: '🐾', description: 'Pets and pet supplies' },
    { name: 'Other',        slug: 'other',         icon: '📦', description: 'Everything else' },
  ]

  for (const cat of categoryData) {
    await prisma.category.upsert({ where: { slug: cat.slug }, update: {}, create: cat })
  }
  console.log('✅ Categories done')

  const categories = await prisma.category.findMany()
  const catMap = Object.fromEntries(categories.map(c => [c.slug, c.id]))

  // ─── USERS ─────────────────────────────────────────────────────────────────
  console.log('👤 Seeding users...')
  const password = await bcrypt.hash('password123', 12)

  const seller = await prisma.user.upsert({
    where:  { email: 'seller@tapnbazaar.com' },
    update: { isAdmin: true },
    create: {
      name: 'Rahul Sharma', email: 'seller@tapnbazaar.com',
      password, phone: '9876543210', city: 'Mumbai', state: 'Maharashtra', isAdmin: true,
    },
  })

  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@tapnbazaar.com' },
    update: {},
    create: {
      name:  'Priya Patel',
      email: 'buyer@tapnbazaar.com',
      password,
      phone: '9123456780',
      city:  'Pune',
      state: 'Maharashtra',
    },
  })
  console.log('✅ Users done — seller@tapnbazaar.com / buyer@tapnbazaar.com (password: password123)')

  // ─── PRODUCTS ──────────────────────────────────────────────────────────────
  console.log('📦 Seeding products...')

  const products: { title: string; description: string; price: number; condition: Condition; categoryId: string; city: string; state: string; images: string[] }[] = [
    // Electronics
    {
      title: 'iPhone 13 Pro Max 256GB — Pacific Blue',
      description: 'Used for 8 months, excellent condition. No scratches, original box and charger included. Battery health 91%. Face ID works perfectly.',
      price: 72000, condition: 'LIKE_NEW', categoryId: catMap['electronics'],
      city: 'Mumbai', state: 'Maharashtra',
      images: ['https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=600'],
    },
    {
      title: 'Samsung Galaxy S23 Ultra 512GB',
      description: 'Bought 6 months ago. S-Pen included. Minor scratch on back, screen is perfect. Comes with original charger and case.',
      price: 85000, condition: 'GOOD', categoryId: catMap['electronics'],
      city: 'Bangalore', state: 'Karnataka',
      images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600'],
    },
    {
      title: 'MacBook Air M2 — 8GB/256GB Space Grey',
      description: 'Purchased 4 months ago. Used lightly for college work. No dents or scratches. Battery cycles: 42. Comes with original charger.',
      price: 95000, condition: 'LIKE_NEW', categoryId: catMap['electronics'],
      city: 'Delhi', state: 'Delhi',
      images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600'],
    },
    {
      title: 'Sony WH-1000XM5 Noise Cancelling Headphones',
      description: 'Barely used, bought 2 months ago. Best-in-class noise cancellation. Comes with original case and cables.',
      price: 22000, condition: 'LIKE_NEW', categoryId: catMap['electronics'],
      city: 'Hyderabad', state: 'Telangana',
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'],
    },
    {
      title: 'OnePlus 11 5G — 16GB/256GB Titan Black',
      description: 'Used for 3 months. Hasselblad camera, 100W fast charging. Screen protector applied from day 1. Selling due to upgrade.',
      price: 48000, condition: 'GOOD', categoryId: catMap['electronics'],
      city: 'Chennai', state: 'Tamil Nadu',
      images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600'],
    },

    // Cars
    {
      title: '2019 Maruti Swift VXI — 28,000 km',
      description: 'Single owner, all service records available. No accidents. New tyres fitted last month. Insurance valid till Dec 2025.',
      price: 520000, condition: 'GOOD', categoryId: catMap['cars'],
      city: 'Pune', state: 'Maharashtra',
      images: ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600'],
    },
    {
      title: 'Royal Enfield Classic 350 — 2021',
      description: 'Gunmetal grey, 12,000 km driven. All original parts, no modifications. Serviced at authorized center. Selling due to relocation.',
      price: 155000, condition: 'GOOD', categoryId: catMap['cars'],
      city: 'Jaipur', state: 'Rajasthan',
      images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'],
    },
    {
      title: 'Honda Activa 6G — 2022 — 8,000 km',
      description: 'Lady driven, excellent condition. All documents up to date. New battery installed. Parking scratches only, no major damage.',
      price: 68000, condition: 'LIKE_NEW', categoryId: catMap['cars'],
      city: 'Ahmedabad', state: 'Gujarat',
      images: ['https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600'],
    },

    // Furniture
    {
      title: 'IKEA MALM Queen Bed Frame — White',
      description: 'Used for 1 year, very good condition. Disassembled and ready to pick up. Mattress not included. Self-pickup only.',
      price: 8500, condition: 'GOOD', categoryId: catMap['furniture'],
      city: 'Bangalore', state: 'Karnataka',
      images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600'],
    },
    {
      title: 'Wooden Study Table with Bookshelf',
      description: 'Solid sheesham wood, 4 feet wide. Minor scratches on top. Very sturdy. Bought for Rs.18,000, selling due to moving.',
      price: 7000, condition: 'GOOD', categoryId: catMap['furniture'],
      city: 'Delhi', state: 'Delhi',
      images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600'],
    },
    {
      title: '3-Seater Fabric Sofa — Dark Grey',
      description: 'Used for 2 years, no tears or stains. Comfortable and sturdy. Dimensions: 7ft x 3ft. Self-pickup from Andheri West.',
      price: 12000, condition: 'GOOD', categoryId: catMap['furniture'],
      city: 'Mumbai', state: 'Maharashtra',
      images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600'],
    },

    // Fashion
    {
      title: 'Nike Air Max 270 — Size 9 — Black/White',
      description: 'Worn only twice, bought from Nike store. Original box included. No sole wear. Selling because size is slightly big for me.',
      price: 5500, condition: 'LIKE_NEW', categoryId: catMap['fashion'],
      city: 'Mumbai', state: 'Maharashtra',
      images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'],
    },
    {
      title: 'Levi\'s 511 Slim Fit Jeans — 32x32 — Dark Blue',
      description: 'Worn 3-4 times, washed once. Perfect condition. Original tag still attached. Bought for Rs.3,500.',
      price: 1200, condition: 'LIKE_NEW', categoryId: catMap['fashion'],
      city: 'Pune', state: 'Maharashtra',
      images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=600'],
    },
    {
      title: 'Ray-Ban Wayfarer Sunglasses — Original',
      description: 'Authentic Ray-Ban RB2140. Comes with original case and cloth. Minor frame scratches, lenses are perfect.',
      price: 3200, condition: 'GOOD', categoryId: catMap['fashion'],
      city: 'Hyderabad', state: 'Telangana',
      images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600'],
    },

    // Books
    {
      title: 'UPSC Civil Services — Complete Study Material Set',
      description: 'Full set of Vision IAS printed notes + 5 years PYQ papers. Used for 1 attempt. Very good condition, no missing pages.',
      price: 3500, condition: 'GOOD', categoryId: catMap['books'],
      city: 'Delhi', state: 'Delhi',
      images: ['https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600'],
    },
    {
      title: 'Atomic Habits by James Clear — Hardcover',
      description: 'Read once, no highlights or notes. Hardcover edition. Great book, selling to declutter.',
      price: 350, condition: 'LIKE_NEW', categoryId: catMap['books'],
      city: 'Bangalore', state: 'Karnataka',
      images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600'],
    },
    {
      title: 'JEE Advanced 10 Years Solved Papers — Arihant',
      description: 'Used for JEE prep, some pencil marks inside. All pages intact. Useful for current JEE aspirants.',
      price: 280, condition: 'FAIR', categoryId: catMap['books'],
      city: 'Kota', state: 'Rajasthan',
      images: ['https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600'],
    },

    // Sports
    {
      title: 'Yonex Arcsaber 11 Badminton Racket',
      description: 'Used for 6 months, restrung 2 months ago with BG65 string. Grip replaced. Comes with original cover.',
      price: 4500, condition: 'GOOD', categoryId: catMap['sports'],
      city: 'Chennai', state: 'Tamil Nadu',
      images: ['https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600'],
    },
    {
      title: 'Decathlon Domyos Treadmill — T520B',
      description: 'Used for 1 year, works perfectly. Max speed 16 km/h, incline up to 9%. Foldable. Selling due to space constraint.',
      price: 28000, condition: 'GOOD', categoryId: catMap['sports'],
      city: 'Pune', state: 'Maharashtra',
      images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600'],
    },
    {
      title: 'SG Cricket Kit — Full Set (Bat + Pads + Gloves)',
      description: 'SG RSD Xtreme bat, SG Campus pads and gloves. Used for 1 season. Bat has some surface cracks, plays well.',
      price: 5500, condition: 'GOOD', categoryId: catMap['sports'],
      city: 'Nagpur', state: 'Maharashtra',
      images: ['https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600'],
    },

    // Home
    {
      title: 'LG 1.5 Ton 5-Star Inverter AC — 2021',
      description: 'Used for 2 summers, serviced every year. Cooling is excellent. Comes with remote. Buyer needs to arrange installation.',
      price: 32000, condition: 'GOOD', categoryId: catMap['home'],
      city: 'Ahmedabad', state: 'Gujarat',
      images: ['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600'],
    },
    {
      title: 'Philips Air Fryer HD9200 — 4.1L',
      description: 'Used about 20 times, works perfectly. All accessories included. Selling because we got a bigger model.',
      price: 4200, condition: 'LIKE_NEW', categoryId: catMap['home'],
      city: 'Mumbai', state: 'Maharashtra',
      images: ['https://images.unsplash.com/photo-1648170645898-f4e9e5e5e5e5?w=600'],
    },
    {
      title: 'Godrej 310L Double Door Refrigerator',
      description: 'Used for 3 years, no issues. Frost-free, works perfectly. Minor dent on side panel. Buyer to arrange transport.',
      price: 18000, condition: 'GOOD', categoryId: catMap['home'],
      city: 'Delhi', state: 'Delhi',
      images: ['https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600'],
    },

    // Jobs
    {
      title: 'Freelance React Developer Available',
      description: 'Experienced React/Next.js developer available for freelance projects. 3+ years experience. Hourly or project basis. Portfolio available on request.',
      price: 500, condition: 'NEW', categoryId: catMap['jobs'],
      city: 'Bangalore', state: 'Karnataka',
      images: ['https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600'],
    },
    {
      title: 'Home Tutor — Maths & Science (Class 8-10)',
      description: 'Experienced tutor with 5 years of teaching. CBSE and ICSE boards. Home visits available in Andheri and Bandra area. Rs.500/hour.',
      price: 500, condition: 'NEW', categoryId: catMap['jobs'],
      city: 'Mumbai', state: 'Maharashtra',
      images: ['https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600'],
    },

    // Pets
    {
      title: 'Golden Retriever Puppies — 45 Days Old',
      description: 'Pure breed Golden Retriever puppies. 3 male, 2 female available. Vaccinated and dewormed. Parents on premises. Serious buyers only.',
      price: 25000, condition: 'NEW', categoryId: catMap['pets'],
      city: 'Pune', state: 'Maharashtra',
      images: ['https://images.unsplash.com/photo-1552053831-71594a27632d?w=600'],
    },
    {
      title: 'Royal Canin Dog Food — 15kg Bag (Sealed)',
      description: 'Bought extra, unopened sealed bag. Adult medium breed formula. MRP Rs.4,200, selling at discount.',
      price: 3200, condition: 'NEW', categoryId: catMap['pets'],
      city: 'Hyderabad', state: 'Telangana',
      images: ['https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600'],
    },

    // Other
    {
      title: 'Canon EOS 200D DSLR Camera — 18-55mm Kit',
      description: 'Used for 1 year, shutter count ~3,000. Excellent condition. Comes with kit lens, 32GB SD card, bag and charger.',
      price: 38000, condition: 'LIKE_NEW', categoryId: catMap['other'],
      city: 'Kolkata', state: 'West Bengal',
      images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600'],
    },
    {
      title: 'Gibson Les Paul Standard Electric Guitar',
      description: 'Bought 2 years ago, played occasionally. Comes with hard case, strap and cable. Minor fret wear, sounds amazing.',
      price: 85000, condition: 'GOOD', categoryId: catMap['other'],
      city: 'Mumbai', state: 'Maharashtra',
      images: ['https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600'],
    },
  ]

  let created = 0
  for (const p of products) {
    await prisma.product.create({
      data: { ...p, userId: seller.id, views: Math.floor(Math.random() * 200) },
    })
    created++
  }

  console.log(`✅ Created ${created} sample products`)
  console.log('')
  console.log('🎉 Seeding complete!')
  console.log('')
  console.log('Test accounts:')
  console.log('  📧 seller@tapnbazaar.com  🔑 password123')
  console.log('  📧 buyer@tapnbazaar.com   🔑 password123')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
