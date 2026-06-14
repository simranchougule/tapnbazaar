import { Router } from 'express'
import {
  getStats, getUsers, getAllProducts, deleteProductAdmin,
  banUser, markTrusted, getReports,
} from '../controllers/admin.controller'
import { protect } from '../middleware/auth.middleware'
import { isAdmin } from '../middleware/admin.middleware'

const router = Router()

router.get('/stats',              protect, isAdmin, getStats)
router.get('/users',              protect, isAdmin, getUsers)
router.get('/products',           protect, isAdmin, getAllProducts)
router.get('/reports',            protect, isAdmin, getReports)
router.delete('/products/:id',    protect, isAdmin, deleteProductAdmin)
router.patch('/users/:id/ban',    protect, isAdmin, banUser)
router.patch('/users/:id/trust',  protect, isAdmin, markTrusted)

export default router
