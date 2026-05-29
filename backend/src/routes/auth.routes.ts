// src/routes/auth.routes.ts
// This file connects URLs to controller functions
// Think of it like a phone directory:
// "If someone calls /register, connect them to the register function"

import { Router } from 'express'
import { register, login, getMe, logout, updateProfile, getPublicProfile } from '../controllers/auth.controller'
import { protect } from '../middleware/auth.middleware'

const router = Router()

router.post('/register',   register)
router.post('/login',      login)
router.post('/logout',     logout)
router.get('/me',          protect, getMe)
router.put('/profile',     protect, updateProfile)
router.get('/users/:id',   getPublicProfile)

export default router