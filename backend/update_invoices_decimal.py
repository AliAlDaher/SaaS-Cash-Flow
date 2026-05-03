import re

def main():
    path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/backend/src/routes/invoices.ts'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add Decimal import
    content = content.replace(
        "import { PrismaClient } from '@prisma/client';",
        "import { PrismaClient } from '@prisma/client';\nimport { Decimal } from '@prisma/client/runtime/library';"
    )

    # Update POST /
    content = content.replace('amount: parseFloat(amount),', 'amount: new Decimal(amount),')
    
    # Update PUT /:id
    content = content.replace('const parsedAmount = parseFloat(amount);', 'const parsedAmount = new Decimal(amount);')
    content = content.replace('if (parsedAmount < existingInvoice.paidAmount)', 'if (parsedAmount.lessThan(new Decimal(existingInvoice.paidAmount)))')
    
    # Update PATCH /:id/reminder
    content = content.replace('parseFloat(reminderAmount)', 'new Decimal(reminderAmount)')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Success updating invoices.ts with Decimal")

if __name__ == '__main__':
    main()