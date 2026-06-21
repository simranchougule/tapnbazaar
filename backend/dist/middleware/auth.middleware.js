"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jwt_1 = require("../utils/jwt");
const prisma_1 = require("../lib/prisma");
const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'Not authorized. Please login first.',
            });
            return;
        }
        const token = authHeader.split(' ')[1];
        const decoded = (0, jwt_1.verifyToken)(token);
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { isBanned: true },
        });
        if (!user) {
            res.status(401).json({ success: false, message: 'User no longer exists.' });
            return;
        }
        if (user.isBanned) {
            res.status(403).json({ success: false, message: 'This account has been suspended.' });
            return;
        }
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: 'Token is invalid or expired. Please login again.',
        });
    }
};
exports.protect = protect;
//# sourceMappingURL=auth.middleware.js.map