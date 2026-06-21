"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNearbyProducts = exports.getTrendingProducts = exports.getMyProducts = exports.deleteProduct = exports.updateProduct = exports.getProduct = exports.getProducts = exports.createProduct = void 0;
const prisma_1 = require("../lib/prisma");
const notificationService_1 = require("../services/notificationService");
const createProduct = async (req, res) => {
    try {
        const { title, description, price, condition, categoryId, city, state, images, latitude, longitude, area, pincode, listingType, supplierInfo, supplierCost, deliveryDays, returnPolicy, shippingNote } = req.body;
        if (!title || !description || !price || !categoryId || !city || !state) {
            res.status(400).json({ success: false, message: 'Please provide all required fields' });
            return;
        }
        if (title.trim().length < 3) {
            res.status(400).json({ success: false, message: 'Title must be at least 3 characters' });
            return;
        }
        if (parseFloat(price) <= 0) {
            res.status(400).json({ success: false, message: 'Price must be greater than 0' });
            return;
        }
        if (listingType === 'dropship' && !supplierCost) {
            res.status(400).json({ success: false, message: 'Supplier cost is required for dropship listings' });
            return;
        }
        // ── Phone verification gate ───────────────────────────────────────────────
        const seller = await prisma_1.prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { phoneVerified: true, isTrusted: true },
        });
        if (!seller?.phoneVerified) {
            res.status(403).json({ success: false, message: 'Phone verification required to post listings', code: 'PHONE_NOT_VERIFIED' });
            return;
        }
        // ── Daily listing limit ───────────────────────────────────────────────────
        const dayLimit = seller.isTrusted ? 50 : 3;
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayCount = await prisma_1.prisma.product.count({
            where: { userId: req.user.userId, createdAt: { gte: todayStart } },
        });
        if (todayCount >= dayLimit) {
            res.status(429).json({
                success: false,
                message: seller.isTrusted
                    ? `Daily limit of ${dayLimit} listings reached. Try again tomorrow.`
                    : `New accounts can post up to ${dayLimit} listings per day. Upgrade to trusted seller for higher limits.`,
            });
            return;
        }
        const category = await prisma_1.prisma.category.findUnique({ where: { id: categoryId } });
        if (!category) {
            res.status(400).json({ success: false, message: 'Invalid category' });
            return;
        }
        const product = await prisma_1.prisma.product.create({
            data: {
                title,
                description,
                price: parseFloat(price),
                condition: condition || 'GOOD',
                city,
                state,
                images: images || [],
                userId: req.user.userId,
                categoryId,
                status: 'ACTIVE',
                ...(area && { area }),
                ...(pincode && { pincode }),
                ...(latitude !== undefined && latitude !== null && latitude !== '' && { latitude: parseFloat(latitude) }),
                ...(longitude !== undefined && longitude !== null && longitude !== '' && { longitude: parseFloat(longitude) }),
                listingType: listingType === 'dropship' ? 'dropship' : 'local',
                ...(listingType === 'dropship' && {
                    supplierInfo,
                    supplierCost: supplierCost ? parseFloat(supplierCost) : undefined,
                    deliveryDays: deliveryDays || '5-10 days',
                }),
                ...(returnPolicy && { returnPolicy }),
                ...(shippingNote && { shippingNote }),
            },
            include: {
                user: { select: { id: true, name: true, avatar: true, phone: true, city: true } },
                category: true,
            },
        });
        res.status(201).json({ success: true, message: 'Product listed successfully!', product });
    }
    catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ success: false, message: 'Something went wrong.' });
    }
};
exports.createProduct = createProduct;
const getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search;
        const category = req.query.category;
        const minPrice = req.query.minPrice;
        const maxPrice = req.query.maxPrice;
        const city = req.query.city;
        const condition = req.query.condition;
        const sortBy = req.query.sortBy || 'createdAt';
        const order = req.query.order || 'desc';
        const where = { status: 'ACTIVE' };
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        // Fix: support both parent and subcategory slugs
        if (category) {
            const cat = await prisma_1.prisma.category.findUnique({
                where: { slug: category },
                include: { children: { select: { id: true } } }
            });
            if (cat) {
                if (cat.children && cat.children.length > 0) {
                    // Parent category — include products from all subcategories too
                    const childIds = cat.children.map((c) => c.id);
                    where.categoryId = { in: [cat.id, ...childIds] };
                }
                else {
                    // Subcategory — direct match
                    where.categoryId = cat.id;
                }
            }
        }
        if (city)
            where.city = { contains: city, mode: 'insensitive' };
        if (condition)
            where.condition = condition;
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice)
                where.price.gte = parseFloat(minPrice);
            if (maxPrice)
                where.price.lte = parseFloat(maxPrice);
        }
        const total = await prisma_1.prisma.product.count({ where });
        const products = await prisma_1.prisma.product.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, avatar: true, city: true } },
                category: { select: { id: true, name: true, slug: true, icon: true } },
                _count: { select: { favorites: true } },
            },
            orderBy: { [sortBy]: order },
            skip: (page - 1) * limit,
            take: limit,
        });
        res.status(200).json({
            success: true,
            products,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        });
    }
    catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ success: false, message: 'Something went wrong.' });
    }
};
exports.getProducts = getProducts;
const getProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await prisma_1.prisma.product.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, name: true, avatar: true, phone: true, city: true, createdAt: true } },
                category: true,
                _count: { select: { favorites: true } },
            },
        });
        if (!product) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }
        await prisma_1.prisma.product.update({ where: { id }, data: { views: { increment: 1 } } });
        const related = await prisma_1.prisma.product.findMany({
            where: { categoryId: product.categoryId, id: { not: id }, status: 'ACTIVE' },
            include: { user: { select: { id: true, name: true, city: true } } },
            orderBy: { createdAt: 'desc' },
            take: 6,
        });
        res.status(200).json({ success: true, product, related });
    }
    catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ success: false, message: 'Something went wrong.' });
    }
};
exports.getProduct = getProduct;
const updateProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const { title, description, price, condition, city, state, images, status, area, pincode, latitude, longitude, listingType, supplierInfo, supplierCost, deliveryDays, returnPolicy, shippingNote } = req.body;
        const existing = await prisma_1.prisma.product.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }
        if (existing.userId !== req.user.userId) {
            res.status(403).json({ success: false, message: 'You can only edit your own listings' });
            return;
        }
        const product = await prisma_1.prisma.product.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(description && { description }),
                ...(price && { price: parseFloat(price) }),
                ...(condition && { condition }),
                ...(city && { city }),
                ...(state && { state }),
                ...(images && { images }),
                ...(status && { status }),
                ...(area && { area }),
                ...(pincode && { pincode }),
                ...(latitude !== undefined && latitude !== null && latitude !== '' && { latitude: parseFloat(latitude) }),
                ...(longitude !== undefined && longitude !== null && longitude !== '' && { longitude: parseFloat(longitude) }),
                ...(listingType && { listingType: listingType === 'dropship' ? 'dropship' : 'local' }),
                ...(supplierInfo !== undefined && { supplierInfo }),
                ...(supplierCost && { supplierCost: parseFloat(supplierCost) }),
                ...(deliveryDays && { deliveryDays }),
                ...(returnPolicy && { returnPolicy }),
                ...(shippingNote !== undefined && { shippingNote }),
            },
            include: {
                user: { select: { id: true, name: true, avatar: true } },
                category: true,
            },
        });
        if (status === 'SOLD' && existing.status !== 'SOLD') {
            await (0, notificationService_1.sendNotification)({
                userId: existing.userId,
                type: 'product_sold',
                title: '🎉 Your item was marked as sold!',
                body: `"${existing.title}" has been marked as sold.`,
                link: `/products/${id}`,
            });
        }
        if (price && parseFloat(price) < existing.price) {
            const favoriters = await prisma_1.prisma.favorite.findMany({
                where: { productId: id },
                select: { userId: true },
            });
            await Promise.all(favoriters.map((f) => (0, notificationService_1.sendNotification)({
                userId: f.userId,
                type: 'price_drop',
                title: '📉 Price dropped on a saved item!',
                body: `"${existing.title}" dropped to Rs.${parseFloat(price).toLocaleString('en-IN')}`,
                link: `/products/${id}`,
            })));
        }
        res.status(200).json({ success: true, message: 'Product updated!', product });
    }
    catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ success: false, message: 'Something went wrong.' });
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const existing = await prisma_1.prisma.product.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }
        if (existing.userId !== req.user.userId) {
            res.status(403).json({ success: false, message: 'You can only delete your own listings' });
            return;
        }
        await prisma_1.prisma.product.delete({ where: { id } });
        res.status(200).json({ success: true, message: 'Product deleted successfully!' });
    }
    catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ success: false, message: 'Something went wrong.' });
    }
};
exports.deleteProduct = deleteProduct;
const getMyProducts = async (req, res) => {
    try {
        const products = await prisma_1.prisma.product.findMany({
            where: { userId: req.user.userId },
            include: {
                category: { select: { id: true, name: true, slug: true, icon: true } },
                _count: { select: { favorites: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json({ success: true, products });
    }
    catch (error) {
        console.error('Get my products error:', error);
        res.status(500).json({ success: false, message: 'Something went wrong.' });
    }
};
exports.getMyProducts = getMyProducts;
const getTrendingProducts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const products = await prisma_1.prisma.product.findMany({
            where: { status: 'ACTIVE' },
            include: {
                user: { select: { id: true, name: true, avatar: true, city: true } },
                category: { select: { id: true, name: true, slug: true, icon: true } },
                _count: { select: { favorites: true } },
            },
            orderBy: [
                { views: 'desc' },
                { favorites: { _count: 'desc' } },
                { createdAt: 'desc' },
            ],
            take: limit,
        });
        res.status(200).json({ success: true, products });
    }
    catch (error) {
        console.error('Get trending products error:', error);
        res.status(500).json({ success: false, message: 'Something went wrong.' });
    }
};
exports.getTrendingProducts = getTrendingProducts;
// ─── LOCATION HELPERS ────────────────────────────────────────────────────────
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
const getNearbyProducts = async (req, res) => {
    try {
        const lat = parseFloat(req.query.lat);
        const lng = parseFloat(req.query.lng);
        const radiusKm = parseFloat(req.query.radius) || 25;
        const limit = parseInt(req.query.limit) || 20;
        if (isNaN(lat) || isNaN(lng)) {
            res.status(400).json({ success: false, message: 'lat and lng are required' });
            return;
        }
        const products = await prisma_1.prisma.product.findMany({
            where: {
                status: 'ACTIVE',
                latitude: { not: null },
                longitude: { not: null },
            },
            include: {
                user: { select: { id: true, name: true, avatar: true, city: true } },
                category: { select: { id: true, name: true, slug: true, icon: true } },
                _count: { select: { favorites: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 200,
        });
        const nearby = products
            .map(p => ({ ...p, distance: haversineDistance(lat, lng, p.latitude, p.longitude) }))
            .filter(p => p.distance <= radiusKm)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, limit);
        res.json({ success: true, products: nearby, total: nearby.length });
    }
    catch (error) {
        console.error('Get nearby products error:', error);
        res.status(500).json({ success: false, message: 'Something went wrong.' });
    }
};
exports.getNearbyProducts = getNearbyProducts;
//# sourceMappingURL=product.controller.js.map