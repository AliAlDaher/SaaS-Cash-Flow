import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma, { centralPrisma } from '../prisma';
import { getPrismaClientForTenant } from '../prismaManager';
import { expandPermissions } from '../utils/permissions';

const router = Router();

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    // 1. Find the tenant mapping by email centrally
    const mapping = await centralPrisma.tenantUser.findUnique({
      where: { email: cleanEmail }
    });

    if (!mapping) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 2. Fetch the tenant configuration
    const tenant = await centralPrisma.tenant.findUnique({
      where: { subdomain: mapping.subdomain }
    });

    if (!tenant) {
      return res.status(404).json({ error: 'Company workspace not found' });
    }

    // 3. Connect to the isolated tenant schema database
    const tenantClient = getPrismaClientForTenant(tenant.subdomain, tenant.dbConnectionString);

    // 4. Find the user inside the tenant's schema
    const user = await tenantClient.user.findUnique({
      where: { email: cleanEmail }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found in workspace' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const parsedPerms = expandPermissions(user.role, user.permissions);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, permissions: parsedPerms, subdomain: tenant.subdomain },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      token,
      subdomain: tenant.subdomain,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: parsedPerms
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
