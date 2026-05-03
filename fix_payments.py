path = r'c:\Users\DELL\.gemini\antigravity\brain\1e70835b-96e1-481b-8a66-641bd45c1cc5\cash-flow-system\frontend\src\App.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old_payments_tab = 'function PaymentsTab({ suppliers, payments, accounts, onRefresh, onDelete, onSupplierClick }: { suppliers: Supplier[], payments: Payment[], accounts: Account[], onRefresh: () => void, setSuppliers?: React.Dispatch<React.SetStateAction<Supplier[]>>, setInvoices?: React.Dispatch<React.SetStateAction<Invoice[]>>, setPayments?: React.Dispatch<React.SetStateAction<Payment[]>>, setAccounts?: React.Dispatch<React.SetStateAction<Account[]>>, setCollections?: React.Dispatch<React.SetStateAction<Collection[]>>, onDelete: (id: number) => void, onSupplierClick?: (s: Supplier) => void }) {'
new_payments_tab = 'function PaymentsTab({ suppliers, payments, accounts, onRefresh, onDelete, onSupplierClick, onToggleReminder }: { suppliers: Supplier[], payments: Payment[], accounts: Account[], onRefresh: () => void, setSuppliers?: React.Dispatch<React.SetStateAction<Supplier[]>>, setInvoices?: React.Dispatch<React.SetStateAction<Invoice[]>>, setPayments?: React.Dispatch<React.SetStateAction<Payment[]>>, setAccounts?: React.Dispatch<React.SetStateAction<Account[]>>, setCollections?: React.Dispatch<React.SetStateAction<Collection[]>>, onDelete: (id: number) => void, onSupplierClick?: (s: Supplier) => void, onToggleReminder?: (id: number, r: boolean, a?: number) => Promise<void> }) {'

content = content.replace(old_payments_tab, new_payments_tab)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
