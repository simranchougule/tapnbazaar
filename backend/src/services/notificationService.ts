import { prisma } from '../lib/prisma'
import { Server } from 'socket.io'

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
