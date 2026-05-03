import re

def main():
    path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/backend/src/routes/invoices.ts'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    content = content.replace('if (invoice.paidAmount > 0)', 'if (new Decimal(invoice.paidAmount).greaterThan(0))')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Success fixing invoices.ts comparison")

if __name__ == '__main__':
    main()