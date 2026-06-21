"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const report_controller_1 = require("../controllers/report.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const router = (0, express_1.Router)();
router.post('/product/:productId', auth_middleware_1.protect, report_controller_1.reportProduct);
router.post('/user/:reportedUserId', auth_middleware_1.protect, report_controller_1.reportUser);
router.get('/admin/products', auth_middleware_1.protect, admin_middleware_1.isAdmin, report_controller_1.getProductReports);
router.get('/admin/users', auth_middleware_1.protect, admin_middleware_1.isAdmin, report_controller_1.getUserReports);
exports.default = router;
//# sourceMappingURL=report.routes.js.map