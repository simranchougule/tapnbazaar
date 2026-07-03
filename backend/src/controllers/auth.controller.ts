import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { prisma } from '../lib/prisma'
import { generateToken } from '../utils/jwt'
import { AuthRequest } from '../middleware/auth.middleware'
import { sendEmailVerification, sendOtpEmail, sendSmsOtp } from '../services/emailService'

const DISPOSABLE_DOMAINS = ['mailinator.com','guerrillamail.com','10minutemail.com','throwam.com','tempmail.com','yopmail.com','sharklasers.com','trashmail.com']

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

    const domain = email.toLowerCase().split('@')[1]
    if (DISPOSABLE_DOMAINS.includes(domain)) {
      res.status(400).json({ success: false, message: 'Disposable email addresses are not allowed' }); return
    }

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existingUser) {
      res.status(400).json({ success: false, message: 'An account with this email already exists' }); return
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const emailVerifyToken  = crypto.randomBytes(32).toString('hex')
    const emailVerifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone: phone || null,
        city: city || null,
        state: state || null,
        emailVerifyToken,
        emailVerifyExpiry,
      },
    })

    sendEmailVerification(user.email, emailVerifyToken).catch(() => {})

    const token = generateToken({ userId: user.id, email: user.email })

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: user.id, name: user.name, email: user.email, phone: user.phone,
        avatar: user.avatar, city: user.city, state: user.state,
        isVerified: user.isVerified, isAdmin: user.isAdmin,
        phoneVerified: user.phoneVerified, emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' })
  }
}

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide email and password' }); return
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' }); return
    }

   const isPasswordCorrect = await bcrypt.compare(password, user.password)
    if (!isPasswordCorrect) {
      res.status(401).json({ success: false, message: 'Invalid email or password' }); return
    }

    if (user.isBanned) {
      res.status(403).json({ success: false, message: 'This account has been suspended.' }); return
    }

    const token = generateToken({ userId: user.id, email: user.email })

    res.status(200).json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: {
        id: user.id, name: user.name, email: user.email, phone: user.phone,
        avatar: user.avatar, city: user.city, state: user.state,
        isVerified: user.isVerified, isAdmin: user.isAdmin,
        phoneVerified: user.phoneVerified, emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' })
  }
}

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.userId },
      select: {
        id: true, name: true, email: true, phone: true, avatar: true,
        bio: true, city: true, state: true, createdAt: true,
        isVerified: true, isAdmin: true, isBanned: true, isTrusted: true,
        phoneVerified: true, emailVerified: true,
        _count: { select: { products: true } },
      },
    })
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return }
    res.status(200).json({ success: true, user })
  } catch (error) {
    console.error('Get me error:', error)
    res.status(500).json({ success: false, message: 'Something went wrong.' })
  }
}

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

export const updateAvatar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) { res.status(400).json({ success: false, message: 'No image provided' }); return }
    const { v2: cloudinary } = await import('cloudinary')
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key:    process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })
    const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
    const result  = await cloudinary.uploader.upload(fileStr, {
      folder: 'tapnbazaar/avatars',
      transformation: [{ width: 300, height: 300, crop: 'fill', gravity: 'face' }, { quality: 'auto' }],
    })
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data:  { avatar: result.secure_url },
    })
    res.status(200).json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, avatar: user.avatar, city: user.city, state: user.state, isVerified: user.isVerified },
    })
  } catch (error) {
    console.error('Avatar upload error:', error)
    res.status(500).json({ success: false, message: 'Avatar upload failed.' })
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

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.query
    if (!token) { res.status(400).json({ success: false, message: 'Token is required' }); return }

    const user = await prisma.user.findFirst({ where: { emailVerifyToken: token as string } })
    if (!user) { res.status(400).json({ success: false, message: 'Invalid or expired token' }); return }

    if (!user.emailVerifyExpiry || new Date() > user.emailVerifyExpiry) {
      res.status(400).json({ success: false, message: 'This verification link has expired. Please request a new one.' })
      return
    }

    await prisma.user.update({
      where: { id: user.id },
      data:  { emailVerified: true, isVerified: true, emailVerifyToken: null, emailVerifyExpiry: null },
    })

    res.status(200).json({ success: true, message: 'Email verified successfully!' })
  } catch {
    res.status(500).json({ success: false, message: 'Something went wrong.' })
  }
}

export const sendPhoneOtp = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { phone } = req.body
    if (!phone || !/^\d{10}$/.test(phone.replace(/\s/g, ''))) {
      res.status(400).json({ success: false, message: 'Please provide a valid 10-digit phone number' }); return
    }

    const otp    = Math.floor(100000 + Math.random() * 900000).toString()
    const expiry = new Date(Date.now() + 10 * 60 * 1000)
    // DEV MODE: log OTP to terminal so you can test without SMS
    if (process.env.NODE_ENV === 'development') {
      console.log('\n==================================')
      console.log('📱 DEV MODE OTP:', otp, '| Phone:', phone)
      console.log('==================================\n')
    }

    const hashedOtp = await bcrypt.hash(otp, 10)

await prisma.user.update({
      where: { id: req.user!.userId },
      data:  { phone, phoneOtp: hashedOtp, phoneOtpExpiry: expiry, phoneOtpAttempts: 0 },
    })

    // Send OTP via SMS
    const smsSent = await sendSmsOtp(phone.replace(/\s/g, ''), otp)
    if (!smsSent) {
      if (process.env.NODE_ENV === 'development') {
        // In dev mode — SMS not configured, but OTP is printed in terminal above
        console.log('[DEV] SMS not sent — use the OTP printed in terminal above')
        res.status(200).json({ success: true, message: 'DEV MODE: Check backend terminal for OTP' })
        return
      }
      // In production — clear OTP and return error
      await prisma.user.update({
        where: { id: req.user!.userId },
        data:  { phoneOtp: null, phoneOtpExpiry: null },
      })
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.',
      })
      return
    }

    res.status(200).json({ success: true, message: 'OTP sent to your mobile number' })
  } catch {
    res.status(500).json({ success: false, message: 'Something went wrong.' })
  }
}

export const verifyPhoneOtp = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { otp } = req.body
    if (!otp) { res.status(400).json({ success: false, message: 'OTP is required' }); return }

    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } })
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return }

if (!user.phoneOtp || !user.phoneOtpExpiry) {
      res.status(400).json({ success: false, message: 'No OTP found. Please request a new one.' }); return
    }
    if (new Date() > user.phoneOtpExpiry) {
      res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' }); return
    }
    if (user.phoneOtpAttempts >= 5) {
      res.status(429).json({ success: false, message: 'Too many failed attempts. Please request a new OTP.' }); return
    }
    const otpValid = await bcrypt.compare(otp, user.phoneOtp)
    if (!otpValid) {
      await prisma.user.update({
        where: { id: user.id },
        data:  { phoneOtpAttempts: { increment: 1 } },
      })
      res.status(400).json({ success: false, message: 'Invalid OTP' }); return
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data:  { phoneVerified: true, phoneOtp: null, phoneOtpExpiry: null, phoneOtpAttempts: 0 },
    })

    res.status(200).json({
      success: true,
      message: 'Phone number verified!',
      user: {
        id: updated.id, name: updated.name, email: updated.email, phone: updated.phone,
        avatar: updated.avatar, city: updated.city, state: updated.state,
        isVerified: updated.isVerified, isAdmin: updated.isAdmin,
        phoneVerified: updated.phoneVerified, emailVerified: updated.emailVerified,
      },
    })
  } catch {
    res.status(500).json({ success: false, message: 'Something went wrong.' })
  }
}

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) { res.status(400).json({ success: false, message: 'All fields are required' }); return }
    if (newPassword.length < 6) { res.status(400).json({ success: false, message: 'Password must be at least 6 characters' }); return }

    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } })
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return }

    const valid = await bcrypt.compare(currentPassword, user.password)
    if (!valid) { res.status(400).json({ success: false, message: 'Current password is incorrect' }); return }

    const hashed = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } })

    res.status(200).json({ success: true, message: 'Password updated successfully!' })
  } catch {
    res.status(500).json({ success: false, message: 'Something went wrong.' })
  }
}

// Fix #16: Forgot password — generates a reset token and emails it
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body
    if (!email) { res.status(400).json({ success: false, message: 'Email is required' }); return }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })

    // Always respond with success to avoid revealing whether an account exists
    if (!user) {
      res.status(200).json({ success: true, message: 'If an account exists with that email, a reset link has been sent.' }); return
    }

    const resetToken  = crypto.randomBytes(32).toString('hex')
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data:  { resetPasswordToken: resetToken, resetPasswordExpiry: resetExpiry },
    })

    const { sendPasswordResetEmail } = await import('../services/emailService')
    await sendPasswordResetEmail(user.email, resetToken).catch(() => {})

    res.status(200).json({ success: true, message: 'If an account exists with that email, a reset link has been sent.' })
  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({ success: false, message: 'Something went wrong.' })
  }
}

// Fix #16: Reset password — validates the token and sets the new password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body
    if (!token || !newPassword) { res.status(400).json({ success: false, message: 'Token and new password are required' }); return }
    if (newPassword.length < 6)  { res.status(400).json({ success: false, message: 'Password must be at least 6 characters' }); return }

    const user = await prisma.user.findFirst({ where: { resetPasswordToken: token } })
    if (!user || !user.resetPasswordExpiry) {
      res.status(400).json({ success: false, message: 'Invalid or expired reset link. Please request a new one.' }); return
    }
    if (new Date() > user.resetPasswordExpiry) {
      res.status(400).json({ success: false, message: 'Reset link has expired. Please request a new one.' }); return
    }

    const hashed = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({
      where: { id: user.id },
      data:  { password: hashed, resetPasswordToken: null, resetPasswordExpiry: null },
    })

    res.status(200).json({ success: true, message: 'Password reset successfully! You can now log in.' })
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({ success: false, message: 'Something went wrong.' })
  }
}