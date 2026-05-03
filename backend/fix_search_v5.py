import re

def main():
    path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Move filteredPayments above return in PaymentsTab
    # Move filteredSuppliers above return in SuppliersTab
    # Move filteredAccounts above return in AccountsTab
    
    # 1. Fix PaymentsTab
    payments_logic_old = r'<tbody className="divide-y divide-slate-100">\s+const filteredPayments = payments\.filter[\s\S]+?return matchesSearch;\s+?\}\);'
    # Actually, I'll just find the block and move it.
    
    # Let's find "function PaymentsTab" and insert the logic there.
    # And remove it from the tbody.
    
    match_payments = re.search(r'const filteredPayments = payments\.filter[\s\S]+?return matchesSearch;\s+?\}\);', content)
    if match_payments:
        logic = match_payments.group(0)
        content = content.replace(logic, '')
        content = content.replace('const [formError, setFormError] = useState<string | null>(null)', 'const [formError, setFormError] = useState<string | null>(null)\n  ' + logic)

    # 2. Fix SuppliersTab
    suppliers_logic_old = r'const filteredSuppliers = suppliers\.filter\(s => \n    searchTerm === \'\' \|\| s\.name\.toLowerCase\(\)\.includes\(searchTerm\.toLowerCase\(\)\) \|\| s\.priority\.toString\(\)\.includes\(searchTerm\)\n  \);'
    match_suppliers = re.search(suppliers_logic_old, content)
    if match_suppliers:
        logic = match_suppliers.group(0)
        content = content.replace(logic, '')
        content = content.replace('const [editSupplierId, setEditSupplierId] = useState<number | null>(null)', 'const [editSupplierId, setEditSupplierId] = useState<number | null>(null)\n  ' + logic)

    # 3. Fix AccountsTab
    accounts_logic_old = r'const filteredAccounts = accounts\.filter\(a => \n    searchTerm === \'\' \|\| a\.name\.toLowerCase\(\)\.includes\(searchTerm\.toLowerCase\(\)\) \|\| a\.type\.toLowerCase\(\)\.includes\(searchTerm\.toLowerCase\(\)\) \|\| a\.balance\.toString\(\)\.includes\(searchTerm\)\n  \);'
    match_accounts = re.search(accounts_logic_old, content)
    if match_accounts:
        logic = match_accounts.group(0)
        content = content.replace(logic, '')
        content = content.replace('const [type, setType] = useState(\'Bank\')', 'const [type, setType] = useState(\'Bank\')\n  ' + logic)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    main()