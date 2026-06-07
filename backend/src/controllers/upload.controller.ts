import { Response } from 'express'
import { v2 as cloudinary } from 'cloudinary'
import { AuthRequest } from '../middleware/auth.middleware'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const uploadSingleImage = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No image provided' })
      return
    }

    const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`

    const result = await cloudinary.uploader.upload(fileStr, {
      folder: 'tapnbazaar/products',
      transformation: [
        { width: 1200, height: 900, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ],
    })

    res.status(200).json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    })
} catch (error: any) {
    console.error("Upload error:", error)
    res.status(500).json({ success: false, message: "Image upload failed. Please try again." })
  }
}

export const uploadMultipleImages = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({ success: false, message: 'No images provided' })
      return
    }

    if (req.files.length > 5) {
      res.status(400).json({ success: false, message: 'Maximum 5 images allowed' })
      return
    }

    const uploadPromises = req.files.map(async (file) => {
      const fileStr = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`
      const result  = await cloudinary.uploader.upload(fileStr, {
        folder: 'tapnbazaar/products',
        transformation: [
          { width: 1200, height: 900, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
      })
      return result.secure_url
    })

    const urls = await Promise.all(uploadPromises)

    res.status(200).json({
      success: true,
      urls,
      message: `${urls.length} images uploaded successfully`,
    })
} catch (error: any) {
    console.error("Upload error:", error)
    res.status(500).json({ success: false, message: "Image upload failed. Please try again." })
  }
}