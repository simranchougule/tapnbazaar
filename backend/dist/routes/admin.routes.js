"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const router = (0, express_1.Router)();
router.get('/stats', auth_middleware_1.protect, admin_middleware_1.isAdmin, admin_controller_1.getStats);
router.get('/users', auth_middleware_1.protect, admin_middleware_1.isAdmin, admin_controller_1.getUsers);
router.get('/products', auth_middleware_1.protect, admin_middleware_1.isAdmin, admin_controller_1.getAllProducts);
router.get('/reports', auth_middleware_1.protect, admin_middleware_1.isAdmin, admin_controller_1.getReports);
router.delete('/products/:id', auth_middleware_1.protect, admin_middleware_1.isAdmin, admin_controller_1.deleteProductAdmin);
router.patch('/users/:id/ban', auth_middleware_1.protect, admin_middleware_1.isAdmin, admin_controller_1.banUser);
router.patch('/users/:id/trust', auth_middleware_1.protect, admin_middleware_1.isAdmin, admin_controller_1.markTrusted);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map