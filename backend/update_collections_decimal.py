import re

def main():
    path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/backend/src/routes/collections.ts'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add Decimal import
    content = content.replace(
        "import { PrismaClient } from '@prisma/client';",
        "import { PrismaClient } from '@prisma/client';\nimport { Decimal } from '@prisma/client/runtime/library';"
    )

    # Update POST /
    content = content.replace(
        'const amountInBase = parseFloat(amount) / exchangeRate;',
        'const amountInBase = new Decimal(amount).div(exchangeRate);'
    )
    content = content.replace(
        'amount: parseFloat(amount),',
        'amount: new Decimal(amount),'
    )

    # Update PUT /:id
    content = content.replace(
        'const newAmountInBase = parseFloat(amount) / exchangeRate;',
        'const newAmountInBase = new Decimal(amount).div(exchangeRate);'
    )
    content = content.replace(
        'amount: parseFloat(amount),',
        'amount: new Decimal(amount),'
    )

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Success updating collections.ts with Decimal")

if __name__ == '__main__':
    main()