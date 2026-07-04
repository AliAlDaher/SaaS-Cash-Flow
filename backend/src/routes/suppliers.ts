import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { requireAuth, requirePermission } from '../middleware/auth';

const router = Router();


router.use(requireAuth);

router.post('/', requirePermission('suppliers', 'create'), async (req: Request, res: Response, next) => {
  try {
    const { name, paymentTermDays } = req.body;
    const supplier = await prisma.supplier.create({
      data: { name, paymentTermDays: paymentTermDays ? parseInt(paymentTermDays) : 0 },
    });
    res.status(201).json(supplier);
  } catch (error) {
    next(error);
  }
});

router.get('/', requirePermission('suppliers', 'view'), async (req: Request, res: Response, next) => {
  try {
    const suppliers = await prisma.supplier.findMany({ orderBy: { id: "desc" } });
    res.json(suppliers);
  } catch (error: any) {
    next(error);
  }
});

router.put('/:id', requirePermission('suppliers', 'edit'), async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;
    const { name, paymentTermDays } = req.body;
    const data: any = { name };
    if (paymentTermDays !== undefined) data.paymentTermDays = parseInt(paymentTermDays);
    const supplier = await prisma.supplier.update({
      where: { id: parseInt(id) },
      data,
    });
    res.json(supplier);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', requirePermission('suppliers', 'delete'), async (req: Request, res: Response, next) => {
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
    next(error);
  }
});

export default router;