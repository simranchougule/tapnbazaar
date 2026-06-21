"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chat_controller_1 = require("../controllers/chat.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get('/', auth_middleware_1.protect, chat_controller_1.getMyChats);
router.get('/unread', auth_middleware_1.protect, chat_controller_1.getUnreadCount);
router.get('/product/:productId', auth_middleware_1.protect, chat_controller_1.getOrCreateChat);
router.get('/:chatId/messages', auth_middleware_1.protect, chat_controller_1.getChatMessages);
router.get('/:chatId', auth_middleware_1.protect, chat_controller_1.getSingleChat);
exports.default = router;
//# sourceMappingURL=chat.routes.js.map