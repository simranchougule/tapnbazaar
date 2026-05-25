import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import authRoutes from './routes/auth.routes'
import productRoutes from './routes/product.routes'

const app = express()

app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ─── ROUTES ──────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes)
app.use('/api/products', productRoutes)

// ─── HEALTH CHECK ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'TapnBazaar API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  })
})

// ─── 404 HANDLER ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log('')
  console.log('🚀 TapnBazaar API Server Started!')
  console.log(`📡 Running on: http://localhost:${PORT}`)
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`)
  console.log('')
})

export default app