import { Response } from 'express'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/auth.middleware'
import { sendNotification } from '../services/notificationService'
import { withCache } from '../lib/cache'

export const getStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Dashboard counts don't need to be second-by-second accurate — a
    // short cache avoids five COUNT queries every time an admin opens
    // or refreshes the dashboard.
    const stats = await withCache('admin:stats', 60_000, async () => {
      const [totalUsers, totalProducts, totalMessages, activeProducts, soldProducts] = await Promise.all([
        prisma.user.count(),
        prisma.product.count(),
        prisma.message.count(),
        prisma.product.count({ where: { status: 'ACTIVE' } }),
        prisma.product.count({ where: { status: 'SOLD' } }),
      ])
      return { totalUsers, totalProducts, totalMessages, activeProducts, soldProducts }
    })
    res.status(200).json({ success: true, stats })
  } catch { res.status(500).json({ success: false, message: 'Something went wrong.' }) }
}

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, city: true, state: true, isAdmin: true, isBanned: true, isTrusted: true, createdAt: true, _count: { select: { products: true } } },
      orderBy: { createdAt: 'desc' },
    })
    res.status(200).json({ success: true, users })
  } catch { res.status(500).json({ success: false, message: 'Something went wrong.' }) }
}

export const getAllProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const products = await prisma.product.findMany({
      include: { user: { select: { id: true, name: true, email: true } }, category: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    res.status(200).json({ success: true, products })
  } catch { res.status(500).json({ success: false, message: 'Something went wrong.' }) }
}

export const deleteProductAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.product.delete({ where: { id: req.params.id as string } })
    res.status(200).json({ success: true, message: 'Product deleted' })
  } catch { res.status(500).json({ success: false, message: 'Something went wrong.' }) }
}

export const banUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const targetId = req.params.id as string

    if (targetId === req.user!.userId) {
      res.status(403).json({ success: false, message: 'You cannot ban your own account.' })
      return
    }

    const target = await prisma.user.findUnique({ where: { id: targetId }, select: { isAdmin: true } })
    if (!target) {
      res.status(404).json({ success: false, message: 'User not found.' })
      return
    }
    if (target.isAdmin) {
      res.status(403).json({ success: false, message: 'Admin accounts cannot be banned from this panel.' })
      return
    }

    const { banned } = req.body
    const user = await prisma.user.update({
      where: { id: targetId },
      data: { isBanned: banned ?? true },
      select: { id: true, name: true, isBanned: true },
    })
    res.status(200).json({ success: true, user })
  } catch { res.status(500).json({ success: false, message: 'Something went wrong.' }) }
}

export const markTrusted = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const targetId = req.params.id as string

    const target = await prisma.user.findUnique({ where: { id: targetId }, select: { isAdmin: true } })
    if (!target) {
      res.status(404).json({ success: false, message: 'User not found.' })
      return
    }
    if (target.isAdmin) {
      res.status(403).json({ success: false, message: 'Admin accounts cannot have trusted status changed from this panel.' })
      return
    }

    const { trusted } = req.body
    const user = await prisma.user.update({
      where: { id: targetId },
      data: { isTrusted: trusted ?? true },
      select: { id: true, name: true, isTrusted: true },
    })
    res.status(200).json({ success: true, user })
  } catch { res.status(500).json({ success: false, message: 'Something went wrong.' }) }
}

export const getReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reports = await prisma.report.findMany({
      include: {
        product: { select: { id: true, title: true } },
        user:    { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    res.status(200).json({ success: true, reports })
  } catch { res.status(500).json({ success: false, message: 'Something went wrong.' }) }
}