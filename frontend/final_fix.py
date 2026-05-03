path = r'c:\\Users\\DELL\\.gemini\\antigravity\\brain\\1e70835b-96e1-481b-8a66-641bd45c1cc5\\cash-flow-system\\frontend\\src\\App.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix line 1350
broken_line = 'onOpenReminderModal={(id, rem) = onQuickPay={onQuickPay}> setReminderModal({isOpen: true, id, remaining: rem})} onSupplierClick={onSupplierClick} onQuickPay={onQuickPay}'
fixed_line = 'onOpenReminderModal={(id, rem) => setReminderModal({isOpen: true, id, remaining: rem})} onSupplierClick={onSupplierClick} onQuickPay={onQuickPay}'
content = content.replace(broken_line, fixed_line)

# 2. Fix InvoiceTable props and hook
old_table_props = 'function InvoiceTable({ invoices, suppliers, showDescription = false, onEditClick, onDeleteClick, onReminderToggle, canToggleReminder, onOpenReminderModal, onSupplierClick }: { invoices: Invoice[], suppliers: Supplier[], showDescription?: boolean, onEditClick?: (inv: Invoice) => void, onDeleteClick?: (id: number) => void, onReminderToggle?: (id: number, reminder: boolean, amount?: number) => void, canToggleReminder?: boolean, onOpenReminderModal?: (id: number, remaining: number) => void, onSupplierClick?: (s: Supplier) => void }) {'

new_table_props = 'function InvoiceTable({ invoices, suppliers, showDescription = false, onEditClick, onDeleteClick, onReminderToggle, canToggleReminder, onOpenReminderModal, onSupplierClick, onQuickPay }: { invoices: Invoice[], suppliers: Supplier[], showDescription?: boolean, onEditClick?: (inv: Invoice) => void, onDeleteClick?: (id: number) => void, onReminderToggle?: (id: number, reminder: boolean, amount?: number) => void, canToggleReminder?: boolean, onOpenReminderModal?: (id: number, remaining: number) => void, onSupplierClick?: (s: Supplier) => void, onQuickPay?: (inv: Invoice) => void }) {\n  const { user } = useAuth();'

content = content.replace(old_table_props, new_table_props)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
