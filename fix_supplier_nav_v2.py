import re

def main():
    app_path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx'
    with open(app_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Properly add selectedSupplier state in MainLayout
    # We'll insert it right after useNavigate()
    if 'const [selectedSupplier, setSelectedSupplier]' not in content:
        content = content.replace(
            'const navigate = useNavigate()',
            'const navigate = useNavigate()\n  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)'
        )

    # 2. Fix handleSupplierClick (it was already added, but let's make sure it's after the state)
    # The previous script added it after navigate. Let's find it and move it if needed.
    # Actually, let's just replace the whole block starting from MainLayout
    
    # Let's fix InvoiceTable first.
    # It seems I used `onSupplierClick` but it wasn't available in the scope or renamed?
    # In InvoiceTable, I added it to props.
    
    # Check InvoiceTable definition
    if 'onSupplierClick?: (s: Supplier) => void' not in content:
        content = re.sub(
            r'function InvoiceTable\(\{ ([^}]+) \}: \{ ([^}]+) \}\) \{',
            r'function InvoiceTable({ \1, onSupplierClick }: { \2, onSupplierClick?: (s: Supplier) => void }) {',
            content
        )

    # Fix the onClick in InvoiceTable
    # I used re.sub previously, let's check what it produced.
    # The error said "Cannot find name 'onSupplierClick'".
    
    # 3. Clean up the messed up states
    # Find duplicate handleSupplierClick and move it after state
    content = re.sub(r'const handleSupplierClick = \(supplier: Supplier\) => \{\s+setSelectedSupplier\(supplier\);\s+navigate\("/suppliers"\);\s+\};', '', content)
    content = content.replace(
        'const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)',
        'const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)\n\n  const handleSupplierClick = (supplier: Supplier) => {\n    setSelectedSupplier(supplier);\n    navigate("/suppliers");\n  };'
    )

    # 4. Fix SuppliersTab props
    # Ensure it's not double-defined or missing
    if 'selectedSupplier={selectedSupplier}' not in content:
         content = content.replace(
            'onDelete={(id) => openDeleteModal(id, "suppliers", "Supplier")}  />',
            'onDelete={(id) => openDeleteModal(id, "suppliers", "Supplier")} selectedSupplier={selectedSupplier} setSelectedSupplier={setSelectedSupplier} />'
         )

    # 5. Fix InvoicesTab props
    if 'onSupplierClick={handleSupplierClick}' not in content:
        content = content.replace(
            'onDelete={(id) => openDeleteModal(id, "invoices", "Invoice")}  />',
            'onDelete={(id) => openDeleteModal(id, "invoices", "Invoice")} onSupplierClick={handleSupplierClick} />'
        )

    # 6. Fix DashboardTab props
    if 'onSupplierClick={handleSupplierClick}' not in content:
        content = content.replace(
            'onRefresh={fetchData} />',
            'onRefresh={fetchData} onSupplierClick={handleSupplierClick} />'
        )

    # 7. Fix ReportsTab props in usage
    if 'onSupplierClick={handleSupplierClick}' not in content:
        content = content.replace(
            'accounts={accounts} />',
            'accounts={accounts} onSupplierClick={handleSupplierClick} />'
        )

    with open(app_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Success fixing supplier nav")

if __name__ == '__main__':
    main()