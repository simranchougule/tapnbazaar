import { Router } from 'express'
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
} from '../controllers/product.controller'
import { protect } from '../middleware/auth.middleware'

const router = Router()

// Public routes
router.get('/', getProducts)
router.get('/:id', getProduct)

// Protected routes
router.post('/', protect, createProduct)
router.put('/:id', protect, updateProduct)
router.delete('/:id', protect, deleteProduct)
router.get('/user/my-listings', protect, getMyProducts)

export default router