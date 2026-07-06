import { Router } from 'express';
import bcrypt from 'bcrypt';
import prisma, { centralPrisma } from '../prisma';
import { expandPermissions, ADMIN_PERMISSIONS } from '../utils/permissions';
import { requireAuth, requirePermission } from '../middleware/auth';

const router = Router();

// Only admin can access users
router.use(requireAuth);

router.get('/', requirePermission('users', 'view'), async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const mapped = users.map(u => {
      let perms: any = {};
      perms = expandPermissions(u.role, u.permissions);
      return { ...u, permissions: perms };
    });
    res.json(mapped);
  } catch (error: any) {
    next(error);
  }
});

router.post('/', requirePermission('users', 'create'), async (req, res, next) => {
  let { email, password, name, role, permissions } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const cleanEmail = email.toLowerCase().trim();

  if (role === 'admin') {
    permissions = ADMIN_PERMISSIONS;
  }
  
  try {
    // 1. Enforce global email uniqueness in TenantUser table
    const existingCentralUser = await centralPrisma.tenantUser.findUnique({
      where: { email: cleanEmail }
    });
    if (existingCentralUser) {
      return res.status(400).json({ error: 'This email is already in use by another workspace.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const permsStr = JSON.stringify(permissions || {});
    
    // 2. Create the user in the tenant database
    const newUser = await prisma.user.create({
      data: {
        email: cleanEmail,
        password: hashed,
        name,
        role: role || 'user',
        permissions: permsStr
      }
    });

    // 3. Register the user centrally
    const subdomain = req.headers['x-tenant-subdomain'] as string;
    await centralPrisma.tenantUser.create({
      data: {
        email: cleanEmail,
        subdomain: subdomain.toLowerCase().trim()
      }
    });

    res.status(201).json({ message: 'User created', user: { id: newUser.id, email: newUser.email } });
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return res.status(400).json({ error: "Email already exists" });
    }
    console.error("CREATE USER ERROR:", error);
    next(error);
  }
});

router.put('/:id', requirePermission('users', 'edit'), async (req, res, next) => {
  const id = parseInt(req.params.id);
  let { email, password, name, role, permissions } = req.body;

  if (role === 'admin') {
    permissions = ADMIN_PERMISSIONS;
  }
  
  const cleanEmail = email.toLowerCase().trim();

  try {
    const userToUpdate = await prisma.user.findUnique({ where: { id } });
    if (!userToUpdate) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If email is changing, check central uniqueness and update mapping
    if (userToUpdate.email.toLowerCase().trim() !== cleanEmail) {
      const existingCentralUser = await centralPrisma.tenantUser.findUnique({
        where: { email: cleanEmail }
      });
      if (existingCentralUser) {
        return res.status(400).json({ error: 'This email is already in use by another workspace.' });
      }

      // Update central mapping
      await centralPrisma.tenantUser.update({
        where: { email: userToUpdate.email.toLowerCase().trim() },
        data: { email: cleanEmail }
      });
    }

    const permsStr = JSON.stringify(permissions || {});
    const updateData: any = {
      email: cleanEmail,
      name,
      role,
      permissions: permsStr
    };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await prisma.user.update({
      where: { id },
      data: updateData
    });
    res.json({ message: 'User updated' });
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return res.status(400).json({ error: "Email already exists" });
    }
    console.error("UPDATE USER ERROR:", error);
    next(error);
  }
});

router.delete('/:id', requirePermission('users', 'delete'), async (req, res, next) => {
  const id = parseInt(req.params.id);
  try {
    const userToDelete = await prisma.user.findUnique({ where: { id } });
    if (userToDelete) {
      // 1. Delete central mapping first
      await centralPrisma.tenantUser.deleteMany({
        where: { email: userToDelete.email.toLowerCase().trim() }
      });
    }

    // 2. Delete user in tenant database
    await prisma.user.delete({
      where: { id }
    });
    res.json({ message: 'User deleted' });
  } catch (error: any) {
    next(error);
  }
});

export default router;
