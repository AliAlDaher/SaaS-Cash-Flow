import re

def main():
    app_path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx'
    with open(app_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Move selectedSupplier state to MainLayout
    content = content.replace(
        'const [successMessage, setSuccessMessage] = useState<string | null>(null)',
        'const [successMessage, setSuccessMessage] = useState<string | null>(null)\n  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)'
    )

    # 2. Add handleSupplierClick helper
    content = content.replace(
        'const navigate = useNavigate()',
        'const navigate = useNavigate()\n\n  const handleSupplierClick = (supplier: Supplier) => {\n    setSelectedSupplier(supplier);\n    navigate("/suppliers");\n  };'
    )

    # 3. Update DashboardTab props to accept onSupplierClick
    content = content.replace(
        'function DashboardTab({ suppliers, invoices, accounts, collections, onRefresh }: { suppliers: Supplier[], invoices: Invoice[], accounts: Account[], collections: Collection[], onRefresh: () => void }) {',
        'function DashboardTab({ suppliers, invoices, accounts, collections, onRefresh, onSupplierClick }: { suppliers: Supplier[], invoices: Invoice[], accounts: Account[], collections: Collection[], onRefresh: () => void, onSupplierClick?: (s: Supplier) => void }) {'
    )

    # 4. Update InvoiceTable props to accept onSupplierClick
    content = content.replace(
        'onOpenReminderModal?: (id: number, remaining: number) => void }) {',
        'onOpenReminderModal?: (id: number, remaining: number) => void, onSupplierClick?: (s: Supplier) => void }) {'
    )

    # 5. Make supplier name clickable in InvoiceTable
    content = re.sub(
        r'<td className="px-6 py-4 font-medium text-slate-700">\{supplierName\}</td>',
        '''<td className="px-6 py-4 font-medium text-slate-700">
                <button 
                  onClick={() => {
                    const s = suppliers.find(sup => sup.id === invoice.supplierId);
                    if (s && onSupplierClick) onSupplierClick(s);
                  }}
                  className="hover:text-sky-600 hover:underline transition-colors text-left"
                >
                  {supplierName}
                </button>
              </td>''',
        content
    )

    # 6. Make supplier name clickable in Dashboard UpcomingRows
    content = re.sub(
        r'<td className={`px-6 py-4 font-medium \${row\.textColor}`}>\{row\.supplierName\}</td>',
        '''<td className={`px-6 py-4 font-medium ${row.textColor}`}>
                      <button 
                        onClick={() => {
                          const s = suppliers.find(sup => sup.name === row.supplierName);
                          if (s && onSupplierClick) onSupplierClick(s);
                        }}
                        className="hover:underline transition-colors text-left"
                      >
                        {row.supplierName}
                      </button>
                    </td>''',
        content
    )

    # 7. Update SuppliersTab: Remove local state and add props
    content = re.sub(
        r'function SuppliersTab\(\{ suppliers, invoices, onRefresh, onDelete \}: \{ suppliers: Supplier\[\], invoices: Invoice\[\], onRefresh: \(\) => void, onDelete: \(id: number\) => void \}\) \{',
        'function SuppliersTab({ suppliers, invoices, onRefresh, onDelete, selectedSupplier, setSelectedSupplier }: { suppliers: Supplier[], invoices: Invoice[], onRefresh: () => void, onDelete: (id: number) => void, selectedSupplier: Supplier | null, setSelectedSupplier: (s: Supplier | null) => void }) {',
        content
    )
    content = content.replace('const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)', '')

    # 8. Make supplier name clickable in Suppliers list
    content = re.sub(
        r'<td className="px-6 py-4 font-medium text-slate-700">\{supplier\.name\}</td>',
        '''<td className="px-6 py-4 font-medium text-slate-700">
                  <button 
                    onClick={() => setSelectedSupplier(supplier)}
                    className="hover:text-sky-600 hover:underline transition-colors text-left"
                  >
                    {supplier.name}
                  </button>
                </td>''',
        content
    )

    # 9. Pass props in MainLayout Routes
    content = content.replace(
        '<DashboardTab suppliers={suppliers} invoices={invoices} accounts={accounts} collections={collections} onRefresh={fetchData} />',
        '<DashboardTab suppliers={suppliers} invoices={invoices} accounts={accounts} collections={collections} onRefresh={fetchData} onSupplierClick={handleSupplierClick} />'
    )
    content = content.replace(
        '<ReportsTab invoices={invoices} payments={payments} collections={collections} suppliers={suppliers} accounts={accounts} />',
        '<ReportsTab invoices={invoices} payments={payments} collections={collections} suppliers={suppliers} accounts={accounts} onSupplierClick={handleSupplierClick} />'
    )
    content = content.replace(
        '<SuppliersTab suppliers={suppliers} invoices={invoices} onRefresh={fetchData} onDelete={(id) => openDeleteModal(id, "suppliers", "Supplier")}  />',
        '<SuppliersTab suppliers={suppliers} invoices={invoices} onRefresh={fetchData} onDelete={(id) => openDeleteModal(id, "suppliers", "Supplier")} selectedSupplier={selectedSupplier} setSelectedSupplier={setSelectedSupplier} />'
    )
    content = content.replace(
        '<InvoicesTab suppliers={suppliers} invoices={invoices} onRefresh={fetchData} onDelete={(id) => openDeleteModal(id, "invoices", "Invoice")}  />',
        '<InvoicesTab suppliers={suppliers} invoices={invoices} onRefresh={fetchData} onDelete={(id) => openDeleteModal(id, "invoices", "Invoice")} onSupplierClick={handleSupplierClick} />'
    )

    # 10. Update InvoicesTab props and InvoiceTable usage
    content = content.replace(
        'function InvoicesTab({ suppliers, invoices, onRefresh, onDelete }: { suppliers: Supplier[], invoices: Invoice[], onRefresh: () => void, onDelete?: (id: number) => void }) {',
        'function InvoicesTab({ suppliers, invoices, onRefresh, onDelete, onSupplierClick }: { suppliers: Supplier[], invoices: Invoice[], onRefresh: () => void, onDelete?: (id: number) => void, onSupplierClick?: (s: Supplier) => void }) {'
    )
    content = content.replace(
        'onOpenReminderModal={(id, rem) => setReminderModal({isOpen: true, id, remaining: rem})} />',
        'onOpenReminderModal={(id, rem) => setReminderModal({isOpen: true, id, remaining: rem})} onSupplierClick={onSupplierClick} />'
    )

    # 11. Clear selected supplier when clicking "Suppliers" in nav?
    # Actually, the user might want to see the list.
    # In MainLayout Link for Suppliers:
    content = content.replace(
        'key={tab.name}\n                    to={tab.path}',
        'key={tab.name}\n                    to={tab.path}\n                    onClick={() => { if(tab.name === "Suppliers") setSelectedSupplier(null); }}'
    )

    with open(app_path, 'w', encoding='utf-8') as f:
        f.write(content)

    # 12. Update ReportsTab.tsx
    reports_path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/ReportsTab.tsx'
    with open(reports_path, 'r', encoding='utf-8') as f:
        rep_content = f.read()

    rep_content = rep_content.replace(
        'export function ReportsTab({ invoices, payments, collections, suppliers }: any) {',
        'export function ReportsTab({ invoices, payments, collections, suppliers, onSupplierClick }: any) {'
    )
    
    # Update Payments table
    rep_content = rep_content.replace(
        '<td className="px-6 py-4">{suppliers.find((s:any)=>s.id===p.supplierId)?.name || p.supplierId}</td>',
        '''<td className="px-6 py-4">
                    <button 
                      onClick={() => {
                        const s = suppliers.find((sup: any) => sup.id === p.supplierId);
                        if (s && onSupplierClick) onSupplierClick(s);
                      }}
                      className="hover:text-sky-600 hover:underline transition-colors text-left"
                    >
                      {suppliers.find((s:any)=>s.id===p.supplierId)?.name || p.supplierId}
                    </button>
                  </td>'''
    )

    # Update Invoices table
    rep_content = rep_content.replace(
        '<td className="px-6 py-4">{suppliers.find((s:any)=>s.id===i.supplierId)?.name || i.supplierId}</td>',
        '''<td className="px-6 py-4">
                    <button 
                      onClick={() => {
                        const s = suppliers.find((sup: any) => sup.id === i.supplierId);
                        if (s && onSupplierClick) onSupplierClick(s);
                      }}
                      className="hover:text-sky-600 hover:underline transition-colors text-left"
                    >
                      {suppliers.find((s:any)=>s.id===i.supplierId)?.name || i.supplierId}
                    </button>
                  </td>'''
    )

    with open(reports_path, 'w', encoding='utf-8') as f:
        f.write(rep_content)

    print("Success supplier clickability")

if __name__ == '__main__':
    main()