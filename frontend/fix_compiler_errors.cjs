const fs = require('fs');

const file = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove `handleMarkReceived` from SuppliersTab
const handleMarkStr = `
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
content = content.replace(handleMarkStr, '');

// 2. Add `handleMarkReceived` to CollectionsTab (after handleCancelEdit)
if (!content.includes('const handleMarkReceived = async (id: number)')) {
  content = content.replace(
    /const handleCancelEdit = \(\) => \{[\s\S]*?setReceivedDate\(format\(new Date\(\), 'yyyy-MM-dd'\)\)\n\s*setIsExpected\(false\)\n\s*\}/,
    `$&${handleMarkStr}`
  );
}

// 3. Remove `setFilter` buttons from SuppliersTab
const filterButtonsRegex = /<div className="mb-4 flex gap-2">\s*<button onClick=\{\(\) => setFilter\('all'\)\}.+<\/button>\s*<button onClick=\{\(\) => setFilter\('expected'\)\}.+<\/button>\s*<button onClick=\{\(\) => setFilter\('received'\)\}.+<\/button>\s*<\/div>/;
content = content.replace(filterButtonsRegex, '');

// 4. Add `setFilter` buttons to CollectionsTab before the table container
// Find `<div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">\s*<table className="w-full text-left text-sm">` inside CollectionsTab
const collectionsTabRegex = /function CollectionsTab\([\s\S]*?function UsersTab/;
const collectionsMatch = content.match(collectionsTabRegex);

if (collectionsMatch) {
  let collectionsContent = collectionsMatch[0];
  
  if (!collectionsContent.includes("onClick={() => setFilter('expected')}")) {
    collectionsContent = collectionsContent.replace(
      /<div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">\s*<table className="w-full text-left text-sm">/,
      `<div className="mb-4 flex gap-2">
        <button onClick={() => setFilter('all')} className={\`px-4 py-2 rounded-lg text-sm font-medium \${filter === 'all' ? 'bg-indigo-100 text-indigo-700' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}\`}>All</button>
        <button onClick={() => setFilter('expected')} className={\`px-4 py-2 rounded-lg text-sm font-medium \${filter === 'expected' ? 'bg-orange-100 text-orange-700' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}\`}>Expected</button>
        <button onClick={() => setFilter('received')} className={\`px-4 py-2 rounded-lg text-sm font-medium \${filter === 'received' ? 'bg-emerald-100 text-emerald-700' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}\`}>Received</button>
      </div>
      $&`
    );
  }
  
  content = content.replace(collectionsMatch[0], collectionsContent);
}

// Check if collections error is there in DashboardTab
if (content.includes("error TS2552: Cannot find name 'collections'")) {
    // wait I fixed it previously: `const totalExpected = collections.filter(c => c.status === 'expected').reduce((sum, c) => sum + c.amountInBase, 0)`
}

fs.writeFileSync(file, content);
console.log('Fixed TS compiler errors');
