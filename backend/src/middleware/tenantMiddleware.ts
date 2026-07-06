import { Request, Response, NextFunction } from 'express';
import { tenantStorage, centralPrisma } from '../prisma';
import { getPrismaClientForTenant } from '../prismaManager';

interface CachedTenant {
  dbConnectionString: string;
  expiresAt: number;
}

// In-memory cache for resolved tenant metadata to prevent excessive database hits on the central control database.
const tenantMetadataCache = new Map<string, CachedTenant>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes TTL

/**
 * Express middleware to resolve the tenant based on subdomain/header
 * and bind their PrismaClient to the AsyncLocalStorage request context.
 */
export async function tenantMiddleware(req: Request, res: Response, next: NextFunction) {
  // 1. Extract tenant subdomain from custom header or host header
  let subdomain = req.headers['x-tenant-subdomain'] as string;
  
  if (!subdomain) {
    const host = req.headers.host || '';
    const parts = host.split('.');
    
    // Check if localhost or standard domain
    if (parts.length > 1) {
      const isLocalhost = parts[parts.length - 1].startsWith('localhost') || parts.includes('localhost');
      if (isLocalhost) {
        // e.g. acme.localhost:3001 or acme.localhost
        subdomain = parts[0] !== 'localhost' ? parts[0] : '';
      } else {
        // e.g. acme.cashflow.com -> parts = ['acme', 'cashflow', 'com']
        subdomain = parts.length > 2 ? parts[0] : '';
      }
    }
  }

  // If no subdomain context, return 400 Bad Request
  if (!subdomain || subdomain === 'www') {
    return res.status(400).json({ error: 'Tenant context is missing. Please access via your company subdomain.' });
  }

  const tenantKey = subdomain.toLowerCase().trim();

  try {
    let dbConnectionString: string;
    const now = Date.now();
    const cached = tenantMetadataCache.get(tenantKey);

    if (cached && cached.expiresAt > now) {
      dbConnectionString = cached.dbConnectionString;
    } else {
      console.log(`[TenantMiddleware] Cache miss for tenant metadata: "${tenantKey}". Querying control database.`);
      // 2. Fetch the tenant configuration from the central database
      const tenant = await centralPrisma.tenant.findUnique({
        where: { subdomain: tenantKey },
      });

      if (!tenant) {
        tenantMetadataCache.delete(tenantKey);
        return res.status(404).json({ error: `Company workspace "${tenantKey}" not found.` });
      }

      dbConnectionString = tenant.dbConnectionString;
      tenantMetadataCache.set(tenantKey, {
        dbConnectionString,
        expiresAt: now + CACHE_TTL_MS,
      });
    }

    // 3. Resolve the dedicated tenant PrismaClient
    const tenantClient = getPrismaClientForTenant(tenantKey, dbConnectionString);

    // 4. Wrap request propagation in AsyncLocalStorage
    tenantStorage.run(tenantClient, () => {
      next();
    });
  } catch (error) {
    console.error(`[TenantMiddleware] Error resolving tenant "${tenantKey}":`, error);
    res.status(500).json({ error: 'Internal server error occurred while connecting to the database workspace.' });
  }
}
