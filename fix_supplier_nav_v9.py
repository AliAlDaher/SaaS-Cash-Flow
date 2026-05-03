import re

def main():
    app_path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx'
    with open(app_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Global fix for InvoiceTable/DashboardTab broken variable
    content = content.replace('payment.supplierId', 'invoice.supplierId')
    
    # 2. Fix PaymentsTab back to payment.supplierId
    content = re.sub(
        r'function PaymentsTab.*?\{payments\.map\(payment => \{.*?const s = suppliers\.find\(sup => sup\.id === invoice\.supplierId\);',
        lambda m: m.group(0).replace('invoice.supplierId', 'payment.supplierId'),
        content,
        flags=re.DOTALL
    )

    # 3. Fix DashboardTab props correctly
    if 'onSupplierClick?: (s: Supplier) => void' not in content.split('function DashboardTab')[1].split('{')[1].split('}')[1]:
        # Need to find the exact line
        content = re.sub(
            r'function DashboardTab\(\{ suppliers, invoices, accounts, collections, onRefresh \}: \{ suppliers: Supplier\[\], invoices: Invoice\[\], accounts: Account\[\], collections: Collection\[\], onRefresh: \(\) => void \}\) \{',
            'function DashboardTab({ suppliers, invoices, accounts, collections, onRefresh, onSupplierClick }: { suppliers: Supplier[], invoices: Invoice[], accounts: Account[], collections: Collection[], onRefresh: () => void, onSupplierClick?: (s: Supplier) => void }) {',
            content
        )

    # 4. Fix SuppliersTab props correctly (ensure all are there)
    # The usage in Routes might be missing props
    content = content.replace(
        '<SuppliersTab suppliers={suppliers} invoices={invoices} onRefresh={fetchData} onDelete={(id) => openDeleteModal(id, "suppliers", "Supplier")}  />',
        '<SuppliersTab suppliers={suppliers} invoices={invoices} onRefresh={fetchData} onDelete={(id) => openDeleteModal(id, "suppliers", "Supplier")} selectedSupplier={selectedSupplier} setSelectedSupplier={setSelectedSupplier} onSupplierClick={handleSupplierClick} />'
    )

    with open(app_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Success fixing supplier nav v9")

if __name__ == '__main__':
    main()