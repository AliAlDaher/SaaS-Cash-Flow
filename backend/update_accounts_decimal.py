import re

def main():
    path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/backend/src/routes/accounts.ts'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add Decimal import
    content = content.replace(
        "import { PrismaClient } from '@prisma/client';",
        "import { PrismaClient } from '@prisma/client';\nimport { Decimal } from '@prisma/client/runtime/library';"
    )

    # Update POST /
    content = content.replace('balance: balance ? parseFloat(balance) : 0', 'balance: balance ? new Decimal(balance) : new Decimal(0)')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Success updating accounts.ts with Decimal")

if __name__ == '__main__':
    main()