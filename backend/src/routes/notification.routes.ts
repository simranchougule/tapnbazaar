import { Router } from 'express'
import { getNotifications, markAllRead, markOneRead } from '../controllers/notification.controller'
import { protect } from '../middleware/auth.middleware'

const router = Router()

router.get('/',           protect, getNotifications)
router.put('/read-all',   protect, markAllRead)
router.put('/:id/read',   protect, markOneRead)

export default router
