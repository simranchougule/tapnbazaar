"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategory = exports.getCategories = void 0;
const prisma_1 = require("../lib/prisma");
const getCategories = async (req, res) => {
    try {
        const categories = await prisma_1.prisma.category.findMany({
            where: { parentId: null },
            orderBy: { name: 'asc' },
            include: { children: { orderBy: { name: 'asc' } } }
        });
        res.status(200).json({ success: true, categories });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Something went wrong.' });
    }
};
exports.getCategories = getCategories;
const getCategory = async (req, res) => {
    try {
        const slug = String(req.params.slug);
        const category = await prisma_1.prisma.category.findUnique({
            where: { slug },
            include: { children: { orderBy: { name: 'asc' } } }
        });
        if (!category) {
            res.status(404).json({ success: false, message: 'Category not found' });
            return;
        }
        res.status(200).json({ success: true, category });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Something went wrong.' });
    }
};
exports.getCategory = getCategory;
//# sourceMappingURL=category.controller.js.map