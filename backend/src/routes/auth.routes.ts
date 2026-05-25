// src/routes/auth.routes.ts
// This file connects URLs to controller functions
// Think of it like a phone directory:
// "If someone calls /register, connect them to the register function"

import { Router } from 'express'
import { register, login, getMe, logout } from '../controllers/auth.controller'
import { protect } from '../middleware/auth.middleware'

const router = Router()

// Public routes — anyone can access these
router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)

// Protected route — only logged in users can access
// protect middleware runs first, then getMe
router.get('/me', protect, getMe)

export default router