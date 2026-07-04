import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { requireAuth, requirePermission } from '../middleware/auth';

const router = Router();


router.use(requireAuth);

router.post('/', requirePermission('invoices', 'create'), async (req: Request, res: Response, next) => {
  try {
    const { supplierId, amount, invoiceDate, description, dueDate: customDueDate } = req.body;
    
    if (!supplierId || amount === undefined || amount === null || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ error: 'supplierId and a positive amount are required' });
    }
    
    const supplier = await prisma.supplier.findUnique({
      where: { id: parseInt(supplierId) }
    });
    
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    const baseDate = invoiceDate ? new Date(invoiceDate) : new Date();
    
    const dueDate = customDueDate ? new Date(customDueDate) : (() => {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + (supplier.paymentTermDays || 0));
      return d;
    })();

    const invoice = await prisma.invoice.create({
      data: {
        supplierId: parseInt(supplierId),
        amount: new Decimal(amount),
        invoiceDate: baseDate,
        dueDate,
        description: description || null,
      },
    });
    res.status(201).json(invoice);
  } catch (error: any) {
    next(error);
  }
});

router.put('/:id', requirePermission('invoices', 'edit'), async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;
    const { amount, invoiceDate, description, dueDate: customDueDate } = req.body;

    const parsedAmount = new Decimal(amount);

    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: parseInt(id) },
      include: { supplier: true }
    });

    if (!existingInvoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    if (parsedAmount.lessThan(new Decimal(existingInvoice.paidAmount))) {
      return res.status(400).json({ error: 'Amount cannot be less than already paid amount' });
    }

    const baseDate = invoiceDate ? new Date(invoiceDate) : existingInvoice.invoiceDate;
    const dueDate = customDueDate ? new Date(customDueDate) : (() => {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + (existingInvoice.supplier.paymentTermDays || 0));
      return d;
    })();

    const invoice = await prisma.invoice.update({
      where: { id: parseInt(id) },
      data: {
        amount: parsedAmount,
        invoiceDate: baseDate,
        dueDate,
        description: description !== undefined ? description : existingInvoice.description
      }
    });

    res.json(invoice);
  } catch (error: any) {
    res.status(400).json({ error: 'Error updating invoice', details: error.message || String(error) });
  }
});

router.get('/', requirePermission('invoices', 'view'), async (req: Request, res: Response, next) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const search = req.query.search ? (req.query.search as string) : undefined;
    const supplierId = req.query.supplierId ? parseInt(req.query.supplierId as string) : undefined;

    const whereClause: any = {};
    if (supplierId) {
      whereClause.supplierId = supplierId;
    }
    if (search) {
      whereClause.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { supplier: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (page !== undefined && limit !== undefined) {
      const skip = (page - 1) * limit;
      const [invoices, totalCount] = await Promise.all([
        prisma.invoice.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { id: "desc" },
          include: { supplier: true }
        }),
        prisma.invoice.count({ where: whereClause })
      ]);

      res.json({
        invoices,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        currentPage: page
      });
    } else {
      const invoices = await prisma.invoice.findMany({
        where: whereClause,
        orderBy: { id: "desc" },
        include: { supplier: true }
      });
      res.json(invoices);
    }
  } catch (error: any) {
    next(error);
  }
});

router.delete('/:id', requirePermission('invoices', 'delete'), async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;
    const invoiceId = parseInt(id);

    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    if (new Decimal(invoice.paidAmount).greaterThan(0)) {
      return res.status(400).json({ error: 'Cannot delete invoice because it has payments applied.' });
    }

    await prisma.invoice.delete({ where: { id: invoiceId } });
    res.status(204).send();
  } catch (error: any) {
    next(error);
  }
});

router.patch('/:id/reminder', requirePermission('invoices', 'edit'), async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;
    const { reminder, reminderAmount } = req.body;

    const existing = await prisma.invoice.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return res.status(404).json({ error: 'Invoice not found' });

    const updateData: any = { reminder: Boolean(reminder) };
    if (reminder) {
      updateData.reminderBaseline = existing.paidAmount;
      if (reminderAmount !== undefined) {
        updateData.reminderAmount = reminderAmount === null ? null : new Decimal(reminderAmount);
      }
    } else {
      updateData.reminderAmount = null;
      updateData.reminderBaseline = 0;
    }

    const invoice = await prisma.invoice.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json(invoice);
  } catch (error: any) {
    res.status(400).json({ error: 'Error updating invoice reminder', details: error.message || String(error) });
  }
});

export default router;
