import re

def main():
    path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Normalize newlines
    content = content.replace('\r\n', '\n')

    # --- 1. Fix PaymentsTab ---
    # Find PaymentsTab header
    payments_header = r'<h2 className="text-xl font-bold text-slate-800">Recent Payments</h2>'
    if payments_header in content:
        # It seems I already replaced it but let's be sure
        pass

    # --- 2. Fix CollectionsTab ---
    # Find the filter buttons and wrap them with Search
    coll_search_ui = '''<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex gap-2">
          <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === 'all' ? 'bg-sky-100 text-sky-700' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>All</button>
          <button onClick={() => setFilter('expected')} className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === 'expected' ? 'bg-orange-100 text-orange-700' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Expected</button>
          <button onClick={() => setFilter('received')} className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === 'received' ? 'bg-emerald-100 text-emerald-700' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Received</button>
        </div>
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
      </div>'''

    old_coll_ui = r'<div className="mb-4 flex gap-2">[\s\S]+?</div>'
    content = re.sub(old_coll_ui, coll_search_ui, content, count=1)

    # --- 3. Fix SuppliersTab ---
    # Check if SuppliersTab header is correct
    suppliers_header_old = r'<h2 className="text-xl font-bold text-slate-800">All Suppliers</h2>'
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
    if suppliers_header_old in content:
        content = content.replace(suppliers_header_old, suppliers_header_new)

    # --- 4. Fix AccountsTab ---
    # Ensure no double headers or missing divs
    
    # --- 5. Fix Syntax Errors ---
    # The build error at 1485,351 is suspicious.
    # Let's check for any orphaned { or } or < >.
    
    # I'll also fix the UsersTab <any> issue if it exists.
    # Actually, TypeScript might be confused if the file is in a weird state.

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    main()