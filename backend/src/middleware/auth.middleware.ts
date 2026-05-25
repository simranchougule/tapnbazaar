// src/middleware/auth.middleware.ts
// This runs BEFORE protected routes
// Like a security guard who checks your ID before letting you in
// If you have a valid token → you get in
// If not → you get a 401 Unauthorized error

import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'

// We extend the Request type to add our user info to it
// This way TypeScript knows req.user exists in protected routes
export interface AuthRequest extends Request {
  user?: {
    userId: string
    email: string
  }
}

export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Token comes in the header like: Authorization: Bearer eyJhbG...
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Not authorized. Please login first.',
      })
      return
    }

    // Extract the token part after "Bearer "
    const token = authHeader.split(' ')[1]

    // Verify the token is real and not expired
    const decoded = verifyToken(token)

    // Attach user info to the request so routes can use it
    req.user = decoded

    // Move on to the actual route
    next()
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token is invalid or expired. Please login again.',
    })
  }
}