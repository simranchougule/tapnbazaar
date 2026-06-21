import dotenv from 'dotenv'
const envResult = dotenv.config()
if (envResult.error) {
  console.error('⚠️  Failed to load .env file:', envResult.error.message)
} else if (!process.env.DATABASE_URL) {
  console.error('⚠️  .env loaded but DATABASE_URL is missing — check the file for typos')
}

import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { prisma } from './lib/prisma'
import { verifyToken } from './utils/jwt'
import { setIo, sendNotification } from './services/notificationService'
import authRoutes         from './routes/auth.routes'
import productRoutes      from './routes/product.routes'
import categoryRoutes     from './routes/category.routes'
import uploadRoutes       from './routes/upload.routes'
import favoriteRoutes     from './routes/favorite.routes'
import chatRoutes         from './routes/chat.routes'
import notificationRoutes from './routes/notification.routes'
import adminRoutes        from './routes/admin.routes'
import locationRoutes     from './routes/location.routes'
import reportRoutes       from './routes/report.routes'
import reviewRoutes       from './routes/review.routes'

const app        = express()
const httpServer = createServer(app)
const io         = new Server(httpServer, {
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true },
})

// Give the notification service access to io
setIo(io)

app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Rate limiting
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { success: false, message: 'Too many attempts, please try again after 15 minutes.' } })
const otpLimiter  = rateLimit({ windowMs: 10 * 60 * 1000, max: 10, message: { success: false, message: 'Too many OTP requests, please try again after 10 minutes.' } })
const apiLimiter  = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 })
app.use('/api/auth/login',      authLimiter)
app.use('/api/auth/register',   authLimiter)
app.use('/api/auth/send-otp',   otpLimiter)
app.use('/api/auth/verify-otp', otpLimiter)
app.use('/api/', apiLimiter)

// ─── REST ROUTES ─────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes)
app.use('/api/products',      productRoutes)
app.use('/api/categories',    categoryRoutes)
app.use('/api/upload',        uploadRoutes)
app.use('/api/favorites',     favoriteRoutes)
app.use('/api/chats',         chatRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/admin',         adminRoutes)
app.use('/api/locations',     locationRoutes)
app.use('/api/reports',       reportRoutes)
app.use('/api/reviews',       reviewRoutes)

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'TapnBazaar API is running!', timestamp: new Date().toISOString() })
})

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` })
})

// ─── SOCKET.IO ───────────────────────────────────────────────────────────────
io.use((socket, next) => {
  const token = socket.handshake.auth.token
  if (!token) return next(new Error('Authentication required'))
  try {
    const decoded      = verifyToken(token)
    socket.data.userId = decoded.userId
    next()
  } catch {
    next(new Error('Invalid token'))
  }
})

io.on('connection', (socket) => {
  const userId = socket.data.userId
  socket.join(`user:${userId}`)

  socket.on('join_chat',  (chatId: string) => socket.join(`chat:${chatId}`))
  socket.on('leave_chat', (chatId: string) => socket.leave(`chat:${chatId}`))

  socket.on('send_message', async (data: { chatId: string; content: string }) => {
    try {
      const { chatId, content } = data
      if (!content?.trim()) return

      const participant = await prisma.chatParticipant.findUnique({
        where: { chatId_userId: { chatId, userId } },
      })
      if (!participant) return

      const other = await prisma.chatParticipant.findFirst({
        where: { chatId, userId: { not: userId } },
      })
      if (!other) return

      const message = await prisma.message.create({
        data: {
          chatId,
          content:    content.trim(),
          senderId:   userId,
          receiverId: other.userId,
        },
        include: { sender: { select: { id: true, name: true, avatar: true } } },
      })

      io.to(`chat:${chatId}`).emit('new_message', message)
      io.to(`user:${other.userId}`).emit('unread_update')

      // ── New message notification ──────────────────────────────────────────
      const chat = await prisma.chat.findUnique({
        where:   { id: chatId },
        include: { product: { select: { title: true } } },
      })
      await sendNotification({
        userId: other.userId,
        type:   'new_message',
        title:  `New message from ${message.sender.name}`,
        body:   `"${content.trim().slice(0, 60)}${content.length > 60 ? '…' : ''}"`,
        link:   `/chats/${chatId}`,
      })
    } catch (error) {
      console.error('send_message error:', error)
    }
  })

  socket.on('disconnect', () => {})
})

// ─── START ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => {
  console.log('')
  console.log('🚀 TapnBazaar API Server Started!')
  console.log(`📡 Running on: http://localhost:${PORT}`)
  console.log(`💬 Socket.io + 🔔 Notifications ready`)
  console.log('')
})

export default app
