import { Response } from 'express'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/auth.middleware'
import { sendNotification } from '../services/notificationService'

export const getStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [totalUsers, totalProducts, totalMessages, activeProducts, soldProducts] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.message.count(),
      prisma.product.count({ where: { status: 'ACTIVE' } }),
      prisma.product.count({ where: { status: 'SOLD' } }),
    ])
    res.status(200).json({ success: true, stats: { totalUsers, totalProducts, totalMessages, activeProducts, soldProducts } })
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
    const { banned } = req.body
    const user = await prisma.user.update({
      where: { id: req.params.id as string },
      data: { isBanned: banned ?? true },
      select: { id: true, name: true, isBanned: true },
    })
    res.status(200).json({ success: true, user })
  } catch { res.status(500).json({ success: false, message: 'Something went wrong.' }) }
}

export const markTrusted = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { trusted } = req.body
    const user = await prisma.user.update({
      where: { id: req.params.id as string },
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
