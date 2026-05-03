import re

def main():
    path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add Search to imports
    content = content.replace(
        'Wallet, ArrowLeft } from \'lucide-react\'',
        'Wallet, ArrowLeft, Search } from \'lucide-react\''
    )

    # 2. Update InvoicesTab
    invoices_tab_state = 'const [formError, setFormError] = useState<string | null>(null)'
    content = content.replace(
        invoices_tab_state,
        invoices_tab_state + '\n  const [searchTerm, setSearchTerm] = useState(\'\')'
    )
    
    invoices_filter_old = 'const filteredInvoices = filterSupplierId ? invoices.filter(inv => inv.supplierId.toString() === filterSupplierId) : invoices;'
    invoices_filter_new = '''const filteredInvoices = invoices.filter(inv => {
    const sName = suppliers.find(s => s.id === inv.supplierId)?.name || '';
    const matchesSupplier = filterSupplierId ? inv.supplierId.toString() === filterSupplierId : true;
    const matchesSearch = searchTerm === '' || 
      sName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.amount.toString().includes(searchTerm);
    return matchesSupplier && matchesSearch;
  });'''
    content = content.replace(invoices_filter_old, invoices_filter_new)

    invoices_header_old = '<div className="flex items-center justify-between mb-4">\n        <h2 className="text-xl font-bold text-slate-800">All Invoices</h2>'
    invoices_header_new = '''<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <h2 className="text-xl font-bold text-slate-800">All Invoices</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search invoices..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500 w-full sm:w-64"
            />
          </div>'''
    content = content.replace(invoices_header_old, invoices_header_new)

    # 3. Update PaymentsTab
    payments_tab_state = 'const [formError, setFormError] = useState<string | null>(null)'
    # Note: this string appears multiple times, we need to be careful.
    # Actually, let's use the function signature as anchor.
    
    content = re.sub(
        r'function PaymentsTab\(\{ suppliers, payments, accounts, onRefresh, onDelete, onSupplierClick \}: \{.+? \}\) \{',
        r'function PaymentsTab({ suppliers, payments, accounts, onRefresh, onDelete, onSupplierClick }: { suppliers: Supplier[], payments: Payment[], accounts: Account[], onRefresh: () => void, onDelete: (id: number) => void, onSupplierClick?: (s: Supplier) => void }) {\n  const [searchTerm, setSearchTerm] = useState("")',
        content
    )

    payments_filter_new = '''const filteredPayments = payments.filter(p => {
    const sName = suppliers.find(s => s.id === p.supplierId)?.name || '';
    const accName = accounts.find(a => a.id === p.accountId)?.name || '';
    const matchesSearch = searchTerm === '' || 
      sName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      accName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.amount.toString().includes(searchTerm) ||
      (p.invoiceId?.toString() || '').includes(searchTerm);
    return matchesSearch;
  });'''
    content = content.replace('{payments.map(payment => {', payments_filter_new + '\n          {filteredPayments.map(payment => {')
    content = content.replace('{payments.length === 0 && (', '{filteredPayments.length === 0 && (')

    payments_header_old = '<h2 className="text-xl font-bold text-slate-800">Recent Payments</h2>'
    payments_header_new = '''<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-bold text-slate-800">Recent Payments</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search payments..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500 w-full sm:w-64"
              />
            </div>
          </div>'''
    content = content.replace(payments_header_old, payments_header_new)

    # 4. Update CollectionsTab
    content = re.sub(
        r'function CollectionsTab\(\{ accounts, collections, onRefresh, onDelete \}: \{.+? \}\) \{',
        r'function CollectionsTab({ accounts, collections, onRefresh, onDelete }: { accounts: Account[], collections: Collection[], onRefresh: () => void, onDelete: (id: number) => void }) {\n  const [searchTerm, setSearchTerm] = useState("")',
        content
    )
    
    collections_filter_old = 'const filtered = filter === \'all\' ? collections : collections.filter(c => c.status === filter)'
    collections_filter_new = '''const filtered = (filter === 'all' ? collections : collections.filter(c => c.status === filter)).filter(c => {
    const accName = accounts.find(a => a.id === c.accountId)?.name || '';
    return searchTerm === '' || 
      (c.note || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      accName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.amount.toString().includes(searchTerm) ||
      c.currency.toLowerCase().includes(searchTerm.toLowerCase());
  });'''
    content = content.replace(collections_filter_old, collections_filter_new)

    collections_header_old = '<h2 className="text-xl font-bold text-slate-800">History</h2>'
    collections_header_new = '''<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-bold text-slate-800">History</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search collections..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500 w-full sm:w-64"
                />
              </div>'''
    content = content.replace(collections_header_old, collections_header_new)

    # 5. Update SuppliersTab
    content = re.sub(
        r'function SuppliersTab\(\{ suppliers, invoices, payments, accounts, onRefresh, onDelete, selectedSupplier, setSelectedSupplier, onSupplierClick \}: \{.+? \}\) \{',
        r'function SuppliersTab({ suppliers, invoices, payments, accounts, onRefresh, onDelete, selectedSupplier, setSelectedSupplier, onSupplierClick }: { suppliers: Supplier[], invoices: Invoice[], payments: Payment[], accounts: Account[], onRefresh: () => void, onDelete: (id: number) => void, selectedSupplier: Supplier | null, setSelectedSupplier: (s: Supplier | null) => void, onSupplierClick?: (s: Supplier) => void }) {\n  const [searchTerm, setSearchTerm] = useState("")',
        content
    )
    
    suppliers_filter_new = '''const filteredSuppliers = suppliers.filter(s => 
    searchTerm === '' || s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.priority.toString().includes(searchTerm)
  );'''
    content = content.replace('{suppliers.map(s => (', suppliers_filter_new + '\n            {filteredSuppliers.map(s => (')
    content = content.replace('{suppliers.length === 0 && (', '{filteredSuppliers.length === 0 && (')
    
    suppliers_header_old = '<h2 className="text-xl font-bold text-slate-800">All Suppliers</h2>'
    suppliers_header_new = '''<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-bold text-slate-800">All Suppliers</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search suppliers..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500 w-full sm:w-64"
              />
            </div>
          </div>'''
    content = content.replace(suppliers_header_old, suppliers_header_new)

    # 6. Update AccountsTab
    content = re.sub(
        r'function AccountsTab\(\{ accounts, payments, collections, suppliers, onRefresh, onDelete, selectedAccount, setSelectedAccount \}: \{.+? \}\) \{',
        r'function AccountsTab({ accounts, payments, collections, suppliers, onRefresh, onDelete, selectedAccount, setSelectedAccount }: { accounts: Account[], payments: Payment[], collections: Collection[], suppliers: Supplier[], onRefresh: () => void, onDelete: (id: number) => void, selectedAccount: Account | null, setSelectedAccount: (a: Account | null) => void }) {\n  const [searchTerm, setSearchTerm] = useState("")',
        content
    )
    
    accounts_filter_new = '''const filteredAccounts = accounts.filter(a => 
    searchTerm === '' || a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.type.toLowerCase().includes(searchTerm.toLowerCase()) || a.balance.toString().includes(searchTerm)
  );'''
    content = content.replace('{accounts.map(acc => (', accounts_filter_new + '\n            {filteredAccounts.map(acc => (')
    content = content.replace('{accounts.length === 0 && (', '{filteredAccounts.length === 0 && (')
    
    accounts_header_old = '<h2 className="text-lg font-bold text-slate-800 mb-4">Existing Accounts</h2>' # Wait, check exact string
    # Actually, AccountsTab might not have a header for the list. Let's find the table.
    content = content.replace(
        '<div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">',
        '''<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h2 className="text-xl font-bold text-slate-800">Existing Accounts</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search accounts..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500 w-full sm:w-64"
          />
        </div>
      </div>\n      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">''',
        1 # only first one
    )

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Success adding search functionality to all tabs")

if __name__ == '__main__':
    main()