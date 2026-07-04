import { Router } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../prisma';
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
  // (debug log removed)

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (role === 'admin') {
    permissions = ADMIN_PERMISSIONS;
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

router.put('/:id', requirePermission('users', 'edit'), async (req, res, next) => {
  const id = parseInt(req.params.id);
  let { email, password, name, role, permissions } = req.body;
  // (debug log removed)

  if (role === 'admin') {
    permissions = ADMIN_PERMISSIONS;
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
