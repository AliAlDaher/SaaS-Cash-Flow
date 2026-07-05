import { Decimal } from '@prisma/client/runtime/library';

export async function recalculateFIFO(tx: any, supplierId: number) {
  // Reset all invoices paidAmount to 0
  await tx.invoice.updateMany({
    where: { supplierId },
    data: { paidAmount: 0 }
  });

  const invoices = await tx.invoice.findMany({
    where: { supplierId },
    orderBy: { createdAt: 'asc' }
  });

  const payments = await tx.payment.findMany({
    where: { supplierId },
    orderBy: [{ paymentDate: 'asc' }, { createdAt: 'asc' }]
  });

  const invoicePaidAmounts: Record<number, Decimal> = {};
  invoices.forEach((inv: any) => invoicePaidAmounts[inv.id] = new Decimal(0));

  let unlinkedPaymentsTotal = new Decimal(0);

  for (const p of payments) {
    const amount = new Decimal(p.amount);
    if (p.invoiceId && invoicePaidAmounts[p.invoiceId] !== undefined) {
      invoicePaidAmounts[p.invoiceId] = invoicePaidAmounts[p.invoiceId].plus(amount);
    } else {
      unlinkedPaymentsTotal = unlinkedPaymentsTotal.plus(amount);
    }
  }

  for (const inv of invoices) {
    const invAmount = new Decimal(inv.amount);
    let specificPaid = invoicePaidAmounts[inv.id];
    let remainingAmount = invAmount.minus(specificPaid);
    
    if (remainingAmount.isNegative()) {
      unlinkedPaymentsTotal = unlinkedPaymentsTotal.plus(remainingAmount.abs());
      specificPaid = invAmount;
      remainingAmount = new Decimal(0);
    }

    let fifoApplied = new Decimal(0);
    if (unlinkedPaymentsTotal.greaterThan(0) && remainingAmount.greaterThan(0)) {
      fifoApplied = Decimal.min(remainingAmount, unlinkedPaymentsTotal);
      unlinkedPaymentsTotal = unlinkedPaymentsTotal.minus(fifoApplied);
    }

    const newPaidAmount = specificPaid.plus(fifoApplied);
    const updateData: any = { paidAmount: newPaidAmount };
    
    if (inv.reminder) {
      const baseline = new Decimal(inv.reminderBaseline || 0);
      const requested = inv.reminderAmount ? new Decimal(inv.reminderAmount) : new Decimal(inv.amount).minus(baseline);
      const target = baseline.plus(requested);
      
      if (newPaidAmount.greaterThanOrEqualTo(target)) {
        updateData.reminder = false;
        updateData.reminderAmount = null;
        updateData.reminderBaseline = 0;
      }
    }

    await tx.invoice.update({
      where: { id: inv.id },
      data: updateData
    });
  }
}
