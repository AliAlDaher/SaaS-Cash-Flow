import { PrismaClient } from '@prisma/client';
import { AsyncLocalStorage } from 'async_hooks';

// AsyncLocalStorage to propagate the tenant-specific PrismaClient across asynchronous operations
export const tenantStorage = new AsyncLocalStorage<PrismaClient>();

// Central admin database client (Control Plane)
export const centralPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.CENTRAL_DATABASE_URL,
    },
  },
});

// Fallback client for scripts, migrations, and seeds running outside the Express request lifecycle
const fallbackPrisma = new PrismaClient();

// Exported prisma client is a Proxy that delegates to the active tenant's client in the storage context, 
// or falls back to the default database connection.
const prisma = new Proxy({} as PrismaClient, {
  get(target, prop, receiver) {
    const activeClient = tenantStorage.getStore();
    const client = activeClient || fallbackPrisma;
    
    const value = Reflect.get(client, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
});

export default prisma;
export { prisma };
