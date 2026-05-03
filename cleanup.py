path = r'c:\Users\DELL\.gemini\antigravity\brain\1e70835b-96e1-481b-8a66-641bd45c1cc5\cash-flow-system\frontend\src\App.tsx'

with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    # Simplify Route calls
    if '<DashboardTab' in line:
        line = '          <Route path="/" element={user?.permissions?.dashboard?.view ? <DashboardTab suppliers={suppliers} invoices={invoices} accounts={accounts} collections={collections} onToggleReminder={handleToggleReminder} onSupplierClick={handleSupplierClick} /> : <AccessDenied />} />\n'
    elif '<AccountsTab' in line:
        line = '          <Route path="/accounts" element={user?.permissions?.accounts?.view ? <AccountsTab accounts={accounts} payments={payments} collections={collections} suppliers={suppliers} onRefresh={refreshAccounts} onDelete={(id) => openDeleteModal(id, "accounts", "Account")} selectedAccount={selectedAccount} setSelectedAccount={setSelectedAccount} /> : <AccessDenied />} />\n'
    elif '<CollectionsTab' in line:
        line = '          <Route path="/collections" element={user?.permissions?.collections?.view ? <CollectionsTab accounts={accounts} collections={collections} onRefresh={async () => { await refreshCollections(); await refreshAccounts(); }} onDelete={(id) => openDeleteModal(id, \'collections\', \'Collection\')}  /> : <AccessDenied />} />\n'
    elif '<SuppliersTab' in line:
        line = '          <Route path="/suppliers" element={user?.permissions?.suppliers?.view ? <SuppliersTab suppliers={suppliers} invoices={invoices} payments={payments} accounts={accounts} onRefresh={refreshSuppliers} onToggleReminder={handleToggleReminder} setSuppliers={setSuppliers} onDelete={(id) => openDeleteModal(id, "suppliers", "Supplier")} selectedSupplier={selectedSupplier} setSelectedSupplier={setSelectedSupplier} onSupplierClick={handleSupplierClick} /> : <AccessDenied />} />\n'
    elif '<InvoicesTab' in line:
        line = '          <Route path="/invoices" element={user?.permissions?.invoices?.view ? <InvoicesTab suppliers={suppliers} invoices={invoices} onRefresh={refreshInvoices} onToggleReminder={handleToggleReminder} setInvoices={setInvoices} onDelete={(id) => openDeleteModal(id, "invoices", "Invoice")} onSupplierClick={handleSupplierClick} /> : <AccessDenied />} />\n'
    elif '<PaymentsTab' in line:
        line = '          <Route path="/payments" element={user?.permissions?.payments?.view ? <PaymentsTab suppliers={suppliers} payments={payments} accounts={accounts} onRefresh={async () => { await Promise.all([refreshPayments(), refreshInvoices(), refreshAccounts()]); }} onDelete={(id) => openDeleteModal(id, "payments", "Payment")} onSupplierClick={handleSupplierClick} /> : <AccessDenied />} />\n'
    
    # Fix signatures (remove unused props)
    if 'function DashboardTab({' in line:
        line = 'function DashboardTab({ suppliers, invoices, accounts, collections, onSupplierClick, onToggleReminder }: { suppliers: Supplier[], invoices: Invoice[], accounts: Account[], collections: Collection[], onSupplierClick?: (s: Supplier) => void, onToggleReminder: (id: number, r: boolean, a?: number) => Promise<void> }) {\n'
    if 'function PaymentsTab({' in line:
        line = 'function PaymentsTab({ suppliers, payments, accounts, onRefresh, onDelete, onSupplierClick }: { suppliers: Supplier[], payments: Payment[], accounts: Account[], onRefresh: () => void, onDelete: (id: number) => void, onSupplierClick?: (s: Supplier) => void }) {\n'

    new_lines.append(line)

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
