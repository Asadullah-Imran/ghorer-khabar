import { PrismaPg } from '@prisma/adapter-pg';
import "dotenv/config";
import { Pool } from 'pg';
import { PrismaClient } from '../../../generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;

// 1. Create a connection pool
const pool = new Pool({ connectionString });

// 2. Set up the adapter
const adapter = new PrismaPg(pool);

// 3. Prevent multiple instances in development (Next.js hot-reloading)
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ 
    adapter,
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'] // Only log errors in production
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;