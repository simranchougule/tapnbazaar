"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReports = exports.markTrusted = exports.banUser = exports.deleteProductAdmin = exports.getAllProducts = exports.getUsers = exports.getStats = void 0;
const prisma_1 = require("../lib/prisma");
const isAdmin = async (userId) => {
    const user = await prisma_1.prisma.user.findUnique({ where: { id: userId }, select: { isAdmin: true } });
    return user?.isAdmin === true;
};
const getStats = async (req, res) => {
    try {
        if (!await isAdmin(req.user.userId)) {
            res.status(403).json({ success: false, message: 'Admin only' });
            return;
        }
        const [totalUsers, totalProducts, totalMessages, activeProducts, soldProducts] = await Promise.all([
            prisma_1.prisma.user.count(),
            prisma_1.prisma.product.count(),
            prisma_1.prisma.message.count(),
            prisma_1.prisma.product.count({ where: { status: 'ACTIVE' } }),
            prisma_1.prisma.product.count({ where: { status: 'SOLD' } }),
        ]);
        res.status(200).json({ success: true, stats: { totalUsers, totalProducts, totalMessages, activeProducts, soldProducts } });
    }
    catch {
        res.status(500).json({ success: false, message: 'Something went wrong.' });
    }
};
exports.getStats = getStats;
const getUsers = async (req, res) => {
    try {
        if (!await isAdmin(req.user.userId)) {
            res.status(403).json({ success: false, message: 'Admin only' });
            return;
        }
        const users = await prisma_1.prisma.user.findMany({
            select: { id: true, name: true, email: true, city: true, state: true, isAdmin: true, createdAt: true, _count: { select: { products: true } } },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json({ success: true, users });
    }
    catch {
        res.status(500).json({ success: false, message: 'Something went wrong.' });
    }
};
exports.getUsers = getUsers;
const getAllProducts = async (req, res) => {
    try {
        if (!await isAdmin(req.user.userId)) {
            res.status(403).json({ success: false, message: 'Admin only' });
            return;
        }
        const products = await prisma_1.prisma.product.findMany({
            include: { user: { select: { id: true, name: true, email: true } }, category: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
        res.status(200).json({ success: true, products });
    }
    catch {
        res.status(500).json({ success: false, message: 'Something went wrong.' });
    }
};
exports.getAllProducts = getAllProducts;
const deleteProductAdmin = async (req, res) => {
    try {
        if (!await isAdmin(req.user.userId)) {
            res.status(403).json({ success: false, message: 'Admin only' });
            return;
        }
        await prisma_1.prisma.product.delete({ where: { id: req.params.id } });
        res.status(200).json({ success: true, message: 'Product deleted' });
    }
    catch {
        res.status(500).json({ success: false, message: 'Something went wrong.' });
    }
};
exports.deleteProductAdmin = deleteProductAdmin;
const banUser = async (req, res) => {
    try {
        if (!await isAdmin(req.user.userId)) {
            res.status(403).json({ success: false, message: 'Admin only' });
            return;
        }
        const { banned } = req.body;
        const user = await prisma_1.prisma.user.update({
            where: { id: req.params.id },
            data: { isBanned: banned ?? true },
            select: { id: true, name: true, isBanned: true },
        });
        res.status(200).json({ success: true, user });
    }
    catch {
        res.status(500).json({ success: false, message: 'Something went wrong.' });
    }
};
exports.banUser = banUser;
const markTrusted = async (req, res) => {
    try {
        if (!await isAdmin(req.user.userId)) {
            res.status(403).json({ success: false, message: 'Admin only' });
            return;
        }
        const { trusted } = req.body;
        const user = await prisma_1.prisma.user.update({
            where: { id: req.params.id },
            data: { isTrusted: trusted ?? true },
            select: { id: true, name: true, isTrusted: true },
        });
        res.status(200).json({ success: true, user });
    }
    catch {
        res.status(500).json({ success: false, message: 'Something went wrong.' });
    }
};
exports.markTrusted = markTrusted;
const getReports = async (req, res) => {
    try {
        if (!await isAdmin(req.user.userId)) {
            res.status(403).json({ success: false, message: 'Admin only' });
            return;
        }
        const reports = await prisma_1.prisma.report.findMany({
            include: {
                product: { select: { id: true, title: true } },
                user: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
        res.status(200).json({ success: true, reports });
    }
    catch {
        res.status(500).json({ success: false, message: 'Something went wrong.' });
    }
};
exports.getReports = getReports;
//# sourceMappingURL=admin.controller.js.map