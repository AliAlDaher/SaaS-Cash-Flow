path = r'c:\\Users\\DELL\\.gemini\\antigravity\\brain\\1e70835b-96e1-481b-8a66-641bd45c1cc5\\cash-flow-system\\frontend\\src\\App.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update InvoicesTab props and pass to InvoiceTable
old_inv_props = 'function InvoicesTab({ suppliers, invoices, onRefresh, onDelete, onSupplierClick, onToggleReminder, setInvoices }: { suppliers: Supplier[], invoices: Invoice[], onRefresh: () => void, onDelete?: (id: number) => void, onSupplierClick?: (s: Supplier) => void, onToggleReminder: (id: number, r: boolean, a?: number) => Promise<void>, setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>> }) {'
new_inv_props = 'function InvoicesTab({ suppliers, invoices, onRefresh, onDelete, onSupplierClick, onToggleReminder, setInvoices, onQuickPay }: { suppliers: Supplier[], invoices: Invoice[], onRefresh: () => void, onDelete?: (id: number) => void, onSupplierClick?: (s: Supplier) => void, onToggleReminder: (id: number, r: boolean, a?: number) => Promise<void>, setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>, onQuickPay?: (inv: Invoice) => void }) {'

content = content.replace(old_inv_props, new_inv_props)

old_inv_table_call = 'onOpenReminderModal={(id, rem) => setReminderModal({isOpen: true, id, remaining: rem})} onEditClick={handleEditClick} onDeleteClick={onDelete} onSupplierClick={onSupplierClick} />'
new_inv_table_call = 'onOpenReminderModal={(id, rem) => setReminderModal({isOpen: true, id, remaining: rem})} onEditClick={handleEditClick} onDeleteClick={onDelete} onSupplierClick={onSupplierClick} onQuickPay={onQuickPay} />'

content = content.replace(old_inv_table_call, new_inv_table_call)

# 2. Update SuppliersTab props and pass to InvoiceTable
old_sup_props = 'function SuppliersTab({ suppliers, invoices, payments, accounts, onRefresh, onDelete, selectedSupplier, setSelectedSupplier, onSupplierClick, onToggleReminder, setSuppliers }: { suppliers: Supplier[], invoices: Invoice[], payments: Payment[], accounts: Account[], onRefresh: () => void, onDelete: (id: number) => void, selectedSupplier: Supplier | null, setSelectedSupplier: (s: Supplier | null) => void, onSupplierClick?: (s: Supplier) => void, onToggleReminder: (id: number, r: boolean, a?: number) => Promise<void>, setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>> }) {'
new_sup_props = 'function SuppliersTab({ suppliers, invoices, payments, accounts, onRefresh, onDelete, selectedSupplier, setSelectedSupplier, onSupplierClick, onToggleReminder, setSuppliers, onQuickPay }: { suppliers: Supplier[], invoices: Invoice[], payments: Payment[], accounts: Account[], onRefresh: () => void, onDelete: (id: number) => void, selectedSupplier: Supplier | null, setSelectedSupplier: (s: Supplier | null) => void, onSupplierClick?: (s: Supplier) => void, onToggleReminder: (id: number, r: boolean, a?: number) => Promise<void>, setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>, onQuickPay?: (inv: Invoice) => void }) {'

content = content.replace(old_sup_props, new_sup_props)

old_sup_inv_table_call = 'onOpenReminderModal={(id, rem) => setReminderModal({isOpen: true, id, remaining: rem})} onSupplierClick={onSupplierClick} />'
new_sup_inv_table_call = 'onOpenReminderModal={(id, rem) => setReminderModal({isOpen: true, id, remaining: rem})} onSupplierClick={onSupplierClick} onQuickPay={onQuickPay} />'

# Note: this might match DashboardTab's call too, which is fine.
content = content.replace(old_sup_inv_table_call, new_sup_inv_table_call)

# 3. Update Routes in App
content = content.replace('onSupplierClick={handleSupplierClick} />', 'onSupplierClick={handleSupplierClick} onQuickPay={openQuickPay} />')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
