import re
path = r'c:\\Users\\DELL\\.gemini\\antigravity\\brain\\1e70835b-96e1-481b-8a66-641bd45c1cc5\\cash-flow-system\\frontend\\src\\App.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add state and handlers to AccountsTab
# I'll search for the start of the function and insert state after user = useAuth()
state_insertion = """  const { user } = useAuth();
  const [isReconcileOpen, setIsReconcileOpen] = useState(false);

  const handleReconcileConfirm = async (actualBalance: number, note: string) => {
    if (!selectedAccount) return;
    try {
      const res = await apiFetch(`${API_URL}/accounts/${selectedAccount.id}/reconcile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actualBalance, note })
      });
      if (!res.ok) throw new Error('Failed to reconcile account');
      const updatedAccount = await res.json();
      
      // Update global accounts state
      if (setAccounts) {
        setAccounts(prev => prev.map(a => a.id === selectedAccount.id ? { ...a, ...updatedAccount } : a));
      }
      // Update local selection
      setSelectedAccount({ ...selectedAccount, ...updatedAccount });
      setIsReconcileOpen(false);
      onRefresh(); // To ensure everything is in sync
    } catch (err: any) {
      alert(err.message);
    }
  };
"""

content = content.replace("  const { user } = useAuth();", state_insertion)

# 2. Add Reconcile button in the Ledger view header
# Look for <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{selectedAccount.name} - Ledger</h1>
header_replacement = """<h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{selectedAccount.name} - Ledger</h1>
            <p className="text-sm text-slate-500 font-medium">{selectedAccount.type} Account</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right mr-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Current Balance</p>
              <p className="text-xl font-black text-slate-900 leading-none"><FormatCurrency amount={selectedAccount.balance} /></p>
            </div>
            {(user?.role === 'admin' || user?.permissions?.accounts?.edit) && (
              <button 
                onClick={() => setIsReconcileOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-xl font-bold text-sm hover:bg-sky-700 transition-all shadow-lg shadow-sky-600/20"
              >
                <Landmark className="w-4 h-4" />
                Reconcile
              </button>
            )}
          </div>"""

content = content.replace('<h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{selectedAccount.name} - Ledger</h1>', header_replacement)

# 3. Add adjustments to allTransactions
transactions_code = """    const accountAdjustments = (selectedAccount.adjustments || []).map(adj => ({
      id: `adj-${adj.id}`,
      date: new Date(adj.createdAt),
      type: 'Adjustment' as const,
      description: adj.note || 'Balance Adjustment',
      amount: adj.amount,
      actual: adj.actualBalance,
      system: adj.systemBalance
    }));

    const allTransactions = [...accountPayments, ...accountCollections, ...accountAdjustments].sort((a, b) => b.date.getTime() - a.date.getTime());
"""

content = content.replace('const allTransactions = [...accountPayments, ...accountCollections].sort((a, b) => b.date.getTime() - a.date.getTime());', transactions_code)

# 4. Update the transaction table to handle Adjustments
# I'll find the table rendering and update the row for Adjustments
# Actually I need to see the table code first.
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
