import re

def main():
    path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add Decimal import
    if "import { Decimal } from 'decimal.js'" not in content:
        content = content.replace(
            "import { useEffect, useState } from 'react'",
            "import { useEffect, useState } from 'react'\nimport { Decimal } from 'decimal.js'"
        )

    # 2. Update FormatCurrency
    content = re.sub(
        r'function FormatCurrency\(\{ amount \}: \{ amount: number \}\) \{',
        r'function FormatCurrency({ amount }: { amount: number | string | any }) {',
        content
    )
    # Inside FormatCurrency, ensure it handles string or Decimal
    content = re.sub(
        r'const formatted = new Intl\.NumberFormat\(\'en-US\', \{ style: \'currency\', currency: \'JOD\' \}\)\.format\(amount\)',
        r"const val = typeof amount === 'object' && amount?.toNumber ? amount.toNumber() : parseFloat(amount?.toString() || '0');\n  const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'JOD' }).format(val)",
        content
    )

    # 3. Update DashboardTab calculations
    calc_old = '''  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0)
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0)
  const totalRemaining = totalAmount - totalPaid
  const totalCash = accounts.reduce((sum, acc) => sum + acc.balance, 0)
  const totalExpected = collections.filter(c => c.status === 'expected').reduce((sum, c) => sum + c.amountInBase, 0)

  // --- Upcoming & Overdue Payments Logic ---
  const today = startOfDay(new Date())
  const fortyFiveDaysFromNow = addDays(today, 45)
  

  // Total Due (Today)
  const totalDueToday = invoices.reduce((sum, inv) => {
    const due = startOfDay(new Date(inv.dueDate))
    // due <= today
    if (!isBefore(today, due)) {
      return sum + Math.max(0, inv.amount - inv.paidAmount)
    }
    return sum
  }, 0)'''

    calc_new = '''  const totalAmount = invoices.reduce((sum, inv) => sum.plus(new Decimal(inv.amount)), new Decimal(0)).toNumber()
  const totalPaid = invoices.reduce((sum, inv) => sum.plus(new Decimal(inv.paidAmount)), new Decimal(0)).toNumber()
  const totalRemaining = new Decimal(totalAmount).minus(totalPaid).toNumber()
  const totalCash = accounts.reduce((sum, acc) => sum.plus(new Decimal(acc.balance)), new Decimal(0)).toNumber()
  const totalExpected = collections.filter(c => c.status === 'expected').reduce((sum, c) => sum.plus(new Decimal(c.amountInBase)), new Decimal(0)).toNumber()

  // --- Upcoming & Overdue Payments Logic ---
  const today = startOfDay(new Date())
  const fortyFiveDaysFromNow = addDays(today, 45)
  

  // Total Due (Today)
  const totalDueToday = invoices.reduce((sum, inv) => {
    const due = startOfDay(new Date(inv.dueDate))
    // due <= today
    if (!isBefore(today, due)) {
      const remaining = new Decimal(inv.amount).minus(inv.paidAmount);
      return sum.plus(remaining.greaterThan(0) ? remaining : 0);
    }
    return sum
  }, new Decimal(0)).toNumber()'''

    content = content.replace(calc_old, calc_new)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Success updating App.tsx with Decimal logic")

if __name__ == '__main__':
    main()