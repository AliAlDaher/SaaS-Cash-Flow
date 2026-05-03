import re

def main():
    app_path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx'
    with open(app_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update Payment type
    content = content.replace(
        'type Payment = {\n  id: number\n  supplierId: number\n  accountId: number\n  amount: number\n  paymentDate: string\n  createdAt: string\n  account?: Account\n}',
        'type Payment = {\n  id: number\n  supplierId: number\n  accountId: number\n  invoiceId?: number | null\n  amount: number\n  paymentDate: string\n  createdAt: string\n  account?: Account\n  invoice?: Invoice\n}'
    )

    # 2. Update PaymentsTab table headers and row
    # Fix the broken headers ("Full Amount", "Remaining Amount")
    # And add "Applied To"
    
    table_header_old = '''              <th className="px-6 py-4 whitespace-nowrap text-right">Full Amount</th>
          <th className="px-6 py-4 whitespace-nowrap text-right">Remaining Amount</th>'''
    
    table_header_new = '''              <th className="px-6 py-4">Account</th>
              <th className="px-6 py-4">Applied To</th>
              <th className="px-6 py-4 text-right">Amount</th>'''

    # Wait, the current headers are:
    # <th className="px-6 py-4">ID</th>
    # <th className="px-6 py-4">Supplier</th>
    # <th className="px-6 py-4">Account</th>
    # <th className="px-6 py-4 whitespace-nowrap text-right">Full Amount</th>
    # <th className="px-6 py-4 whitespace-nowrap text-right">Remaining Amount</th>
    # <th className="px-6 py-4 whitespace-nowrap">Payment Date</th>
    # <th className="px-6 py-4 whitespace-nowrap text-right">Actions</th>

    content = content.replace(
        '''              <th className="px-6 py-4">Account</th>
              <th className="px-6 py-4 whitespace-nowrap text-right">Full Amount</th>
          <th className="px-6 py-4 whitespace-nowrap text-right">Remaining Amount</th>''',
        '''              <th className="px-6 py-4">Account</th>
              <th className="px-6 py-4">Applied To</th>
              <th className="px-6 py-4 text-right">Amount</th>'''
    )

    # Update the row to include "Applied To" column and fix amount cell
    content = content.replace(
        '''                  <td className="px-6 py-4 text-slate-500">{accountName}</td>
                  <td className="px-6 py-4 font-bold text-rose-600 flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-700">Outgoing</span>
                    <FormatCurrency amount={payment.amount} />
                  </td>''',
        '''                  <td className="px-6 py-4 text-slate-500">{accountName}</td>
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
                  </td>'''
    )

    with open(app_path, 'w', encoding='utf-8') as f:
        f.write(content)

    # 3. Update ReportsTab.tsx
    reports_path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/ReportsTab.tsx'
    with open(reports_path, 'r', encoding='utf-8') as f:
        rep_content = f.read()

    rep_content = rep_content.replace(
        '                <th className="px-6 py-4">Supplier</th>\n                <th className="px-6 py-4 text-right">Amount</th>',
        '                <th className="px-6 py-4">Supplier</th>\n                <th className="px-6 py-4">Applied To</th>\n                <th className="px-6 py-4 text-right">Amount</th>'
    )

    rep_content = rep_content.replace(
        '''                  <td className="px-6 py-4">
                    <button 
                      onClick={() => {
                        const s = suppliers.find((sup: any) => sup.id === p.supplierId);
                        if (s && onSupplierClick) onSupplierClick(s);
                      }}
                      className="hover:text-sky-600 hover:underline transition-colors text-left"
                    >
                      {suppliers.find((s:any)=>s.id===p.supplierId)?.name || p.supplierId}
                    </button>
                  </td>''',
        '''                  <td className="px-6 py-4">
                    <button 
                      onClick={() => {
                        const s = suppliers.find((sup: any) => sup.id === p.supplierId);
                        if (s && onSupplierClick) onSupplierClick(s);
                      }}
                      className="hover:text-sky-600 hover:underline transition-colors text-left"
                    >
                      {suppliers.find((s:any)=>s.id===p.supplierId)?.name || p.supplierId}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    {p.invoiceId ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-100">
                        Inv #{p.invoiceId}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-50 text-slate-500 border border-slate-100">
                        FIFO
                      </span>
                    )}
                  </td>'''
    )

    with open(reports_path, 'w', encoding='utf-8') as f:
        f.write(rep_content)

    print("Success updating payment allocation visibility")

if __name__ == '__main__':
    main()