import re

def main():
    path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/backend/src/routes/invoices.ts'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    old_patch = '''router.patch(\'/:id/reminder\', requirePermission(\'invoices\', \'reminder\'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reminder, reminderAmount } = req.body;

    const updateData: any = { reminder: Boolean(reminder) };
    if (reminder) {
      if (reminderAmount !== undefined) {
        updateData.reminderAmount = reminderAmount === null ? null : new Decimal(reminderAmount)
      }
    } else {
      updateData.reminderAmount = null;
    }

    const invoice = await prisma.invoice.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json(invoice);
  } catch (error: any) {
    res.status(400).json({ error: \'Error updating invoice reminder\', details: error.message || String(error) });
  }
});'''

    new_patch = '''router.patch('/:id/reminder', requirePermission('invoices', 'reminder'), async (req: Request, res: Response) => {
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
});'''

    # Use regex to find it more reliably if spacing differs
    # But since I wrote it recently, it should be exact.
    if old_patch in content:
        content = content.replace(old_patch, new_patch)
        print("Replaced patch route")
    else:
        # Fallback to a simpler replacement if exact match fails
        content = re.sub(r'router\.patch\(\'/:id/reminder\'[\s\S]+?\}\);', new_patch, content)
        print("Replaced patch route via regex")

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    main()