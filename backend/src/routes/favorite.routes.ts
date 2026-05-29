import { Router } from 'express'
import { toggleFavorite, getMyFavorites } from '../controllers/favorite.controller'
import { protect } from '../middleware/auth.middleware'

const router = Router()

router.post('/:productId', protect, toggleFavorite)
router.get('/',            protect, getMyFavorites)

export default router
