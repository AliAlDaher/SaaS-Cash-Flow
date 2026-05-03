import re

def main():
    app_path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx'
    with open(app_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Fix MainLayout states and helper
    # First, find and remove any misplaced handleSupplierClick
    content = re.sub(r'const handleSupplierClick = \(supplier: Supplier\) => \{\s+setSelectedSupplier\(supplier\);\s+navigate\("/suppliers"\);\s+\};', '', content)
    
    # Remove misplaced selectedSupplier if any
    content = re.sub(r'const \[selectedSupplier, setSelectedSupplier\] = useState<Supplier \| null>\(null\)', '', content)

    # Insert them correctly in MainLayout
    # Find the block of states in MainLayout
    state_block = '''  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)

  const handleSupplierClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    navigate("/suppliers");
  };'''

    # Pattern to match the original state block
    pattern = r'  const \[suppliers, setSuppliers\] = useState<Supplier\[\]>\(\[\]\)\s+const \[invoices, setInvoices\] = useState<Invoice\[\]>\(\[\]\)\s+const \[payments, setPayments\] = useState<Payment\[\]>\(\[\]\)\s+const \[accounts, setAccounts\] = useState<Account\[\]>\(\[\]\)\s+const \[collections, setCollections\] = useState<Collection\[\]>\(\[\]\)\s+const \[loading, setLoading\] = useState\(true\)\s+const \[error, setError\] = useState<string \| null>\(null\)'
    
    content = re.sub(pattern, state_block, content)

    # 2. Fix InvoiceTable: use invoice.supplierId
    # This was previously broken by a global replace
    # We want to find the button inside InvoiceTable and fix its onClick
    # The button inside InvoiceTable uses {supplierName} and is inside invoices.map
    
    # Let's find the specific block in InvoiceTable
    # It currently has: const s = suppliers.find(sup => sup.id === payment.supplierId);
    # It should be: const s = suppliers.find(sup => sup.id === invoice.supplierId);
    
    # We need to be careful not to hit PaymentsTab
    # InvoiceTable starts around line 1211
    
    # Let's use a simpler approach: replace the specific broken line only if it's preceded by invoice.map
    # Actually, let's just replace all occurrences of `sup.id === payment.supplierId` with `sup.id === invoice.supplierId` 
    # ONLY if they are NOT in the payments.map block.
    
    # But wait, PaymentsTab IS correct with payment.supplierId.
    # So I just need to fix InvoiceTable.
    
    # Let's do a targeted replace for InvoiceTable's map
    content = content.replace(
        'const s = suppliers.find(sup => sup.id === payment.supplierId);\n                    if (s && onSupplierClick) onSupplierClick(s);',
        'const s = suppliers.find(sup => sup.id === invoice.supplierId);\n                    if (s && onSupplierClick) onSupplierClick(s);'
    )
    # Wait, the above might hit PaymentsTab too if I'm not careful.
    # In PaymentsTab it IS `payment.supplierId`.
    # Let's check PaymentsTab again.
    
    # Actually, I'll just rewrite the whole InvoiceTable and PaymentsTab functions to be sure.
    
    with open(app_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Success fixing supplier nav v4")

if __name__ == '__main__':
    main()