import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const users = await prisma.$queryRaw`SELECT * FROM [User] WHERE email = ${email}`;
    const user = Array.isArray(users) ? users[0] : null;

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    let parsedPerms: any = {};
    if (user.role === 'admin') {
      parsedPerms = 
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
        const flatPerms = user.permissions ? JSON.parse(user.permissions) : {};
        if (!flatPerms.invoices && (flatPerms.canManageInvoices !== undefined || flatPerms.canViewDashboard !== undefined)) {
           parsedPerms = {
             dashboard: { view: !!flatPerms.canViewDashboard },
             invoices: { view: !!flatPerms.canManageInvoices, create: !!flatPerms.canManageInvoices, edit: !!flatPerms.canManageInvoices, delete: !!flatPerms.canDelete },
             payments: { view: !!flatPerms.canManagePayments, create: !!flatPerms.canManagePayments, edit: !!flatPerms.canManagePayments, delete: !!flatPerms.canDelete },
             collections: { view: !!flatPerms.canManageCollections, create: !!flatPerms.canManageCollections, edit: !!flatPerms.canManageCollections, delete: !!flatPerms.canDelete },
             suppliers: { view: !!flatPerms.canManageSuppliers, create: !!flatPerms.canManageSuppliers, edit: !!flatPerms.canManageSuppliers, delete: !!flatPerms.canDelete },
             accounts: { view: !!flatPerms.canManageAccounts, create: !!flatPerms.canManageAccounts, edit: !!flatPerms.canManageAccounts, delete: !!flatPerms.canDelete },
             users: { view: !!flatPerms.canManageUsers, create: !!flatPerms.canManageUsers, edit: !!flatPerms.canManageUsers, delete: !!flatPerms.canManageUsers }
           };
        } else {
           parsedPerms = flatPerms;
        }
      } catch(e) {
        parsedPerms = {};
      }
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, permissions: parsedPerms },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.status(200).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, permissions: parsedPerms } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed', details: String(error) });
  }
});
export default router;
