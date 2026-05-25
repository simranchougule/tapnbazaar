// prisma/seed.ts
// This file fills your database with initial data
// Like stocking a shop before opening day

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding categories...')

  const categories = [
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

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    })
    console.log(`✅ Category created: ${category.name}`)
  }

  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })