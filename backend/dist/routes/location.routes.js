"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const location_controller_1 = require("../controllers/location.controller");
const router = (0, express_1.Router)();
router.get('/states', location_controller_1.getStates);
router.get('/cities', location_controller_1.getCities);
router.get('/localities', location_controller_1.getLocalities);
router.get('/search', location_controller_1.searchLocations);
router.get('/popular', location_controller_1.getPopularLocalities);
router.get('/locality-stats', location_controller_1.getLocalityStats);
exports.default = router;
//# sourceMappingURL=location.routes.js.map