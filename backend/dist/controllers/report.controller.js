"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserReports = exports.getProductReports = exports.reportUser = exports.reportProduct = void 0;
const prisma_1 = require("../lib/prisma");
const REPORT_REASONS = ['Fake Product', 'Fraud', 'Wrong Category', 'Duplicate Listing', 'Inappropriate Content'];
const USER_REPORT_REASONS = ['Scam', 'Harassment', 'Fake Account', 'Spam', 'Other'];
// POST /api/reports/product/:productId
const reportProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        const { reason, details } = req.body;
        const userId = req.user.userId;
        if (!reason || !REPORT_REASONS.includes(reason)) {
            res.status(400).json({ success: false, message: 'Invalid report reason' });
            return;
        }
        const product = await prisma_1.prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }
        if (product.userId === userId) {
            res.status(400).json({ success: false, message: 'You cannot report your own listing' });
            return;
        }
        const existing = await prisma_1.prisma.report.findUnique({ where: { userId_productId: { userId, productId } } });
        if (existing) {
            res.status(400).json({ success: false, message: 'You have already reported this listing' });
            return;
        }
        await prisma_1.prisma.report.create({ data: { productId, userId, reason, details: details || null } });
        // Auto-flag if 5+ reports
        const count = await prisma_1.prisma.report.count({ where: { productId } });
        if (count >= 5) {
            await prisma_1.prisma.product.update({ where: { id: productId }, data: { status: 'INACTIVE' } });
        }
        res.status(201).json({ success: true, message: 'Report submitted. Our team will review it.' });
    }
    catch (error) {
        if (error.code === 'P2002') {
            res.status(400).json({ success: false, message: 'You have already reported this listing' });
            return;
        }
        res.status(500).json({ success: false, message: 'Something went wrong.' });
    }
};
exports.reportProduct = reportProduct;
// POST /api/reports/user/:reportedUserId
const reportUser = async (req, res) => {
    try {
        const reportedUserId = req.params.reportedUserId;
        const { reason, details } = req.body;
        const reporterId = req.user.userId;
        if (!reason || !USER_REPORT_REASONS.includes(reason)) {
            res.status(400).json({ success: false, message: 'Invalid report reason' });
            return;
        }
        if (reportedUserId === reporterId) {
            res.status(400).json({ success: false, message: 'You cannot report yourself' });
            return;
        }
        const target = await prisma_1.prisma.user.findUnique({ where: { id: reportedUserId } });
        if (!target) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        await prisma_1.prisma.userReport.create({ data: { reportedUserId, reporterId, reason, details: details || null } });
        res.status(201).json({ success: true, message: 'User reported. Our team will review it.' });
    }
    catch (error) {
        if (error.code === 'P2002') {
            res.status(400).json({ success: false, message: 'You have already reported this user' });
            return;
        }
        res.status(500).json({ success: false, message: 'Something went wrong.' });
    }
};
exports.reportUser = reportUser;
// Admin: GET /api/reports/admin/products
const getProductReports = async (req, res) => {
    try {
        const reports = await prisma_1.prisma.report.findMany({
            include: {
                product: { select: { id: true, title: true, status: true } },
                user: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json({ success: true, reports });
    }
    catch {
        res.status(500).json({ success: false, message: 'Something went wrong.' });
    }
};
exports.getProductReports = getProductReports;
// Admin: GET /api/reports/admin/users
const getUserReports = async (req, res) => {
    try {
        const reports = await prisma_1.prisma.userReport.findMany({
            include: {
                reportedUser: { select: { id: true, name: true, email: true } },
                reporter: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json({ success: true, reports });
    }
    catch {
        res.status(500).json({ success: false, message: 'Something went wrong.' });
    }
};
exports.getUserReports = getUserReports;
//# sourceMappingURL=report.controller.js.map