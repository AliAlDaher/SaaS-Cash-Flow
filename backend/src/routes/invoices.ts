import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requirePermission } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(requireAuth);

router.post('/', requirePermission('invoices', 'create'), async (req: Request, res: Response) => {
  try {
    const { supplierId, amount, invoiceDate, description } = req.body;
    
    const supplier = await prisma.supplier.findUnique({
      where: { id: parseInt(supplierId) }
    });
    
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    const baseDate = invoiceDate ? new Date(invoiceDate) : new Date();
    
    const dueDate = new Date(baseDate);
    dueDate.setDate(dueDate.getDate() + (supplier.paymentTermDays || 0));

    const invoice = await prisma.invoice.create({
      data: {
        supplierId: parseInt(supplierId),
        amount: parseFloat(amount),
        invoiceDate: baseDate,
        dueDate,
        description: description || null,
      },
    });
    res.status(201).json(invoice);
  } catch (error: any) {
    res.status(500).json({ error: 'Error creating invoice', details: error.message || String(error) });
  }
});

router.put('/:id', requirePermission('invoices', 'edit'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, invoiceDate, description } = req.body;

    const parsedAmount = parseFloat(amount);

    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: parseInt(id) },
      include: { supplier: true }
    });

    if (!existingInvoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    if (parsedAmount < existingInvoice.paidAmount) {
      return res.status(400).json({ error: 'Amount cannot be less than already paid amount' });
    }

    const baseDate = invoiceDate ? new Date(invoiceDate) : existingInvoice.invoiceDate;
    const dueDate = new Date(baseDate);
    dueDate.setDate(dueDate.getDate() + (existingInvoice.supplier.paymentTermDays || 0));

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

router.get('/', requirePermission('invoices', 'view'), async (req: Request, res: Response) => {
  try {
    const invoices = await prisma.invoice.findMany({ orderBy: { id: "desc" }, include: { supplier: true } });
    res.json(invoices);
  } catch (error: any) {
    res.status(500).json({ error: 'Error fetching invoices', details: error.message || String(error) });
  }
});

router.get('/:supplierId', requirePermission('invoices', 'view'), async (req: Request, res: Response) => {
  try {
    const { supplierId } = req.params;
    const invoices = await prisma.invoice.findMany({ where: { supplierId: parseInt(supplierId) }, orderBy: { id: "desc" } });
    res.json(invoices);
  } catch (error: any) {
    res.status(500).json({ error: 'Error fetching supplier invoices', details: error.message || String(error) });
  }
});

router.delete('/:id', requirePermission('invoices', 'delete'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const invoiceId = parseInt(id);

    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    if (invoice.paidAmount > 0) {
      return res.status(400).json({ error: 'Cannot delete invoice because it has payments applied.' });
    }

    await prisma.invoice.delete({ where: { id: invoiceId } });
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: 'Error deleting invoice', details: error.message || String(error) });
  }
});

export default router;
