import fs from 'fs';
import path from 'path';
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



// Add new expense (handling Paid/Unpaid status toggles and account deductions)
router.post('/', requireAuth, requirePermission('expenses', 'create'), async (req, res) => {
  const { category, amount, accountId, date, note, status } = req.body;
  try {
    const parsedAmount = parseFloat(amount);
    const parsedAccountId = parseInt(accountId);
    
    if (!category || amount === undefined || amount === null || isNaN(parsedAmount) || parsedAmount <= 0 || accountId === undefined || accountId === null || isNaN(parsedAccountId) || !date || isNaN(Date.parse(date))) {
      return res.status(400).json({ error: 'category, positive amount, accountId, and a valid date are required' });
    }
    
    const isPaid = status === 'paid';
    
    const expense = await prisma.$transaction(async (tx) => {
      // 1. Deduct from account balance immediately if Paid
      if (isPaid && parsedAmount > 0) {
        await tx.account.update({
          where: { id: parsedAccountId },
          data: { balance: { decrement: parsedAmount } }
        });
      }

      // 2. Create the expense record
      const created = await tx.expense.create({
        data: {
          category,
          amount: parsedAmount,
          paidAmount: isPaid ? parsedAmount : 0, // Unpaid or Paid
          accountId: parsedAccountId,
          date: new Date(date),
          note
        }
      });
      return created;
    });
    
    res.status(201).json(expense);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to create expense' });
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


// Edit expense details (handling Paid/Unpaid changes and adjusting account balances)
router.patch('/:id(\\d+)', requireAuth, requirePermission('expenses', 'edit'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { category, amount, accountId, date, note, status } = req.body;
    
    const updated = await prisma.$transaction(async (tx) => {
      const expense = await tx.expense.findUnique({ where: { id } });
      if (!expense) throw new Error('Expense not found');
      
      const oldAmount = Number(expense.amount);
      const oldPaid = Number(expense.paidAmount);
      const oldAccountId = expense.accountId;
      
      const newAmount = amount !== undefined ? parseFloat(amount) : oldAmount;
      const newAccountId = accountId !== undefined ? parseInt(accountId) : oldAccountId;
      
      const isPaid = status !== undefined ? status === 'paid' : (oldPaid >= oldAmount);
      const newPaid = isPaid ? newAmount : 0;
      
      // 1. Revert the old payment from the old account
      if (oldPaid > 0) {
        await tx.account.update({
          where: { id: oldAccountId },
          data: { balance: { increment: oldPaid } }
        });
      }
      
      // 2. Apply the new payment to the new account
      if (newPaid > 0) {
        await tx.account.update({
          where: { id: newAccountId },
          data: { balance: { decrement: newPaid } }
        });
      }
      
      const updatedExpense = await tx.expense.update({
        where: { id },
        data: {
          category,
          amount: newAmount,
          paidAmount: newPaid,
          accountId: newAccountId,
          date: date ? new Date(date) : undefined,
          note
        }
      });
      return updatedExpense;
    });
    
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


const categoriesFilePath = path.join(__dirname, '../../categories.json');
const defaultCategoriesList = ['إيجار', 'محروقات', 'رواتب', 'صيانة', 'كهرباء', 'مياه', 'إنترنت', 'مستلزمات مكتبية', 'تسويق', 'ضرائب', 'الضمان الاجتماعي', 'أخرى'];

router.get('/categories', requireAuth, (req, res) => {
  try {
    if (fs.existsSync(categoriesFilePath)) {
      const data = fs.readFileSync(categoriesFilePath, 'utf-8');
      return res.json(JSON.parse(data));
    }
    res.json(defaultCategoriesList);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/categories', requireAuth, requirePermission('expenses', 'edit'), (req, res) => {
  try {
    const { categories } = req.body;
    if (!Array.isArray(categories)) {
      return res.status(400).json({ error: 'categories must be an array' });
    }
    fs.writeFileSync(categoriesFilePath, JSON.stringify(categories, null, 2), 'utf-8');
    res.json({ success: true, categories });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
