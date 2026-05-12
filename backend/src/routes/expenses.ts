import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requirePermission } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all expenses
router.get('/', requireAuth, requirePermission('expenses', 'view'), async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      include: { account: true },
      orderBy: { date: 'desc' }
    });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Add new expense
router.post('/', requireAuth, requirePermission('expenses', 'create'), async (req, res) => {
  const { category, amount, accountId, date, note } = req.body;
  try {
    const result = await prisma.$transaction(async (tx) => {
      const expense = await tx.expense.create({
        data: {
          category,
          amount,
          accountId: parseInt(accountId),
          date: new Date(date),
          note
        }
      });

      // Deduct from account balance
      await tx.account.update({
        where: { id: parseInt(accountId) },
        data: { balance: { decrement: amount } }
      });

      return expense;
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// Delete expense
router.delete('/:id', requireAuth, requirePermission('expenses', 'delete'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.$transaction(async (tx) => {
      const expense = await tx.expense.findUnique({ where: { id } });
      if (!expense) throw new Error('Expense not found');

      // Add back to account balance
      await tx.account.update({
        where: { id: expense.accountId },
        data: { balance: { increment: expense.amount } }
      });

      await tx.expense.delete({ where: { id } });
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle reminder status
router.patch('/:id/reminder', requireAuth, requirePermission('expenses', 'edit'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { reminder } = req.body;
    const updated = await prisma.expense.update({
      where: { id },
      data: { reminder: Boolean(reminder) }
    });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Pay/clear a planned expense
router.patch('/:id/pay', requireAuth, requirePermission('expenses', 'edit'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { accountId } = req.body;
    
    const result = await prisma.$transaction(async (tx) => {
      const expense = await tx.expense.findUnique({ where: { id } });
      if (!expense) throw new Error('Expense not found');
      
      const parsedAccountId = parseInt(accountId);
      
      // 1. Reverse the deduction from the old account
      await tx.account.update({
        where: { id: expense.accountId },
        data: { balance: { increment: expense.amount } }
      });
      
      // 2. Deduct from the new selected payment account
      await tx.account.update({
        where: { id: parsedAccountId },
        data: { balance: { decrement: expense.amount } }
      });
      
      // 3. Update the expense record with today's date, new account, and clear reminder
      const updated = await tx.expense.update({
        where: { id },
        data: {
          accountId: parsedAccountId,
          date: new Date(), // Set to today (actual payment date)
          reminder: false   // Clear reminder/approval checkmark
        }
      });
      
      return updated;
    });
    
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
