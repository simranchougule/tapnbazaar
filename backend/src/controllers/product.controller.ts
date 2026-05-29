import { Response } from 'express'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/auth.middleware'
import { sendNotification } from '../services/notificationService'

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, price, condition, categoryId, city, state, images } = req.body

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
      },
      include: {
        user: { select: { id: true, name: true, avatar: true, phone: true, city: true } },
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

    if (category)  where.category  = { slug: category }
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
    const { title, description, price, condition, city, state, images, status } = req.body

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
        ...(title       && { title }),
        ...(description && { description }),
        ...(price       && { price: parseFloat(price) }),
        ...(condition   && { condition }),
        ...(city        && { city }),
        ...(state       && { state }),
        ...(images      && { images }),
        ...(status      && { status }),
      },
      include: {
        user:     { select: { id: true, name: true, avatar: true } },
        category: true,
      },
    })

    // ── Notify seller: product marked as sold ─────────────────────────────
    if (status === 'SOLD' && existing.status !== 'SOLD') {
      await sendNotification({
        userId: existing.userId,
        type:   'product_sold',
        title:  '🎉 Your item was marked as sold!',
        body:   `"${existing.title}" has been marked as sold.`,
        link:   `/products/${id}`,
      })
    }

    // ── Notify users who favorited: price dropped ─────────────────────────
    if (price && parseFloat(price) < existing.price) {
      const favoriters = await prisma.favorite.findMany({
        where: { productId: id },
        select: { userId: true },
      })
      await Promise.all(favoriters.map(f =>
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