import { Response } from 'express'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

const REPORT_REASONS = ['Fake Product', 'Fraud', 'Wrong Category', 'Duplicate Listing', 'Inappropriate Content']
const USER_REPORT_REASONS = ['Scam', 'Harassment', 'Fake Account', 'Spam', 'Other']

// POST /api/reports/product/:productId
export const reportProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const productId = req.params.productId as string
    const { reason, details } = req.body
    const userId = req.user!.userId

    if (!reason || !REPORT_REASONS.includes(reason)) {
      res.status(400).json({ success: false, message: 'Invalid report reason' }); return
    }

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) { res.status(404).json({ success: false, message: 'Product not found' }); return }
    if (product.userId === userId) { res.status(400).json({ success: false, message: 'You cannot report your own listing' }); return }

    const existing = await prisma.report.findUnique({ where: { userId_productId: { userId, productId } } })
    if (existing) { res.status(400).json({ success: false, message: 'You have already reported this listing' }); return }

    await prisma.report.create({ data: { productId, userId, reason, details: details || null } })

    // Auto-flag if 5+ reports
    const count = await prisma.report.count({ where: { productId } })
    if (count >= 5) {
      await prisma.product.update({ where: { id: productId }, data: { status: 'INACTIVE' } })
    }

    res.status(201).json({ success: true, message: 'Report submitted. Our team will review it.' })
  } catch (error: any) {
    if (error.code === 'P2002') { res.status(400).json({ success: false, message: 'You have already reported this listing' }); return }
    res.status(500).json({ success: false, message: 'Something went wrong.' })
  }
}

// POST /api/reports/user/:reportedUserId
export const reportUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reportedUserId = req.params.reportedUserId as string
    const { reason, details } = req.body
    const reporterId = req.user!.userId

    if (!reason || !USER_REPORT_REASONS.includes(reason)) {
      res.status(400).json({ success: false, message: 'Invalid report reason' }); return
    }
    if (reportedUserId === reporterId) {
      res.status(400).json({ success: false, message: 'You cannot report yourself' }); return
    }

    const target = await prisma.user.findUnique({ where: { id: reportedUserId } })
    if (!target) { res.status(404).json({ success: false, message: 'User not found' }); return }

    await prisma.userReport.create({ data: { reportedUserId, reporterId, reason, details: details || null } })

    res.status(201).json({ success: true, message: 'User reported. Our team will review it.' })
  } catch (error: any) {
    if (error.code === 'P2002') { res.status(400).json({ success: false, message: 'You have already reported this user' }); return }
    res.status(500).json({ success: false, message: 'Something went wrong.' })
  }
}

// Admin: GET /api/reports/admin/products
export const getProductReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reports = await prisma.report.findMany({
      include: {
        product: { select: { id: true, title: true, status: true } },
        user:    { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    res.status(200).json({ success: true, reports })
  } catch {
    res.status(500).json({ success: false, message: 'Something went wrong.' })
  }
}

// Admin: GET /api/reports/admin/users
export const getUserReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reports = await prisma.userReport.findMany({
      include: {
        reportedUser: { select: { id: true, name: true, email: true } },
        reporter:     { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    res.status(200).json({ success: true, reports })
  } catch {
    res.status(500).json({ success: false, message: 'Something went wrong.' })
  }
}
