path = r'c:\Users\DELL\.gemini\antigravity\brain\1e70835b-96e1-481b-8a66-641bd45c1cc5\cash-flow-system\frontend\src\App.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix InvoicesTab call (remove setSuppliers)
content = content.replace('<InvoicesTab suppliers={suppliers} invoices={invoices} onRefresh={() => fetchData(false)} setSuppliers={setSuppliers} setInvoices={setInvoices}', '<InvoicesTab suppliers={suppliers} invoices={invoices} onRefresh={() => fetchData(false)} setInvoices={setInvoices}')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
