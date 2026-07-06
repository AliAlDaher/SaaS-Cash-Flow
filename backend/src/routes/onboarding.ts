import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { exec } from 'child_process';
import { promisify } from 'util';
import { centralPrisma } from '../prisma';
import { getPrismaClientForTenant } from '../prismaManager';
import { expandPermissions } from '../utils/permissions';

const execAsync = promisify(exec);
const router = Router();

// Endpoint to register a new tenant workspace (company)
router.post('/register', async (req, res, next) => {
  const { companyName, subdomain, email, password } = req.body;

  // 1. Basic validation
  if (!companyName || !subdomain || !email || !password) {
    return res.status(400).json({ error: 'All fields (companyName, subdomain, email, password) are required.' });
  }

  const cleanSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '').trim();
  if (cleanSubdomain.length < 3) {
    return res.status(400).json({ error: 'Subdomain must be at least 3 alphanumeric characters.' });
  }

  const reservedSubdomains = ['www', 'api', 'admin', 'cashflow', 'localhost', 'root', 'control'];
  if (reservedSubdomains.includes(cleanSubdomain)) {
    return res.status(400).json({ error: 'This subdomain is reserved. Please choose another one.' });
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    // 2. Check if the subdomain is already registered
    const existingTenant = await centralPrisma.tenant.findUnique({
      where: { subdomain: cleanSubdomain },
    });

    if (existingTenant) {
      return res.status(400).json({ error: 'This company name is already taken. Please choose another one.' });
    }

    // 3. Check if email is already in use centrally
    const existingCentralUser = await centralPrisma.tenantUser.findUnique({
      where: { email: cleanEmail }
    });

    if (existingCentralUser) {
      return res.status(400).json({ error: 'This email is already registered to a company workspace.' });
    }

    console.log(`[Onboarding] Starting registration for company "${companyName}" on subdomain "${cleanSubdomain}"`);

    // 4. Construct the tenant database connection string pointing to the new isolated Postgres schema
    const baseDbUrl = process.env.CENTRAL_DATABASE_URL || '';
    const urlObj = new URL(baseDbUrl);
    urlObj.searchParams.set('schema', `tenant_${cleanSubdomain}`);
    const tenantDbUrl = urlObj.toString();

    // 5. Create the isolated schema in PostgreSQL
    console.log(`[Onboarding] Creating PostgreSQL schema "tenant_${cleanSubdomain}"...`);
    await centralPrisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "tenant_${cleanSubdomain}";`);

    // 6. Run Prisma db push to provision the tables inside the new schema
    console.log(`[Onboarding] Provisioning tables via Prisma db push...`);
    await execAsync('npx prisma db push --skip-generate', {
      env: {
        ...process.env,
        DATABASE_URL: tenantDbUrl,
      },
    });

    // 7. Connect to the newly provisioned tenant schema using the PrismaManager
    const tenantClient = getPrismaClientForTenant(cleanSubdomain, tenantDbUrl);

    // 8. Seed the initial Administrator user inside the tenant schema
    console.log(`[Onboarding] Seeding admin user inside schema "tenant_${cleanSubdomain}"...`);
    const hashedPassword = await bcrypt.hash(password, 10);
    const defaultPermissions = {
      canViewDashboard: true,
      canManageAccounts: true,
      canManageCollections: true,
      canManageSuppliers: true,
      canManageInvoices: true,
      canManagePayments: true,
      canDelete: true,
      canEdit: true,
      canCreate: true
    };

    const adminUser = await tenantClient.user.create({
      data: {
        email: cleanEmail,
        password: hashedPassword,
        role: 'admin',
        name: `${companyName} Admin`,
        permissions: JSON.stringify(defaultPermissions)
      }
    });

    // 9. Generate a unique random 6-digit subscription code
    let subscriptionCode = '';
    let isUnique = false;
    while (!isUnique) {
      subscriptionCode = Math.floor(100000 + Math.random() * 900000).toString();
      const existing = await centralPrisma.tenant.findFirst({ where: { subscriptionCode } });
      if (!existing) {
        isUnique = true;
      }
    }

    // 10. Register the tenant in the Central Database
    console.log(`[Onboarding] Registering workspace metadata in Central DB...`);
    await centralPrisma.tenant.create({
      data: {
        name: companyName,
        subdomain: cleanSubdomain,
        subscriptionCode,
        dbConnectionString: tenantDbUrl,
      },
    });

    // 11. Register the admin user centrally in TenantUser mapping
    await centralPrisma.tenantUser.create({
      data: {
        email: cleanEmail,
        subdomain: cleanSubdomain
      }
    });

    console.log(`[Onboarding] Registration successful for: "${cleanSubdomain}"`);

    // 12. Auto-login the user immediately on success
    const parsedPerms = expandPermissions('admin', JSON.stringify(defaultPermissions));
    const token = jwt.sign(
      { id: adminUser.id, email: cleanEmail, role: 'admin', permissions: parsedPerms, subdomain: cleanSubdomain },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Workspace registered successfully.',
      token,
      subdomain: cleanSubdomain,
      user: {
        id: adminUser.id,
        email: cleanEmail,
        name: adminUser.name,
        role: 'admin',
        permissions: parsedPerms
      }
    });

  } catch (error: any) {
    console.error('[Onboarding] Error during company registration:', error);
    res.status(500).json({
      error: 'An error occurred while provisioning the workspace database.',
      details: error.message || error
    });
  }
});

export default router;
