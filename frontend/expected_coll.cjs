const fs = require('fs');

const file = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix DashboardTab props
content = content.replace(
  /function DashboardTab\(\{ suppliers, invoices, accounts \}: \{ suppliers: Supplier\[\], invoices: Invoice\[\], accounts: Account\[\] \}\) \{/,
  'function DashboardTab({ suppliers, invoices, accounts, collections }: { suppliers: Supplier[], invoices: Invoice[], accounts: Account[], collections: Collection[] }) {'
);

content = content.replace(
  /<DashboardTab suppliers=\{suppliers\} invoices=\{invoices\} accounts=\{accounts\}\s*\/>/,
  '<DashboardTab suppliers={suppliers} invoices={invoices} accounts={accounts} collections={collections} />'
);

// 2. Add Expected Collections StatCard to Dashboard
if (!content.includes('Expected Collections')) {
  // Find "Total Cash" StatCard
  content = content.replace(
    /<StatCard title="Total Cash"[\s\S]*?\/>/,
    `$&
        <StatCard 
          title="Expected Collections" 
          value={<FormatCurrency amount={totalExpected} />} 
          icon={<Landmark className="w-5 h-5 text-orange-500" />} 
          valueColor="text-orange-600"
        />`
  );
}

// 3. Remove filter block from SuppliersTab
content = content.replace(
  /<div className="mb-4 flex gap-2">\s*<button onClick=\{\(\) => setFilter\('all'\)\}[^>]+>All<\/button>\s*<button onClick=\{\(\) => setFilter\('expected'\)\}[^>]+>Expected<\/button>\s*<button onClick=\{\(\) => setFilter\('received'\)\}[^>]+>Received<\/button>\s*<\/div>/,
  ''
);

// 4. Update CollectionsTab state
const collectionsStateInjection = `
  const [filter, setFilter] = useState('all')
  const [isExpected, setIsExpected] = useState(false)
`;

if (!content.includes("const [filter, setFilter] = useState('all')")) {
  content = content.replace(
    /const \[editCollectionId, setEditCollectionId\] = useState<number \| null>\(null\)/,
    `$&${collectionsStateInjection}`
  );
}

// 5. Update CollectionsTab UI
// Add checkbox to form
if (!content.includes('isExpected} onChange={e => setIsExpected(e.target.checked)}')) {
  content = content.replace(
    /<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">/,
    `$&
            <div className="col-span-1 sm:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                <input type="checkbox" checked={isExpected} onChange={e => setIsExpected(e.target.checked)} className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" />
                This is an Expected Collection (Not received yet)
              </label>
            </div>`
  );
}

// Add filter buttons before Collections table
if (!content.includes('setFilter(\'expected\')')) {
  content = content.replace(
    /<div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">\s*<table className="w-full text-left text-sm">\s*<thead className="bg-slate-50\/50 text-slate-500 font-medium">\s*<tr>\s*<th className="px-6 py-4">ID<\/th>/,
    `<div className="mb-4 flex gap-2">
        <button onClick={() => setFilter('all')} className={\`px-4 py-2 rounded-lg text-sm font-medium \${filter === 'all' ? 'bg-indigo-100 text-indigo-700' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}\`}>All</button>
        <button onClick={() => setFilter('expected')} className={\`px-4 py-2 rounded-lg text-sm font-medium \${filter === 'expected' ? 'bg-orange-100 text-orange-700' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}\`}>Expected</button>
        <button onClick={() => setFilter('received')} className={\`px-4 py-2 rounded-lg text-sm font-medium \${filter === 'received' ? 'bg-emerald-100 text-emerald-700' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}\`}>Received</button>
      </div>
      $&`
  );
}

// Add Status column
if (!content.includes('<th className="px-6 py-4">Status</th>')) {
  content = content.replace(
    /<th className="px-6 py-4">Amount \(JOD\)<\/th>/,
    `$&
              <th className="px-6 py-4">Status</th>`
  );
}

// Filter logic in mapping
if (!content.includes('filteredCollections.map(collection =>')) {
  content = content.replace(
    /\{collections\.map\(collection => \(\{/,
    `{(() => {
            const filteredCollections = collections.filter(c => filter === 'all' || c.status === filter);
            return filteredCollections.map(collection => {
              const account = accounts.find(a => a.id === collection.accountId);
              return (`
  );
  
  // Close the IIFE at the end of map
  content = content.replace(
    /\{\(user\?\.role === 'admin' \|\| user\?\.permissions\?\.collections\?\.delete\) && <button onClick=\{\(\) => onDelete\(collection\.id\)\} className="text-rose-600 hover:text-rose-900 font-medium">Delete<\/button>\}\s*<\/td>\s*<\/tr>\s*\)\s*\}\)\}/,
    `$&
            })
          })()}`
  );
}

// Fix mapping variables. The code actually uses `collections.map(collection => {` ... wait. Let's make sure our replacement works.
// Actually, I can just replace `collections.map(collection => {` with `collections.filter(c => filter === 'all' || c.status === filter).map(collection => {`
content = content.replace(
  /\{collections\.map\(collection => \{/,
  `{collections.filter(c => filter === 'all' || c.status === filter).map(collection => {`
);

// Add Status cell and "Mark as Received" button
const markReceivedHandler = `
  const handleMarkReceived = async (id: number) => {
    try {
      const res = await apiFetch(\`\${API_URL}/collections/\${id}/status\`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error('Failed to update status')
      onRefresh()
    } catch(err: any) {
      alert(err.message)
    }
  }
`;

if (!content.includes('handleMarkReceived')) {
  content = content.replace(
    /const handleCancelEdit = \(\) => \{/,
    `${markReceivedHandler}\n  $&`
  );
}

const statusCell = `
                <td className="px-6 py-4">
                  {collection.status === 'expected' ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Expected
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      Received
                    </span>
                  )}
                </td>
`;

if (!content.includes("collection.status === 'expected' ? (")) {
  content = content.replace(
    /<td className="px-6 py-4 font-bold">\s*<FormatCurrency amount=\{collection\.amountInBase\} \/>\s*<\/td>/,
    `$&${statusCell}`
  );
}

if (!content.includes('Mark as Received')) {
  content = content.replace(
    /\{\(user\?\.role === 'admin' \|\| user\?\.permissions\?\.collections\?\.edit\) && <button onClick=\{\(\) => handleEditClick\(collection\)\} className="text-indigo-600 hover:text-indigo-900 font-medium mr-3">Edit<\/button>\}/,
    `$&
                  {collection.status === 'expected' && (user?.role === 'admin' || user?.permissions?.collections?.edit) && (
                    <button onClick={() => handleMarkReceived(collection.id)} className="text-emerald-600 hover:text-emerald-900 font-medium mr-3">
                      Mark as Received
                    </button>
                  )}`
  );
}

// In CollectionsTab component, handle resetting isExpected in handleCancelEdit
if (!content.includes("setIsExpected(false)")) {
    content = content.replace(
        /setReceivedDate\(format\(new Date\(\), 'yyyy-MM-dd'\)\)\n  \}/,
        `setReceivedDate(format(new Date(), 'yyyy-MM-dd'))\n    setIsExpected(false)\n  }`
    )
}

fs.writeFileSync(file, content);
console.log('Finished updating App.tsx for expected collections');
