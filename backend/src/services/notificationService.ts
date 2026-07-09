import { prisma } from '../lib/prisma'
import { Server } from 'socket.io'
import { randomUUID } from 'crypto'

let _io: Server | null = null

export const setIo = (io: Server) => { _io = io }

export type NotificationType = 'new_message' | 'product_sold' | 'price_drop'

export const sendNotification = async (params: {
  userId:  string
  type:    NotificationType
  title:   string
  body:    string
  link?:   string
}) => {
  const notification = await prisma.notification.create({
    data: {
      userId: params.userId,
      type:   params.type,
      title:  params.title,
      body:   params.body,
      link:   params.link,
    },
  })

  // Push real-time to user's personal socket room
  if (_io) {
    _io.to(`user:${params.userId}`).emit('notification', notification)
  }

  return notification
}

// Fan-out variant for sending the *same* notification content to many
// users at once (e.g. price-drop alerts to everyone who favorited a
// listing). A single batched insert instead of N individual awaited
// `create` calls, so a listing with hundreds/thousands of favoriters
// doesn't turn into hundreds/thousands of sequential round trips inside
// one request. IDs are generated up front so the DB rows and the
// real-time socket payloads reference the same notification id.
export const sendBulkNotifications = async (
  targets: { userId: string }[],
  content: { type: NotificationType; title: string; body: string; link?: string }
) => {
  if (targets.length === 0) return

  const createdAt = new Date()
  const notifications = targets.map((t) => ({
    id:        randomUUID(),
    userId:    t.userId,
    type:      content.type,
    title:     content.title,
    body:      content.body,
    link:      content.link,
    isRead:    false,
    createdAt,
  }))

  await prisma.notification.createMany({ data: notifications })

  if (_io) {
    for (const n of notifications) {
      _io.to(`user:${n.userId}`).emit('notification', n)
    }
  }
}