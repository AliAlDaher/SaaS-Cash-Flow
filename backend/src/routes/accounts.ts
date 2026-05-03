import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { requireAuth, requirePermission, AuthRequest } from '../middleware/auth';


const router = Router();
const prisma = new PrismaClient();

router.use(requireAuth);

router.post('/', requirePermission('accounts', 'create'), async (req: Request, res: Response, next) => {
  try {
    const { name, type, balance } = req.body;
    const account = await prisma.account.create({
      data: {
        name,
        type,
        balance: balance ? new Decimal(balance) : new Decimal(0)
      }
    });
    res.status(201).json(account);
  } catch (error: any) {
    next(error);
  }
});

router.get('/', requirePermission('accounts', 'view'), async (req: Request, res: Response, next) => {
  try {
    const accounts = await prisma.account.findMany({ orderBy: { id: "desc" } });
    res.json(accounts);
  } catch (error: any) {
    next(error);
  }
});


router.patch('/adjustments/:adjustmentId', requirePermission('accounts', 'edit'), async (req: Request, res: Response, next) => {
  const { adjustmentId } = req.params;
  const { note } = req.body;
  try {
    const updated = await prisma.accountAdjustment.update({
      where: { id: parseInt(adjustmentId) },
      data: { note }
    });
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: 'Error updating adjustment', details: error.message || String(error) });
  }
});

router.delete('/adjustments/:adjustmentId', requirePermission('accounts', 'delete'), async (req: Request, res: Response, next) => {
  const { adjustmentId } = req.params;
  try {
    await prisma.$transaction(async (tx) => {
      const adjustment = await tx.accountAdjustment.findUnique({
        where: { id: parseInt(adjustmentId) }
      });
      if (!adjustment) throw new Error('Adjustment not found');

      // Reverse the balance change
      await tx.account.update({
        where: { id: adjustment.accountId },
        data: {
          balance: { decrement: adjustment.amount }
        }
      });

      await tx.accountAdjustment.delete({
        where: { id: parseInt(adjustmentId) }
      });
    });
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:id', requirePermission('accounts', 'view'), async (req: Request, res: Response, next) => {
  try {
    const account = await prisma.account.findUnique({ 
      where: { id: parseInt(req.params.id) },
      include: { adjustments: { orderBy: { createdAt: 'desc' } } }
    });
    if (!account) return res.status(404).json({ error: 'Account not found' });
    res.json(account);
  } catch (error: any) {
    next(error);
  }
});

router.delete('/:id', requirePermission('accounts', 'delete'), async (req: Request, res: Response, next) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid account ID' });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const paymentCount = await tx.payment.count({ where: { accountId: id } });
      const collectionCount = await tx.collection.count({ where: { accountId: id } });
      const adjustmentCount = await tx.accountAdjustment.count({ where: { accountId: id } });

      if (paymentCount > 0 || collectionCount > 0 || adjustmentCount > 0) {
        let reasons = [];
        if (paymentCount > 0) reasons.push(`${paymentCount} payments`);
        if (collectionCount > 0) reasons.push(`${collectionCount} collections`);
        if (adjustmentCount > 0) reasons.push(`${adjustmentCount} adjustments`);
        throw new Error(`Cannot delete account. Linked data remaining: ${reasons.join(', ')}.`);
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


router.post('/:id/reconcile', requirePermission('accounts', 'edit'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { actualBalance, note } = req.body;
    const accountId = parseInt(id);

    const result = await prisma.$transaction(async (tx) => {
      const account = await tx.account.findUnique({ where: { id: accountId } });
      if (!account) throw new Error('Account not found');

      const systemBalance = new Decimal(account.balance);
      const targetBalance = new Decimal(actualBalance);
      const diff = targetBalance.minus(systemBalance);

      if (diff.equals(0)) {
        return { message: 'Balance is already in sync', account };
      }

      // Record the adjustment
      await (tx as any).accountAdjustment.create({
        data: {
          accountId,
          amount: diff,
          systemBalance,
          actualBalance: targetBalance,
          note: note || 'Bank Reconciliation'
        }
      });

      // Update account balance
      const updatedAccount = await tx.account.update({
        where: { id: accountId },
        data: { balance: targetBalance }
      });

      return updatedAccount;
    });

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: 'Error reconciling account', details: error.message || String(error) });
  }
});

export default router;