// src/routes/auth.routes.ts
// This file connects URLs to controller functions
// Think of it like a phone directory:
// "If someone calls /register, connect them to the register function"

import { Router } from 'express'
import { register, login, getMe, logout, updateProfile, getPublicProfile, verifyEmail, sendPhoneOtp, verifyPhoneOtp, changePassword } from '../controllers/auth.controller'
import { protect } from '../middleware/auth.middleware'

const router = Router()

router.post('/register',       register)
router.post('/login',          login)
router.post('/logout',         logout)
router.get('/verify-email',    verifyEmail)
router.get('/me',              protect, getMe)
router.put('/profile',         protect, updateProfile)
router.put('/change-password', protect, changePassword)
router.post('/send-otp',       protect, sendPhoneOtp)
router.post('/verify-otp',     protect, verifyPhoneOtp)
router.get('/users/:id',       getPublicProfile)

export default router