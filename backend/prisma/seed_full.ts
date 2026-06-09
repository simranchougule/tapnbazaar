import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const categories = [
  { name: 'Vehicles', slug: 'vehicles', icon: '🚗', children: [
    { name: 'Cars', slug: 'cars' },
    { name: 'Bikes', slug: 'bikes' },
    { name: 'Scooters', slug: 'scooters' },
    { name: 'Commercial Vehicles', slug: 'commercial-vehicles' },
    { name: 'Auto Parts', slug: 'auto-parts' },
    { name: 'Bicycles', slug: 'bicycles' },
  ]},
  { name: 'Property', slug: 'property', icon: '🏠', children: [
    { name: 'Houses for Sale', slug: 'houses-for-sale' },
    { name: 'Flats & Apartments', slug: 'flats-apartments' },
    { name: 'Plots & Land', slug: 'plots-land' },
    { name: 'Commercial Property', slug: 'commercial-property' },
    { name: 'Houses for Rent', slug: 'houses-for-rent' },
    { name: 'PG & Guest Houses', slug: 'pg-guest-houses' },
  ]},
  { name: 'Electronics', slug: 'electronics', icon: '📱', children: [
    { name: 'Mobile Phones', slug: 'mobile-phones' },
    { name: 'Tablets', slug: 'tablets' },
    { name: 'Laptops', slug: 'laptops' },
    { name: 'Computers', slug: 'computers' },
    { name: 'TVs', slug: 'tvs' },
    { name: 'Cameras', slug: 'cameras' },
    { name: 'Home Appliances', slug: 'home-appliances' },
    { name: 'Gaming Consoles', slug: 'gaming-consoles' },
  ]},
  { name: 'Fashion & Beauty', slug: 'fashion', icon: '👕', children: [
    { name: "Men's Clothing", slug: 'mens-clothing' },
    { name: "Women's Clothing", slug: 'womens-clothing' },
    { name: 'Kids Clothing', slug: 'kids-clothing' },
    { name: 'Footwear', slug: 'footwear' },
    { name: 'Watches', slug: 'watches' },
    { name: 'Beauty Products', slug: 'beauty-products' },
    { name: 'Jewellery', slug: 'jewellery' },
  ]},
  { name: 'Home & Furniture', slug: 'furniture', icon: '🪑', children: [
    { name: 'Sofas', slug: 'sofas' },
    { name: 'Beds', slug: 'beds' },
    { name: 'Dining Tables', slug: 'dining-tables' },
    { name: 'Wardrobes', slug: 'wardrobes' },
    { name: 'Home Decor', slug: 'home-decor' },
    { name: 'Kitchen Items', slug: 'kitchen-items' },
  ]},
  { name: 'Jobs', slug: 'jobs', icon: '💼', children: [
    { name: 'IT Jobs', slug: 'it-jobs' },
    { name: 'Sales Jobs', slug: 'sales-jobs' },
    { name: 'Marketing Jobs', slug: 'marketing-jobs' },
    { name: 'Part-time Jobs', slug: 'part-time-jobs' },
    { name: 'Work From Home', slug: 'work-from-home' },
    { name: 'Delivery Jobs', slug: 'delivery-jobs' },
  ]},
  { name: 'Pets', slug: 'pets', icon: '🐾', children: [
    { name: 'Dogs', slug: 'dogs' },
    { name: 'Cats', slug: 'cats' },
    { name: 'Birds', slug: 'birds' },
    { name: 'Fish', slug: 'fish' },
    { name: 'Pet Accessories', slug: 'pet-accessories' },
  ]},
  { name: 'Education', slug: 'education', icon: '🎓', children: [
    { name: 'Courses', slug: 'courses' },
    { name: 'Tuition', slug: 'tuition' },
    { name: 'Books', slug: 'books' },
    { name: 'Training Programs', slug: 'training-programs' },
  ]},
  { name: 'Services', slug: 'services', icon: '🔧', children: [
    { name: 'Home Cleaning', slug: 'home-cleaning' },
    { name: 'Repairs', slug: 'repairs' },
    { name: 'Movers & Packers', slug: 'movers-packers' },
    { name: 'Event Services', slug: 'event-services' },
    { name: 'Beauty Services', slug: 'beauty-services' },
    { name: 'Freelance Services', slug: 'freelance-services' },
  ]},
  { name: 'Kids & Toys', slug: 'kids-toys', icon: '🧸', children: [
    { name: 'Toys', slug: 'toys' },
    { name: 'Baby Products', slug: 'baby-products' },
    { name: 'Strollers', slug: 'strollers' },
    { name: 'School Supplies', slug: 'school-supplies' },
  ]},
  { name: 'Sports & Hobbies', slug: 'sports', icon: '🎮', children: [
    { name: 'Sports Equipment', slug: 'sports-equipment' },
    { name: 'Musical Instruments', slug: 'musical-instruments' },
    { name: 'Collectibles', slug: 'collectibles' },
    { name: 'Fitness Equipment', slug: 'fitness-equipment' },
  ]},
  { name: 'Agriculture & Business', slug: 'agriculture', icon: '🌾', children: [
    { name: 'Farm Equipment', slug: 'farm-equipment' },
    { name: 'Seeds & Fertilizers', slug: 'seeds-fertilizers' },
    { name: 'Industrial Machinery', slug: 'industrial-machinery' },
    { name: 'Business Equipment', slug: 'business-equipment' },
  ]},
]

const sampleProducts = [
  {
    title: 'iPhone 13 Pro Max 256GB',
    description: 'Used for 1 year, excellent condition. No scratches, comes with original box and charger. Battery health 91%.',
    price: 65000, condition: 'LIKE_NEW', city: 'Mumbai', state: 'Maharashtra',
    categorySlug: 'mobile-phones',
    images: ['https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=600'],
  },
  {
    title: 'Samsung Galaxy S23 Ultra',
    description: 'Bought 6 months ago, switching to iPhone. All accessories included. No issues whatsoever.',
    price: 72000, condition: 'LIKE_NEW', city: 'Delhi', state: 'Delhi',
    categorySlug: 'mobile-phones',
    images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600'],
  },
  {
    title: 'MacBook Pro M2 2023',
    description: '14 inch MacBook Pro M2, 16GB RAM, 512GB SSD. Barely used, still under warranty. Selling due to upgrade.',
    price: 145000, condition: 'LIKE_NEW', city: 'Bangalore', state: 'Karnataka',
    categorySlug: 'laptops',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600'],
  },
  {
    title: 'Dell XPS 15 Laptop',
    description: 'Intel i7 12th Gen, 16GB RAM, 512GB SSD, 4K OLED display. Perfect for professionals.',
    price: 89000, condition: 'GOOD', city: 'Pune', state: 'Maharashtra',
    categorySlug: 'laptops',
    images: ['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600'],
  },
  {
    title: 'Sony Alpha A7 III Camera',
    description: 'Full frame mirrorless camera with 28-70mm kit lens. Shutter count under 5000. Comes with 2 batteries and bag.',
    price: 135000, condition: 'GOOD', city: 'Chennai', state: 'Tamil Nadu',
    categorySlug: 'cameras',
    images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600'],
  },
  {
    title: 'Canon EOS 200D DSLR',
    description: 'Entry level DSLR perfect for beginners. Comes with 18-55mm lens. Very good condition.',
    price: 28000, condition: 'GOOD', city: 'Hyderabad', state: 'Telangana',
    categorySlug: 'cameras',
    images: ['https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600'],
  },
  {
    title: 'Honda Activa 6G 2022',
    description: '2022 model, 12000 km driven, single owner. All documents clear. New tyres fitted last month.',
    price: 68000, condition: 'GOOD', city: 'Pune', state: 'Maharashtra',
    categorySlug: 'scooters',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'],
  },
  {
    title: 'Royal Enfield Classic 350',
    description: '2021 model, 8000 km driven. Excellent condition, well maintained. First owner. All papers complete.',
    price: 155000, condition: 'LIKE_NEW', city: 'Jaipur', state: 'Rajasthan',
    categorySlug: 'bikes',
    images: ['https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600'],
  },
  {
    title: 'Maruti Swift 2020',
    description: '2020 Maruti Swift VXi, 35000 km driven. Petrol, single owner. All service records available. No accidents.',
    price: 520000, condition: 'GOOD', city: 'Mumbai', state: 'Maharashtra',
    categorySlug: 'cars',
    images: ['https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600'],
  },
  {
    title: 'Hyundai Creta 2019',
    description: 'SX variant, diesel, 55000 km driven. Sunroof, all features working. Minor scratch on bumper.',
    price: 850000, condition: 'GOOD', city: 'Delhi', state: 'Delhi',
    categorySlug: 'cars',
    images: ['https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=600'],
  },
  {
    title: 'LG 55 inch 4K Smart TV',
    description: '2022 model LG NanoCell 55 inch. WebOS, all streaming apps. Remote and stand included.',
    price: 42000, condition: 'LIKE_NEW', city: 'Bangalore', state: 'Karnataka',
    categorySlug: 'tvs',
    images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f4834c?w=600'],
  },
  {
    title: 'PlayStation 5 Console',
    description: 'PS5 disc edition with 2 controllers and 3 games. Bought 8 months ago. Works perfectly.',
    price: 45000, condition: 'LIKE_NEW', city: 'Chennai', state: 'Tamil Nadu',
    categorySlug: 'gaming-consoles',
    images: ['https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=600'],
  },
  {
    title: '3BHK Flat for Rent - Baner',
    description: 'Spacious 3BHK semi-furnished flat in Baner. 2 bathrooms, parking, 24/7 security. Close to IT park.',
    price: 28000, condition: 'NEW', city: 'Pune', state: 'Maharashtra',
    categorySlug: 'houses-for-rent',
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600'],
  },
  {
    title: '1BHK Flat for Sale - Thane',
    description: '450 sqft 1BHK in Thane West. 5th floor, good ventilation. Ready possession. Loan available.',
    price: 4500000, condition: 'NEW', city: 'Mumbai', state: 'Maharashtra',
    categorySlug: 'flats-apartments',
    images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600'],
  },
  {
    title: 'IKEA Sofa 3 Seater',
    description: 'IKEA EKTORP 3 seater sofa, white cover. Purchased 1 year ago. Minor stain on one cushion, cover washable.',
    price: 18000, condition: 'GOOD', city: 'Bangalore', state: 'Karnataka',
    categorySlug: 'sofas',
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600'],
  },
  {
    title: 'King Size Bed with Storage',
    description: 'Solid wood king size bed with hydraulic storage. 5 years old but very sturdy. No mattress included.',
    price: 12000, condition: 'FAIR', city: 'Hyderabad', state: 'Telangana',
    categorySlug: 'beds',
    images: ['https://images.unsplash.com/photo-1505693314120-0d443867891c?w=600'],
  },
  {
    title: 'Golden Retriever Puppies',
    description: 'Pure breed Golden Retriever puppies, 45 days old. Vaccinated, dewormed. 2 male 1 female available.',
    price: 15000, condition: 'NEW', city: 'Delhi', state: 'Delhi',
    categorySlug: 'dogs',
    images: ['https://images.unsplash.com/photo-1552053831-71594a27632d?w=600'],
  },
  {
    title: 'Persian Cat Female',
    description: '2 year old Persian cat, very friendly and trained. Selling due to relocation. Food and accessories included.',
    price: 8000, condition: 'GOOD', city: 'Mumbai', state: 'Maharashtra',
    categorySlug: 'cats',
    images: ['https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600'],
  },
  {
    title: 'Yoga Mat + Resistance Bands Set',
    description: 'Premium 6mm yoga mat with carrying strap + set of 5 resistance bands. Used only 3 times.',
    price: 1200, condition: 'LIKE_NEW', city: 'Pune', state: 'Maharashtra',
    categorySlug: 'fitness-equipment',
    images: ['https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=600'],
  },
  {
    title: 'Yamaha Acoustic Guitar',
    description: 'Yamaha F310 acoustic guitar, 2 years old. Good condition, minor fret wear. Comes with bag and extra strings.',
    price: 4500, condition: 'GOOD', city: 'Bangalore', state: 'Karnataka',
    categorySlug: 'musical-instruments',
    images: ['https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600'],
  },
  {
    title: 'NCERT Books Class 12 Set',
    description: 'Complete set of NCERT books for Class 12 PCM + English. Good condition, no missing pages.',
    price: 800, condition: 'GOOD', city: 'Jaipur', state: 'Rajasthan',
    categorySlug: 'books',
    images: ['https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600'],
  },
  {
    title: "Men's Nike Air Max Shoes",
    description: 'Size 10, worn 4-5 times only. Original purchase from Nike store. No box available.',
    price: 3500, condition: 'LIKE_NEW', city: 'Chennai', state: 'Tamil Nadu',
    categorySlug: 'footwear',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'],
  },
  {
    title: 'Whirlpool Washing Machine 7kg',
    description: 'Front load washing machine, 3 years old. Works perfectly, all wash programs functional. Self pickup only.',
    price: 14000, condition: 'GOOD', city: 'Pune', state: 'Maharashtra',
    categorySlug: 'home-appliances',
    images: ['https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600'],
  },
  {
    title: 'Baby Stroller - Chicco Brand',
    description: 'Chicco Activ3 stroller, used for 6 months. Folds compactly, good condition. All safety features intact.',
    price: 6500, condition: 'GOOD', city: 'Mumbai', state: 'Maharashtra',
    categorySlug: 'strollers',
    images: ['https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600'],
  },
  {
    title: 'HP LaserJet Printer',
    description: 'HP LaserJet Pro M404dn, 2 years old. Works perfectly. Toner at 60%. Ideal for office use.',
    price: 9500, condition: 'GOOD', city: 'Bangalore', state: 'Karnataka',
    categorySlug: 'business-equipment',
    images: ['https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600'],
  },
  {
    title: 'Lego Technic Set',
    description: 'Lego Technic 42110 Land Rover Defender. Complete set, all pieces present. Built once then disassembled.',
    price: 3800, condition: 'LIKE_NEW', city: 'Delhi', state: 'Delhi',
    categorySlug: 'toys',
    images: ['https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600'],
  },
  {
    title: 'Tata Ace Mini Truck 2018',
    description: '2018 Tata Ace, 45000 km driven. Good condition, used for goods transport. All papers clear.',
    price: 320000, condition: 'GOOD', city: 'Pune', state: 'Maharashtra',
    categorySlug: 'commercial-vehicles',
    images: ['https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600'],
  },
  {
    title: 'React & Node.js Full Stack Course',
    description: 'Recorded course with 40+ hours of content. Covers React, Node, Express, MongoDB. Lifetime access included.',
    price: 1500, condition: 'NEW', city: 'Mumbai', state: 'Maharashtra',
    categorySlug: 'courses',
    images: ['https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=600'],
  },
  {
    title: 'Home Deep Cleaning Service',
    description: 'Professional home deep cleaning for 2BHK. Includes kitchen, bathrooms, all rooms. Available on weekends.',
    price: 2500, condition: 'NEW', city: 'Pune', state: 'Maharashtra',
    categorySlug: 'home-cleaning',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'],
  },
  {
    title: 'Road Bicycle Trek FX3',
    description: 'Trek FX3 hybrid bicycle, purchased last year. Excellent for city commuting. Rarely used.',
    price: 22000, condition: 'LIKE_NEW', city: 'Bangalore', state: 'Karnataka',
    categorySlug: 'bicycles',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'],
  },
]

async function main() {
  console.log('🌱 Starting seed...')

  // Find or create seed user
  let seedUser = await prisma.user.findFirst({ where: { email: 'seed@tapnbazaar.com' } })
  if (!seedUser) {
    const bcrypt = require('bcryptjs')
    seedUser = await prisma.user.create({
      data: {
        email:    'seed@tapnbazaar.com',
        password: await bcrypt.hash('seed123456', 10),
        name:     'TapnBazaar Demo',
        city:     'Mumbai',
        state:    'Maharashtra',
      }
    })
    console.log('✅ Created seed user: seed@tapnbazaar.com / seed123456')
  } else {
    console.log('✅ Seed user already exists')
  }

  // Delete products first (foreign key), then subcategories, then parent categories
  console.log('🗑️  Clearing old data...')
  await prisma.product.deleteMany({})
  await prisma.category.deleteMany({ where: { parentId: { not: null } } })
  await prisma.category.deleteMany({})
  console.log('✅ Cleared')

  // Create parent categories + subcategories
  const categoryMap: Record<string, string> = {}

  for (const cat of categories) {
    const parent = await prisma.category.create({
      data: { name: cat.name, slug: cat.slug, icon: cat.icon }
    })
    categoryMap[cat.slug] = parent.id

    for (const child of cat.children) {
      const sub = await prisma.category.create({
        data: { name: child.name, slug: child.slug, parentId: parent.id }
      })
      categoryMap[child.slug] = sub.id
    }
    console.log('📁 ' + cat.name + ' + ' + cat.children.length + ' subcategories')
  }

  console.log('✅ All categories created')

  // Create sample products
  let created = 0
  for (const p of sampleProducts) {
    const catId = categoryMap[p.categorySlug]
    if (!catId) {
      console.log('⚠️  Category not found for slug: ' + p.categorySlug)
      continue
    }

    await prisma.product.create({
      data: {
        title:       p.title,
        description: p.description,
        price:       p.price,
        condition:   p.condition as any,
        city:        p.city,
        state:       p.state,
        images:      p.images,
        status:      'ACTIVE',
        userId:      seedUser.id,
        categoryId:  catId,
      }
    })
    created++
    console.log('🛍️  ' + p.title)
  }

  console.log('')
  console.log('🎉 Seed complete!')
  console.log('📁 Categories created: ' + Object.keys(categoryMap).length)
  console.log('🛍️  Products created: ' + created)
  console.log('👤 Test login: seed@tapnbazaar.com / seed123456')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())