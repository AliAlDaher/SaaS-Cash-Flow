import os
import re

def main():
    path = r'c:\Users\DELL\.gemini\antigravity\brain\1e70835b-96e1-481b-8a66-641bd45c1cc5\cash-flow-system\frontend\src\App.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Normalize newlines
    content = content.replace('\r\n', '\n')

    # Remove the misplaced filteredPayments from InvoicesTab
    # It might have slightly different spacing now
    misplaced_pattern = r'\s+const filteredPayments = payments\.filter[\s\S]+?return matchesSearch;\s+\}\);'
    content = re.sub(misplaced_pattern, '', content)

    # Clean up duplicated searchTerm in PaymentsTab
    content = re.sub(r'const \[searchTerm, setSearchTerm\] = useState\(["\']["\']\)\n\s+const \[searchTerm, setSearchTerm\] = useState\(["\']["\']\)', 'const [searchTerm, setSearchTerm] = useState("")', content)

    # Ensure InvoicesTab has searchTerm exactly once
    if 'function InvoicesTab' in content:
        # First, remove all searchTerm states in InvoicesTab if they are duplicated or misplaced
        # Then add it correctly.
        pass

    # I'll use a more surgical approach for each tab.
    
    # --- PaymentsTab ---
    payments_start = 'function PaymentsTab({ suppliers, payments, accounts, onRefresh, onDelete, onSupplierClick }: { suppliers: Supplier[], payments: Payment[], accounts: Account[], onRefresh: () => void, onDelete: (id: number) => void, onSupplierClick?: (s: Supplier) => void }) {'
    payments_body = '''  const [searchTerm, setSearchTerm] = useState("")
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
    
    # Replace top of PaymentsTab
    content = re.sub(r'function PaymentsTab.+?\{[\s\S]+?const handleEditClick', payments_start + '\n' + payments_body + '\n\n  const handleEditClick', content, count=1)

    # --- InvoicesTab ---
    invoices_start = 'function InvoicesTab({ suppliers, invoices, onRefresh, onDelete, onSupplierClick }: { suppliers: Supplier[], invoices: Invoice[], onRefresh: () => void, onDelete?: (id: number) => void, onSupplierClick?: (s: Supplier) => void }) {'
    invoices_body = '''  const [searchTerm, setSearchTerm] = useState("")
  const [reminderModal, setReminderModal] = useState<{isOpen: boolean, id: number, remaining: number}>({isOpen: false, id: 0, remaining: 0})

  const { user } = useAuth();

  const [newInvoiceSupplierId, setNewInvoiceSupplierId] = useState('')
  const [newInvoiceAmount, setNewInvoiceAmount] = useState('')
  const [newInvoiceDate, setNewInvoiceDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [newInvoiceDescription, setNewInvoiceDescription] = useState('')
  const [editInvoiceId, setEditInvoiceId] = useState<number | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [filterSupplierId, setFilterSupplierId] = useState<string>('')

  const filteredInvoices = invoices.filter(inv => {
    const sName = suppliers.find(s => s.id === inv.supplierId)?.name || '';
    const matchesSupplier = filterSupplierId ? inv.supplierId.toString() === filterSupplierId : true;
    const matchesSearch = searchTerm === '' || 
      sName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.amount.toString().includes(searchTerm);
    return matchesSupplier && matchesSearch;
  });'''
    
    content = re.sub(r'function InvoicesTab.+?\{[\s\S]+?const handleEditClick', invoices_start + '\n' + invoices_body + '\n\n  const handleEditClick', content, count=1)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    main()