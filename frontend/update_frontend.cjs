const fs = require('fs');

const file = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add status to Collection type
content = content.replace(/type Collection = \{([\s\S]*?)createdAt: string/, 'type Collection = {$1status?: string\n  createdAt: string');

// 2. Dashboard Expected Collections
// First add totalExpected calculation
content = content.replace(
  /const totalCash = accounts\.reduce\(\(sum, acc\) => sum \+ acc\.balance, 0\)/,
  "const totalCash = accounts.reduce((sum, acc) => sum + acc.balance, 0)\n  const totalExpected = collections.filter(c => c.status === 'expected').reduce((sum, c) => sum + c.amountInBase, 0)"
);
// Then add the StatCard
content = content.replace(
  /<StatCard\s*title="Total Cash"[\s\S]*?\/>/,
  `<StatCard title="Total Cash" value={<FormatCurrency amount={totalCash} />} icon={<Wallet className="w-5 h-5 text-emerald-500" />} valueColor="text-emerald-600" />
        <StatCard title="Expected Collections" value={<FormatCurrency amount={totalExpected} />} icon={<Clock className="w-5 h-5 text-orange-500" />} valueColor="text-orange-600" />`
);

// 3. CollectionsTab updates
// Add states:
const collectionsTabRegex = /function CollectionsTab[^\{]+\{\s*const \{ user \} = useAuth\(\);[\s\S]*?const \[editCollectionId, setEditCollectionId\] = useState<number \| null>\(null\)/;
const matchCol = content.match(collectionsTabRegex);
if (matchCol) {
  const newStates = `${matchCol[0]}
  const [isExpected, setIsExpected] = useState(false)
  const [filter, setFilter] = useState('all')

  const handleMarkReceived = async (id: number) => {
    try {
      const res = await apiFetch(\`\${API_URL}/collections/\${id}/status\`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Failed to update status');
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  }
`;
  content = content.replace(matchCol[0], newStates);
}

// Update handleEditClick
content = content.replace(
  /setReceivedDate\(format\(new Date\(coll\.receivedDate\), 'yyyy-MM-dd'\)\)/,
  "setReceivedDate(format(new Date(coll.receivedDate), 'yyyy-MM-dd'))\n    setIsExpected(coll.status === 'expected')"
);

// Update handleCancelEdit
content = content.replace(
  /setAccountId\(''\)\n\s*setNote\(''\)/,
  "setAccountId('')\n    setNote('')\n    setIsExpected(false)"
);

// Update handleAddCollection body
content = content.replace(
  /accountId: parseInt\(accountId\),\s*note,\s*receivedDate\s*\}/,
  "accountId: parseInt(accountId),\n          note,\n          receivedDate,\n          status: isExpected ? 'expected' : 'received'\n        }"
);

// Add Checkbox to form
content = content.replace(
  /(<div>\s*<label className="block text-sm font-medium text-slate-700 mb-1">Date Received<\/label>[\s\S]*?<\/div>)/,
  `$1
          <div className="flex items-center gap-2 mt-4">
            <input type="checkbox" id="expectedCollection" checked={isExpected} onChange={e => setIsExpected(e.target.checked)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
            <label htmlFor="expectedCollection" className="text-sm font-medium text-slate-700">This is an Expected Collection (Pending)</label>
          </div>`
);

// Add Filters & Update Table
content = content.replace(
  /<div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">\s*<table/,
  `<div className="mb-4 flex gap-2">
        <button onClick={() => setFilter('all')} className={\`px-4 py-2 rounded-lg text-sm font-medium \${filter === 'all' ? 'bg-indigo-100 text-indigo-700' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}\`}>All</button>
        <button onClick={() => setFilter('expected')} className={\`px-4 py-2 rounded-lg text-sm font-medium \${filter === 'expected' ? 'bg-orange-100 text-orange-700' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}\`}>Expected</button>
        <button onClick={() => setFilter('received')} className={\`px-4 py-2 rounded-lg text-sm font-medium \${filter === 'received' ? 'bg-emerald-100 text-emerald-700' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}\`}>Received</button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table`
);

// Filter collections
content = content.replace(
  /\{collections\.map\(collection => \{/,
  `{collections.filter(c => filter === 'all' || c.status === filter).map(collection => {`
);

// Add Status to table header
content = content.replace(
  /<th className="px-6 py-4">Account<\/th>\s*<th className="px-6 py-4 text-right">Actions<\/th>/,
  `<th className="px-6 py-4">Account</th>
          <th className="px-6 py-4 text-center">Status</th>
          <th className="px-6 py-4 text-right">Actions</th>`
);

// Add Status badge and "Mark Received" button to table row
content = content.replace(
  /<td className="px-6 py-4 text-slate-600">\{accName\}<\/td>\s*<td className="px-6 py-4 space-x-3 text-right">/,
  `<td className="px-6 py-4 text-slate-600">{accName}</td>
              <td className="px-6 py-4 text-center">
                {collection.status === 'expected' ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">Pending</span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Completed</span>
                )}
              </td>
              <td className="px-6 py-4 space-x-3 text-right">
                {collection.status === 'expected' && (user?.role === 'admin' || user?.permissions?.collections?.edit) && (
                  <button onClick={() => handleMarkReceived(collection.id)} className="text-emerald-600 hover:text-emerald-900 font-medium mr-3 border border-emerald-200 px-2 py-1 rounded bg-emerald-50 text-xs">Mark Received</button>
                )}`
);

fs.writeFileSync(file, content);
console.log('Frontend CollectionsTab updated');
