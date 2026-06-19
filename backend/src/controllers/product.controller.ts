import { Response } from 'express'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/auth.middleware'
import { sendNotification } from '../services/notificationService'

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, price, condition, categoryId, city, state, images, latitude, longitude, area, pincode, listingType, supplierInfo, supplierCost, deliveryDays, returnPolicy, shippingNote } = req.body

    if (!title || !description || !price || !categoryId || !city || !state) {
      res.status(400).json({ success: false, message: 'Please provide all required fields' })
      return
    }
    if (title.trim().length < 3) {
      res.status(400).json({ success: false, message: 'Title must be at least 3 characters' })
      return
    }
    if (parseFloat(price) <= 0) {
      res.status(400).json({ success: false, message: 'Price must be greater than 0' })
      return
    }
    if (listingType === 'dropship' && !supplierCost) {
      res.status(400).json({ success: false, message: 'Supplier cost is required for dropship listings' })
      return
    }

    // ── Phone verification gate ───────────────────────────────────────────────
    const seller = await prisma.user.findUnique({
      where:  { id: req.user!.userId },
      select: { phoneVerified: true, isTrusted: true },
    })
    if (!seller?.phoneVerified) {
      res.status(403).json({ success: false, message: 'Phone verification required to post listings', code: 'PHONE_NOT_VERIFIED' })
      return
    }

    // ── Daily listing limit ───────────────────────────────────────────────────
    const dayLimit  = seller.isTrusted ? 50 : 3
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
    const todayCount = await prisma.product.count({
      where: { userId: req.user!.userId, createdAt: { gte: todayStart } },
    })
    if (todayCount >= dayLimit) {
      res.status(429).json({
        success: false,
        message: seller.isTrusted
          ? `Daily limit of ${dayLimit} listings reached. Try again tomorrow.`
          : `New accounts can post up to ${dayLimit} listings per day. Upgrade to trusted seller for higher limits.`,
      })
      return
    }

    const category = await prisma.category.findUnique({ where: { id: categoryId } })
    if (!category) {
      res.status(400).json({ success: false, message: 'Invalid category' })
      return
    }

    const product = await prisma.product.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        condition: condition || 'GOOD',
        city,
        state,
        images: images || [],
        userId: req.user!.userId,
        categoryId,
        status: 'ACTIVE',
        listingType: listingType === 'dropship' ? 'dropship' : 'local',
        ...(listingType === 'dropship' && {
          supplierInfo,
          supplierCost: supplierCost ? parseFloat(supplierCost) : undefined,
          deliveryDays: deliveryDays || '5-10 days',
        }),
        ...(returnPolicy && { returnPolicy }),
        ...(shippingNote && { shippingNote }),
      },
      include: {
        user:     { select: { id: true, name: true, avatar: true, phone: true, city: true } },
        category: true,
      },
    })

    res.status(201).json({ success: true, message: 'Product listed successfully!', product })
  } catch (error) {
    console.error('Create product error:', error)
    res.status(500).json({ success: false, message: 'Something went wrong.' })
  }
}

export const getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page      = parseInt(req.query.page as string) || 1
    const limit     = parseInt(req.query.limit as string) || 20
    const search    = req.query.search as string | undefined
    const category  = req.query.category as string | undefined
    const minPrice  = req.query.minPrice as string | undefined
    const maxPrice  = req.query.maxPrice as string | undefined
    const city      = req.query.city as string | undefined
    const condition = req.query.condition as string | undefined
    const sortBy    = (req.query.sortBy as string) || 'createdAt'
    const order     = (req.query.order as string) || 'desc'

    const where: any = { status: 'ACTIVE' }

    if (search) {
      where.OR = [
        { title:       { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Fix: support both parent and subcategory slugs
    if (category) {
      const cat = await prisma.category.findUnique({
        where:   { slug: category },
        include: { children: { select: { id: true } } }
      })
      if (cat) {
        if (cat.children && cat.children.length > 0) {
          // Parent category — include products from all subcategories too
          const childIds = cat.children.map((c: any) => c.id)
          where.categoryId = { in: [cat.id, ...childIds] }
        } else {
          // Subcategory — direct match
          where.categoryId = cat.id
        }
      }
    }

    if (city)      where.city      = { contains: city, mode: 'insensitive' }
    if (condition) where.condition = condition

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }

    const total    = await prisma.product.count({ where })
    const products = await prisma.product.findMany({
      where,
      include: {
        user:     { select: { id: true, name: true, avatar: true, city: true } },
        category: { select: { id: true, name: true, slug: true, icon: true } },
        _count:   { select: { favorites: true } },
      },
      orderBy: { [sortBy]: order },
      skip: (page - 1) * limit,
      take: limit,
    })

    res.status(200).json({
      success: true,
      products,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Get products error:', error)
    res.status(500).json({ success: false, message: 'Something went wrong.' })
  }
}

export const getProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        user:     { select: { id: true, name: true, avatar: true, phone: true, city: true, createdAt: true } },
        category: true,
        _count:   { select: { favorites: true } },
      },
    })

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' })
      return
    }

    await prisma.product.update({ where: { id }, data: { views: { increment: 1 } } })

    const related = await prisma.product.findMany({
      where: { categoryId: product.categoryId, id: { not: id }, status: 'ACTIVE' },
      include: { user: { select: { id: true, name: true, city: true } } },
      orderBy: { createdAt: 'desc' },
      take: 6,
    })

    res.status(200).json({ success: true, product, related })
  } catch (error) {
    console.error('Get product error:', error)
    res.status(500).json({ success: false, message: 'Something went wrong.' })
  }
}

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string
    const { title, description, price, condition, city, state, images, status, listingType, supplierInfo, supplierCost, deliveryDays, returnPolicy, shippingNote } = req.body

    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) {
      res.status(404).json({ success: false, message: 'Product not found' })
      return
    }
    if (existing.userId !== req.user!.userId) {
      res.status(403).json({ success: false, message: 'You can only edit your own listings' })
      return
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(title        && { title }),
        ...(description  && { description }),
        ...(price        && { price: parseFloat(price) }),
        ...(condition    && { condition }),
        ...(city         && { city }),
        ...(state        && { state }),
        ...(images       && { images }),
        ...(status       && { status }),
        ...(listingType  && { listingType: listingType === 'dropship' ? 'dropship' : 'local' }),
        ...(supplierInfo !== undefined && { supplierInfo }),
        ...(supplierCost && { supplierCost: parseFloat(supplierCost) }),
        ...(deliveryDays && { deliveryDays }),
        ...(returnPolicy && { returnPolicy }),
        ...(shippingNote !== undefined && { shippingNote }),
      },
      include: {
        user:     { select: { id: true, name: true, avatar: true } },
        category: true,
      },
    })

    if (status === 'SOLD' && existing.status !== 'SOLD') {
      await sendNotification({
        userId: existing.userId,
        type:   'product_sold',
        title:  '🎉 Your item was marked as sold!',
        body:   `"${existing.title}" has been marked as sold.`,
        link:   `/products/${id}`,
      })
    }

    if (price && parseFloat(price) < existing.price) {
      const favoriters = await prisma.favorite.findMany({
        where:  { productId: id },
        select: { userId: true },
      })
      await Promise.all(favoriters.map((f: any) =>
        sendNotification({
          userId: f.userId,
          type:   'price_drop',
          title:  '📉 Price dropped on a saved item!',
          body:   `"${existing.title}" dropped to Rs.${parseFloat(price).toLocaleString('en-IN')}`,
          link:   `/products/${id}`,
        })
      ))
    }

    res.status(200).json({ success: true, message: 'Product updated!', product })
  } catch (error) {
    console.error('Update product error:', error)
    res.status(500).json({ success: false, message: 'Something went wrong.' })
  }
}

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string
    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) {
      res.status(404).json({ success: false, message: 'Product not found' })
      return
    }
    if (existing.userId !== req.user!.userId) {
      res.status(403).json({ success: false, message: 'You can only delete your own listings' })
      return
    }
    await prisma.product.delete({ where: { id } })
    res.status(200).json({ success: true, message: 'Product deleted successfully!' })
  } catch (error) {
    console.error('Delete product error:', error)
    res.status(500).json({ success: false, message: 'Something went wrong.' })
  }
}

export const getMyProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const products = await prisma.product.findMany({
      where:   { userId: req.user!.userId },
      include: {
        category: { select: { id: true, name: true, slug: true, icon: true } },
        _count:   { select: { favorites: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    res.status(200).json({ success: true, products })
  } catch (error) {
    console.error('Get my products error:', error)
    res.status(500).json({ success: false, message: 'Something went wrong.' })
  }
}

export const getTrendingProducts = async (req: any, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10
    const products = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      include: {
        user:     { select: { id: true, name: true, avatar: true, city: true } },
        category: { select: { id: true, name: true, slug: true, icon: true } },
        _count:   { select: { favorites: true } },
      },
      orderBy: [
        { views: 'desc' },
        { favorites: { _count: 'desc' } },
        { createdAt: 'desc' },
      ],
      take: limit,
    })
    res.status(200).json({ success: true, products })
  } catch (error) {
    console.error('Get trending products error:', error)
    res.status(500).json({ success: false, message: 'Something went wrong.' })
  }
}

// ─── LOCATION HELPERS ────────────────────────────────────────────────────────
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

export const getNearbyProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lat      = parseFloat(req.query.lat as string)
    const lng      = parseFloat(req.query.lng as string)
    const radiusKm = parseFloat(req.query.radius as string) || 25
    const limit    = parseInt(req.query.limit as string) || 20

    if (isNaN(lat) || isNaN(lng)) {
      res.status(400).json({ success: false, message: 'lat and lng are required' })
      return
    }

    const products = await prisma.product.findMany({
      where: {
        status:    'ACTIVE',
        latitude:  { not: null },
        longitude: { not: null },
      },
      include: {
        user:     { select: { id: true, name: true, avatar: true, city: true } },
        category: { select: { id: true, name: true, slug: true, icon: true } },
        _count:   { select: { favorites: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    })

    const nearby = products
      .map(p => ({ ...p, distance: haversineDistance(lat, lng, p.latitude!, p.longitude!) }))
      .filter(p => p.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit)

    res.json({ success: true, products: nearby, total: nearby.length })
  } catch (error) {
    console.error('Get nearby products error:', error)
    res.status(500).json({ success: false, message: 'Something went wrong.' })
  }
}