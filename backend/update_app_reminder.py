import re

def main():
    path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update Invoice type
    content = content.replace(
        'reminderAmount?: number | null',
        'reminderAmount?: number | null\n  reminderBaseline?: number'
    )

    # 2. Update reminder amount display in InvoiceTable
    # Before: {invoice.reminder && invoice.reminderAmount && <span className="text-[10px] font-bold text-emerald-600">{invoice.reminderAmount} JOD</span>}
    
    pattern = r'\{invoice\.reminder && invoice\.reminderAmount && <span className="text-\[10px\] font-bold text-emerald-600">\{invoice\.reminderAmount\} JOD</span>\}'
    
    def replacement(match):
        return '''{invoice.reminder && invoice.reminderAmount && (
                        <span className="text-[10px] font-bold text-emerald-600">
                          {new Decimal(invoice.reminderBaseline || 0).plus(invoice.reminderAmount).minus(invoice.paidAmount).toNumber().toLocaleString()} JOD
                        </span>
                      )}'''

    content = re.sub(pattern, replacement, content)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Updated App.tsx reminder display")

if __name__ == '__main__':
    main()