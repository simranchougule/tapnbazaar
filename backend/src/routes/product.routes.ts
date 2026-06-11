import { Router } from 'express'
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
  getTrendingProducts,
  getNearbyProducts,
} from '../controllers/product.controller'
import { protect } from '../middleware/auth.middleware'

const router = Router()

// Protected static routes — must be before /:id
router.get('/user/my-listings', protect, getMyProducts)

// Public routes
router.get('/',         getProducts)
router.get('/trending', getTrendingProducts)
router.get('/nearby',   getNearbyProducts)
router.get('/:id',      getProduct)

// Protected routes
router.post('/',    protect, createProduct)
router.put('/:id',  protect, updateProduct)
router.delete('/:id', protect, deleteProduct)

export default router
