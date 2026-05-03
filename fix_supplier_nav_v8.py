import re

def main():
    app_path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx'
    with open(app_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix PaymentsTab (around line 1181)
    # Search for the block inside payments.map
    content = re.sub(
        r'\{payments\.map\(payment => \{.*?const s = suppliers\.find\(sup => sup\.id === invoice\.supplierId\);',
        lambda m: m.group(0).replace('invoice.supplierId', 'payment.supplierId'),
        content,
        flags=re.DOTALL
    )

    # Fix DashboardTab (around line 787)
    # It seems onSupplierClick is missing in DashboardTab props
    if 'function DashboardTab({ suppliers, invoices, accounts, collections, onRefresh, onSupplierClick }' not in content:
        content = re.sub(
            r'function DashboardTab\(\{ suppliers, invoices, accounts, collections, onRefresh \}: \{ suppliers: Supplier\[\], invoices: Invoice\[\], accounts: Account\[\], collections: Collection\[\], onRefresh: \(\) => void \}\) \{',
            'function DashboardTab({ suppliers, invoices, accounts, collections, onRefresh, onSupplierClick }: { suppliers: Supplier[], invoices: Invoice[], accounts: Account[], collections: Collection[], onRefresh: () => void, onSupplierClick?: (s: Supplier) => void }) {',
            content
        )

    with open(app_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Success fixing supplier nav v8")

if __name__ == '__main__':
    main()