import re

def main():
    path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/ReportsTab.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add Decimal import
    if "import { Decimal } from 'decimal.js'" not in content:
        content = "import { Decimal } from 'decimal.js';\n" + content

    # 2. Update FormatCurrency
    content = re.sub(
        r'function FormatCurrency\(\{ amount \}: \{ amount: number \}\) \{',
        r'function FormatCurrency({ amount }: { amount: any }) {',
        content
    )
    content = re.sub(
        r'\{amount\.toLocaleString\(undefined, \{minimumFractionDigits: 2\}\)\}',
        r"{new Decimal(amount || 0).toNumber().toLocaleString(undefined, {minimumFractionDigits: 2})}",
        content
    )

    # 3. Update calculations
    content = content.replace(
        'const totalIncoming = filteredCollections.filter((c: any) => c.status === \'received\').reduce((sum: number, c: any) => sum + c.amountInBase, 0);',
        'const totalIncoming = filteredCollections.filter((c: any) => c.status === \'received\').reduce((sum: any, c: any) => sum.plus(new Decimal(c.amountInBase)), new Decimal(0)).toNumber();'
    )
    content = content.replace(
        'const totalOutgoing = filteredPayments.reduce((sum: number, p: any) => sum + p.amount, 0);',
        'const totalOutgoing = filteredPayments.reduce((sum: any, p: any) => sum.plus(new Decimal(p.amount)), new Decimal(0)).toNumber();'
    )
    content = content.replace(
        'const netCash = totalIncoming - totalOutgoing;',
        'const netCash = new Decimal(totalIncoming).minus(totalOutgoing).toNumber();'
    )
    content = content.replace(
        'const expectedCollections = filteredCollections.filter((c: any) => c.status === \'expected\').reduce((sum: number, c: any) => sum + c.amountInBase, 0);',
        'const expectedCollections = filteredCollections.filter((c: any) => c.status === \'expected\').reduce((sum: any, c: any) => sum.plus(new Decimal(c.amountInBase)), new Decimal(0)).toNumber();'
    )

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Success updating ReportsTab.tsx with Decimal logic")

if __name__ == '__main__':
    main()