"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyFavorites = exports.toggleFavorite = void 0;
const prisma_1 = require("../lib/prisma");
const toggleFavorite = async (req, res) => {
    try {
        const userId = req.user.userId;
        const productId = req.params.productId;
        const existing = await prisma_1.prisma.favorite.findUnique({
            where: { userId_productId: { userId, productId } },
        });
        if (existing) {
            await prisma_1.prisma.favorite.delete({ where: { id: existing.id } });
            res.status(200).json({ success: true, favorited: false });
        }
        else {
            await prisma_1.prisma.favorite.create({ data: { userId, productId } });
            res.status(201).json({ success: true, favorited: true });
        }
    }
    catch (error) {
        console.error('Toggle favorite error:', error);
        res.status(500).json({ success: false, message: 'Something went wrong.' });
    }
};
exports.toggleFavorite = toggleFavorite;
const getMyFavorites = async (req, res) => {
    try {
        const favorites = await prisma_1.prisma.favorite.findMany({
            where: { userId: req.user.userId },
            include: {
                product: {
                    include: {
                        user: { select: { id: true, name: true, avatar: true, city: true } },
                        category: { select: { id: true, name: true, slug: true, icon: true } },
                        _count: { select: { favorites: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const products = favorites.map(f => f.product);
        res.status(200).json({ success: true, products });
    }
    catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({ success: false, message: 'Something went wrong.' });
    }
};
exports.getMyFavorites = getMyFavorites;
//# sourceMappingURL=favorite.controller.js.map