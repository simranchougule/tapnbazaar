"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = exports.setIo = void 0;
const prisma_1 = require("../lib/prisma");
let _io = null;
const setIo = (io) => { _io = io; };
exports.setIo = setIo;
const sendNotification = async (params) => {
    const notification = await prisma_1.prisma.notification.create({
        data: {
            userId: params.userId,
            type: params.type,
            title: params.title,
            body: params.body,
            link: params.link,
        },
    });
    // Push real-time to user's personal socket room
    if (_io) {
        _io.to(`user:${params.userId}`).emit('notification', notification);
    }
    return notification;
};
exports.sendNotification = sendNotification;
//# sourceMappingURL=notificationService.js.map