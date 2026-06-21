"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get('/', auth_middleware_1.protect, notification_controller_1.getNotifications);
router.put('/read-all', auth_middleware_1.protect, notification_controller_1.markAllRead);
router.put('/:id/read', auth_middleware_1.protect, notification_controller_1.markOneRead);
exports.default = router;
//# sourceMappingURL=notification.routes.js.map