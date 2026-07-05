import { recalculateFIFO } from '../utils/fifo';
import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { requireAuth, requirePermission } from '../middleware/auth';

const router = Router();


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
    const { amount, chequeDate, accountId, supplierId, invoiceId, note } = req.body;

    if (!accountId) {
      return res.status(400).json({ error: 'Account is required.' });
    }

    const parsedAccountId = parseInt(accountId);
    const accountExists = await prisma.account.findUnique({ where: { id: parsedAccountId } });
    if (!accountExists) {
      return res.status(400).json({ error: 'Selected account does not exist.' });
    }

    if (supplierId) {
      const parsedSupplierId = parseInt(supplierId);
      const supplierExists = await prisma.supplier.findUnique({ where: { id: parsedSupplierId } });
      if (!supplierExists) {
        return res.status(400).json({ error: `Selected supplier (ID ${parsedSupplierId}) does not exist.` });
      }
    }

    if (invoiceId) {
      const parsedInvoiceId = parseInt(invoiceId);
      const invoiceExists = await prisma.invoice.findUnique({ where: { id: parsedInvoiceId } });
      if (!invoiceExists) {
        return res.status(400).json({ error: `Invoice with ID ${parsedInvoiceId} does not exist.` });
      }
    }

    const { deductFromBalance } = req.body;
    const result = await prisma.$transaction(async (tx) => {
      const cheque = await tx.cheque.create({
        data: {
          amount: new Decimal(amount),
          chequeDate: new Date(chequeDate),
          accountId: parsedAccountId,
          supplierId: supplierId ? parseInt(supplierId) : null,
          invoiceId: invoiceId ? parseInt(invoiceId) : null,
          status: 'Pending',
          note: note || null,
          deductFromBalance: Boolean(deductFromBalance)
        }
      });

      if (deductFromBalance && supplierId) {
        await tx.payment.create({
          data: {
            supplierId: parseInt(supplierId),
            amount: new Decimal(amount),
            paymentDate: new Date(chequeDate),
            accountId: parsedAccountId,
            invoiceId: invoiceId ? parseInt(invoiceId) : null,
            chequeId: cheque.id
          }
        });
        await recalculateFIFO(tx, parseInt(supplierId));
      }
      return cheque;
    }, { timeout: 30000 });
    res.status(201).json(result);
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
    }, { timeout: 30000 });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Update/Edit cheque
router.put('/:id', requirePermission('cheques', 'edit'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, chequeDate, accountId, supplierId, invoiceId, note, status, deductFromBalance } = req.body;

    if (!accountId) {
      return res.status(400).json({ error: 'Account is required.' });
    }

    const parsedAccountId = parseInt(accountId);
    const accountExists = await prisma.account.findUnique({ where: { id: parsedAccountId } });
    if (!accountExists) {
      return res.status(400).json({ error: 'Selected account does not exist.' });
    }

    if (supplierId) {
      const parsedSupplierId = parseInt(supplierId);
      const supplierExists = await prisma.supplier.findUnique({ where: { id: parsedSupplierId } });
      if (!supplierExists) {
        return res.status(400).json({ error: `Selected supplier (ID ${parsedSupplierId}) does not exist.` });
      }
    }

    if (invoiceId) {
      const parsedInvoiceId = parseInt(invoiceId);
      const invoiceExists = await prisma.invoice.findUnique({ where: { id: parsedInvoiceId } });
      if (!invoiceExists) {
        return res.status(400).json({ error: `Invoice with ID ${parsedInvoiceId} does not exist.` });
      }
    }

    const chequeId = parseInt(id);
    const result = await prisma.$transaction(async (tx) => {
      const oldCheque = await tx.cheque.findUnique({
        where: { id: chequeId },
        include: { payment: true }
      });
      if (!oldCheque) throw new Error('Cheque not found');

      const targetStatus = status !== undefined ? status : oldCheque.status;
      const targetAmount = amount !== undefined ? new Decimal(amount) : oldCheque.amount;
      const targetAccountId = parsedAccountId;
      const targetSupplierId = supplierId ? parseInt(supplierId) : null;
      const targetInvoiceId = invoiceId ? parseInt(invoiceId) : null;
      const targetDeductFromBalance = deductFromBalance !== undefined ? Boolean(deductFromBalance) : oldCheque.deductFromBalance;

      // Handle account balance adjustments if the cheque is Cleared
      if (oldCheque.status === 'Cleared') {
        await tx.account.update({
          where: { id: oldCheque.accountId },
          data: { balance: { increment: oldCheque.amount } }
        });
      }

      if (targetStatus === 'Cleared') {
        await tx.account.update({
          where: { id: targetAccountId },
          data: { balance: { decrement: targetAmount } }
        });
      }

      // Handle linked payment updates
      if (oldCheque.payment) {
        if (targetDeductFromBalance && targetSupplierId) {
          await tx.payment.update({
            where: { id: oldCheque.payment.id },
            data: {
              supplierId: targetSupplierId,
              amount: targetAmount,
              paymentDate: chequeDate ? new Date(chequeDate) : oldCheque.chequeDate,
              accountId: targetAccountId,
              invoiceId: targetInvoiceId
            }
          });

          if (oldCheque.supplierId !== targetSupplierId) {
            if (oldCheque.supplierId) {
              await recalculateFIFO(tx, oldCheque.supplierId);
            }
            await recalculateFIFO(tx, targetSupplierId);
          } else {
            await recalculateFIFO(tx, targetSupplierId);
          }
        } else {
          await tx.payment.delete({
            where: { id: oldCheque.payment.id }
          });
          if (oldCheque.supplierId) {
            await recalculateFIFO(tx, oldCheque.supplierId);
          }
        }
      } else {
        if (targetDeductFromBalance && targetSupplierId) {
          await tx.payment.create({
            data: {
              supplierId: targetSupplierId,
              amount: targetAmount,
              paymentDate: chequeDate ? new Date(chequeDate) : oldCheque.chequeDate,
              accountId: targetAccountId,
              invoiceId: targetInvoiceId,
              chequeId: chequeId
            }
          });
          await recalculateFIFO(tx, targetSupplierId);
        }
      }

      const updated = await tx.cheque.update({
        where: { id: chequeId },
        data: {
          amount: targetAmount,
          chequeDate: chequeDate ? new Date(chequeDate) : oldCheque.chequeDate,
          accountId: targetAccountId,
          supplierId: targetSupplierId,
          invoiceId: targetInvoiceId,
          note: note !== undefined ? note : oldCheque.note,
          status: targetStatus,
          deductFromBalance: targetDeductFromBalance
        }
      });
      return updated;
    }, { timeout: 30000 });

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || String(error) });
  }
});

// Delete cheque
router.delete('/:id', requirePermission('cheques', 'delete'), async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.$transaction(async (tx) => {
      const cheque = await tx.cheque.findUnique({
        where: { id: parseInt(id) },
        include: { payment: true }
      });
      if (!cheque) throw new Error('Cheque not found');

      if (cheque.payment) {
        await tx.payment.delete({ where: { id: cheque.payment.id } });
        if (cheque.supplierId) {
          await recalculateFIFO(tx, cheque.supplierId);
        }
      }
      
      if (cheque.status === 'Cleared') {
        await tx.account.update({
          where: { id: cheque.accountId },
          data: { balance: { increment: cheque.amount } }
        });
      }
      await tx.cheque.delete({ where: { id: parseInt(id) } });
    }, { timeout: 30000 });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
