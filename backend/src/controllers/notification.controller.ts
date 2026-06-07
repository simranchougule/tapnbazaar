import { Response } from 'express'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notifications = await prisma.notification.findMany({
      where:   { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      take:    50,
    })
    const unreadCount = notifications.filter(n => !n.isRead).length
    res.status(200).json({ success: true, notifications, unreadCount })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Something went wrong.' })
  }
}

export const markAllRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.userId, isRead: false },
      data:  { isRead: true },
    })
    res.status(200).json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Something went wrong.' })
  }
}

export const markOneRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.notification.update({
      where: { id: req.params.id as string, userId: req.user!.userId },
      data:  { isRead: true },
    })
    res.status(200).json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Something went wrong.' })
  }
}
