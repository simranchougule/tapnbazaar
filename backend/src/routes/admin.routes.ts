import { Router } from 'express'
import { getStats, getUsers, getAllProducts, deleteProductAdmin } from '../controllers/admin.controller'
import { protect } from '../middleware/auth.middleware'

const router = Router()

router.get('/stats',           protect, getStats)
router.get('/users',           protect, getUsers)
router.get('/products',        protect, getAllProducts)
router.delete('/products/:id', protect, deleteProductAdmin)

export default router
