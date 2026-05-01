import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requirePermission } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(requireAuth);

async function recalculateFIFO(tx: any, supplierId: number) {
  // Reset all invoices paidAmount to 0
  await tx.invoice.updateMany({
    where: { supplierId },
    data: { paidAmount: 0 }
  });

  // Get all invoices ordered by createdAt asc
  const invoices = await tx.invoice.findMany({
    where: { supplierId },
    orderBy: { createdAt: 'asc' }
  });

  // Get all payments for this supplier ordered by paymentDate asc
  const payments = await tx.payment.findMany({
    where: { supplierId },
    orderBy: [{ paymentDate: 'asc' }, { createdAt: 'asc' }]
  });

  let totalPaid = payments.reduce((sum: number, p: any) => sum + p.amount, 0);

  for (const invoice of invoices) {
    if (totalPaid <= 0) break;
    const paymentForInvoice = Math.min(invoice.amount, totalPaid);
    await tx.invoice.update({
      where: { id: invoice.id },
      data: { paidAmount: paymentForInvoice }
    });
    totalPaid -= paymentForInvoice;
  }
}

router.post('/', requirePermission('payments', 'create'), async (req: Request, res: Response) => {
  try {
    const { supplierId, amount, paymentDate, accountId } = req.body;
    
    if (!accountId) {
      return res.status(400).json({ error: 'accountId is required' });
    }

    const payment = await prisma.$transaction(async (tx) => {
      const baseDate = paymentDate ? new Date(paymentDate) : new Date();
      const parsedAmount = parseFloat(amount);
      const parsedAccountId = parseInt(accountId);

      // Check account balance
      const account = await tx.account.findUnique({ where: { id: parsedAccountId } });
      if (!account || account.balance < parsedAmount) {
        throw new Error('Insufficient balance in selected account');
      }

      const newPayment = await tx.payment.create({
        data: {
          supplierId: parseInt(supplierId),
          amount: parsedAmount,
          paymentDate: baseDate,
          accountId: parsedAccountId
        }
      });

      // Deduct from account
      await tx.account.update({
        where: { id: parsedAccountId },
        data: { balance: { decrement: parsedAmount } }
      });

      // Recalculate FIFO
      await recalculateFIFO(tx, parseInt(supplierId));

      return newPayment;
    });

    res.status(201).json(payment);
  } catch (error: any) {
    res.status(400).json({ error: 'Error processing payment', details: error.message || String(error) });
  }
});

router.put('/:id', requirePermission('payments', 'edit'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { supplierId, amount, paymentDate, accountId } = req.body;
    
    if (!accountId) {
      return res.status(400).json({ error: 'accountId is required' });
    }

    const payment = await prisma.$transaction(async (tx) => {
      const oldPayment = await tx.payment.findUnique({ where: { id: parseInt(id) } });
      if (!oldPayment) throw new Error('Payment not found');

      const newAmount = parseFloat(amount);
      const newAccountId = parseInt(accountId);
      const newSupplierId = parseInt(supplierId);

      // Account logic
      if (oldPayment.accountId !== newAccountId || oldPayment.amount !== newAmount) {
        // 1. Reverse old amount
        await tx.account.update({
          where: { id: oldPayment.accountId },
          data: { balance: { increment: oldPayment.amount } }
        });

        // 2. Check new balance
        const newAccount = await tx.account.findUnique({ where: { id: newAccountId } });
        if (!newAccount || newAccount.balance < newAmount) {
          throw new Error('Insufficient balance in selected account');
        }

        // 3. Deduct new amount
        await tx.account.update({
          where: { id: newAccountId },
          data: { balance: { decrement: newAmount } }
        });
      }

      // Update payment record
      const updatedPayment = await tx.payment.update({
        where: { id: parseInt(id) },
        data: {
          supplierId: newSupplierId,
          amount: newAmount,
          paymentDate: new Date(paymentDate),
          accountId: newAccountId
        }
      });

      // Maintain FIFO
      if (oldPayment.amount !== newAmount || oldPayment.supplierId !== newSupplierId) {
        // Recalculate FIFO for old supplier (if changed)
        if (oldPayment.supplierId !== newSupplierId) {
          await recalculateFIFO(tx, oldPayment.supplierId);
        }
        // Recalculate FIFO for new supplier
        await recalculateFIFO(tx, newSupplierId);
      }

      return updatedPayment;
    });

    res.json(payment);
  } catch (error: any) {
    res.status(400).json({ error: 'Error updating payment', details: error.message || String(error) });
  }
});

router.get('/', requirePermission('payments', 'view'), async (req: Request, res: Response) => {
  try {
    const payments = await prisma.payment.findMany({ orderBy: { id: "desc" },
      include: { account: true }
    });
    res.json(payments);
  } catch (error: any) {
    res.status(500).json({ error: 'Error fetching payments', details: error.message || String(error) });
  }
});

router.delete('/:id', requirePermission('payments', 'delete'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({ where: { id: parseInt(id) } });
      if (!payment) throw new Error('Payment not found');

      // 1. Restore account balance
      await tx.account.update({
        where: { id: payment.accountId },
        data: { balance: { increment: payment.amount } }
      });

      // 2. Delete payment
      await tx.payment.delete({ where: { id: parseInt(id) } });

      // 3. Undo FIFO allocation
      await recalculateFIFO(tx, payment.supplierId);
    });

    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: 'Error deleting payment', details: error.message || String(error) });
  }
});

export default router;
