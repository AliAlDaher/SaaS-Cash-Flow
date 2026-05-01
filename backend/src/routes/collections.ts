import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requirePermission } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(requireAuth);

const getExchangeRate = (currency: string) => {
  if (currency === 'SAR') return 5.3;
  // Ignore USD as requested, fallback to 1
  return 1;
};

router.post('/', requirePermission('collections', 'create'), async (req: Request, res: Response) => {
  try {
    const { amount, currency, accountId, note, expectedDate, receivedDate, status } = req.body;
    
    // Ignore any exchangeRate sent from frontend
    const exchangeRate = getExchangeRate(currency);
    const amountInBase = parseFloat(amount) / exchangeRate;

    const collection = await prisma.$transaction(async (tx) => {
      const newCollection = await tx.collection.create({
        data: {
          amount: parseFloat(amount),
          currency,
          exchangeRate,
          amountInBase,
          accountId: parseInt(accountId),
          note: note || '',
          expectedDate: expectedDate ? new Date(expectedDate) : null,
          receivedDate: receivedDate ? new Date(receivedDate) : new Date(),
          status: status || 'received'
        }
      });

      if (status !== 'expected') {
        await tx.account.update({
          where: { id: parseInt(accountId) },
          data: {
            balance: { increment: amountInBase }
          }
        });
      }

      return newCollection;
    });

    res.status(201).json(collection);
  } catch (error: any) {
    res.status(500).json({ error: 'Error creating collection', details: error.message || String(error) });
  }
});

router.put('/:id', requirePermission('collections', 'edit'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, currency, accountId, note, expectedDate, receivedDate, status } = req.body;
    
    // Ignore any exchangeRate sent from frontend
    const exchangeRate = getExchangeRate(currency);
    const newAmountInBase = parseFloat(amount) / exchangeRate;

    const collection = await prisma.$transaction(async (tx) => {
      const existing = await tx.collection.findUnique({ where: { id: parseInt(id) } });
      if (!existing) throw new Error('Collection not found');

      // 1. Reverse old
      if (existing.status !== 'expected') {
        await tx.account.update({
          where: { id: existing.accountId },
          data: { balance: { decrement: existing.amountInBase } }
        });
      }

      // 2. Apply new
      const newStatus = status || existing.status;
      if (newStatus !== 'expected') {
        await tx.account.update({
          where: { id: parseInt(accountId) },
          data: { balance: { increment: newAmountInBase } }
        });
      }

      // 3. Update collection record
      const updated = await tx.collection.update({
        where: { id: parseInt(id) },
        data: {
          amount: parseFloat(amount),
          currency,
          exchangeRate,
          amountInBase: newAmountInBase,
          accountId: parseInt(accountId),
          note: note || '',
          expectedDate: expectedDate ? new Date(expectedDate) : null,
          receivedDate: receivedDate ? new Date(receivedDate) : existing.receivedDate,
          status: newStatus
        }
      });

      return updated;
    });

    res.json(collection);
  } catch (error: any) {
    res.status(400).json({ error: 'Error updating collection', details: error.message || String(error) });
  }
});

router.get('/', requirePermission('collections', 'view'), async (req: Request, res: Response) => {
  try {
    const collections = await prisma.collection.findMany({ orderBy: { id: "desc" }
    });
    res.json(collections);
  } catch (error: any) {
    res.status(500).json({ error: 'Error fetching collections', details: error.message || String(error) });
  }
});

router.delete('/:id', requirePermission('collections', 'delete'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.$transaction(async (tx) => {
      const collection = await tx.collection.findUnique({ where: { id: parseInt(id) } });
      if (!collection) throw new Error('Collection not found');

      // 1. Reverse account balance
      if (collection.status !== 'expected') {
        await tx.account.update({
          where: { id: collection.accountId },
          data: { balance: { decrement: collection.amountInBase } }
        });
      }

      // 2. Delete collection
      await tx.collection.delete({ where: { id: parseInt(id) } });
    });

    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: 'Error deleting collection', details: error.message || String(error) });
  }
});


router.patch('/:id/status', requirePermission('collections', 'edit'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const collection = await prisma.$transaction(async (tx) => {
      const existing = await tx.collection.findUnique({ where: { id: parseInt(id) } });
      if (!existing) throw new Error('Collection not found');
      if (existing.status === 'received') throw new Error('Collection is already marked as received');

      // Update status and date
      const updated = await tx.collection.update({
        where: { id: parseInt(id) },
        data: {
          status: 'received',
          receivedDate: new Date()
        }
      });

      // Increment balance
      await tx.account.update({
        where: { id: existing.accountId },
        data: { balance: { increment: existing.amountInBase } }
      });

      return updated;
    });

    res.json(collection);
  } catch (error: any) {
    res.status(400).json({ error: 'Error updating status', details: error.message || String(error) });
  }
});

export default router;
