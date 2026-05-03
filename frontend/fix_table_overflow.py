path = r'c:\\Users\\DELL\\.gemini\\antigravity\\brain\\1e70835b-96e1-481b-8a66-641bd45c1cc5\\cash-flow-system\\frontend\\src\\App.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix InvoicesTab container
old_inv_cont = '<div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">\n        <InvoiceTable'
new_inv_cont = '<div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto">\n        <InvoiceTable'

content = content.replace(old_inv_cont, new_inv_cont)

# 2. Fix SuppliersTab container
old_sup_cont = '<div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">\n          <div className="p-6 border-b border-slate-100">\n             <h2 className="text-lg font-bold text-slate-800">Associated Invoices</h2>\n          </div>\n          <InvoiceTable'
new_sup_cont = '<div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto mb-8">\n          <div className="p-6 border-b border-slate-100">\n             <h2 className="text-lg font-bold text-slate-800">Associated Invoices</h2>\n          </div>\n          <InvoiceTable'

content = content.replace(old_sup_cont, new_sup_cont)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
