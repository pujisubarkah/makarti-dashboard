// /src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

/**
 * IMPORTANT: DO NOT use prisma.$disconnect() in API routes!
 * 
 * This is a singleton Prisma Client instance that persists across requests.
 * Calling $disconnect() will close the connection pool and cause 
 * "Engine is not yet connected" errors for subsequent requests.
 * 
 * Prisma automatically manages connections and will handle connection pooling.
 * Only disconnect in long-running scripts or when shutting down the application.
 */
