import { Router } from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requirePermission } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Only admin can access users
router.use(requireAuth);


router.get('/', requirePermission('users', 'view'), async (req, res) => {
  try {
    const users = await prisma.$queryRaw`SELECT id, email, name, role, permissions, createdAt, updatedAt FROM [User]`;
    const mapped = (Array.isArray(users) ? users : []).map(u => {
      let perms: any = {};
      if (u.role === 'admin') {
        perms = 
{
  dashboard: { view: true },
  reports: { view: true },
  invoices: { view: true, create: true, edit: true, delete: true },
  payments: { view: true, create: true, edit: true, delete: true },
  collections: { view: true, create: true, edit: true, delete: true },
  suppliers: { view: true, create: true, edit: true, delete: true },
  accounts: { view: true, create: true, edit: true, delete: true },
  users: { view: true, create: true, edit: true, delete: true }
}
;
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
    res.status(500).json({ error: 'Error fetching users', details: error.message });
  }
});

router.post('/', requirePermission('users', 'create'), async (req, res) => {
  let { email, password, name, role, permissions } = req.body;
  if (role === 'admin') {
    permissions = 
{
  dashboard: { view: true },
  reports: { view: true },
  invoices: { view: true, create: true, edit: true, delete: true },
  payments: { view: true, create: true, edit: true, delete: true },
  collections: { view: true, create: true, edit: true, delete: true },
  suppliers: { view: true, create: true, edit: true, delete: true },
  accounts: { view: true, create: true, edit: true, delete: true },
  users: { view: true, create: true, edit: true, delete: true }
}
;
  }
  try {
    const hashed = await bcrypt.hash(password, 10);
    const permsStr = JSON.stringify(permissions || {});
    await prisma.$executeRaw`INSERT INTO [User] (email, password, name, role, permissions, createdAt, updatedAt) VALUES (${email}, ${hashed}, ${name}, ${role || 'user'}, ${permsStr}, GETDATE(), GETDATE())`;
    res.status(201).json({ message: 'User created' });
  } catch (error: any) {
    res.status(500).json({ error: 'Error creating user', details: error.message });
  }
});


router.put('/:id/permissions', requirePermission('users', 'edit'), async (req, res) => {
  const id = parseInt(req.params.id);
  const { permissions } = req.body;
  try {
    const permsStr = JSON.stringify(permissions || {});
    await prisma.$executeRaw`UPDATE [User] SET permissions=${permsStr}, updatedAt=GETDATE() WHERE id=${id}`;
    res.json({ message: 'Permissions updated' });
  } catch (error: any) {
    res.status(500).json({ error: 'Error updating permissions', details: error.message });
  }
});

router.put('/:id', requirePermission('users', 'edit'), async (req, res) => {
  const id = parseInt(req.params.id);
  let { email, password, name, role, permissions } = req.body;
  if (role === 'admin') {
    permissions = 
{
  dashboard: { view: true },
  reports: { view: true },
  invoices: { view: true, create: true, edit: true, delete: true },
  payments: { view: true, create: true, edit: true, delete: true },
  collections: { view: true, create: true, edit: true, delete: true },
  suppliers: { view: true, create: true, edit: true, delete: true },
  accounts: { view: true, create: true, edit: true, delete: true },
  users: { view: true, create: true, edit: true, delete: true }
}
;
  }
  try {
    const permsStr = JSON.stringify(permissions || {});
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      await prisma.$executeRaw`UPDATE [User] SET email=${email}, password=${hashed}, name=${name}, role=${role}, permissions=${permsStr}, updatedAt=GETDATE() WHERE id=${id}`;
    } else {
      await prisma.$executeRaw`UPDATE [User] SET email=${email}, name=${name}, role=${role}, permissions=${permsStr}, updatedAt=GETDATE() WHERE id=${id}`;
    }
    res.json({ message: 'User updated' });
  } catch (error: any) {
    res.status(500).json({ error: 'Error updating user', details: error.message });
  }
});

router.delete('/:id', requirePermission('users', 'delete'), async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.$executeRaw`DELETE FROM [User] WHERE id=${id}`;
    res.json({ message: 'User deleted' });
  } catch (error: any) {
    res.status(500).json({ error: 'Error deleting user', details: error.message });
  }
});

export default router;
