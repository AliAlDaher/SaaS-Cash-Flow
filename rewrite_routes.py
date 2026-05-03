import re
path = r'c:\Users\DELL\.gemini\antigravity\brain\1e70835b-96e1-481b-8a66-641bd45c1cc5\cash-flow-system\frontend\src\App.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

routes_block = """        <Routes>
          <Route path="/" element={user?.permissions?.dashboard?.view ? <DashboardTab suppliers={suppliers} invoices={invoices} accounts={accounts} collections={collections} onRefresh={() => fetchData(false)} onToggleReminder={handleToggleReminder} onSupplierClick={handleSupplierClick} /> : <AccessDenied />} />
          <Route path="/reports" element={user?.permissions?.reports?.view ? <ReportsTab invoices={invoices} payments={payments} collections={collections} suppliers={suppliers} accounts={accounts} onSupplierClick={handleSupplierClick} /> : <AccessDenied />} />
          <Route path="/accounts" element={user?.permissions?.accounts?.view ? <AccountsTab accounts={accounts} payments={payments} collections={collections} suppliers={suppliers} onRefresh={refreshAccounts} onDelete={(id) => openDeleteModal(id, "accounts", "Account")} selectedAccount={selectedAccount} setSelectedAccount={setSelectedAccount} /> : <AccessDenied />} />
          <Route path="/collections" element={user?.permissions?.collections?.view ? <CollectionsTab accounts={accounts} collections={collections} onRefresh={async () => { await refreshCollections(); await refreshAccounts(); }} onDelete={(id) => openDeleteModal(id, 'collections', 'Collection')}  /> : <AccessDenied />} />
          <Route path="/suppliers" element={user?.permissions?.suppliers?.view ? <SuppliersTab suppliers={suppliers} invoices={invoices} payments={payments} accounts={accounts} onRefresh={refreshSuppliers} onToggleReminder={handleToggleReminder} setSuppliers={setSuppliers} onDelete={(id) => openDeleteModal(id, "suppliers", "Supplier")} selectedSupplier={selectedSupplier} setSelectedSupplier={setSelectedSupplier} onSupplierClick={handleSupplierClick} /> : <AccessDenied />} />
          <Route path="/invoices" element={user?.permissions?.invoices?.view ? <InvoicesTab suppliers={suppliers} invoices={invoices} onRefresh={refreshInvoices} onToggleReminder={handleToggleReminder} setInvoices={setInvoices} onDelete={(id) => openDeleteModal(id, "invoices", "Invoice")} onSupplierClick={handleSupplierClick} /> : <AccessDenied />} />
          <Route path="/payments" element={user?.permissions?.payments?.view ? <PaymentsTab suppliers={suppliers} payments={payments} accounts={accounts} onRefresh={async () => { await Promise.all([refreshPayments(), refreshInvoices(), refreshAccounts()]); }} onToggleReminder={handleToggleReminder} onDelete={(id) => openDeleteModal(id, "payments", "Payment")} onSupplierClick={handleSupplierClick} /> : <AccessDenied />} />
          <Route path="/users" element={user?.permissions?.users?.view ? <UsersTab /> : <AccessDenied />} />
        </Routes>"""

old_routes = re.search(r'<Routes>.*?</Routes>', content, re.DOTALL).group(0)
content = content.replace(old_routes, routes_block)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
