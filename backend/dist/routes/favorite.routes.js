"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const favorite_controller_1 = require("../controllers/favorite.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post('/:productId', auth_middleware_1.protect, favorite_controller_1.toggleFavorite);
router.get('/', auth_middleware_1.protect, favorite_controller_1.getMyFavorites);
exports.default = router;
//# sourceMappingURL=favorite.routes.js.map