import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

// POST /api/reviews  { sellerId, productId, rating, comment }
export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const buyerId = req.user!.userId
    const { sellerId, productId, rating, comment } = req.body

    if (!sellerId || !productId || !rating) {
      res.status(400).json({ success: false, message: 'sellerId, productId and rating are required' }); return
    }
    if (rating < 1 || rating > 5) {
      res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' }); return
    }
    if (buyerId === sellerId) {
      res.status(400).json({ success: false, message: 'You cannot review yourself' }); return
    }

    // Verify buyer has a chat with the seller on this product
    const chat = await prisma.chat.findFirst({
      where: {
        productId,
        participants: { some: { userId: buyerId } },
      },
    })
    if (!chat) {
      res.status(403).json({ success: false, message: 'You can only review sellers you have chatted with' }); return
    }

    const review = await prisma.review.upsert({
      where:  { buyerId_productId: { buyerId, productId } },
      update: { rating, comment: comment || null },
      create: { sellerId, buyerId, productId, rating, comment: comment || null },
      include: { buyer: { select: { id: true, name: true, avatar: true } } },
    })

    res.status(201).json({ success: true, review })
  } catch {
    res.status(500).json({ success: false, message: 'Something went wrong.' })
  }
}

// GET /api/reviews/user/:userId
export const getSellerReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId as string
    const reviews = await prisma.review.findMany({
      where:   { sellerId: userId },
      include: { buyer: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
      take:    20,
    })

    const avg = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

    res.status(200).json({ success: true, reviews, averageRating: Math.round(avg * 10) / 10, total: reviews.length })
  } catch {
    res.status(500).json({ success: false, message: 'Something went wrong.' })
  }
}

// GET /api/reviews/can-review/:productId  — checks if current user can leave a review
export const canReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const buyerId    = req.user!.userId
    const productId  = req.params.productId as string

    const chat = await prisma.chat.findFirst({
      where: { productId, participants: { some: { userId: buyerId } } },
    })
    const existing = await prisma.review.findUnique({
      where: { buyerId_productId: { buyerId, productId } },
    })

    res.status(200).json({ success: true, canReview: !!chat, alreadyReviewed: !!existing, review: existing || null })
  } catch {
    res.status(500).json({ success: false, message: 'Something went wrong.' })
  }
}
