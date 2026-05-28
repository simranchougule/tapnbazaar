import { Router } from 'express'
import { uploadSingleImage, uploadMultipleImages } from '../controllers/upload.controller'
import { protect } from '../middleware/auth.middleware'
import { upload } from '../middleware/upload.middleware'

const router = Router()

router.post('/single', protect, upload.single('image'), uploadSingleImage)
router.post('/multiple', protect, upload.array('images', 5), uploadMultipleImages)

export default router