import os

def main():
    path = r'c:\Users\DELL\.gemini\antigravity\brain\1e70835b-96e1-481b-8a66-641bd45c1cc5\cash-flow-system\frontend\src\App.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split the file into parts based on function definitions
    # This is tricky because of braces.
    # I will just use very specific search/replace for the headers and logic.

    # 1. Clean up duplicate Search states
    # PaymentsTab: remove double state
    content = content.replace('const [searchTerm, setSearchTerm] = useState("")\n  const [searchTerm, setSearchTerm] = useState("")', 'const [searchTerm, setSearchTerm] = useState("")')
    content = content.replace('const [searchTerm, setSearchTerm] = useState(\'\')\n  const [searchTerm, setSearchTerm] = useState(\'\')', 'const [searchTerm, setSearchTerm] = useState(\'\')')

    # 2. Fix SuppliersTab (around line 738)
    if 'function SuppliersTab' in content:
        # Define filteredSuppliers
        if 'const filteredSuppliers =' not in content:
            content = content.replace('const [editSupplierId, setEditSupplierId] = useState<number | null>(null)', 
                                      '''const [editSupplierId, setEditSupplierId] = useState<number | null>(null)
  const filteredSuppliers = suppliers.filter(s => 
    searchTerm === '' || s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.priority.toString().includes(searchTerm)
  );''')

    # 3. Fix PaymentsTab logic move
    if 'function PaymentsTab' in content:
        if 'const filteredPayments = payments.filter' in content:
            # Check if it's inside the function body
            pass
        # The build error said filteredPayments is declared but never read, 
        # and payments/accounts not found. This means it's in a scope where they aren't available.
        # It's likely because I moved it to the wrong place or accidentally put it outside.

    # 4. Fix CollectionsTab logic
    if 'function CollectionsTab' in content:
        if 'const filtered =' not in content:
            content = content.replace('const [isExpected, setIsExpected] = useState(false)', 
                                      '''const [isExpected, setIsExpected] = useState(false)
  const filtered = (filter === 'all' ? collections : collections.filter(c => c.status === filter)).filter(c => {
    const accName = accounts.find(a => a.id === c.accountId)?.name || '';
    return searchTerm === '' || 
      (c.note || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      accName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.amount.toString().includes(searchTerm) ||
      c.currency.toLowerCase().includes(searchTerm.toLowerCase());
  });''')

    # 5. Fix AccountsTab logic
    if 'function AccountsTab' in content:
        if 'const filteredAccounts =' not in content:
            content = content.replace('const { user } = useAuth();', 
                                      '''const { user } = useAuth();
  const filteredAccounts = accounts.filter(a => 
    searchTerm === '' || a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.type.toLowerCase().includes(searchTerm.toLowerCase()) || a.balance.toString().includes(searchTerm)
  );''')

    # 6. Final check on Search inputs
    # Ensure they all use {searchTerm} and {e => setSearchTerm(e.target.value)}

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    main()