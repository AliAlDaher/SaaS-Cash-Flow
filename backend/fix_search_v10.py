import os

def main():
    path = r'c:\Users\DELL\.gemini\antigravity\brain\1e70835b-96e1-481b-8a66-641bd45c1cc5\cash-flow-system\frontend\src\App.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # I'll identify the functions by their first line and then use brace counting to find the end.
    
    def get_function_range(start_line_pattern):
        start_idx = -1
        for i, line in enumerate(lines):
            if start_line_pattern in line:
                start_idx = i
                break
        if start_idx == -1: return None
        
        # Count braces
        brace_count = 0
        end_idx = -1
        for i in range(start_idx, len(lines)):
            brace_count += lines[i].count('{')
            brace_count -= lines[i].count('}')
            if brace_count == 0 and '{' in ''.join(lines[start_idx:i+1]):
                end_idx = i
                break
        return (start_idx, end_idx)

    # Re-implement each tab body
    # 1. InvoicesTab
    rng = get_function_range('function InvoicesTab')
    if rng:
        # Re-construct body
        # I'll just fix the specific issues inside it
        pass

    # Actually, I'll just do a global cleanup of the specific broken blocks.
    content = ''.join(lines)
    
    # Remove the misplaced filteredPayments from InvoicesTab
    misplaced_payments = '''  const filteredPayments = payments.filter(p => {
    const sName = suppliers.find(s => s.id === p.supplierId)?.name || '';
    const accName = accounts.find(a => a.id === p.accountId)?.name || '';
    const matchesSearch = searchTerm === '' || 
      sName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      accName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.amount.toString().includes(searchTerm) ||
      (p.invoiceId?.toString() || '').includes(searchTerm);
    return matchesSearch;
  });'''
    content = content.replace(misplaced_payments, '')

    # Ensure InvoicesTab has searchTerm
    content = content.replace('const [formError, setFormError] = useState<string | null>(null)', 
                              'const [formError, setFormError] = useState<string | null>(null)\n  const [searchTerm, setSearchTerm] = useState("")')

    # Ensure InvoicesTab has filteredInvoices (it might be missing or old)
    old_inv_filter = "const filteredInvoices = filterSupplierId ? invoices.filter(inv => inv.supplierId.toString() === filterSupplierId) : invoices;"
    new_inv_filter = '''const filteredInvoices = invoices.filter(inv => {
    const sName = suppliers.find(s => s.id === inv.supplierId)?.name || '';
    const matchesSupplier = filterSupplierId ? inv.supplierId.toString() === filterSupplierId : true;
    const matchesSearch = searchTerm === '' || 
      sName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.amount.toString().includes(searchTerm);
    return matchesSupplier && matchesSearch;
  });'''
    content = content.replace(old_inv_filter, new_inv_filter)

    # 2. Fix PaymentsTab
    # Ensure it has exactly one searchTerm and the filteredPayments logic
    # ... I'll just overwrite the top of PaymentsTab
    payments_start = 'function PaymentsTab({ suppliers, payments, accounts, onRefresh, onDelete, onSupplierClick }: { suppliers: Supplier[], payments: Payment[], accounts: Account[], onRefresh: () => void, onDelete: (id: number) => void, onSupplierClick?: (s: Supplier) => void }) {'
    payments_body_start = '''  const [searchTerm, setSearchTerm] = useState("")
  const { user } = useAuth();

  const [paymentSupplierId, setPaymentSupplierId] = useState('')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [paymentAccountId, setPaymentAccountId] = useState('')
  const [editPaymentId, setEditPaymentId] = useState<number | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const filteredPayments = payments.filter(p => {
    const sName = suppliers.find(s => s.id === p.supplierId)?.name || '';
    const accName = accounts.find(a => a.id === p.accountId)?.name || '';
    const matchesSearch = searchTerm === '' || 
      sName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      accName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.amount.toString().includes(searchTerm) ||
      (p.invoiceId?.toString() || '').includes(searchTerm);
    return matchesSearch;
  });'''
    
    # I'll replace everything from PaymentsTab start to handleEditClick
    content = re.sub(r'function PaymentsTab.+?\{\s+const \[searchTerm[\s\S]+?const handleEditClick', payments_start + '\n' + payments_body_start + '\n\n  const handleEditClick', content)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    main()