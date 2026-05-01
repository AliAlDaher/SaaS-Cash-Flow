import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requirePermission } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(requireAuth);

router.post('/', requirePermission('suppliers', 'create'), async (req: Request, res: Response) => {
  try {
    const { name, priority, paymentTermDays } = req.body;
    const supplier = await prisma.supplier.create({
      data: { name, priority, paymentTermDays: paymentTermDays ? parseInt(paymentTermDays) : 0 },
    });
    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ error: 'Error creating supplier' });
  }
});

router.get('/', requirePermission('suppliers', 'view'), async (req: Request, res: Response) => {
  try {
    const suppliers = await prisma.supplier.findMany({ orderBy: { id: "desc" } });
    res.json(suppliers);
  } catch (error: any) {
    res.status(500).json({ error: 'Error fetching suppliers', details: error.message || String(error) });
  }
});

router.get('/:id', requirePermission('suppliers', 'view'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const supplier = await prisma.supplier.findUnique({
      where: { id: parseInt(id) },
    });
    if (supplier) {
      res.json(supplier);
    } else {
      res.status(404).json({ error: 'Supplier not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching supplier' });
  }
});

router.put('/:id', requirePermission('suppliers', 'edit'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, priority, paymentTermDays } = req.body;
    const data: any = { name, priority };
    if (paymentTermDays !== undefined) data.paymentTermDays = parseInt(paymentTermDays);
    const supplier = await prisma.supplier.update({
      where: { id: parseInt(id) },
      data,
    });
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: 'Error updating supplier' });
  }
});

router.delete('/:id', requirePermission('suppliers', 'delete'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const supplierId = parseInt(id);

    const invoicesCount = await prisma.invoice.count({ where: { supplierId } });
    const paymentsCount = await prisma.payment.count({ where: { supplierId } });

    if (invoicesCount > 0 || paymentsCount > 0) {
      return res.status(400).json({ error: 'Cannot delete supplier because it has existing invoices or payments.' });
    }

    await prisma.supplier.delete({
      where: { id: supplierId },
    });
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: 'Error deleting supplier', details: error.message || String(error) });
  }
});

export default router;