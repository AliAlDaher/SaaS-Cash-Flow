import re

def main():
    path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/backend/src/routes/payments.ts'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    old_clear_logic = '''    const newPaidAmount = specificPaid.plus(fifoApplied);
    const updateData: any = { paidAmount: newPaidAmount };
    if (newPaidAmount.greaterThan(0) && inv.reminder) {
      updateData.reminder = false;
      updateData.reminderAmount = null;
    }'''

    new_clear_logic = '''    const newPaidAmount = specificPaid.plus(fifoApplied);
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
    }'''

    content = content.replace(old_clear_logic, new_clear_logic)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Updated recalculateFIFO logic")

if __name__ == '__main__':
    main()