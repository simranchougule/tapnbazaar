"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSingleChat = exports.getUnreadCount = exports.getChatMessages = exports.getMyChats = exports.getOrCreateChat = void 0;
const prisma_1 = require("../lib/prisma");
// GET or CREATE a chat between buyer and seller for a product
const getOrCreateChat = async (req, res) => {
    try {
        const buyerId = req.user.userId;
        const productId = req.params.productId;
        const product = await prisma_1.prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }
        const sellerId = product.userId;
        if (buyerId === sellerId) {
            res.status(400).json({ success: false, message: 'You cannot chat with yourself' });
            return;
        }
        // Find existing chat for this product between these two users
        let chat = await prisma_1.prisma.chat.findFirst({
            where: {
                productId,
                participants: {
                    every: { userId: { in: [buyerId, sellerId] } },
                },
            },
            include: {
                participants: { include: { user: { select: { id: true, name: true, avatar: true } } } },
                product: { select: { id: true, title: true, price: true, images: true } },
                messages: { orderBy: { createdAt: 'asc' }, include: { sender: { select: { id: true, name: true } } } },
            },
        });
        if (!chat) {
            chat = await prisma_1.prisma.chat.create({
                data: {
                    productId,
                    participants: {
                        create: [{ userId: buyerId }, { userId: sellerId }],
                    },
                },
                include: {
                    participants: { include: { user: { select: { id: true, name: true, avatar: true } } } },
                    product: { select: { id: true, title: true, price: true, images: true } },
                    messages: { orderBy: { createdAt: 'asc' }, include: { sender: { select: { id: true, name: true } } } },
                },
            });
        }
        res.status(200).json({ success: true, chat });
    }
    catch (error) {
        console.error('getOrCreateChat error:', error);
        res.status(500).json({ success: false, message: 'Something went wrong.' });
    }
};
exports.getOrCreateChat = getOrCreateChat;
// GET all chats for the logged-in user
const getMyChats = async (req, res) => {
    try {
        const userId = req.user.userId;
        const chats = await prisma_1.prisma.chat.findMany({
            where: {
                participants: { some: { userId } },
            },
            include: {
                participants: { include: { user: { select: { id: true, name: true, avatar: true } } } },
                product: { select: { id: true, title: true, price: true, images: true } },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    include: { sender: { select: { id: true, name: true } } },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json({ success: true, chats });
    }
    catch (error) {
        console.error('getMyChats error:', error);
        res.status(500).json({ success: false, message: 'Something went wrong.' });
    }
};
exports.getMyChats = getMyChats;
// GET all messages in a chat
const getChatMessages = async (req, res) => {
    try {
        const userId = req.user.userId;
        const chatId = req.params.chatId;
        const participant = await prisma_1.prisma.chatParticipant.findUnique({
            where: { chatId_userId: { chatId, userId } },
        });
        if (!participant) {
            res.status(403).json({ success: false, message: 'Not a participant of this chat' });
            return;
        }
        const messages = await prisma_1.prisma.message.findMany({
            where: { chatId },
            include: { sender: { select: { id: true, name: true, avatar: true } } },
            orderBy: { createdAt: 'asc' },
        });
        // Mark messages as read
        await prisma_1.prisma.message.updateMany({
            where: { chatId, receiverId: userId, isRead: false },
            data: { isRead: true },
        });
        res.status(200).json({ success: true, messages });
    }
    catch (error) {
        console.error('getChatMessages error:', error);
        res.status(500).json({ success: false, message: 'Something went wrong.' });
    }
};
exports.getChatMessages = getChatMessages;
// GET unread message count
const getUnreadCount = async (req, res) => {
    try {
        const count = await prisma_1.prisma.message.count({
            where: { receiverId: req.user.userId, isRead: false },
        });
        res.status(200).json({ success: true, count });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Something went wrong.' });
    }
};
exports.getUnreadCount = getUnreadCount;
const getSingleChat = async (req, res) => {
    try {
        const chatId = req.params.chatId;
        const userId = req.user.userId;
        const chat = await prisma_1.prisma.chat.findUnique({
            where: { id: chatId },
            include: {
                product: { select: { id: true, title: true, price: true, images: true } },
                participants: { include: { user: { select: { id: true, name: true, avatar: true } } } },
                messages: {
                    orderBy: { createdAt: 'asc' },
                    include: { sender: { select: { id: true, name: true, avatar: true } } },
                },
            },
        });
        if (!chat) {
            res.status(404).json({ success: false, message: 'Chat not found' });
            return;
        }
        const isParticipant = chat.participants.some((p) => p.user.id === userId);
        if (!isParticipant) {
            res.status(403).json({ success: false, message: 'Access denied' });
            return;
        }
        res.json({ success: true, chat, messages: chat.messages });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Something went wrong.' });
    }
};
exports.getSingleChat = getSingleChat;
//# sourceMappingURL=chat.controller.js.map