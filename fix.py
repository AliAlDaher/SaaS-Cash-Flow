import re

def main():
    file_path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Import Star
    content = content.replace('import { Activity', 'import { Star, Activity')

    # 2. Add reminder to Invoice type
    content = content.replace(
        'description?: string\n  createdAt: string',
        'description?: string\n  reminder?: boolean\n  createdAt: string'
    )

    # 3. Add onRefresh and handleReminderToggle to DashboardTab
    content = content.replace(
        'function DashboardTab({ suppliers, invoices, accounts, collections }: { suppliers: Supplier[], invoices: Invoice[], accounts: Account[], collections: Collection[] }) {\n  const { user } = useAuth();',
        '''function DashboardTab({ suppliers, invoices, accounts, collections, onRefresh }: { suppliers: Supplier[], invoices: Invoice[], accounts: Account[], collections: Collection[], onRefresh: () => void }) {
  const { user } = useAuth();

  const handleReminderToggle = async (id: number, reminder: boolean) => {
    try {
      const res = await apiFetch(`${API_URL}/invoices/${id}/reminder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminder })
      })
      if (!res.ok) throw new Error('Failed to toggle reminder')
      onRefresh()
    } catch (err: any) {
      alert(err.message)
    }
  }'''
    )

    # 4. Pass onRefresh in Route
    content = content.replace(
        '<Route path="/" element={user?.permissions?.dashboard?.view ? <DashboardTab suppliers={suppliers} invoices={invoices} accounts={accounts} collections={collections} /> : <AccessDenied />} />',
        '<Route path="/" element={user?.permissions?.dashboard?.view ? <DashboardTab suppliers={suppliers} invoices={invoices} accounts={accounts} collections={collections} onRefresh={fetchData} /> : <AccessDenied />} />'
    )

    # 5. Recent Invoices passing
    content = content.replace(
        '<InvoiceTable invoices={invoices.slice(0, 5)} suppliers={suppliers} />',
        '<InvoiceTable invoices={invoices.slice(0, 5)} suppliers={suppliers} onReminderToggle={handleReminderToggle} canToggleReminder={user?.role === "admin" || user?.permissions?.invoices?.reminder} />'
    )

    # 6. SuppliersTab handleReminderToggle
    content = content.replace(
        '  if (selectedSupplier) {',
        '''  const handleReminderToggle = async (id: number, reminder: boolean) => {
    try {
      const res = await apiFetch(`${API_URL}/invoices/${id}/reminder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminder })
      })
      if (!res.ok) throw new Error('Failed to toggle reminder')
      onRefresh()
    } catch (err: any) {
      alert(err.message)
    }
  }

  if (selectedSupplier) {'''
    )
    content = content.replace(
        '<InvoiceTable invoices={supplierInvoices} suppliers={suppliers} showDescription={true} />',
        '<InvoiceTable invoices={supplierInvoices} suppliers={suppliers} showDescription={true} onReminderToggle={handleReminderToggle} canToggleReminder={user?.role === "admin" || user?.permissions?.invoices?.reminder} />'
    )

    # 7. InvoicesTab handleReminderToggle
    content = content.replace(
        '  const filteredInvoices = filterSupplierId ? invoices.filter(inv => inv.supplierId.toString() === filterSupplierId) : invoices;',
        '''  const handleReminderToggle = async (id: number, reminder: boolean) => {
    try {
      const res = await apiFetch(`${API_URL}/invoices/${id}/reminder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminder })
      })
      if (!res.ok) throw new Error('Failed to toggle reminder')
      onRefresh()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const filteredInvoices = filterSupplierId ? invoices.filter(inv => inv.supplierId.toString() === filterSupplierId) : invoices;'''
    )
    content = content.replace(
        '<InvoiceTable invoices={filteredInvoices} suppliers={suppliers} showDescription={true} onEditClick={(user?.role === \'admin\' || user?.permissions?.invoices?.edit) ? handleEditClick : undefined} onDeleteClick={(user?.role === \'admin\' || user?.permissions?.invoices?.delete) ? onDelete : undefined} />',
        '<InvoiceTable invoices={filteredInvoices} suppliers={suppliers} showDescription={true} onEditClick={(user?.role === \'admin\' || user?.permissions?.invoices?.edit) ? handleEditClick : undefined} onDeleteClick={(user?.role === \'admin\' || user?.permissions?.invoices?.delete) ? onDelete : undefined} onReminderToggle={handleReminderToggle} canToggleReminder={user?.role === "admin" || user?.permissions?.invoices?.reminder} />'
    )

    # 8. InvoiceTable signature
    content = content.replace(
        'function InvoiceTable({ invoices, suppliers, showDescription = false, onEditClick, onDeleteClick }: { invoices: Invoice[], suppliers: Supplier[], showDescription?: boolean, onEditClick?: (inv: Invoice) => void, onDeleteClick?: (id: number) => void }) {',
        'function InvoiceTable({ invoices, suppliers, showDescription = false, onEditClick, onDeleteClick, onReminderToggle, canToggleReminder }: { invoices: Invoice[], suppliers: Supplier[], showDescription?: boolean, onEditClick?: (inv: Invoice) => void, onDeleteClick?: (id: number) => void, onReminderToggle?: (id: number, reminder: boolean) => void, canToggleReminder?: boolean }) {'
    )

    # 9. InvoiceTable header
    content = content.replace(
        '          <th className="px-6 py-4">Supplier</th>\n          {showDescription && <th className="px-6 py-4">Description / Invoice No.</th>}',
        '          <th className="px-6 py-4">Supplier</th>\n          <th className="px-6 py-4 text-center">Priority</th>\n          {showDescription && <th className="px-6 py-4">Description / Invoice No.</th>}'
    )

    # 10. InvoiceTable body and colSpan
    body_row_replace = r'(?s)(<td className="px-6 py-4 font-medium text-slate-700">\{supplierName\}</td>\s*)\{showDescription && \('
    replacement = r'''\g<1><td className="px-6 py-4 text-center">
                {canToggleReminder ? (
                  <button onClick={() => onReminderToggle && onReminderToggle(invoice.id, !invoice.reminder)} className={`transition-colors ${invoice.reminder ? 'text-amber-500 hover:text-amber-600' : 'text-slate-300 hover:text-amber-400'}`}>
                    <Star className={`w-5 h-5 ${invoice.reminder ? 'fill-current' : ''}`} />
                  </button>
                ) : (
                  <Star className={`w-5 h-5 mx-auto ${invoice.reminder ? 'text-amber-500 fill-current' : 'text-slate-200'}`} />
                )}
              </td>
              {showDescription && ('''
    
    content = re.sub(body_row_replace, replacement, content)
    
    content = content.replace(
        'colSpan={showDescription ? (onEditClick ? 9 : 8) : 8}',
        'colSpan={showDescription ? (onEditClick ? 10 : 9) : 9}'
    )

    # 11. UsersTab
    content = content.replace(
        '<th className="p-3 border-b border-slate-200 text-center">Delete</th>\n                    <th className="p-3 border-b border-slate-200 text-center">All</th>',
        '<th className="p-3 border-b border-slate-200 text-center">Delete</th>\n                    <th className="p-3 border-b border-slate-200 text-center">Reminder</th>\n                    <th className="p-3 border-b border-slate-200 text-center">All</th>'
    )
    content = content.replace(
        'const isAll = modPerms.view && modPerms.create && modPerms.edit && modPerms.delete;',
        'const isAll = modPerms.view && modPerms.create && modPerms.edit && modPerms.delete && (mod === "invoices" ? modPerms.reminder : true);'
    )
    content = content.replace(
        '[mod]: { view: val, create: val, edit: val, delete: val }',
        '[mod]: { view: val, create: val, edit: val, delete: val, ...(mod === "invoices" ? { reminder: val } : {}) }'
    )
    content = content.replace(
        '''                        <td className="p-3 text-center">
                          {mod !== 'dashboard' && mod !== 'reports' && <input type="checkbox" checked={!!modPerms.delete} onChange={(e) => handleToggleAction('delete', e.target.checked)} />}
                        </td>
                        <td className="p-3 text-center border-l border-slate-100 bg-slate-50">''',
        '''                        <td className="p-3 text-center">
                          {mod !== 'dashboard' && mod !== 'reports' && <input type="checkbox" checked={!!modPerms.delete} onChange={(e) => handleToggleAction('delete', e.target.checked)} />}
                        </td>
                        <td className="p-3 text-center">
                          {mod === 'invoices' && <input type="checkbox" checked={!!modPerms.reminder} onChange={(e) => handleToggleAction('reminder', e.target.checked)} />}
                        </td>
                        <td className="p-3 text-center border-l border-slate-100 bg-slate-50">'''
    )

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Success")

if __name__ == '__main__':
    main()