import { PrismaClient } from '@prisma/client';
import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

// Required for neon serverless in Node.js environment
neonConfig.webSocketConstructor = ws;

const prismaClientSingleton = () => {
  // Use connection pooling URL for runtime
  const connectionString = process.env.DATABASE_URL!;

  // Configure Prisma adapter with PoolConfig
  const adapter = new PrismaNeon({ connectionString });
  
  // Initialize Prisma Client with the adapter
  return new PrismaClient({ adapter });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
