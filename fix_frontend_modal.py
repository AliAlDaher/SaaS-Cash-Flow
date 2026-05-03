import re

def main():
    file_path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add ReminderModal component
    modal_code = '''
function PaymentReminderModal({ isOpen, onClose, onConfirm, remainingAmount }: { isOpen: boolean, onClose: () => void, onConfirm: (amount: number) => void, remainingAmount: number }) {
  const [amount, setAmount] = useState(remainingAmount.toString())

  useEffect(() => {
    if (isOpen) setAmount(remainingAmount.toString())
  }, [isOpen, remainingAmount])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = parseFloat(amount)
    if (isNaN(parsed) || parsed <= 0 || parsed > remainingAmount) {
      alert('Please enter a valid amount (up to ' + remainingAmount + ')')
      return
    }
    onConfirm(parsed)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Payment Selection</h2>
            <p className="text-sm text-slate-500">Set the amount to pay for this invoice.</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Amount to Pay (JOD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">JOD</span>
              <input 
                type="number" 
                step="0.01"
                max={remainingAmount}
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
                className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                required
                autoFocus
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">Maximum allowed: {remainingAmount.toLocaleString()} JOD</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200">Confirm Payment</button>
          </div>
        </form>
      </div>
    </div>
  )
}
'''
    if 'function PaymentReminderModal' not in content:
        content = content.replace('function DashboardTab', modal_code + '\nfunction DashboardTab')

    # 2. Update global state for ReminderModal.
    # Since InvoiceTable is used in multiple tabs, where do we put the state?
    # We can put it in `App` component and pass `openReminderModal` down.
    # Wait, `handleReminderToggle` is already passed down as `onReminderToggle`.
    # Let's see where `handleReminderToggle` is defined: DashboardTab, SuppliersTab, InvoicesTab.
    # If we put the modal in each tab, it's easier.
    # DashboardTab:
    dash_state = '''  const [reminderModal, setReminderModal] = useState<{isOpen: boolean, id: number, remaining: number}>({isOpen: false, id: 0, remaining: 0})

  const handleReminderToggle = async (id: number, reminder: boolean, amount?: number) => {'''
    content = content.replace('  const handleReminderToggle = async (id: number, reminder: boolean, amount?: number) => {', dash_state, 1)

    dash_modal_jsx = '''      <PaymentReminderModal 
        isOpen={reminderModal.isOpen} 
        onClose={() => setReminderModal({ ...reminderModal, isOpen: false })} 
        remainingAmount={reminderModal.remaining} 
        onConfirm={(amount) => {
          handleReminderToggle(reminderModal.id, true, amount)
          setReminderModal({ ...reminderModal, isOpen: false })
        }} 
      />
    </div>
  )
}'''
    content = content.replace('    </div>\n  )\n}\n\nfunction SuppliersTab', dash_modal_jsx + '\n\nfunction SuppliersTab')

    # SuppliersTab:
    sup_state = '''  const [reminderModal, setReminderModal] = useState<{isOpen: boolean, id: number, remaining: number}>({isOpen: false, id: 0, remaining: 0})

  const handleReminderToggle = async (id: number, reminder: boolean, amount?: number) => {'''
    content = content.replace('  const handleReminderToggle = async (id: number, reminder: boolean, amount?: number) => {', sup_state, 1)
    
    sup_modal_jsx = '''      <PaymentReminderModal 
        isOpen={reminderModal.isOpen} 
        onClose={() => setReminderModal({ ...reminderModal, isOpen: false })} 
        remainingAmount={reminderModal.remaining} 
        onConfirm={(amount) => {
          handleReminderToggle(reminderModal.id, true, amount)
          setReminderModal({ ...reminderModal, isOpen: false })
        }} 
      />
    </div>
  )
}'''
    content = content.replace('    </div>\n  )\n}\n\nfunction InvoicesTab', sup_modal_jsx + '\n\nfunction InvoicesTab')

    # InvoicesTab:
    inv_state = '''  const [reminderModal, setReminderModal] = useState<{isOpen: boolean, id: number, remaining: number}>({isOpen: false, id: 0, remaining: 0})

  const handleReminderToggle = async (id: number, reminder: boolean, amount?: number) => {'''
    content = content.replace('  const handleReminderToggle = async (id: number, reminder: boolean, amount?: number) => {', inv_state, 1)
    
    inv_modal_jsx = '''      <PaymentReminderModal 
        isOpen={reminderModal.isOpen} 
        onClose={() => setReminderModal({ ...reminderModal, isOpen: false })} 
        remainingAmount={reminderModal.remaining} 
        onConfirm={(amount) => {
          handleReminderToggle(reminderModal.id, true, amount)
          setReminderModal({ ...reminderModal, isOpen: false })
        }} 
      />
    </div>
  )
}'''
    content = content.replace('    </div>\n  )\n}\n\nfunction PaymentsTab', inv_modal_jsx + '\n\nfunction PaymentsTab')

    # Now change the `window.prompt` in `DashboardTab` row:
    bad_dash_prompt = '''                          <button onClick={() => {
                            if (!row.reminder) {
                              const amountStr = window.prompt(`Enter amount to pay (Leave blank for full amount: ${row.remainingAmount}):`);
                              if (amountStr === null) return;
                              const amt = amountStr.trim() ? parseFloat(amountStr) : row.remainingAmount;
                              if (isNaN(amt) || amt <= 0) return alert('Invalid amount');
                              handleReminderToggle(row.invoiceId!, true, amt);
                            } else {
                              handleReminderToggle(row.invoiceId!, false);
                            }
                          }} className={`transition-colors ${row.reminder ? 'text-emerald-500 hover:text-emerald-600' : 'text-slate-300 hover:text-emerald-400'}`}>'''
    good_dash_prompt = '''                          <button onClick={() => {
                            if (!row.reminder) {
                              setReminderModal({ isOpen: true, id: row.invoiceId!, remaining: row.remainingAmount });
                            } else {
                              handleReminderToggle(row.invoiceId!, false);
                            }
                          }} className={`transition-colors ${row.reminder ? 'text-emerald-500 hover:text-emerald-600' : 'text-slate-300 hover:text-emerald-400'}`}>'''
    content = content.replace(bad_dash_prompt, good_dash_prompt)

    # Now change the `window.prompt` in `InvoiceTable`:
    # Wait, `InvoiceTable` doesn't have `setReminderModal` access!
    # I should pass an `onRequestReminder` callback instead of handling it directly inside `InvoiceTable` if I want to use modal.
    # OR better yet, pass `openReminderModal: (id: number, remaining: number) => void` down to `InvoiceTable`.
    # Let's add it to InvoiceTable props.
    bad_inv_sig = '''function InvoiceTable({ invoices, suppliers, showDescription = false, onEditClick, onDeleteClick, onReminderToggle, canToggleReminder }: { invoices: Invoice[], suppliers: Supplier[], showDescription?: boolean, onEditClick?: (inv: Invoice) => void, onDeleteClick?: (id: number) => void, onReminderToggle?: (id: number, reminder: boolean, amount?: number) => void, canToggleReminder?: boolean }) {'''
    good_inv_sig = '''function InvoiceTable({ invoices, suppliers, showDescription = false, onEditClick, onDeleteClick, onReminderToggle, canToggleReminder, onOpenReminderModal }: { invoices: Invoice[], suppliers: Supplier[], showDescription?: boolean, onEditClick?: (inv: Invoice) => void, onDeleteClick?: (id: number) => void, onReminderToggle?: (id: number, reminder: boolean, amount?: number) => void, canToggleReminder?: boolean, onOpenReminderModal?: (id: number, remaining: number) => void }) {'''
    content = content.replace(bad_inv_sig, good_inv_sig)

    bad_inv_prompt = '''                      <button onClick={() => {
                        if (!invoice.reminder) {
                          const amountStr = window.prompt(`Enter amount to pay (Leave blank for full amount: ${invoice.amount - invoice.paidAmount}):`);
                          if (amountStr === null) return;
                          const amt = amountStr.trim() ? parseFloat(amountStr) : (invoice.amount - invoice.paidAmount);
                          if (isNaN(amt) || amt <= 0) return alert('Invalid amount');
                          if (onReminderToggle) onReminderToggle(invoice.id, true, amt);
                        } else {
                          if (onReminderToggle) onReminderToggle(invoice.id, false);
                        }
                      }} className={`transition-colors ${invoice.reminder ? 'text-emerald-500 hover:text-emerald-600' : 'text-slate-300 hover:text-emerald-400'}`}>'''
    good_inv_prompt = '''                      <button onClick={() => {
                        if (!invoice.reminder) {
                          if (onOpenReminderModal) onOpenReminderModal(invoice.id, invoice.amount - invoice.paidAmount);
                        } else {
                          if (onReminderToggle) onReminderToggle(invoice.id, false);
                        }
                      }} className={`transition-colors ${invoice.reminder ? 'text-emerald-500 hover:text-emerald-600' : 'text-slate-300 hover:text-emerald-400'}`}>'''
    content = content.replace(bad_inv_prompt, good_inv_prompt)

    # Finally, pass `onOpenReminderModal` wherever `InvoiceTable` is rendered:
    # 1. DashboardTab Recent Invoices
    content = content.replace(
        '<InvoiceTable invoices={invoices.slice(0, 5)} suppliers={suppliers} onReminderToggle={handleReminderToggle} canToggleReminder={user?.role === "admin" || user?.permissions?.invoices?.reminder} />',
        '<InvoiceTable invoices={invoices.slice(0, 5)} suppliers={suppliers} onReminderToggle={handleReminderToggle} canToggleReminder={user?.role === "admin" || user?.permissions?.invoices?.reminder} onOpenReminderModal={(id, rem) => setReminderModal({isOpen: true, id, remaining: rem})} />'
    )
    # 2. SuppliersTab
    content = content.replace(
        '<InvoiceTable invoices={supplierInvoices} suppliers={suppliers} showDescription={true} onReminderToggle={handleReminderToggle} canToggleReminder={user?.role === "admin" || user?.permissions?.invoices?.reminder} />',
        '<InvoiceTable invoices={supplierInvoices} suppliers={suppliers} showDescription={true} onReminderToggle={handleReminderToggle} canToggleReminder={user?.role === "admin" || user?.permissions?.invoices?.reminder} onOpenReminderModal={(id, rem) => setReminderModal({isOpen: true, id, remaining: rem})} />'
    )
    # 3. InvoicesTab
    content = content.replace(
        '<InvoiceTable invoices={filteredInvoices} suppliers={suppliers} showDescription={true} onEditClick={(user?.role === \'admin\' || user?.permissions?.invoices?.edit) ? handleEditClick : undefined} onDeleteClick={(user?.role === \'admin\' || user?.permissions?.invoices?.delete) ? onDelete : undefined} onReminderToggle={handleReminderToggle} canToggleReminder={user?.role === "admin" || user?.permissions?.invoices?.reminder} />',
        '<InvoiceTable invoices={filteredInvoices} suppliers={suppliers} showDescription={true} onEditClick={(user?.role === \'admin\' || user?.permissions?.invoices?.edit) ? handleEditClick : undefined} onDeleteClick={(user?.role === \'admin\' || user?.permissions?.invoices?.delete) ? onDelete : undefined} onReminderToggle={handleReminderToggle} canToggleReminder={user?.role === "admin" || user?.permissions?.invoices?.reminder} onOpenReminderModal={(id, rem) => setReminderModal({isOpen: true, id, remaining: rem})} />'
    )

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Success frontend_modal")

if __name__ == '__main__':
    main()