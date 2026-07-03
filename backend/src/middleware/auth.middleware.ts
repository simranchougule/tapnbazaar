import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'
import { prisma } from '../lib/prisma'

export interface AuthRequest extends Request {
  user?: {
    userId: string
    email: string
  }
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Not authorized. Please login first.',
      })
      return
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { isBanned: true },
    })

    if (!user) {
      res.status(401).json({ success: false, message: 'User no longer exists.' })
      return
    }

    if (user.isBanned) {
      res.status(403).json({ success: false, message: 'This account has been suspended.' })
      return
    }

    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token is invalid or expired. Please login again.',
    })
  }
}

// Like protect but does NOT reject unauthenticated requests.
// Populates req.user if a valid token is present, otherwise continues as guest.
export const optionalProtect = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    if (authHeader?.startsWith('Bearer ')) {
      const token   = authHeader.split(' ')[1]
      const decoded = verifyToken(token)
      const user    = await prisma.user.findUnique({
        where:  { id: decoded.userId },
        select: { isBanned: true },
      })
      if (user && !user.isBanned) req.user = decoded
    }
  } catch { /* invalid token — treat as guest */ }
  next()
}