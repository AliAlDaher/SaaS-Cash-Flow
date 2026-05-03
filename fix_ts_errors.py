import re

def main():
    file_path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Fix PaymentReminderModal props (it doesn't need totalAmount)
    content = content.replace(
        'onConfirm: (amount: number) => void, totalAmount: number\n    remainingAmount: number',
        'onConfirm: (amount: number) => void, remainingAmount: number'
    )

    # 2. Fix unused variable remainingAmount in DashboardTab
    content = content.replace(
        'const remainingAmount = inv.amount - inv.paidAmount',
        '' # Remove it
    )

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Fixing TS errors")

if __name__ == '__main__':
    main()