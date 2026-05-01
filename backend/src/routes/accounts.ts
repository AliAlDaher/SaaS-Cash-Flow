import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requirePermission } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(requireAuth);

router.post('/', requirePermission('accounts', 'create'), async (req: Request, res: Response) => {
  try {
    const { name, type, balance } = req.body;
    const account = await prisma.account.create({
      data: {
        name,
        type,
        balance: balance ? parseFloat(balance) : 0
      }
    });
    res.status(201).json(account);
  } catch (error: any) {
    res.status(500).json({ error: 'Error creating account', details: error.message || String(error) });
  }
});

router.get('/', requirePermission('accounts', 'view'), async (req: Request, res: Response) => {
  try {
    const accounts = await prisma.account.findMany({ orderBy: { id: "desc" } });
    res.json(accounts);
  } catch (error: any) {
    res.status(500).json({ error: 'Error fetching accounts', details: error.message || String(error) });
  }
});

router.get('/:id', requirePermission('accounts', 'view'), async (req: Request, res: Response) => {
  try {
    const account = await prisma.account.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!account) return res.status(404).json({ error: 'Account not found' });
    res.json(account);
  } catch (error: any) {
    res.status(500).json({ error: 'Error fetching account', details: error.message || String(error) });
  }
});

router.delete('/:id', requirePermission('accounts', 'delete'), async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid account ID' });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const paymentCount = await tx.payment.count({ where: { accountId: id } });
      const collectionCount = await tx.collection.count({ where: { accountId: id } });

      if (paymentCount > 0 || collectionCount > 0) {
        throw new Error('Cannot delete account because it has existing transactions.');
      }

      const account = await tx.account.findUnique({ where: { id } });
      if (!account) {
        throw new Error('Account not found');
      }

      await tx.account.delete({ where: { id } });
    });

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error deleting account' });
  }
});

export default router;