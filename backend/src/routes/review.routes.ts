import { Router } from 'express'
import { createReview, getSellerReviews, canReview } from '../controllers/review.controller'
import { protect } from '../middleware/auth.middleware'

const router = Router()

router.post('/',                        protect, createReview)
router.get('/user/:userId',             getSellerReviews)
router.get('/can-review/:productId',    protect, canReview)

export default router
