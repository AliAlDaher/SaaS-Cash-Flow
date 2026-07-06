import { PrismaClient } from '@prisma/client';

const clientCache = new Map<string, PrismaClient>();

/**
 * Formats the database connection string to ensure performance options (like connection pooling limit) are appended.
 */
function formatConnectionString(connectionString: string): string {
  try {
    const url = new URL(connectionString);
    if (!url.searchParams.has('connection_limit')) {
      // Limit to 3 connections per tenant client to prevent exhausting the DB server limits
      url.searchParams.set('connection_limit', '3');
      return url.toString();
    }
    return connectionString;
  } catch (error) {
    if (!connectionString.includes('connection_limit=')) {
      const separator = connectionString.includes('?') ? '&' : '?';
      return `${connectionString}${separator}connection_limit=3`;
    }
    return connectionString;
  }
}

/**
 * Get or create a PrismaClient instance for a specific tenant based on their subdomain and database connection URL.
 */
export function getPrismaClientForTenant(tenantSubdomain: string, dbConnectionString: string): PrismaClient {
  const cacheKey = tenantSubdomain.toLowerCase();
  
  if (clientCache.has(cacheKey)) {
    return clientCache.get(cacheKey)!;
  }

  const formattedUrl = formatConnectionString(dbConnectionString);
  console.log(`[PrismaManager] Creating new PrismaClient for tenant: "${cacheKey}" (limit connections to 3)`);
  
  // Create a new PrismaClient with the tenant's connection URL
  const client = new PrismaClient({
    datasources: {
      db: {
        url: formattedUrl,
      },
    },
  });

  clientCache.set(cacheKey, client);
  return client;
}

/**
 * Disconnect and remove a tenant's PrismaClient from the cache.
 */
export async function removePrismaClientForTenant(tenantSubdomain: string): Promise<void> {
  const cacheKey = tenantSubdomain.toLowerCase();
  const client = clientCache.get(cacheKey);
  
  if (client) {
    console.log(`[PrismaManager] Disconnecting PrismaClient for tenant: "${cacheKey}"`);
    try {
      await client.$disconnect();
    } catch (error) {
      console.error(`[PrismaManager] Error disconnecting tenant client "${cacheKey}":`, error);
    }
    clientCache.delete(cacheKey);
  }
}
