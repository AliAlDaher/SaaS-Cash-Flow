import re

def main():
    file_path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update Invoice type
    content = content.replace(
        'reminder?: boolean\n  createdAt: string',
        'reminder?: boolean\n  reminderAmount?: number | null\n  createdAt: string'
    )

    # 2. Update DisplayRow type
    content = content.replace(
        'reminder?: boolean\n  }',
        'reminder?: boolean\n    reminderAmount?: number | null\n  }'
    )

    # 3. Update handleReminderToggle in 3 places
    old_handle = '''  const handleReminderToggle = async (id: number, reminder: boolean) => {
    try {
      const res = await apiFetch(`${API_URL}/invoices/${id}/reminder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminder })
      })'''
    new_handle = '''  const handleReminderToggle = async (id: number, reminder: boolean, amount?: number) => {
    try {
      const res = await apiFetch(`${API_URL}/invoices/${id}/reminder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminder, reminderAmount: amount })
      })'''
    content = content.replace(old_handle, new_handle)

    # 4. Update InvoiceTable signature
    old_sig = 'onReminderToggle?: (id: number, reminder: boolean) => void'
    new_sig = 'onReminderToggle?: (id: number, reminder: boolean, amount?: number) => void'
    content = content.replace(old_sig, new_sig)

    # 5. Dashboard row additions
    # Replace in overdueInvoices
    content = content.replace(
        'reminder: inv.reminder\n      })',
        'reminder: inv.reminder,\n        reminderAmount: inv.reminderAmount\n      })'
    )
    
    # 6. Dashboard table Pay Now column
    bad_dash_cell = '''                    <td className="px-6 py-4 text-center">
                      {(user?.role === "admin" || user?.permissions?.invoices?.reminder) && row.invoiceId ? (
                        <button onClick={() => handleReminderToggle(row.invoiceId!, !row.reminder)} className={`transition-colors ${row.reminder ? 'text-emerald-500 hover:text-emerald-600' : 'text-slate-300 hover:text-emerald-400'}`}>
                          <CheckCircle className={`w-5 h-5 ${row.reminder ? 'fill-current text-emerald-500' : ''}`} />
                        </button>
                      ) : row.reminder ? (
                        <CheckCircle className="w-5 h-5 mx-auto text-emerald-500 fill-current" />
                      ) : (
                        <CheckCircle className="w-5 h-5 mx-auto text-slate-200" />
                      )}
                    </td>'''
    good_dash_cell = '''                    <td className="px-6 py-4 text-center">
                      {(user?.role === "admin" || user?.permissions?.invoices?.reminder) && row.invoiceId ? (
                        <div className="flex flex-col items-center gap-1">
                          <button onClick={() => {
                            if (!row.reminder) {
                              const amountStr = window.prompt(`Enter amount to pay (Leave blank for full amount: ${row.remainingAmount}):`);
                              if (amountStr === null) return;
                              const amt = amountStr.trim() ? parseFloat(amountStr) : row.remainingAmount;
                              if (isNaN(amt) || amt <= 0) return alert('Invalid amount');
                              handleReminderToggle(row.invoiceId!, true, amt);
                            } else {
                              handleReminderToggle(row.invoiceId!, false);
                            }
                          }} className={`transition-colors ${row.reminder ? 'text-emerald-500 hover:text-emerald-600' : 'text-slate-300 hover:text-emerald-400'}`}>
                            <CheckCircle className={`w-5 h-5 ${row.reminder ? 'fill-current text-emerald-500' : ''}`} />
                          </button>
                          {row.reminder && row.reminderAmount && <span className="text-[10px] font-bold text-emerald-600">{row.reminderAmount} JOD</span>}
                        </div>
                      ) : row.reminder ? (
                        <div className="flex flex-col items-center gap-1">
                          <CheckCircle className="w-5 h-5 mx-auto text-emerald-500 fill-current" />
                          {row.reminderAmount && <span className="text-[10px] font-bold text-emerald-600">{row.reminderAmount} JOD</span>}
                        </div>
                      ) : (
                        <CheckCircle className="w-5 h-5 mx-auto text-slate-200" />
                      )}
                    </td>'''
    content = content.replace(bad_dash_cell, good_dash_cell)

    # 7. InvoiceTable Pay Now column
    bad_inv_cell = '''              <td className="px-6 py-4 text-center">
                {!isPaid && (dueStatus === 'Overdue' || dueStatus === 'Due Today') ? (
                  canToggleReminder ? (
                    <button onClick={() => onReminderToggle && onReminderToggle(invoice.id, !invoice.reminder)} className={`transition-colors ${invoice.reminder ? 'text-emerald-500 hover:text-emerald-600' : 'text-slate-300 hover:text-emerald-400'}`}>
                      <CheckCircle className={`w-5 h-5 ${invoice.reminder ? 'fill-current text-emerald-500' : ''}`} />
                    </button>
                  ) : invoice.reminder ? (
                    <CheckCircle className="w-5 h-5 mx-auto text-emerald-500 fill-current" />
                  ) : (
                    <CheckCircle className="w-5 h-5 mx-auto text-slate-200" />
                  )
                ) : (
                  <span className="text-slate-300">-</span>
                )}
              </td>'''
    good_inv_cell = '''              <td className="px-6 py-4 text-center">
                {!isPaid && (dueStatus === 'Overdue' || dueStatus === 'Due Today') ? (
                  canToggleReminder ? (
                    <div className="flex flex-col items-center gap-1">
                      <button onClick={() => {
                        if (!invoice.reminder) {
                          const amountStr = window.prompt(`Enter amount to pay (Leave blank for full amount: ${invoice.amount - invoice.paidAmount}):`);
                          if (amountStr === null) return;
                          const amt = amountStr.trim() ? parseFloat(amountStr) : (invoice.amount - invoice.paidAmount);
                          if (isNaN(amt) || amt <= 0) return alert('Invalid amount');
                          if (onReminderToggle) onReminderToggle(invoice.id, true, amt);
                        } else {
                          if (onReminderToggle) onReminderToggle(invoice.id, false);
                        }
                      }} className={`transition-colors ${invoice.reminder ? 'text-emerald-500 hover:text-emerald-600' : 'text-slate-300 hover:text-emerald-400'}`}>
                        <CheckCircle className={`w-5 h-5 ${invoice.reminder ? 'fill-current text-emerald-500' : ''}`} />
                      </button>
                      {invoice.reminder && invoice.reminderAmount && <span className="text-[10px] font-bold text-emerald-600">{invoice.reminderAmount} JOD</span>}
                    </div>
                  ) : invoice.reminder ? (
                    <div className="flex flex-col items-center gap-1">
                      <CheckCircle className="w-5 h-5 mx-auto text-emerald-500 fill-current" />
                      {invoice.reminderAmount && <span className="text-[10px] font-bold text-emerald-600">{invoice.reminderAmount} JOD</span>}
                    </div>
                  ) : (
                    <CheckCircle className="w-5 h-5 mx-auto text-slate-200" />
                  )
                ) : (
                  <span className="text-slate-300">-</span>
                )}
              </td>'''
    content = content.replace(bad_inv_cell, good_inv_cell)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Success frontend3")

if __name__ == '__main__':
    main()