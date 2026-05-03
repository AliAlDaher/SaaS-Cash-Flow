import { Router } from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requirePermission } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Only admin can access users
router.use(requireAuth);

router.get('/', requirePermission('users', 'view'), async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const mapped = users.map(u => {
      let perms: any = {};
      if (u.role === 'admin') {
        perms = {
          dashboard: { view: true },
          reports: { view: true },
          invoices: { view: true, create: true, edit: true, delete: true },
          payments: { view: true, create: true, edit: true, delete: true },
          collections: { view: true, create: true, edit: true, delete: true },
          suppliers: { view: true, create: true, edit: true, delete: true },
          accounts: { view: true, create: true, edit: true, delete: true },
          users: { view: true, create: true, edit: true, delete: true }
        };
      } else {
        try {
          const flatPerms = u.permissions ? JSON.parse(u.permissions) : {};
          if (!flatPerms.invoices && (flatPerms.canManageInvoices !== undefined || flatPerms.canViewDashboard !== undefined)) {
            perms = {
              dashboard: { view: !!flatPerms.canViewDashboard },
              reports: { view: !!flatPerms.canViewDashboard },
              invoices: { view: !!flatPerms.canManageInvoices, create: !!flatPerms.canManageInvoices, edit: !!flatPerms.canManageInvoices, delete: !!flatPerms.canDelete },
              payments: { view: !!flatPerms.canManagePayments, create: !!flatPerms.canManagePayments, edit: !!flatPerms.canManagePayments, delete: !!flatPerms.canDelete },
              collections: { view: !!flatPerms.canManageCollections, create: !!flatPerms.canManageCollections, edit: !!flatPerms.canManageCollections, delete: !!flatPerms.canDelete },
              suppliers: { view: !!flatPerms.canManageSuppliers, create: !!flatPerms.canManageSuppliers, edit: !!flatPerms.canManageSuppliers, delete: !!flatPerms.canDelete },
              accounts: { view: !!flatPerms.canManageAccounts, create: !!flatPerms.canManageAccounts, edit: !!flatPerms.canManageAccounts, delete: !!flatPerms.canDelete },
              users: { view: !!flatPerms.canManageUsers, create: !!flatPerms.canManageUsers, edit: !!flatPerms.canManageUsers, delete: !!flatPerms.canManageUsers }
            };
          } else {
            perms = flatPerms;
          }
        } catch(e) {
          perms = {};
        }
      }
      return { ...u, permissions: perms };
    });
    res.json(mapped);
  } catch (error: any) {
    next(error);
  }
});

router.post('/', requirePermission('users', 'create'), async (req, res, next) => {
  let { email, password, name, role, permissions } = req.body;
  console.log("CREATING USER:", { email, name, role });

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (role === 'admin') {
    permissions = {
      dashboard: { view: true },
      reports: { view: true },
      invoices: { view: true, create: true, edit: true, delete: true },
      payments: { view: true, create: true, edit: true, delete: true },
      collections: { view: true, create: true, edit: true, delete: true },
      suppliers: { view: true, create: true, edit: true, delete: true },
      accounts: { view: true, create: true, edit: true, delete: true },
      users: { view: true, create: true, edit: true, delete: true }
    };
  }
  try {
    const hashed = await bcrypt.hash(password, 10);
    const permsStr = JSON.stringify(permissions || {});
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name,
        role: role || 'user',
        permissions: permsStr
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

router.put('/:id/permissions', requirePermission('users', 'edit'), async (req, res, next) => {
  const id = parseInt(req.params.id);
  const { permissions } = req.body;
  try {
    const permsStr = JSON.stringify(permissions || {});
    await prisma.user.update({
      where: { id },
      data: { permissions: permsStr }
    });
    res.json({ message: 'Permissions updated' });
  } catch (error: any) {
    next(error);
  }
});

router.put('/:id', requirePermission('users', 'edit'), async (req, res, next) => {
  const id = parseInt(req.params.id);
  let { email, password, name, role, permissions } = req.body;
  console.log("UPDATING USER:", { id, email, name, role });

  if (role === 'admin') {
    permissions = {
      dashboard: { view: true },
      reports: { view: true },
      invoices: { view: true, create: true, edit: true, delete: true },
      payments: { view: true, create: true, edit: true, delete: true },
      collections: { view: true, create: true, edit: true, delete: true },
      suppliers: { view: true, create: true, edit: true, delete: true },
      accounts: { view: true, create: true, edit: true, delete: true },
      users: { view: true, create: true, edit: true, delete: true }
    };
  }
  try {
    const permsStr = JSON.stringify(permissions || {});
    const updateData: any = {
      email,
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
    await prisma.user.delete({
      where: { id }
    });
    res.json({ message: 'User deleted' });
  } catch (error: any) {
    next(error);
  }
});

export default router;
