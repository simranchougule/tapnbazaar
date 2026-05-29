// src/controllers/auth.controller.ts
// This file handles all authentication logic
// Register, Login, Get current user, Logout

import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { generateToken } from '../utils/jwt'
import { AuthRequest } from '../middleware/auth.middleware'

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone, city, state } = req.body
    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Please provide name, email and password' }); return
    }
    if (password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters' }); return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ success: false, message: 'Please provide a valid email address' }); return
    }

    // Step 2 — Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      })
      return
    }

    // Step 3 — Hash the password
    // NEVER store plain text passwords in database
    // bcrypt turns "mypassword123" into "$2b$10$xyz..." (unreadable)
    // The 12 means how many times to scramble it — higher = safer but slower
    const hashedPassword = await bcrypt.hash(password, 12)

    // Step 4 — Create the user in database
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone: phone || null,
        city: city || null,
        state: state || null,
      },
    })

    // Step 5 — Generate a JWT token for immediate login after register
    const token = generateToken({
      userId: user.id,
      email: user.email,
    })

    // Step 6 — Send response (never send the password back!)
    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        city: user.city,
        state: user.state,
        isVerified: user.isVerified,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.',
    })
  }
}

// ─── LOGIN ───────────────────────────────────────────────────────────────────
// POST /api/auth/login
// Logs in existing user and returns a token
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body

    // Step 1 — Check fields provided
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      })
      return
    }

    // Step 2 — Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      // Don't say "email not found" — security risk
      // Always say generic message so hackers can't guess emails
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
      return
    }

    // Step 3 — Check password
    // bcrypt compares the plain text with the hashed version
    const isPasswordCorrect = await bcrypt.compare(password, user.password)

    if (!isPasswordCorrect) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
      return
    }

    // Step 4 — Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    })

    // Step 5 — Send response
    res.status(200).json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        city: user.city,
        state: user.state,
        isVerified: user.isVerified,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.',
    })
  }
}

// ─── GET CURRENT USER ────────────────────────────────────────────────────────
// GET /api/auth/me
// Returns the currently logged in user's info
// This is a PROTECTED route — requires valid token
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // req.user was set by the protect middleware
    const user = await prisma.user.findUnique({
      where: { id: req.user?.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        bio: true,
        city: true,
        state: true,
        isVerified: true,
        createdAt: true,
        // Count how many products this user has posted
        _count: {
          select: { products: true }
        }
      },
    })

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      })
      return
    }

    res.status(200).json({
      success: true,
      user,
    })
  } catch (error) {
    console.error('Get me error:', error)
    res.status(500).json({
      success: false,
      message: 'Something went wrong.',
    })
  }
}

// ─── LOGOUT ──────────────────────────────────────────────────────────────────
// POST /api/auth/logout
// JWT tokens can't be truly "deleted" from server side
// The frontend just deletes the token from localStorage
// This route just confirms the logout
export const logout = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({ success: true, message: 'Logged out successfully!' })
}

export const getPublicProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id as string },
      select: {
        id: true, name: true, avatar: true, city: true, state: true, createdAt: true,
        _count: { select: { products: true } },
        products: {
          where: { status: 'ACTIVE' },
          include: { category: { select: { name: true, slug: true } } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    })
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return }
    res.status(200).json({ success: true, user })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Something went wrong.' })
  }
}

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, phone, city, state, bio } = req.body
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        ...(name  && { name }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(city  !== undefined && { city:  city  || null }),
        ...(state !== undefined && { state: state || null }),
        ...(bio   !== undefined && { bio:   bio   || null }),
      },
    })
    res.status(200).json({
      success: true,
      message: 'Profile updated!',
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, avatar: user.avatar, city: user.city, state: user.state, isVerified: user.isVerified },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Something went wrong.' })
  }
}