"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = void 0;
const prisma_1 = require("../lib/prisma");
const isAdmin = async (req, res, next) => {
    try {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { isAdmin: true }
        });
        if (!user?.isAdmin) {
            res.status(403).json({ success: false, message: 'Admin access required.' });
            return;
        }
        next();
    }
    catch {
        res.status(403).json({ success: false, message: 'Access denied.' });
    }
};
exports.isAdmin = isAdmin;
//# sourceMappingURL=admin.middleware.js.map