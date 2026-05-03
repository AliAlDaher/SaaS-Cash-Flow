import re

def main():
    app_path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx'
    with open(app_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add state for showSelectedOnly in DashboardTab
    content = content.replace(
        'function DashboardTab({ suppliers, invoices, accounts, collections, onRefresh, onSupplierClick }: { suppliers: Supplier[], invoices: Invoice[], accounts: Account[], collections: Collection[], onRefresh: () => void, onSupplierClick?: (s: Supplier) => void }) {\n  const { user } = useAuth();',
        'function DashboardTab({ suppliers, invoices, accounts, collections, onRefresh, onSupplierClick }: { suppliers: Supplier[], invoices: Invoice[], accounts: Account[], collections: Collection[], onRefresh: () => void, onSupplierClick?: (s: Supplier) => void }) {\n  const { user } = useAuth();\n  const [showSelectedOnly, setShowSelectedOnly] = useState(false);'
    )

    # 2. Update upcomingRows filtering
    content = content.replace(
        'upcomingRows.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())',
        'upcomingRows.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())\n  const finalRows = showSelectedOnly ? upcomingRows.filter(r => r.reminder) : upcomingRows;'
    )

    # 3. Add toggle UI in DashboardTab
    content = content.replace(
        '<h2 className="text-lg font-bold text-slate-800">Upcoming & Overdue Payments (1.5 Months)</h2>',
        '''<div className="flex flex-1 items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Upcoming & Overdue Payments (1.5 Months)</h2>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-600">Show Selected Only</span>
                <button 
                  onClick={() => setShowSelectedOnly(!showSelectedOnly)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${showSelectedOnly ? 'bg-sky-600' : 'bg-slate-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showSelectedOnly ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>'''
    )

    # 4. Update the table to use finalRows instead of upcomingRows
    content = content.replace(
        '{upcomingRows.map(row => (',
        '{finalRows.map(row => ('
    )
    content = content.replace(
        '{upcomingRows.length === 0 && (',
        '{finalRows.length === 0 && ('
    )

    # 5. Add "No selected invoices" message if filter is active
    content = content.replace(
        'No upcoming or overdue payments!',
        'showSelectedOnly ? "No invoices selected for payment!" : "No upcoming or overdue payments!"'
    )

    with open(app_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Success adding payment filter to dashboard")

if __name__ == '__main__':
    main()