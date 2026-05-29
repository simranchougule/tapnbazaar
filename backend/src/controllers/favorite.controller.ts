import { Response } from 'express'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

export const toggleFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId    = req.user!.userId
    const productId = req.params.productId as string

    const existing = await prisma.favorite.findUnique({
      where: { userId_productId: { userId, productId } },
    })

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } })
      res.status(200).json({ success: true, favorited: false })
    } else {
      await prisma.favorite.create({ data: { userId, productId } })
      res.status(201).json({ success: true, favorited: true })
    }
  } catch (error) {
    console.error('Toggle favorite error:', error)
    res.status(500).json({ success: false, message: 'Something went wrong.' })
  }
}

export const getMyFavorites = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const favorites = await prisma.favorite.findMany({
      where:   { userId: req.user!.userId },
      include: {
        product: {
          include: {
            user:     { select: { id: true, name: true, avatar: true, city: true } },
            category: { select: { id: true, name: true, slug: true, icon: true } },
            _count:   { select: { favorites: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const products = favorites.map(f => f.product)
    res.status(200).json({ success: true, products })
  } catch (error) {
    console.error('Get favorites error:', error)
    res.status(500).json({ success: false, message: 'Something went wrong.' })
  }
}
