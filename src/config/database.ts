import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

export const prisma = new PrismaClient();

export const connectDB = async () => {
  try {
    await prisma.$connect();
    logger.debug('database Connected');
  } catch (error: any) {
    logger.error(`Error: ${error.message}`);
    process.exit(1);
  }
};
