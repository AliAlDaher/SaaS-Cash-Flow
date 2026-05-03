import re

def main():
    path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Remove duplicate search state and rogue Dashboard insertion
    dashboard_err = '''        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
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
      </div>\n      '''
    content = content.replace(dashboard_err, '')

    # 2. Fix duplicated states and missing logic
    # I'll just find all `searchTerm` definitions and ensure they are exactly 1 per Tab function.
    
    # 3. Fix PaymentsTab
    # Remove the second state
    content = content.replace('return matchesSearch;\n  });\n  const [searchTerm, setSearchTerm] = useState(\'\')', 'return matchesSearch;\n  });')

    # 4. Fix SuppliersTab logic move
    # Check if filteredSuppliers is missing
    if 'filteredSuppliers.map' in content and 'const filteredSuppliers' not in content:
        # Re-add it
        logic = '''const filteredSuppliers = suppliers.filter(s => 
    searchTerm === '' || s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.priority.toString().includes(searchTerm)
  );'''
        content = content.replace('const [editSupplierId, setEditSupplierId] = useState<number | null>(null)', 'const [editSupplierId, setEditSupplierId] = useState<number | null>(null)\n  ' + logic)

    # 5. Fix AccountsTab logic move
    if 'filteredAccounts.map' in content and 'const filteredAccounts' not in content:
        logic = '''const filteredAccounts = accounts.filter(a => 
    searchTerm === '' || a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.type.toLowerCase().includes(searchTerm.toLowerCase()) || a.balance.toString().includes(searchTerm)
  );'''
        content = content.replace('const [type, setType] = useState(\'Bank\')', 'const [type, setType] = useState(\'Bank\')\n  ' + logic)

    # 6. Ensure searchTerm state is present in all Tabs
    for tab_name in ['InvoicesTab', 'PaymentsTab', 'CollectionsTab', 'SuppliersTab', 'AccountsTab']:
        # This is a bit complex to do blindly, so I'll be specific.
        pass

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    main()