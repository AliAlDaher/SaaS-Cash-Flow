import re

def main():
    path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/backend/src/routes/payments.ts'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add Decimal import
    content = content.replace(
        "import { PrismaClient } from '@prisma/client';",
        "import { PrismaClient } from '@prisma/client';\nimport { Decimal } from '@prisma/client/runtime/library';"
    )

    # Rewrite recalculateFIFO
    recalculate_fifo_old = '''async function recalculateFIFO(tx: any, supplierId: number) {
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

  const invoicePaidAmounts: Record<number, number> = {};
  invoices.forEach((inv: any) => invoicePaidAmounts[inv.id] = 0);

  let unlinkedPaymentsTotal = 0;

  for (const p of payments) {
    if (p.invoiceId && invoicePaidAmounts[p.invoiceId] !== undefined) {
      invoicePaidAmounts[p.invoiceId] += p.amount;
    } else {
      unlinkedPaymentsTotal += p.amount;
    }
  }

  for (const inv of invoices) {
    let specificPaid = invoicePaidAmounts[inv.id];
    let remainingAmount = inv.amount - specificPaid;
    
    if (remainingAmount < 0) {
      unlinkedPaymentsTotal += Math.abs(remainingAmount);
      specificPaid = inv.amount;
      remainingAmount = 0;
    }

    let fifoApplied = 0;
    if (unlinkedPaymentsTotal > 0 && remainingAmount > 0) {
      fifoApplied = Math.min(remainingAmount, unlinkedPaymentsTotal);
      unlinkedPaymentsTotal -= fifoApplied;
    }

    const newPaidAmount = specificPaid + fifoApplied;
    const updateData: any = { paidAmount: newPaidAmount };
    if (newPaidAmount > 0 && inv.reminder) {
      updateData.reminder = false;
      updateData.reminderAmount = null;
    }

    await tx.invoice.update({
      where: { id: inv.id },
      data: updateData
    });
  }
}'''

    recalculate_fifo_new = '''async function recalculateFIFO(tx: any, supplierId: number) {
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
    if (newPaidAmount.greaterThan(0) && inv.reminder) {
      updateData.reminder = false;
      updateData.reminderAmount = null;
    }

    await tx.invoice.update({
      where: { id: inv.id },
      data: updateData
    });
  }
}'''

    content = content.replace(recalculate_fifo_old, recalculate_fifo_new)

    # 2. Update POST / (Record Payment)
    content = content.replace('const parsedAmount = parseFloat(amount);', 'const parsedAmount = new Decimal(amount);')
    content = content.replace('if (!account || account.balance < parsedAmount)', 'if (!account || new Decimal(account.balance).lessThan(parsedAmount))')
    
    # 3. Update PUT /:id (Edit Payment)
    content = content.replace('const newAmount = parseFloat(amount);', 'const newAmount = new Decimal(amount);')
    content = content.replace(
        'if (oldPayment.accountId !== newAccountId || oldPayment.amount !== newAmount) {',
        'if (oldPayment.accountId !== newAccountId || !new Decimal(oldPayment.amount).equals(newAmount)) {'
    )
    # Note: Prisma handles balance: { increment: ... } correctly with Decimal objects

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Success updating payments.ts with Decimal")

if __name__ == '__main__':
    main()