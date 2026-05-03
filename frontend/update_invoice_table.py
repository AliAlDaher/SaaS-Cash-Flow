path = r'c:\\Users\\DELL\\.gemini\\antigravity\\brain\\1e70835b-96e1-481b-8a66-641bd45c1cc5\\cash-flow-system\\frontend\\src\\App.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update InvoiceTable props
old_props = 'function InvoiceTable({ invoices, suppliers, showDescription = false, onReminderToggle, canToggleReminder = false, onOpenReminderModal, onEditClick, onDeleteClick, onSupplierClick }: { invoices: Invoice[], suppliers: Supplier[], showDescription?: boolean, onReminderToggle: (id: number, r: boolean, a?: number) => Promise<void>, canToggleReminder?: boolean, onOpenReminderModal: (id: number, rem: number) => void, onEditClick?: (inv: Invoice) => void, onDeleteClick?: (id: number) => void, onSupplierClick?: (s: Supplier) => void }) {'

new_props = 'function InvoiceTable({ invoices, suppliers, showDescription = false, onReminderToggle, canToggleReminder = false, onOpenReminderModal, onEditClick, onDeleteClick, onSupplierClick, onQuickPay }: { invoices: Invoice[], suppliers: Supplier[], showDescription?: boolean, onReminderToggle: (id: number, r: boolean, a?: number) => Promise<void>, canToggleReminder?: boolean, onOpenReminderModal: (id: number, rem: number) => void, onEditClick?: (inv: Invoice) => void, onDeleteClick?: (id: number) => void, onSupplierClick?: (s: Supplier) => void, onQuickPay?: (inv: Invoice) => void }) {'

content = content.replace(old_props, new_props)

# 2. Add Pay Now button to InvoiceTable
old_actions_start = '                  <button onClick={() => onEditClick(invoice)} className="text-sky-600 hover:text-sky-900 font-medium text-sm mr-4">Edit</button>'

new_actions_start = """                  {invoice.reminder && onQuickPay && (user?.role === 'admin' || user?.permissions?.payments?.create) && (
                    <button 
                      onClick={() => onQuickPay(invoice)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-all border border-emerald-100 mr-3"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      Pay Now
                    </button>
                  )}
                  <button onClick={() => onEditClick(invoice)} className="text-sky-600 hover:text-sky-900 font-medium text-sm mr-4">Edit</button>"""

content = content.replace(old_actions_start, new_actions_start)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
