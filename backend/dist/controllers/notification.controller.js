"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markOneRead = exports.markAllRead = exports.getNotifications = void 0;
const prisma_1 = require("../lib/prisma");
const getNotifications = async (req, res) => {
    try {
        const notifications = await prisma_1.prisma.notification.findMany({
            where: { userId: req.user.userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        const unreadCount = notifications.filter(n => !n.isRead).length;
        res.status(200).json({ success: true, notifications, unreadCount });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Something went wrong.' });
    }
};
exports.getNotifications = getNotifications;
const markAllRead = async (req, res) => {
    try {
        await prisma_1.prisma.notification.updateMany({
            where: { userId: req.user.userId, isRead: false },
            data: { isRead: true },
        });
        res.status(200).json({ success: true });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Something went wrong.' });
    }
};
exports.markAllRead = markAllRead;
const markOneRead = async (req, res) => {
    try {
        await prisma_1.prisma.notification.update({
            where: { id: req.params.id, userId: req.user.userId },
            data: { isRead: true },
        });
        res.status(200).json({ success: true });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Something went wrong.' });
    }
};
exports.markOneRead = markOneRead;
//# sourceMappingURL=notification.controller.js.map