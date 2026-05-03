import re

def main():
    app_path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx'
    with open(app_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update SuppliersTab props definition
    content = content.replace(
        'function SuppliersTab({ suppliers, invoices, onRefresh, onDelete, selectedSupplier, setSelectedSupplier, onSupplierClick }: { suppliers: Supplier[], invoices: Invoice[], onRefresh: () => void, onDelete: (id: number) => void, selectedSupplier: Supplier | null, setSelectedSupplier: (s: Supplier | null) => void, onSupplierClick?: (s: Supplier) => void }) {',
        'function SuppliersTab({ suppliers, invoices, payments, accounts, onRefresh, onDelete, selectedSupplier, setSelectedSupplier, onSupplierClick }: { suppliers: Supplier[], invoices: Invoice[], payments: Payment[], accounts: Account[], onRefresh: () => void, onDelete: (id: number) => void, selectedSupplier: Supplier | null, setSelectedSupplier: (s: Supplier | null) => void, onSupplierClick?: (s: Supplier) => void }) {'
    )

    # 2. Update SuppliersTab usage in Routes
    content = content.replace(
        '<SuppliersTab suppliers={suppliers} invoices={invoices} onRefresh={fetchData} onDelete={(id) => openDeleteModal(id, "suppliers", "Supplier")} selectedSupplier={selectedSupplier} setSelectedSupplier={setSelectedSupplier} onSupplierClick={handleSupplierClick} />',
        '<SuppliersTab suppliers={suppliers} invoices={invoices} payments={payments} accounts={accounts} onRefresh={fetchData} onDelete={(id) => openDeleteModal(id, "suppliers", "Supplier")} selectedSupplier={selectedSupplier} setSelectedSupplier={setSelectedSupplier} onSupplierClick={handleSupplierClick} />'
    )

    # 3. Add Payment History section to Supplier Detail View
    payment_history_block = '''        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-sky-500" />
            <h2 className="text-lg font-bold text-slate-800">Payment History</h2>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Account</th>
                <th className="px-6 py-4">Applied To</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.filter(p => p.supplierId === selectedSupplier.id).map(payment => {
                const accountName = accounts.find(a => a.id === payment.accountId)?.name || payment.accountId
                return (
                  <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-slate-500">#{payment.id}</td>
                    <td className="px-6 py-4 text-slate-500">{accountName}</td>
                    <td className="px-6 py-4">
                      {payment.invoiceId ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-100">
                          Invoice #{payment.invoiceId}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          Auto (FIFO)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-rose-600">
                      <FormatCurrency amount={payment.amount} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                      {format(new Date(payment.paymentDate), 'MMM dd, yyyy')}
                    </td>
                  </tr>
                )
              })}
              {payments.filter(p => p.supplierId === selectedSupplier.id).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No payment history found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>'''

    # Insert it after the InvoiceTable in the detail view
    content = content.replace(
        '''        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <InvoiceTable invoices={supplierInvoices} suppliers={suppliers} showDescription={true} onReminderToggle={handleReminderToggle} canToggleReminder={user?.role === "admin" || user?.permissions?.invoices?.reminder} onOpenReminderModal={(id, rem) => setReminderModal({isOpen: true, id, remaining: rem})} onSupplierClick={onSupplierClick} />
        </div>
      </div>''',
        '''        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-100">
             <h2 className="text-lg font-bold text-slate-800">Associated Invoices</h2>
          </div>
          <InvoiceTable invoices={supplierInvoices} suppliers={suppliers} showDescription={true} onReminderToggle={handleReminderToggle} canToggleReminder={user?.role === "admin" || user?.permissions?.invoices?.reminder} onOpenReminderModal={(id, rem) => setReminderModal({isOpen: true, id, remaining: rem})} onSupplierClick={onSupplierClick} />
        </div>

''' + payment_history_block
    )

    with open(app_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Success adding payment history to supplier detail view")

if __name__ == '__main__':
    main()