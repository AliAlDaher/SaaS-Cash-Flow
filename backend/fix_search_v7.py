import re

def main():
    path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Fix SuppliersTab (738)
    suppliers_logic = '''  const [searchTerm, setSearchTerm] = useState("")
  const filteredSuppliers = suppliers.filter(s => 
    searchTerm === '' || s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.priority.toString().includes(searchTerm)
  );'''
    # I'll replace the states with this
    content = re.sub(r'const \[searchTerm, setSearchTerm\] = useState\(""\)\s+const \[reminderModal, setReminderModal\] = useState', suppliers_logic + '\n  const [reminderModal, setReminderModal] = useState', content)

    # 2. Fix InvoicesTab (981) - Already has logic but let's be sure
    
    # 3. Fix PaymentsTab (1150)
    # Remove duplicate searchTerm and move logic
    content = re.sub(r'const \[searchTerm, setSearchTerm\] = useState\(""\)\n  const \{ user \} = useAuth\(\);[\s\S]+?const \[formError, setFormError\] = useState<string \| null>\(null\)\n  const filteredPayments = payments\.filter[\s\S]+?return matchesSearch;\n  \}\);\s+const \[searchTerm, setSearchTerm\] = useState\(\'\')', 
        r'const [searchTerm, setSearchTerm] = useState("")\n  const { user } = useAuth();\n  const [paymentSupplierId, setPaymentSupplierId] = useState(\'\')\n  const [paymentAmount, setPaymentAmount] = useState(\'\')\n  const [paymentDate, setPaymentDate] = useState(format(new Date(), \'yyyy-MM-dd\'))\n  const [paymentAccountId, setPaymentAccountId] = useState(\'\')\n  const [editPaymentId, setEditPaymentId] = useState<number | null>(null)\n  const [formError, setFormError] = useState<string | null>(null)\n  const filteredPayments = payments.filter(p => {\n    const sName = suppliers.find(s => s.id === p.supplierId)?.name || \'\';\n    const accName = accounts.find(a => a.id === p.accountId)?.name || \'\';\n    const matchesSearch = searchTerm === \'\' || \n      sName.toLowerCase().includes(searchTerm.toLowerCase()) ||\n      accName.toLowerCase().includes(searchTerm.toLowerCase()) ||\n      p.amount.toString().includes(searchTerm) ||\n      (p.invoiceId?.toString() || \'\').includes(searchTerm);\n    return matchesSearch;\n  });', content)

    # 4. Fix AccountsTab (1482)
    accounts_logic = '''  const [searchTerm, setSearchTerm] = useState("")
  const filteredAccounts = accounts.filter(a => 
    searchTerm === '' || a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.type.toLowerCase().includes(searchTerm.toLowerCase()) || a.balance.toString().includes(searchTerm)
  );'''
    content = re.sub(r'const \[searchTerm, setSearchTerm\] = useState\(""\)\s+const \{ user \} = useAuth\(\);', accounts_logic + '\n  const { user } = useAuth();', content)
    content = content.replace('{accounts.map(acc => (', '{filteredAccounts.map(acc => (')
    content = content.replace('{accounts.length === 0 && (', '{filteredAccounts.length === 0 && (')

    # 5. Fix CollectionsTab (1670)
    collections_logic = '''  const [searchTerm, setSearchTerm] = useState("")
  const filtered = (filter === 'all' ? collections : collections.filter(c => c.status === filter)).filter(c => {
    const accName = accounts.find(a => a.id === c.accountId)?.name || '';
    return searchTerm === '' || 
      (c.note || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      accName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.amount.toString().includes(searchTerm) ||
      c.currency.toLowerCase().includes(searchTerm.toLowerCase());
  });'''
    content = re.sub(r'const \[searchTerm, setSearchTerm\] = useState\(""\)\s+const \{ user \} = useAuth\(\);', collections_logic + '\n  const { user } = useAuth();', content)
    content = content.replace('{collections.filter(c => filter === \'all\' || c.status === filter).map(coll => {', '{filtered.map(coll => {')
    content = content.replace('{collections.length === 0 && (', '{filtered.length === 0 && (')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    main()