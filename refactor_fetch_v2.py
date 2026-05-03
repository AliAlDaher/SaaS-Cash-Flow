import os, re

path = r'c:\Users\DELL\.gemini\antigravity\brain\1e70835b-96e1-481b-8a66-641bd45c1cc5\cash-flow-system\frontend\src\App.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# --- 1. MainLayout refactor ---

# Helper functions for granular refresh
new_helpers = """
  const fetchModule = async (module: string, endpoint: string, setter: (data: any) => void) => {
    if (user?.role === 'admin' || user?.permissions?.[module]?.view) {
      try {
        const res = await apiFetch(`${API_URL}${endpoint}`);
        if (!res.ok) throw new Error(`Failed to fetch ${module}`);
        const data = await res.json();
        setter(data);
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const refreshInvoices = () => fetchModule('invoices', '/invoices', setInvoices);
  const refreshSuppliers = () => fetchModule('suppliers', '/suppliers', setSuppliers);
  const refreshPayments = () => fetchModule('payments', '/payments', setPayments);
  const refreshAccounts = () => fetchModule('accounts', '/accounts', setAccounts);
  const refreshCollections = () => fetchModule('collections', '/collections', setCollections);

  const handleToggleReminder = async (id: number, reminder: boolean, amount?: number) => {
    try {
      const res = await apiFetch(`${API_URL}/invoices/${id}/reminder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminder, reminderAmount: amount })
      })
      if (!res.ok) throw new Error('Failed to toggle reminder')
      const updated = await res.json()
      setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, ...updated } : inv))
    } catch (err: any) {
      alert(err.message)
    }
  }
"""

content = content.replace('  const fetchData = async () => {', new_helpers + '\n  const fetchData = async (showLoading = true) => {\n    if (showLoading) setLoading(true);')

# Update fetchData body
old_fetch_body = re.search(r'try \{.*?await Promise\.all\(.*?\);.*?setSuppliers\(suppliersRes\);.*?setInvoices\(invoicesRes\);.*?setPayments\(paymentsRes\);.*?setAccounts\(accountsRes\);.*?setCollections\(collectionsRes\);', content, re.DOTALL)
if old_fetch_body:
    new_fetch_body = """try {
      await Promise.all([
        refreshSuppliers(),
        refreshInvoices(),
        refreshPayments(),
        refreshAccounts(),
        refreshCollections()
      ]);"""
    content = content.replace(old_fetch_body.group(0), new_fetch_body)

# Update confirmDelete
old_confirm_delete = """      setSuccessMessage(`${deleteModal.title} deleted successfully`)
      setDeleteModal({ ...deleteModal, isOpen: false })
      fetchData()
      setTimeout(() => setSuccessMessage(null), 3000)"""

new_confirm_delete = """      setSuccessMessage(`${deleteModal.title} deleted successfully`)
      setDeleteModal({ ...deleteModal, isOpen: false })
      if (deleteModal.type === 'invoices') {
        setInvoices(prev => prev.filter(inv => inv.id !== deleteModal.id));
      } else if (deleteModal.type === 'suppliers') {
        setSuppliers(prev => prev.filter(s => s.id !== deleteModal.id));
      } else if (deleteModal.type === 'payments') {
        setPayments(prev => prev.filter(p => p.id !== deleteModal.id));
        refreshInvoices();
        refreshAccounts();
      } else if (deleteModal.type === 'collections') {
        setCollections(prev => prev.filter(c => c.id !== deleteModal.id));
        refreshAccounts();
      } else if (deleteModal.type === 'accounts') {
        setAccounts(prev => prev.filter(a => a.id !== deleteModal.id));
      } else {
        fetchData(false);
      }
      setTimeout(() => setSuccessMessage(null), 3000)"""

content = content.replace(old_confirm_delete, new_confirm_delete)

# --- 2. Pass props to Tabs ---

# DashboardTab
content = content.replace('<DashboardTab suppliers={suppliers} invoices={invoices} accounts={accounts} collections={collections} onRefresh={fetchData}', '<DashboardTab suppliers={suppliers} invoices={invoices} accounts={accounts} collections={collections} onRefresh={() => fetchData(false)} onToggleReminder={handleToggleReminder}')

# AccountsTab
content = content.replace('<AccountsTab accounts={accounts} payments={payments} collections={collections} suppliers={suppliers} onRefresh={fetchData}', '<AccountsTab accounts={accounts} payments={payments} collections={collections} suppliers={suppliers} onRefresh={refreshAccounts}')

# CollectionsTab
content = content.replace('<CollectionsTab accounts={accounts} collections={collections} onRefresh={fetchData}', '<CollectionsTab accounts={accounts} collections={collections} onRefresh={async () => { await refreshCollections(); await refreshAccounts(); }}')

# SuppliersTab
content = content.replace('<SuppliersTab suppliers={suppliers} invoices={invoices} payments={payments} accounts={accounts} onRefresh={fetchData}', '<SuppliersTab suppliers={suppliers} invoices={invoices} payments={payments} accounts={accounts} onRefresh={refreshSuppliers} onToggleReminder={handleToggleReminder} setSuppliers={setSuppliers}')

# InvoicesTab
content = content.replace('<InvoicesTab suppliers={suppliers} invoices={invoices} onRefresh={fetchData}', '<InvoicesTab suppliers={suppliers} invoices={invoices} onRefresh={refreshInvoices} onToggleReminder={handleToggleReminder} setInvoices={setInvoices}')

# PaymentsTab
content = content.replace('<PaymentsTab suppliers={suppliers} payments={payments} accounts={accounts} onRefresh={fetchData}', '<PaymentsTab suppliers={suppliers} payments={payments} accounts={accounts} onRefresh={async () => { await Promise.all([refreshPayments(), refreshInvoices(), refreshAccounts()]); }}')


# --- 3. Update Component Definitions ---

# DashboardTab
content = re.sub(r'function DashboardTab\(\{ suppliers, invoices, accounts, collections, onRefresh, onSupplierClick \}', 'function DashboardTab({ suppliers, invoices, accounts, collections, onRefresh, onSupplierClick, onToggleReminder }: { suppliers: Supplier[], invoices: Invoice[], accounts: Account[], collections: Collection[], onRefresh: () => void, onSupplierClick?: (s: Supplier) => void, onToggleReminder: (id: number, r: boolean, a?: number) => Promise<void> })', content)
content = re.sub(r'const handleReminderToggle = async \(id: number, reminder: boolean, amount\?: number\) => \{.*?\}', '', content, flags=re.DOTALL)
content = content.replace('handleReminderToggle(', 'onToggleReminder!(')

# SuppliersTab
content = re.sub(r'function SuppliersTab\(.*?\) \{', 'function SuppliersTab({ suppliers, invoices, payments, accounts, onRefresh, onDelete, selectedSupplier, setSelectedSupplier, onSupplierClick, onToggleReminder, setSuppliers }: { suppliers: Supplier[], invoices: Invoice[], payments: Payment[], accounts: Account[], onRefresh: () => void, onDelete: (id: number) => void, selectedSupplier: Supplier | null, setSelectedSupplier: (s: Supplier | null) => void, onSupplierClick?: (s: Supplier) => void, onToggleReminder: (id: number, r: boolean, a?: number) => Promise<void>, setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>> }) {', content)
content = re.sub(r'const handleReminderToggle = async \(id: number, reminder: boolean, amount\?: number\) => \{.*?\}', '', content, flags=re.DOTALL)
content = content.replace('handleReminderToggle(', 'onToggleReminder!(')

# handleAddSupplier response update
old_add_supplier = """      await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSupplierName, priority: newSupplierPriority, paymentTermDays: newSupplierPaymentTerms })
      })
      handleCancelEdit()
      onRefresh()"""
new_add_supplier = """      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSupplierName, priority: newSupplierPriority, paymentTermDays: newSupplierPaymentTerms })
      })
      const data = await res.json()
      if (editSupplierId) {
        setSuppliers(prev => prev.map(s => s.id === editSupplierId ? data : s));
      } else {
        setSuppliers(prev => [data, ...prev]);
      }
      handleCancelEdit()"""
content = content.replace(old_add_supplier, new_add_supplier)

# InvoicesTab
content = re.sub(r'function InvoicesTab\(.*?\) \{', 'function InvoicesTab({ suppliers, invoices, onRefresh, onDelete, onSupplierClick, onToggleReminder, setInvoices }: { suppliers: Supplier[], invoices: Invoice[], onRefresh: () => void, onDelete?: (id: number) => void, onSupplierClick?: (s: Supplier) => void, onToggleReminder: (id: number, r: boolean, a?: number) => Promise<void>, setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>> }) {', content)
content = re.sub(r'const handleReminderToggle = async \(id: number, reminder: boolean, amount\?: number\) => \{.*?\}', '', content, flags=re.DOTALL)
content = content.replace('handleReminderToggle(', 'onToggleReminder!(')

# handleAddInvoice
old_add_invoice = """      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          supplierId: newInvoiceSupplierId, 
          amount: newInvoiceAmount,
          invoiceDate: newInvoiceDate,
          description: newInvoiceDescription
        })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save invoice')
      }
      handleCancelEdit()
      onRefresh()"""
new_add_invoice = """      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          supplierId: newInvoiceSupplierId, 
          amount: newInvoiceAmount,
          invoiceDate: newInvoiceDate,
          description: newInvoiceDescription
        })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save invoice')
      }
      if (editInvoiceId) {
        setInvoices(prev => prev.map(inv => inv.id === editInvoiceId ? data : inv));
      } else {
        setInvoices(prev => [data, ...prev]);
      }
      handleCancelEdit()"""
content = content.replace(old_add_invoice, new_add_invoice)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
