import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const SUBCATEGORIES: Record<string, { name: string; slug: string; icon: string }[]> = {
  electronics: [
    { name: 'Mobile Phones',  slug: 'mobile-phones',  icon: '📱' },
    { name: 'Laptops',        slug: 'laptops',         icon: '💻' },
    { name: 'Tablets',        slug: 'tablets',         icon: '📟' },
    { name: 'Cameras',        slug: 'cameras',         icon: '📷' },
    { name: 'TVs',            slug: 'tvs',             icon: '📺' },
    { name: 'Accessories',    slug: 'accessories',     icon: '🎧' },
  ],
  cars: [
    { name: 'Hatchbacks',     slug: 'hatchbacks',      icon: '🚗' },
    { name: 'Sedans',         slug: 'sedans',          icon: '🚙' },
    { name: 'SUVs',           slug: 'suvs',            icon: '🛻' },
    { name: 'Spare Parts',    slug: 'car-spare-parts', icon: '⚙️' },
  ],
  furniture: [
    { name: 'Sofa & Chairs',    slug: 'sofa-chairs',       icon: '🛋️' },
    { name: 'Beds & Wardrobes', slug: 'beds-wardrobes',    icon: '🛏️' },
    { name: 'Tables & Desks',   slug: 'tables-desks',      icon: '🪑' },
    { name: 'Kitchen',          slug: 'kitchen-furniture', icon: '🍳' },
  ],
  fashion: [
    { name: "Men's Clothing",   slug: 'mens-clothing',   icon: '👔' },
    { name: "Women's Clothing", slug: 'womens-clothing', icon: '👗' },
    { name: 'Footwear',         slug: 'footwear',        icon: '👟' },
    { name: 'Watches',          slug: 'watches',         icon: '⌚' },
    { name: 'Jewellery',        slug: 'jewellery',       icon: '💍' },
  ],
  books: [
    { name: 'Textbooks', slug: 'textbooks', icon: '📚' },
    { name: 'Novels',    slug: 'novels',    icon: '📖' },
    { name: 'Comics',    slug: 'comics',    icon: '📕' },
  ],
  sports: [
    { name: 'Cricket',       slug: 'cricket',       icon: '🏏' },
    { name: 'Football',      slug: 'football',      icon: '⚽' },
    { name: 'Gym Equipment', slug: 'gym-equipment', icon: '🏋️' },
    { name: 'Cycles',        slug: 'cycles',        icon: '🚲' },
  ],
  home: [
    { name: 'Kitchen Appliances', slug: 'kitchen-appliances', icon: '🍳' },
    { name: 'Home Decor',         slug: 'home-decor',         icon: '🏮' },
    { name: 'Washing Machines',   slug: 'washing-machines',   icon: '🫧' },
    { name: 'Air Conditioners',   slug: 'air-conditioners',   icon: '❄️' },
  ],
  pets: [
    { name: 'Dogs',           slug: 'dogs',           icon: '🐕' },
    { name: 'Cats',           slug: 'cats',           icon: '🐈' },
    { name: 'Pet Accessories',slug: 'pet-accessories', icon: '🦴' },
    { name: 'Fish & Aquarium',slug: 'fish-aquarium',  icon: '🐠' },
  ],
}

async function main() {
  for (const [parentSlug, subs] of Object.entries(SUBCATEGORIES)) {
    const parent = await prisma.category.findUnique({ where: { slug: parentSlug } })
    if (!parent) { console.log('Parent not found:', parentSlug); continue }
    for (const sub of subs) {
      await prisma.category.upsert({
        where:  { slug: sub.slug },
        update: { name: sub.name, icon: sub.icon, parentId: parent.id },
        create: { name: sub.name, slug: sub.slug, icon: sub.icon, parentId: parent.id },
      })
      console.log('Created:', sub.name)
    }
  }
  console.log('All subcategories seeded!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
