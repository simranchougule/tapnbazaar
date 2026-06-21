"use strict";
// src/lib/prisma.ts
// This file creates ONE database connection shared across the whole app
// Think of it like one phone line to the database — we don't want 100 lines open at once
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
// This trick prevents creating multiple connections during development
// When you save a file, nodemon restarts — without this trick it would
// open a new database connection every restart and eventually run out
const globalForPrisma = globalThis;
exports.prisma = globalForPrisma.prisma ??
    new client_1.PrismaClient({
        log: process.env.NODE_ENV !== 'production' ? ['query', 'error', 'warn'] : ['error'], // shows database queries in terminal (helpful for learning)
    });
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = exports.prisma;
}
//# sourceMappingURL=prisma.js.map