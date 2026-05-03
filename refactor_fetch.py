import os, re

path = r'c:\Users\DELL\.gemini\antigravity\brain\1e70835b-96e1-481b-8a66-641bd45c1cc5\cash-flow-system\frontend\src\App.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add handleToggleReminder to MainLayout and update confirmDelete
# We'll insert it before fetchData

new_handlers = """
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

content = content.replace('  const fetchData = async () => {', new_handlers + '\n  const fetchData = async (showLoading = true) => {\n    if (showLoading) setLoading(true);')

# Update fetchData to use individual refreshers
old_fetch_body = r'const \[suppliersRes, invoicesRes, paymentsRes, accountsRes, collectionsRes\] = await Promise\.all\(\[.*?\]\);.*?setSuppliers\(suppliersRes\);.*?setInvoices\(invoicesRes\);.*?setPayments\(paymentsRes\);.*?setAccounts\(accountsRes\);.*?setCollections\(collectionsRes\);'
new_fetch_body = """await Promise.all([
        refreshSuppliers(),
        refreshInvoices(),
        refreshPayments(),
        refreshAccounts(),
        refreshCollections()
      ]);"""
content = re.sub(old_fetch_body, new_fetch_body, content, flags=re.DOTALL)

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

# 2. Update Tab components signatures to include specific handlers if needed
# Actually, I'll just pass handleToggleReminder where onRefresh was passed or alongside it.

content = content.replace('onRefresh={fetchData}', 'onRefresh={fetchData} onToggleReminder={handleToggleReminder}')

# Now update the components themselves to use the new handlers.

# DashboardTab
content = re.sub(r'const handleReminderToggle = async \(id: number, reminder: boolean, amount\?: number\) => \{.*?\}', '', content, flags=re.DOTALL)
content = content.replace('function DashboardTab({ suppliers, invoices, accounts, collections, onRefresh, onSupplierClick }', 'function DashboardTab({ suppliers, invoices, accounts, collections, onRefresh, onSupplierClick, onToggleReminder }')
content = content.replace('handleReminderToggle(', 'onToggleReminder!(')

# SuppliersTab
content = re.sub(r'function SuppliersTab\(.*?\) \{', 'function SuppliersTab({ suppliers, invoices, payments, accounts, onRefresh, onDelete, selectedSupplier, setSelectedSupplier, onSupplierClick, onToggleReminder }: { suppliers: Supplier[], invoices: Invoice[], payments: Payment[], accounts: Account[], onRefresh: () => void, onDelete: (id: number) => void, selectedSupplier: Supplier | null, setSelectedSupplier: (s: Supplier | null) => void, onSupplierClick?: (s: Supplier) => void, onToggleReminder?: (id: number, r: boolean, a?: number) => void }) {', content)
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
        // We need setSuppliers here. Wait, I should pass it or just use onRefresh.
        // Actually, if I want efficiency, I should pass setSuppliers or a specific update function.
        // But for now, let's just use onRefresh but make it granular.
        onRefresh(); // This is still fetchData. I should change onRefresh to a more specific one.
      } else {
        onRefresh();
      }
      handleCancelEdit()"""
# Wait, I realized I should pass setSuppliers etc. or specialized update functions.
# Let's redefine onRefresh to be optional or multiple.

# Actually, I'll pass a 'setSuppliers' etc. to the tabs.
content = content.replace('onRefresh={fetchData}', 'onRefresh={() => fetchData(false)} setSuppliers={setSuppliers} setInvoices={setInvoices} setPayments={setPayments} setAccounts={setAccounts} setCollections={setCollections}')

# Update Tab signatures again
content = content.replace('onRefresh: () => void', 'onRefresh: () => void, setSuppliers?: React.Dispatch<React.SetStateAction<Supplier[]>>, setInvoices?: React.Dispatch<React.SetStateAction<Invoice[]>>, setPayments?: React.Dispatch<React.SetStateAction<Payment[]>>, setAccounts?: React.Dispatch<React.SetStateAction<Account[]>>, setCollections?: React.Dispatch<React.SetStateAction<Collection[]>>')

# Now handleAddSupplier with local state update
new_add_supplier_better = """      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSupplierName, priority: newSupplierPriority, paymentTermDays: newSupplierPaymentTerms })
      })
      const data = await res.json()
      if (setSuppliers) {
        if (editSupplierId) {
          setSuppliers(prev => prev.map(s => s.id === editSupplierId ? data : s));
        } else {
          setSuppliers(prev => [data, ...prev]);
        }
      } else {
        onRefresh();
      }
      handleCancelEdit()"""
content = content.replace(old_add_supplier, new_add_supplier_better)

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
      if (setInvoices) {
        if (editInvoiceId) {
          setInvoices(prev => prev.map(inv => inv.id === editInvoiceId ? data : inv));
        } else {
          setInvoices(prev => [data, ...prev]);
        }
      } else {
        onRefresh();
      }
      handleCancelEdit()"""
content = content.replace(old_add_invoice, new_add_invoice)

# handleAddPayment (Special: needs payments, invoices, accounts)
content = content.replace('onRefresh()', 'onRefresh()', 1) # This is inside handleAddPayment

# Let's fix handleAddPayment specifically
# It's inside PaymentsTab
old_add_payment_refresh = """      handleCancelEdit()
      onRefresh()"""
new_add_payment_refresh = """      handleCancelEdit()
      // Needs multiple refreshes
      onRefresh(); // Which is now fetchData(false)
"""
# Actually, if I pass refreshInvoices etc. as props, it's better.
# Let's just keep it simple: onRefresh is fetchData(false) which is already much better.

# CollectionsTab handleAddCollection
old_add_coll = """      handleCancelEdit()
      onRefresh()"""
new_add_coll = """      handleCancelEdit()
      onRefresh()""" # Will use fetchData(false)

# handleMarkReceived
old_mark_received = """      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || errorData.details || 'Failed to update status');
      }
      onRefresh();"""
new_mark_received = """      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.details || 'Failed to update status');
      }
      if (setCollections && setAccounts) {
        setCollections(prev => prev.map(c => c.id === id ? data.collection : c));
        setAccounts(prev => prev.map(a => a.id === data.collection.accountId ? data.account : a));
      } else {
        onRefresh();
      }"""
# Wait, I need to check if backend returns {collection, account}.
# I'll check collections.ts PATCH /status

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
