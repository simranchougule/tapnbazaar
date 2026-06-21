"use strict";
// src/routes/auth.routes.ts
// This file connects URLs to controller functions
// Think of it like a phone directory:
// "If someone calls /register, connect them to the register function"
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post('/register', auth_controller_1.register);
router.post('/login', auth_controller_1.login);
router.post('/logout', auth_controller_1.logout);
router.get('/verify-email', auth_controller_1.verifyEmail);
router.get('/me', auth_middleware_1.protect, auth_controller_1.getMe);
router.put('/profile', auth_middleware_1.protect, auth_controller_1.updateProfile);
router.put('/change-password', auth_middleware_1.protect, auth_controller_1.changePassword);
router.post('/send-otp', auth_middleware_1.protect, auth_controller_1.sendPhoneOtp);
router.post('/verify-otp', auth_middleware_1.protect, auth_controller_1.verifyPhoneOtp);
router.get('/users/:id', auth_controller_1.getPublicProfile);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map