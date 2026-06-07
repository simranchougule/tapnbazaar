import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth.middleware'
import { prisma } from '../lib/prisma'

export const isAdmin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { isAdmin: true }
    })
    if (!user?.isAdmin) {
      res.status(403).json({ success: false, message: 'Admin access required.' })
      return
    }
    next()
  } catch {
    res.status(403).json({ success: false, message: 'Access denied.' })
  }
}
