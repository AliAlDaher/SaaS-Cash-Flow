import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { requireAuth, requirePermission } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(requireAuth);

// Get all cheques
router.get('/', requirePermission('cheques', 'view'), async (req, res, next) => {
  try {
    const cheques = await prisma.cheque.findMany({
      include: {
        account: true,
        supplier: true,
        invoice: true
      },
      orderBy: { chequeDate: 'asc' }
    });
    res.json(cheques);
  } catch (error) {
    next(error);
  }
});

// Create cheque
router.post('/', requirePermission('cheques', 'create'), async (req, res, next) => {
  try {
    const { amount, chequeDate, accountId, supplierId, invoiceId } = req.body;
    const cheque = await prisma.cheque.create({
      data: {
        amount: new Decimal(amount),
        chequeDate: new Date(chequeDate),
        accountId: parseInt(accountId),
        supplierId: supplierId ? parseInt(supplierId) : null,
        invoiceId: invoiceId ? parseInt(invoiceId) : null,
        status: 'Pending'
      }
    });
    res.status(201).json(cheque);
  } catch (error) {
    next(error);
  }
});

// Update status
router.patch('/:id/status', requirePermission('cheques', 'edit'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Pending, Cleared, Bounced

    const result = await prisma.$transaction(async (tx) => {
      const oldCheque = await tx.cheque.findUnique({ where: { id: parseInt(id) } });
      if (!oldCheque) throw new Error('Cheque not found');

      if (oldCheque.status === status) return oldCheque;

      if (status === 'Cleared' && oldCheque.status !== 'Cleared') {
        await tx.account.update({
          where: { id: oldCheque.accountId },
          data: { balance: { decrement: oldCheque.amount } }
        });
      } else if (oldCheque.status === 'Cleared' && status !== 'Cleared') {
        await tx.account.update({
          where: { id: oldCheque.accountId },
          data: { balance: { increment: oldCheque.amount } }
        });
      }

      const updated = await tx.cheque.update({
        where: { id: parseInt(id) },
        data: { status }
      });
      
      return updated;
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Delete cheque
router.delete('/:id', requirePermission('cheques', 'delete'), async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.$transaction(async (tx) => {
      const cheque = await tx.cheque.findUnique({ where: { id: parseInt(id) } });
      if (!cheque) throw new Error('Cheque not found');
      
      if (cheque.status === 'Cleared') {
        await tx.account.update({
          where: { id: cheque.accountId },
          data: { balance: { increment: cheque.amount } }
        });
      }
      await tx.cheque.delete({ where: { id: parseInt(id) } });
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
