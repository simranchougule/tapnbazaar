"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("../controllers/product.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Protected static routes — must be before /:id
router.get('/user/my-listings', auth_middleware_1.protect, product_controller_1.getMyProducts);
// Public routes
router.get('/', product_controller_1.getProducts);
router.get('/trending', product_controller_1.getTrendingProducts);
router.get('/nearby', product_controller_1.getNearbyProducts);
router.get('/:id', product_controller_1.getProduct);
// Protected routes
router.post('/', auth_middleware_1.protect, product_controller_1.createProduct);
router.put('/:id', auth_middleware_1.protect, product_controller_1.updateProduct);
router.delete('/:id', auth_middleware_1.protect, product_controller_1.deleteProduct);
exports.default = router;
//# sourceMappingURL=product.routes.js.map