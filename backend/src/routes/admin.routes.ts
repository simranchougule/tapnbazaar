import { Router } from 'express'
import { getStats, getUsers, getAllProducts, deleteProductAdmin } from '../controllers/admin.controller'
import { protect } from '../middleware/auth.middleware'
import { isAdmin } from '../middleware/admin.middleware'

const router = Router()

router.get('/stats',           protect, isAdmin, getStats)
router.get('/users',           protect, isAdmin, getUsers)
router.get('/products',        protect, isAdmin, getAllProducts)
router.delete('/products/:id', protect, isAdmin, deleteProductAdmin)

export default router
