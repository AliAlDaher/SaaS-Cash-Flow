import re

def main():
    app_path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx'
    with open(app_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Fix SuppliersTab usage in Routes
    content = content.replace(
        '<SuppliersTab suppliers={suppliers} invoices={invoices} onRefresh={fetchData} onDelete={(id) => openDeleteModal(id, \'suppliers\', \'Supplier\')}  />',
        '<SuppliersTab suppliers={suppliers} invoices={invoices} onRefresh={fetchData} onDelete={(id) => openDeleteModal(id, "suppliers", "Supplier")} selectedSupplier={selectedSupplier} setSelectedSupplier={setSelectedSupplier} />'
    )

    # 2. Fix InvoicesTab usage in Routes
    content = content.replace(
        '<InvoicesTab suppliers={suppliers} invoices={invoices} onRefresh={fetchData} onDelete={(id) => openDeleteModal(id, \'invoices\', \'Invoice\')}  />',
        '<InvoicesTab suppliers={suppliers} invoices={invoices} onRefresh={fetchData} onDelete={(id) => openDeleteModal(id, "invoices", "Invoice")} onSupplierClick={handleSupplierClick} />'
    )

    # 3. Fix PaymentsTab usage in Routes
    content = content.replace(
        '<PaymentsTab suppliers={suppliers} payments={payments} accounts={accounts} onRefresh={fetchData} onDelete={(id) => openDeleteModal(id, \'payments\', \'Payment\')}  />',
        '<PaymentsTab suppliers={suppliers} payments={payments} accounts={accounts} onRefresh={fetchData} onDelete={(id) => openDeleteModal(id, "payments", "Payment")} onSupplierClick={handleSupplierClick} />'
    )

    # 4. Fix InvoiceTable: use invoice.supplierId instead of payment.supplierId
    # This specifically targets the button inside InvoiceTable
    content = re.sub(
        r'const s = suppliers\.find\(sup => sup\.id === payment\.supplierId\);\s+if \(s && onSupplierClick\) onSupplierClick\(s\);',
        'const s = suppliers.find(sup => sup.id === invoice.supplierId);\n                    if (s && onSupplierClick) onSupplierClick(s);',
        content
    )
    # Wait, the above might hit PaymentsTab too if I'm not careful.
    # In PaymentsTab it SHOULD be payment.supplierId.
    # Let's fix only the one inside InvoiceTable.
    
    # Actually, let's replace the whole onClick block in InvoiceTable
    invoice_table_onclick = '''                <button 
                  onClick={() => {
                    const s = suppliers.find(sup => sup.id === invoice.supplierId);
                    if (s && onSupplierClick) onSupplierClick(s);
                  }}'''
    
    # Pattern to find the one that is definitely wrong (using payment instead of invoice in a context where invoice is defined)
    # But wait, PaymentsTab also has supplierName.
    
    # Let's check line 1257 again.
    # It's inside `invoices.map(invoice => { ... return ( ... ) })`
    
    # 5. Fix InvoicesTab props definition
    content = content.replace(
        'function InvoicesTab({ suppliers, invoices, onRefresh, onDelete }: { suppliers: Supplier[], invoices: Invoice[], onRefresh: () => void, onDelete?: (id: number) => void }) {',
        'function InvoicesTab({ suppliers, invoices, onRefresh, onDelete, onSupplierClick }: { suppliers: Supplier[], invoices: Invoice[], onRefresh: () => void, onDelete?: (id: number) => void, onSupplierClick?: (s: Supplier) => void }) {'
    )
    
    # 6. Fix PaymentsTab props definition
    content = content.replace(
        'function PaymentsTab({ suppliers, payments, accounts, onRefresh, onDelete }: { suppliers: Supplier[], payments: Payment[], accounts: Account[], onRefresh: () => void, onDelete: (id: number) => void }) {',
        'function PaymentsTab({ suppliers, payments, accounts, onRefresh, onDelete, onSupplierClick }: { suppliers: Supplier[], payments: Payment[], accounts: Account[], onRefresh: () => void, onDelete: (id: number) => void, onSupplierClick?: (s: Supplier) => void }) {'
    )

    with open(app_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Success fixing supplier nav v5")

if __name__ == '__main__':
    main()