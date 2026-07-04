import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import { expandPermissions } from '../utils/permissions';

const router = Router();


router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const parsedPerms = expandPermissions(user.role, user.permissions);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, permissions: parsedPerms },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.status(200).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, permissions: parsedPerms } });
  } catch (error) {
    next(error);
  }
});
export default router;
