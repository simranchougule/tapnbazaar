import { Response } from 'express'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

const isAdmin = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { isAdmin: true } })
  return user?.isAdmin === true
}

export const getStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!await isAdmin(req.user!.userId)) { res.status(403).json({ success: false, message: 'Admin only' }); return }
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
    if (!await isAdmin(req.user!.userId)) { res.status(403).json({ success: false, message: 'Admin only' }); return }
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, city: true, state: true, isAdmin: true, createdAt: true, _count: { select: { products: true } } },
      orderBy: { createdAt: 'desc' },
    })
    res.status(200).json({ success: true, users })
  } catch { res.status(500).json({ success: false, message: 'Something went wrong.' }) }
}

export const getAllProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!await isAdmin(req.user!.userId)) { res.status(403).json({ success: false, message: 'Admin only' }); return }
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
    if (!await isAdmin(req.user!.userId)) { res.status(403).json({ success: false, message: 'Admin only' }); return }
    await prisma.product.delete({ where: { id: req.params.id as string } })
    res.status(200).json({ success: true, message: 'Product deleted' })
  } catch { res.status(500).json({ success: false, message: 'Something went wrong.' }) }
}
