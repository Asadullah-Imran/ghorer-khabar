import { PrismaPg } from '@prisma/adapter-pg';
import "dotenv/config";
import { Pool } from 'pg';
import { PrismaClient } from '../../../generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;

// Prevent multiple instances in development (Next.js hot-reloading)
const globalForPrisma = global as unknown as { 
  prisma: PrismaClient | undefined,
  pgPool: Pool | undefined,
  adapter: PrismaPg | undefined
};

// Use existing pool or create a new one
const pool = globalForPrisma.pgPool || new Pool({ connectionString });
const adapter = globalForPrisma.adapter || new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ 
    adapter,
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'] // Only log errors in production
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pgPool = pool;
  globalForPrisma.adapter = adapter;
}