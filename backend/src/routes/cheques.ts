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
    const { amount, chequeDate, accountId, supplierId, invoiceId } = req.body;

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

    const cheque = await prisma.cheque.create({
      data: {
        amount: new Decimal(amount),
        chequeDate: new Date(chequeDate),
        accountId: parsedAccountId,
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

// Postpone cheque due date
router.patch('/:id/postpone', requirePermission('cheques', 'create'), async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;
    const { postponeDate, reason } = req.body;

    const existing = await prisma.cheque.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return res.status(404).json({ error: 'Cheque not found' });

    const originalDateStr = new Date(existing.chequeDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const targetDateStr = new Date(postponeDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const postponementLog = "[Postponed from " + originalDateStr + " to " + targetDateStr + (reason ? ": " + reason : "") + "]";
    const newNote = existing.note
      ? existing.note + " " + postponementLog
      : postponementLog;

    const updated = await prisma.cheque.update({
      where: { id: parseInt(id) },
      data: {
        chequeDate: new Date(postponeDate),
        note: newNote
      }
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

export default router;
