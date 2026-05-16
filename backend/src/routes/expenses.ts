import { Router } from 'express';
import prisma from '../prisma';
import { requireAuth, requirePermission } from '../middleware/auth';

const router = Router();


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


// Generate monthly recurring expenses on demand (e.g. before the month starts)
router.post('/generate-monthly', requireAuth, requirePermission('expenses', 'create'), async (req, res) => {
  try {
    const { accountId, targetMonth } = req.body; // targetMonth: "2026-06" (YYYY-MM)
    
    if (!accountId) return res.status(400).json({ error: 'accountId is required' });
    
    // Parse target month or default to next month
    let targetDate: Date;
    if (targetMonth) {
      targetDate = new Date(targetMonth + '-01');
    } else {
      const now = new Date();
      targetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }
    
    const monthLabel = targetDate.toLocaleString('ar-SA', { month: 'long', year: 'numeric' });
    
    const recurringCategories = ['رواتب', 'الضمان الاجتماعي', 'كهرباء', 'إنترنت'];
    
    const created = [];
    for (const category of recurringCategories) {
      const expense = await prisma.expense.create({
        data: {
          category,
          amount: 0,
          paidAmount: 0,
          accountId: parseInt(accountId),
          date: targetDate,
          note: 'مصروف شهري - ' + monthLabel
        }
      });
      created.push(expense);
    }
    
    res.json({ success: true, created });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Add new expense (created as Unpaid with paidAmount = 0, no bank account deduction on creation)
router.post('/', requireAuth, requirePermission('expenses', 'create'), async (req, res) => {
  const { category, amount, accountId, date, note } = req.body;
  try {
    const expense = await prisma.expense.create({
      data: {
        category,
        amount,
        paidAmount: 0, // Unpaid by default
        accountId: parseInt(accountId),
        date: new Date(date),
        note
      }
    });
    res.json(expense);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// Delete expense (restores any actually paid amount back to the account balance)
router.delete('/:id', requireAuth, requirePermission('expenses', 'delete'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.$transaction(async (tx) => {
      const expense = await tx.expense.findUnique({ where: { id } });
      if (!expense) throw new Error('Expense not found');

      // Add back only the actually paid amount to the account balance
      if (Number(expense.paidAmount) > 0) {
        await tx.account.update({
          where: { id: expense.accountId },
          data: { balance: { increment: expense.paidAmount } }
        });
      }

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

// Pay/clear a planned expense (supports partial payments, deducts chosen bank account balance)
router.patch('/:id/pay', requireAuth, requirePermission('expenses', 'edit'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { accountId, amount } = req.body;
    
    const result = await prisma.$transaction(async (tx) => {
      const expense = await tx.expense.findUnique({ where: { id } });
      if (!expense) throw new Error('Expense not found');
      
      const remaining = Number(expense.amount) - Number(expense.paidAmount);
      if (remaining <= 0) throw new Error('Expense is already fully paid');
      
      // Default payment amount is the remaining balance
      const paymentAmount = amount !== undefined ? Number(amount) : remaining;
      if (paymentAmount <= 0) throw new Error('Payment amount must be greater than 0');
      if (paymentAmount > remaining) throw new Error('Payment amount cannot exceed remaining amount');
      
      const parsedAccountId = parseInt(accountId);
      
      // 1. Deduct from the selected payment account balance
      await tx.account.update({
        where: { id: parsedAccountId },
        data: { balance: { decrement: paymentAmount } }
      });
      
      // 2. Increment paidAmount on the expense, update accountId, date, and set reminder to false if fully paid
      const isFullyPaid = (Number(expense.paidAmount) + paymentAmount) >= Number(expense.amount);
      
      const updated = await tx.expense.update({
        where: { id },
        data: {
          accountId: parsedAccountId,
          paidAmount: { increment: paymentAmount },
          date: new Date(), // Set date to actual payment execution date
          reminder: isFullyPaid ? false : expense.reminder // Clear reminder checkmark only when fully paid
        }
      });
      
      return updated;
    });
    
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id(\\d+)/postpone', requireAuth, requirePermission('cheques', 'create'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { postponeDate, reason } = req.body;

    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Expense not found' });


    const originalDateStr = new Date(existing.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const targetDateStr = new Date(postponeDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const postponementLog = "[Postponed from " + originalDateStr + " to " + targetDateStr + (reason ? ": " + reason : "") + "]";
    const updatedNote = existing.note 
      ? existing.note + " " + postponementLog
      : postponementLog;

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        date: new Date(postponeDate),
        reminder: false, // Automatically clears the manager reminder!
        note: updatedNote
      }
    });

    res.json(expense);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// Edit expense details (amount, note, etc.)
router.patch('/:id(\\d+)', requireAuth, requirePermission('expenses', 'edit'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { category, amount, accountId, date, note } = req.body;
    
    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    
    if (amount !== undefined && parseFloat(amount) < Number(expense.paidAmount)) {
      return res.status(400).json({ error: 'New amount cannot be less than the already paid amount' });
    }
    
    const updated = await prisma.expense.update({
      where: { id },
      data: {
        category,
        amount: amount !== undefined ? parseFloat(amount) : undefined,
        accountId: accountId !== undefined ? parseInt(accountId) : undefined,
        date: date ? new Date(date) : undefined,
        note
      }
    });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
