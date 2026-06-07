// src/lib/prisma.ts
// This file creates ONE database connection shared across the whole app
// Think of it like one phone line to the database — we don't want 100 lines open at once

import { PrismaClient } from '@prisma/client'

// This trick prevents creating multiple connections during development
// When you save a file, nodemon restarts — without this trick it would
// open a new database connection every restart and eventually run out
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV !== 'production' ? ['query', 'error', 'warn'] : ['error'], // shows database queries in terminal (helpful for learning)
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}