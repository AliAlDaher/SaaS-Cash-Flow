import re

def main():
    file_path_inv = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/backend/src/routes/invoices.ts'
    with open(file_path_inv, 'r', encoding='utf-8') as f:
        content_inv = f.read()

    bad_inv = '''    const { reminder } = req.body;

    const invoice = await prisma.invoice.update({
      where: { id: parseInt(id) },
      data: { reminder: Boolean(reminder) }
    });'''
    good_inv = '''    const { reminder, reminderAmount } = req.body;

    const updateData: any = { reminder: Boolean(reminder) };
    if (reminder) {
      if (reminderAmount !== undefined) {
        updateData.reminderAmount = reminderAmount === null ? null : parseFloat(reminderAmount);
      }
    } else {
      updateData.reminderAmount = null;
    }

    const invoice = await prisma.invoice.update({
      where: { id: parseInt(id) },
      data: updateData
    });'''
    content_inv = content_inv.replace(bad_inv, good_inv)
    with open(file_path_inv, 'w', encoding='utf-8') as f:
        f.write(content_inv)

    file_path_pay = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/backend/src/routes/payments.ts'
    with open(file_path_pay, 'r', encoding='utf-8') as f:
        content_pay = f.read()

    bad_pay = '''    if (newPaidAmount > 0 && inv.reminder) {
      updateData.reminder = false;
    }'''
    good_pay = '''    if (newPaidAmount > 0 && inv.reminder) {
      updateData.reminder = false;
      updateData.reminderAmount = null;
    }'''
    content_pay = content_pay.replace(bad_pay, good_pay)
    with open(file_path_pay, 'w', encoding='utf-8') as f:
        f.write(content_pay)

    print("Success backend updates")

if __name__ == '__main__':
    main()