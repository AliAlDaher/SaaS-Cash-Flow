import re

def main():
    app_path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx'
    with open(app_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Fix PaymentsTab: use payment.supplierId instead of invoice.supplierId
    content = content.replace(
        'const s = suppliers.find(sup => sup.id === invoice.supplierId);',
        'const s = suppliers.find(sup => sup.id === payment.supplierId);'
    )

    # 2. Fix InvoiceTable: ensure it has onSupplierClick in props
    if 'onSupplierClick?: (s: Supplier) => void' not in content:
        # It should be there from previous run, but let's check
        pass

    # 3. Ensure handleSupplierClick and states are correctly defined in MainLayout
    # Remove any misplaced definitions
    content = re.sub(r'const handleSupplierClick = \(supplier: Supplier\) => \{\s+setSelectedSupplier\(supplier\);\s+navigate\("/suppliers"\);\s+\};', '', content)
    
    # Define state and helper properly
    state_block = 'const [successMessage, setSuccessMessage] = useState<string | null>(null)\n  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)\n\n  const handleSupplierClick = (supplier: Supplier) => {\n    setSelectedSupplier(supplier);\n    navigate("/suppliers");\n  };'
    
    if 'const [selectedSupplier, setSelectedSupplier]' not in content:
        content = content.replace('const [successMessage, setSuccessMessage] = useState<string | null>(null)', state_block)

    # 4. Fix SuppliersTab props usage in MainLayout
    # It might be missing because of the regex failure
    content = re.sub(
        r'<SuppliersTab suppliers=\{suppliers\} invoices=\{invoices\} onRefresh=\{fetchData\} onDelete=\{\(id\) => openDeleteModal\(id, "suppliers", "Supplier"\)\}\s+/>',
        '<SuppliersTab suppliers={suppliers} invoices={invoices} onRefresh={fetchData} onDelete={(id) => openDeleteModal(id, "suppliers", "Supplier")} selectedSupplier={selectedSupplier} setSelectedSupplier={setSelectedSupplier} />',
        content
    )

    # 5. Fix InvoicesTab and DashboardTab props
    content = re.sub(
        r'<DashboardTab suppliers=\{suppliers\} invoices=\{invoices\} accounts=\{accounts\} collections=\{collections\} onRefresh=\{fetchData\} />',
        '<DashboardTab suppliers={suppliers} invoices={invoices} accounts={accounts} collections={collections} onRefresh={fetchData} onSupplierClick={handleSupplierClick} />',
        content
    )

    # 6. Ensure onSupplierClick is in InvoiceTable props and passed to it
    # Check InvoiceTable prop destructuring
    if 'onSupplierClick' not in content.split('function InvoiceTable')[1].split('{')[1].split('}')[0]:
        content = content.replace(
            'function InvoiceTable({ invoices, suppliers, showDescription = false, onEditClick, onDeleteClick, onReminderToggle, canToggleReminder, onOpenReminderModal }:',
            'function InvoiceTable({ invoices, suppliers, showDescription = false, onEditClick, onDeleteClick, onReminderToggle, canToggleReminder, onOpenReminderModal, onSupplierClick }:'
        )

    # Check InvoiceTable prop type
    if 'onSupplierClick?: (s: Supplier) => void' not in content.split('function InvoiceTable')[1].split('}')[1]:
        content = content.replace(
            'onOpenReminderModal?: (id: number, remaining: number) => void }',
            'onOpenReminderModal?: (id: number, remaining: number) => void, onSupplierClick?: (s: Supplier) => void }'
        )

    with open(app_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Success fixing supplier nav v3")

if __name__ == '__main__':
    main()