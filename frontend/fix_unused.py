path = r'c:\\Users\\DELL\\.gemini\\antigravity\\brain\\1e70835b-96e1-481b-8a66-641bd45c1cc5\\cash-flow-system\\frontend\\src\\App.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove onQuickPay from PaymentsTab
old_pay = 'function PaymentsTab({ suppliers, payments, accounts, onRefresh, onDelete, onSupplierClick, onQuickPay }: { suppliers: Supplier[], payments: Payment[], accounts: Account[], onRefresh: () => void, onDelete: (id: number) => void, onSupplierClick?: (s: Supplier) => void, onQuickPay?: (inv: Invoice) => void }) {'
new_pay = 'function PaymentsTab({ suppliers, payments, accounts, onRefresh, onDelete, onSupplierClick }: { suppliers: Supplier[], payments: Payment[], accounts: Account[], onRefresh: () => void, onDelete: (id: number) => void, onSupplierClick?: (s: Supplier) => void }) {'

content = content.replace(old_pay, new_pay)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
