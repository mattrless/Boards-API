import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { softDeleteExtension } from './soft-delete.extension';

export const createPrismaClient = () => {
  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    }),
    omit: {
      user: {
        password: true,
      },
    },
  }).$extends(softDeleteExtension);
};

export type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;
