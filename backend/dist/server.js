"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const prisma_1 = require("./lib/prisma");
const jwt_1 = require("./utils/jwt");
const notificationService_1 = require("./services/notificationService");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
const favorite_routes_1 = __importDefault(require("./routes/favorite.routes"));
const chat_routes_1 = __importDefault(require("./routes/chat.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const location_routes_1 = __importDefault(require("./routes/location.routes"));
const report_routes_1 = __importDefault(require("./routes/report.routes"));
const review_routes_1 = __importDefault(require("./routes/review.routes"));
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true },
});
// Give the notification service access to io
(0, notificationService_1.setIo)(io);
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Rate limiting
const authLimiter = (0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000, max: 20, message: { success: false, message: 'Too many attempts, please try again after 15 minutes.' } });
const apiLimiter = (0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/', apiLimiter);
// ─── REST ROUTES ─────────────────────────────────────────────────────────────
app.use('/api/auth', auth_routes_1.default);
app.use('/api/products', product_routes_1.default);
app.use('/api/categories', category_routes_1.default);
app.use('/api/upload', upload_routes_1.default);
app.use('/api/favorites', favorite_routes_1.default);
app.use('/api/chats', chat_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api/locations', location_routes_1.default);
app.use('/api/reports', report_routes_1.default);
app.use('/api/reviews', review_routes_1.default);
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'TapnBazaar API is running!', timestamp: new Date().toISOString() });
});
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});
// ─── SOCKET.IO ───────────────────────────────────────────────────────────────
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token)
        return next(new Error('Authentication required'));
    try {
        const decoded = (0, jwt_1.verifyToken)(token);
        socket.data.userId = decoded.userId;
        next();
    }
    catch {
        next(new Error('Invalid token'));
    }
});
io.on('connection', (socket) => {
    const userId = socket.data.userId;
    socket.join(`user:${userId}`);
    socket.on('join_chat', (chatId) => socket.join(`chat:${chatId}`));
    socket.on('leave_chat', (chatId) => socket.leave(`chat:${chatId}`));
    socket.on('send_message', async (data) => {
        try {
            const { chatId, content } = data;
            if (!content?.trim())
                return;
            const participant = await prisma_1.prisma.chatParticipant.findUnique({
                where: { chatId_userId: { chatId, userId } },
            });
            if (!participant)
                return;
            const other = await prisma_1.prisma.chatParticipant.findFirst({
                where: { chatId, userId: { not: userId } },
            });
            if (!other)
                return;
            const message = await prisma_1.prisma.message.create({
                data: {
                    chatId,
                    content: content.trim(),
                    senderId: userId,
                    receiverId: other.userId,
                },
                include: { sender: { select: { id: true, name: true, avatar: true } } },
            });
            io.to(`chat:${chatId}`).emit('new_message', message);
            io.to(`user:${other.userId}`).emit('unread_update');
            // ── New message notification ──────────────────────────────────────────
            const chat = await prisma_1.prisma.chat.findUnique({
                where: { id: chatId },
                include: { product: { select: { title: true } } },
            });
            await (0, notificationService_1.sendNotification)({
                userId: other.userId,
                type: 'new_message',
                title: `New message from ${message.sender.name}`,
                body: `"${content.trim().slice(0, 60)}${content.length > 60 ? '…' : ''}"`,
                link: `/chats/${chatId}`,
            });
        }
        catch (error) {
            console.error('send_message error:', error);
        }
    });
    socket.on('disconnect', () => { });
});
// ─── START ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log('');
    console.log('🚀 TapnBazaar API Server Started!');
    console.log(`📡 Running on: http://localhost:${PORT}`);
    console.log(`💬 Socket.io + 🔔 Notifications ready`);
    console.log('');
});
exports.default = app;
//# sourceMappingURL=server.js.map