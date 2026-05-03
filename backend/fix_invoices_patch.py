import re

def main():
    path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/backend/src/routes/invoices.ts'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the first export default router;
    # And keep everything before the first occurrence of the duplicated block
    
    parts = content.split('export default router;')
    if len(parts) > 1:
        # We assume the first part is what we want, but it might have the duplicated patch
        # Let's just find the last closing }); before export
        
        main_content = parts[0]
        # Find the last });
        last_idx = main_content.rfind('});')
        if last_idx != -1:
            # Check if there is another }); before it that is the REAL end
            # Actually, looking at the view_file, line 150 is the real end of the first patch.
            # line 156 is the end of the second.
            
            # Let's just use regex to replace the whole messy end.
            new_content = re.sub(r'router\.patch\(\'/:id/reminder\'[\s\S]+?export default router;', '''router.patch('/:id/reminder', requirePermission('invoices', 'reminder'), async (req: Request, res: Response) => {
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

export default router;''', content)
            
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)

if __name__ == '__main__':
    main()