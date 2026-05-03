import re

def main():
    path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Clean up PaymentsTab duplicated state and logic
    # Find the double searchTerm state
    content = re.sub(r'const \[searchTerm, setSearchTerm\] = useState\(\'\'\)\s+const \[searchTerm, setSearchTerm\] = useState\(\'\'\)', 'const [searchTerm, setSearchTerm] = useState(\'\')', content)
    
    # 2. Fix SuppliersTab missing logic
    # Find top of SuppliersTab
    if 'function SuppliersTab' in content:
        # Check if filteredSuppliers is defined
        if 'const filteredSuppliers' not in content:
            content = content.replace('const [editSupplierId, setEditSupplierId] = useState<number | null>(null)', '''const [editSupplierId, setEditSupplierId] = useState<number | null>(null)
  const filteredSuppliers = suppliers.filter(s => 
    searchTerm === '' || s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.priority.toString().includes(searchTerm)
  );''')

    # 3. Fix AccountsTab missing logic
    if 'function AccountsTab' in content:
        if 'const filteredAccounts' not in content:
            content = content.replace('const { user } = useAuth();', '''const { user } = useAuth();
  const filteredAccounts = accounts.filter(a => 
    searchTerm === '' || a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.type.toLowerCase().includes(searchTerm.toLowerCase()) || a.balance.toString().includes(searchTerm)
  );''')
            content = content.replace('{accounts.map(acc => (', '{filteredAccounts.map(acc => (')
            content = content.replace('{accounts.length === 0 && (', '{filteredAccounts.length === 0 && (')

    # 4. Fix CollectionsTab missing logic
    if 'function CollectionsTab' in content:
        if 'const filtered =' not in content or 'searchTerm' not in content:
            # Re-implement filtered logic for CollectionsTab
            old_filtered = "const filtered = filter === 'all' ? collections : collections.filter(c => c.status === filter)"
            new_filtered = '''const filtered = (filter === 'all' ? collections : collections.filter(c => c.status === filter)).filter(c => {
    const accName = accounts.find(a => a.id === c.accountId)?.name || '';
    return searchTerm === '' || 
      (c.note || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      accName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.amount.toString().includes(searchTerm) ||
      c.currency.toLowerCase().includes(searchTerm.toLowerCase());
  });'''
            content = content.replace(old_filtered, new_filtered)
            content = content.replace('{collections.filter(c => filter === \'all\' || c.status === filter).map(coll => {', '{filtered.map(coll => {')
            content = content.replace('{collections.length === 0 && (', '{filtered.length === 0 && (')

    # 5. Fix DashboardTab rogue Search UI
    dashboard_err = '''<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
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
      </div>'''
    content = content.replace(dashboard_err, '')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    main()