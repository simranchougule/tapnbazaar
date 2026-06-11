import { Router } from 'express'
import { reportProduct, reportUser, getProductReports, getUserReports } from '../controllers/report.controller'
import { protect } from '../middleware/auth.middleware'
import { isAdmin } from '../middleware/admin.middleware'

const router = Router()

router.post('/product/:productId', protect, reportProduct)
router.post('/user/:reportedUserId', protect, reportUser)
router.get('/admin/products', protect, isAdmin, getProductReports)
router.get('/admin/users',    protect, isAdmin, getUserReports)

export default router
