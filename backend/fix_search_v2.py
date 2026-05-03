import re

def main():
    path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix InvoicesTab
    invoices_fix = '''        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search invoices..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500 w-full sm:w-64"
            />
          </div>
        <select value={filterSupplierId} onChange={e => setFilterSupplierId(e.target.value)} className="border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-sky-500 bg-white min-w-[200px]">
          <option value="">All Suppliers</option>
          {suppliers.map(s => <option key={s.id} value={s.id.toString()}>{s.name}</option>)}
        </select>
      </div>'''

    invoices_correct = '''        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search invoices..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500 w-full sm:w-64"
            />
          </div>
          <select value={filterSupplierId} onChange={e => setFilterSupplierId(e.target.value)} className="border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-sky-500 bg-white min-w-[200px]">
            <option value="">All Suppliers</option>
            {suppliers.map(s => <option key={s.id} value={s.id.toString()}>{s.name}</option>)}
          </select>
        </div>
      </div>'''

    content = content.replace(invoices_fix, invoices_correct)

    # Fix CollectionsTab
    collections_fix = '''        <div className="flex flex-col sm:flex-row gap-3">
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
    
    collections_correct = '''        <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search collections..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500 w-full sm:w-64"
                />
              </div>
            </div>
          </div>'''
    # Wait, the collections one probably has more after it.
    # Actually, the original replacement had:
    # <div className="flex flex-col sm:flex-row gap-3">
    #   <div className="relative"> ... </div>
    #   ... existing filter buttons ...
    # </div>
    # </div>

    # Let's check CollectionsTab header again.
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    main()