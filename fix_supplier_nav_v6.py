import re

def main():
    app_path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx'
    with open(app_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Fix PaymentsTab: Change invoice.supplierId to payment.supplierId
    # Specifically target the one inside the Payments history table
    content = content.replace(
        'const s = suppliers.find(sup => sup.id === invoice.supplierId);\n                    if (s && onSupplierClick) onSupplierClick(s);',
        'const s = suppliers.find(sup => sup.id === payment.supplierId);\n                    if (s && onSupplierClick) onSupplierClick(s);'
    )

    # 2. Fix SuppliersTab props definition
    content = content.replace(
        'function SuppliersTab({ suppliers, invoices, onRefresh, onDelete, selectedSupplier, setSelectedSupplier }: { suppliers: Supplier[], invoices: Invoice[], onRefresh: () => void, onDelete: (id: number) => void, selectedSupplier: Supplier | null, setSelectedSupplier: (s: Supplier | null) => void }) {',
        'function SuppliersTab({ suppliers, invoices, onRefresh, onDelete, selectedSupplier, setSelectedSupplier, onSupplierClick }: { suppliers: Supplier[], invoices: Invoice[], onRefresh: () => void, onDelete: (id: number) => void, selectedSupplier: Supplier | null, setSelectedSupplier: (s: Supplier | null) => void, onSupplierClick?: (s: Supplier) => void }) {'
    )

    # 3. Fix SuppliersTab usage in Routes (pass handleSupplierClick)
    content = content.replace(
        'selectedSupplier={selectedSupplier} setSelectedSupplier={setSelectedSupplier} />',
        'selectedSupplier={selectedSupplier} setSelectedSupplier={setSelectedSupplier} onSupplierClick={handleSupplierClick} />'
    )

    # 4. Check DashboardTab props definition (it should have onSupplierClick)
    # The error was: src/App.tsx(787,327): error TS2304: Cannot find name 'onSupplierClick'.
    # This means it's NOT in the props of DashboardTab.
    
    # Let's find DashboardTab definition.
    # It might have been replaced wrongly.
    
    content = re.sub(
        r'function DashboardTab\(\{ suppliers, invoices, accounts, collections, onRefresh \}: \{ suppliers: Supplier\[\], invoices: Invoice\[\], accounts: Account\[\], collections: Collection\[\], onRefresh: \(\) => void \}\) \{',
        'function DashboardTab({ suppliers, invoices, accounts, collections, onRefresh, onSupplierClick }: { suppliers: Supplier[], invoices: Invoice[], accounts: Account[], collections: Collection[], onRefresh: () => void, onSupplierClick?: (s: Supplier) => void }) {',
        content
    )

    with open(app_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Success fixing supplier nav v6")

if __name__ == '__main__':
    main()