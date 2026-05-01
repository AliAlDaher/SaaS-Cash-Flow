const fs = require('fs');

const file = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. App route
content = content.replace(
  /<SuppliersTab suppliers=\{suppliers\} onRefresh=\{fetchData\}/,
  '<SuppliersTab suppliers={suppliers} invoices={invoices} onRefresh={fetchData}'
);

// 2. SuppliersTab signature
content = content.replace(
  /function SuppliersTab\(\{ suppliers, onRefresh, onDelete \}: \{ suppliers: Supplier\[\], onRefresh: \(\) => void, onDelete: \(id: number\) => void \}\) \{/,
  'function SuppliersTab({ suppliers, invoices, onRefresh, onDelete }: { suppliers: Supplier[], invoices: Invoice[], onRefresh: () => void, onDelete: (id: number) => void }) {'
);

// 3. SuppliersTab states
content = content.replace(
  /const \[editSupplierId, setEditSupplierId\] = useState<number \| null>\(null\)/,
  `const [editSupplierId, setEditSupplierId] = useState<number | null>(null)\n  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)`
);

// 4. SuppliersTab return block
const detailedViewLogic = `  if (selectedSupplier) {
    const supplierInvoices = invoices.filter(inv => inv.supplierId === selectedSupplier.id)
    const totalInvoicesCount = supplierInvoices.length;
    const totalAmount = supplierInvoices.reduce((acc, inv) => acc + inv.amount, 0);
    const totalPaid = supplierInvoices.reduce((acc, inv) => acc + inv.paidAmount, 0);
    const remaining = totalAmount - totalPaid;

    return (
      <div className="space-y-8 animate-in fade-in duration-200">
        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedSupplier(null)} className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{selectedSupplier.name} - Invoices</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Invoices" value={totalInvoicesCount} icon={<FileText className="w-5 h-5 text-sky-500"/>} />
          <StatCard title="Total Amount" value={<FormatCurrency amount={totalAmount}/>} icon={<Wallet className="w-5 h-5 text-sky-500"/>} />
          <StatCard title="Total Paid" value={<FormatCurrency amount={totalPaid}/>} icon={<CheckCircle className="w-5 h-5 text-emerald-500"/>} valueColor="text-emerald-600" />
          <StatCard title="Remaining Balance" value={<FormatCurrency amount={remaining}/>} icon={<AlertTriangle className="w-5 h-5 text-orange-500"/>} valueColor="text-orange-600" />
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <InvoiceTable invoices={supplierInvoices} suppliers={suppliers} showDescription={true} />
        </div>
      </div>
    )
  }

  return (`

content = content.replace(
  /  return \(\s*<div className="space-y-8">\s*<header>\s*<h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Suppliers Management<\/h1>/,
  `${detailedViewLogic}\n    <div className="space-y-8">\n      <header>\n        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Suppliers Management</h1>`
);


// 5. SuppliersTab supplier name clickable
content = content.replace(
  /<td className="px-6 py-4 font-medium text-slate-900">\{supplier\.name\}<\/td>/g,
  `<td className="px-6 py-4"><button onClick={() => setSelectedSupplier(supplier)} className="font-bold text-sky-600 hover:text-sky-800 hover:underline">{supplier.name}</button></td>`
);


// 6. InvoicesTab states
content = content.replace(
  /const \[formError, setFormError\] = useState<string \| null>\(null\)/,
  `const [formError, setFormError] = useState<string | null>(null)\n  const [filterSupplierId, setFilterSupplierId] = useState<string>('')`
);

// 7. InvoicesTab filtering logic
content = content.replace(
  /  return \(\s*<div className="space-y-8">\s*<header>\s*<h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Invoices<\/h1>/,
  `  const filteredInvoices = filterSupplierId ? invoices.filter(inv => inv.supplierId.toString() === filterSupplierId) : invoices;\n\n  return (\n    <div className="space-y-8">\n      <header>\n        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Invoices</h1>`
);

// 8. InvoicesTab filter UI
const invoicesTableUI = `<div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800">All Invoices</h2>
        <select value={filterSupplierId} onChange={e => setFilterSupplierId(e.target.value)} className="border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-sky-500 bg-white min-w-[200px]">
          <option value="">All Suppliers</option>
          {suppliers.map(s => <option key={s.id} value={s.id.toString()}>{s.name}</option>)}
        </select>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <InvoiceTable invoices={filteredInvoices} suppliers={suppliers} showDescription={true} onEditClick={(user?.role === 'admin' || user?.permissions?.invoices?.edit) ? handleEditClick : undefined} onDeleteClick={(user?.role === 'admin' || user?.permissions?.invoices?.delete) ? onDelete : undefined} />
      </div>`;

content = content.replace(
  /<div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">\s*\{\/\* Pass showDescription=\{true\} so it appears here \*\/\}\s*<InvoiceTable invoices=\{invoices\} suppliers=\{suppliers\} showDescription=\{true\} onEditClick=\{\(user\?\.role === 'admin' \|\| user\?\.permissions\?\.invoices\?\.edit\) \? handleEditClick : undefined\} onDeleteClick=\{\(user\?\.role === 'admin' \|\| user\?\.permissions\?\.invoices\?\.delete\) \? onDelete : undefined\} \/>\s*<\/div>/,
  invoicesTableUI
);

fs.writeFileSync(file, content);
console.log('Supplier-based invoice grouping and filtering added');
