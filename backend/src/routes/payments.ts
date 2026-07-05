import { recalculateFIFO } from '../utils/fifo';
import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { requireAuth, requirePermission, AuthRequest } from '../middleware/auth';

const router = Router();


router.use(requireAuth);



router.post('/', requirePermission('payments', 'create'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { supplierId, amount, paymentDate, accountId, invoiceId, allocations } = req.body;
    
    if (!accountId) {
      return res.status(400).json({ error: 'accountId is required' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const baseDate = paymentDate ? new Date(paymentDate) : new Date();
      const parsedAccountId = parseInt(accountId);
      const totalAmount = new Decimal(amount);

      const account = await tx.account.findUnique({ where: { id: parsedAccountId } });
      if (!account || new Decimal(account.balance).lessThan(totalAmount)) {
        throw new Error('Insufficient balance in selected account');
      }

      // If allocations are provided (Manual Mode)
      if (allocations && Array.isArray(allocations) && allocations.length > 0) {
        for (const alloc of allocations) {
          const allocAmount = new Decimal(alloc.amount);
          if (allocAmount.lessThanOrEqualTo(0)) continue;

          await tx.payment.create({
            data: {
              supplierId: parseInt(supplierId),
              amount: allocAmount,
              paymentDate: baseDate,
              accountId: parsedAccountId,
              invoiceId: parseInt(alloc.invoiceId)
            }
          });
        }
      } else {
        // Auto Mode (FIFO)
        await tx.payment.create({
          data: {
            supplierId: parseInt(supplierId),
            amount: totalAmount,
            paymentDate: baseDate,
            accountId: parsedAccountId,
            invoiceId: invoiceId ? parseInt(invoiceId) : null
          }
        });
      }

      // Deduct total amount from account once
      await tx.account.update({
        where: { id: parsedAccountId },
        data: { balance: { decrement: totalAmount } }
      });

      await recalculateFIFO(tx, parseInt(supplierId));
      return { message: 'Payment processed successfully' };
    }, { timeout: 30000 });

    res.status(201).json(result);
  } catch (error: any) {
    next(error);
  }
});

router.put('/:id', requirePermission('payments', 'edit'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { supplierId, amount, paymentDate, accountId, invoiceId } = req.body;
    
    if (!accountId) {
      return res.status(400).json({ error: 'accountId is required' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const oldPayment = await tx.payment.findUnique({ where: { id: parseInt(id) } });
      if (!oldPayment) throw new Error('Payment not found');
      if (oldPayment.chequeId) {
        throw new Error('Cannot modify a payment linked to a cheque. Please manage it via the Cheques tab.');
      }

      const newAmount = new Decimal(amount);
      const oldAmount = new Decimal(oldPayment.amount);
      const newAccountId = parseInt(accountId);
      const newSupplierId = parseInt(supplierId);

      // Fetch the target account to check balance
      const targetAccount = await tx.account.findUnique({ where: { id: newAccountId } });
      if (!targetAccount) throw new Error('Account not found');

      // Calculate effective balance if we were to reverse the old payment
      let effectiveBalance = new Decimal(targetAccount.balance);
      if (oldPayment.accountId === newAccountId) {
        effectiveBalance = effectiveBalance.plus(oldAmount);
      }

      // (debug log removed)

      if (effectiveBalance.lessThan(newAmount)) {
        throw new Error(`Insufficient balance in selected account (Available: ${effectiveBalance}, Required: ${newAmount})`);
      }

      // Update balances
      if (oldPayment.accountId !== newAccountId) {
        // Give back to old account
        await tx.account.update({
          where: { id: oldPayment.accountId },
          data: { balance: { increment: oldAmount } }
        });
        // Take from new account
        await tx.account.update({
          where: { id: newAccountId },
          data: { balance: { decrement: newAmount } }
        });
      } else if (!oldAmount.equals(newAmount)) {
        // Same account, just adjust the difference
        const diff = newAmount.minus(oldAmount);
        await tx.account.update({
          where: { id: newAccountId },
          data: { balance: { decrement: diff } }
        });
      }

      const updatedPayment = await tx.payment.update({
        where: { id: parseInt(id) },
        data: {
          supplierId: newSupplierId,
          amount: newAmount,
          paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
          accountId: newAccountId,
          invoiceId: invoiceId ? parseInt(invoiceId) : null
        }
      });

      if (!oldAmount.equals(newAmount) || oldPayment.supplierId !== newSupplierId || oldPayment.invoiceId !== (invoiceId ? parseInt(invoiceId) : null)) {
        if (oldPayment.supplierId !== newSupplierId) {
          await recalculateFIFO(tx, oldPayment.supplierId);
        }
        await recalculateFIFO(tx, newSupplierId);
      }

      return updatedPayment;
    }, { timeout: 30000 });

    res.json(updated);
  } catch (error: any) {
    next(error);
  }
});

router.get('/', requirePermission('payments', 'view'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const hasAccountsView = req.user?.role === 'admin' || req.user?.permissions?.accounts?.view;
    
    const payments = await prisma.payment.findMany({ 
      orderBy: { id: "desc" },
      include: { 
        account: true, 
        invoice: true 
      } 
    });

    if (!hasAccountsView) {
      const filtered = payments.map(p => {
        if (p.account) {
          const { balance, ...rest } = p.account as any;
          return { ...p, account: rest };
        }
        return p;
      });
      return res.json(filtered);
    }

    res.json(payments);
  } catch (error: any) {
    next(error);
  }
});

router.delete('/:id', requirePermission('payments', 'delete'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({ where: { id: parseInt(id) } });
      if (!payment) throw new Error('Payment not found');
      if (payment.chequeId) {
        throw new Error('Cannot delete a payment linked to a cheque. Please manage it via the Cheques tab.');
      }

      await tx.account.update({
        where: { id: payment.accountId },
        data: { balance: { increment: payment.amount } }
      });

      await tx.payment.delete({ where: { id: parseInt(id) } });

      await recalculateFIFO(tx, payment.supplierId);
    }, { timeout: 30000 });

    res.status(204).send();
  } catch (error: any) {
    next(error);
  }
});

export default router;
