path = r'c:\\Users\\DELL\\.gemini\\antigravity\\brain\\1e70835b-96e1-481b-8a66-641bd45c1cc5\\cash-flow-system\\frontend\\src\\App.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add useAuth to InvoiceTable
old_table_start = 'function InvoiceTable({ invoices, suppliers, showDescription = false, onReminderToggle, canToggleReminder = false, onOpenReminderModal, onEditClick, onDeleteClick, onSupplierClick, onQuickPay }: { invoices: Invoice[], suppliers: Supplier[], showDescription?: boolean, onReminderToggle: (id: number, r: boolean, a?: number) => Promise<void>, canToggleReminder?: boolean, onOpenReminderModal: (id: number, rem: number) => void, onEditClick?: (inv: Invoice) => void, onDeleteClick?: (id: number) => void, onSupplierClick?: (s: Supplier) => void, onQuickPay?: (inv: Invoice) => void }) {'

new_table_start = 'function InvoiceTable({ invoices, suppliers, showDescription = false, onReminderToggle, canToggleReminder = false, onOpenReminderModal, onEditClick, onDeleteClick, onSupplierClick, onQuickPay }: { invoices: Invoice[], suppliers: Supplier[], showDescription?: boolean, onReminderToggle: (id: number, r: boolean, a?: number) => Promise<void>, canToggleReminder?: boolean, onOpenReminderModal: (id: number, rem: number) => void, onEditClick?: (inv: Invoice) => void, onDeleteClick?: (id: number) => void, onSupplierClick?: (s: Supplier) => void, onQuickPay?: (inv: Invoice) => void }) {\n  const { user } = useAuth();'

content = content.replace(old_table_start, new_table_start)

# 2. Fix InvoicesTab and SuppliersTab calls to InvoiceTable
# They were missing onQuickPay={onQuickPay} in some places if I missed them earlier.

# Actually, I'll just check if they are correct.
# InvoicesTab:
# old: <InvoiceTable invoices={filtered} suppliers={suppliers} onReminderToggle={onToggleReminder} canToggleReminder={user?.role === "admin" || user?.permissions?.invoices?.reminder} onOpenReminderModal={(id, rem) => setReminderModal({isOpen: true, id, remaining: rem})} onEditClick={handleEditClick} onDeleteClick={onDelete} onSupplierClick={onSupplierClick} onQuickPay={onQuickPay} />
# Wait, I already did this in Step 5 but maybe it failed due to string mismatch.

# Let's use a regex to ensure all InvoiceTable calls have onQuickPay={onQuickPay}
import re
content = re.sub(r'(<InvoiceTable\s+[^>]*?)(/?>)', r'\1 onQuickPay={onQuickPay}\2', content)
# But wait, some might already have it!
# I'll use a safer approach:
content = content.replace('onQuickPay={onQuickPay} onQuickPay={onQuickPay}', 'onQuickPay={onQuickPay}')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
