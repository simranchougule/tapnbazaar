import { Router } from 'express'
import { getOrCreateChat, getMyChats, getChatMessages, getUnreadCount, getSingleChat } from '../controllers/chat.controller'
import { protect } from '../middleware/auth.middleware'

const router = Router()

router.get('/',                        protect, getMyChats)
router.get('/unread',                  protect, getUnreadCount)
router.get('/product/:productId',      protect, getOrCreateChat)
router.get('/:chatId/messages',        protect, getChatMessages)
router.get('/:chatId',                 protect, getSingleChat)

export default router
