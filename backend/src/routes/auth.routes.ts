// src/routes/auth.routes.ts
// This file connects URLs to controller functions

import { Router } from 'express'
import {
  register, login, getMe, logout, updateProfile, updateAvatar, getPublicProfile,
  verifyEmail, sendPhoneOtp, verifyPhoneOtp, changePassword,
  forgotPassword, resetPassword,
} from '../controllers/auth.controller'
import { protect } from '../middleware/auth.middleware'
import { upload } from '../middleware/upload.middleware'

const router = Router()

router.post('/register',        register)
router.post('/login',           login)
router.post('/logout',          logout)
router.get('/verify-email',     verifyEmail)
// Fix #16: Password reset routes
router.post('/forgot-password', forgotPassword)
router.post('/reset-password',  resetPassword)
router.get('/me',               protect, getMe)
router.put('/profile',          protect, updateProfile)
router.put('/avatar',           protect, upload.single('image'), updateAvatar)
router.put('/change-password',  protect, changePassword)
router.post('/send-otp',        protect, sendPhoneOtp)
router.post('/verify-otp',      protect, verifyPhoneOtp)
router.get('/users/:id',        getPublicProfile)

export default router