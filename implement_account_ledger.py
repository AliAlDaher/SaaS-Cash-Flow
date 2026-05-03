import re

def main():
    app_path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx'
    with open(app_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add selectedAccount state to MainLayout
    content = content.replace(
        'const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)',
        'const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)\n  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)'
    )

    # 2. Update AccountsTab props definition
    content = content.replace(
        'function AccountsTab({ accounts, onRefresh, onDelete }: { accounts: Account[], onRefresh: () => void, onDelete: (id: number) => void }) {',
        'function AccountsTab({ accounts, payments, collections, suppliers, onRefresh, onDelete, selectedAccount, setSelectedAccount }: { accounts: Account[], payments: Payment[], collections: Collection[], suppliers: Supplier[], onRefresh: () => void, onDelete: (id: number) => void, selectedAccount: Account | null, setSelectedAccount: (a: Account | null) => void }) {'
    )

    # 3. Update AccountsTab usage in Routes
    content = content.replace(
        '<AccountsTab accounts={accounts} onRefresh={fetchData} onDelete={(id) => openDeleteModal(id, \'accounts\', \'Account\')}  />',
        '<AccountsTab accounts={accounts} payments={payments} collections={collections} suppliers={suppliers} onRefresh={fetchData} onDelete={(id) => openDeleteModal(id, "accounts", "Account")} selectedAccount={selectedAccount} setSelectedAccount={setSelectedAccount} />'
    )

    # 4. Implement Ledger View in AccountsTab
    # We'll replace the return block of AccountsTab
    
    # First, let's find the start and end of AccountsTab return
    # It's roughly line 1440 to 1500+
    
    # Actually, I'll just use a regex to replace the entire body of AccountsTab
    # But wait, it's safer to just replace the return statement.
    
    # Let's find the return statement in AccountsTab
    
    ledger_logic = '''
  if (selectedAccount) {
    const accountPayments = payments.filter(p => p.accountId === selectedAccount.id).map(p => ({
      id: `pay-${p.id}`,
      date: new Date(p.paymentDate),
      type: 'Outgoing' as const,
      description: suppliers.find(s => s.id === p.supplierId)?.name || `Supplier ID: ${p.supplierId}`,
      amount: p.amount
    }));

    const accountCollections = collections.filter(c => c.accountId === selectedAccount.id).map(c => ({
      id: `coll-${c.id}`,
      date: new Date(c.receivedDate || c.createdAt),
      type: 'Incoming' as const,
      description: c.note || 'Collection',
      amount: c.amountInBase
    }));

    const allTransactions = [...accountPayments, ...accountCollections].sort((a, b) => b.date.getTime() - a.date.getTime());

    return (
      <div className="space-y-8 animate-in fade-in duration-200">
        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedAccount(null)} className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
             <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{selectedAccount.name} - Ledger</h1>
             <p className="text-slate-500 text-sm">Account Type: {selectedAccount.type}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
           <StatCard title="Current Balance" value={<FormatCurrency amount={selectedAccount.balance}/>} icon={<Wallet className="w-5 h-5 text-sky-500"/>} />
           <StatCard title="Total Inflow" value={<FormatCurrency amount={accountCollections.reduce((sum, t) => sum + t.amount, 0)}/>} icon={<TrendingUp className="w-5 h-5 text-emerald-500"/>} valueColor="text-emerald-600" />
           <StatCard title="Total Outflow" value={<FormatCurrency amount={accountPayments.reduce((sum, t) => sum + t.amount, 0)}/>} icon={<CreditCard className="w-5 h-5 text-rose-500"/>} valueColor="text-rose-600" />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">Transaction History</h2>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allTransactions.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{format(t.date, 'MMM dd, yyyy')}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      t.type === 'Incoming' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                        : 'bg-rose-50 text-rose-700 border-rose-100'
                    }`}>
                      {t.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-medium">{t.description}</td>
                  <td className={`px-6 py-4 text-right font-bold ${
                    t.type === 'Incoming' ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {t.type === 'Incoming' ? '+' : '-'}<FormatCurrency amount={t.amount} />
                  </td>
                </tr>
              ))}
              {allTransactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No transactions found for this account</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
'''
    
    # Insert ledger logic after the initial hooks/states in AccountsTab
    content = content.replace(
        '    } catch (err) {\n      console.error(err)\n    }\n  }',
        '    } catch (err) {\n      console.error(err)\n    }\n  }' + ledger_logic
    )

    # 5. Make Account Name clickable in the table
    content = content.replace(
        '<Landmark className="w-4 h-4 text-slate-400" /> {acc.name}',
        '<button onClick={() => setSelectedAccount(acc)} className="flex items-center gap-2 hover:text-sky-600 hover:underline transition-colors text-left">\n                      <Landmark className="w-4 h-4 text-slate-400" /> {acc.name}\n                    </button>'
    )

    # 6. Add "View Ledger" button in Actions
    content = content.replace(
        '{(user?.role === \'admin\' || user?.permissions?.accounts?.delete) && <button onClick={() => onDelete(acc.id)} className="text-rose-600 hover:text-rose-900 font-medium">Delete</button>}',
        '<button onClick={() => setSelectedAccount(acc)} className="text-sky-600 hover:text-sky-900 font-medium mr-4">View Ledger</button>\n                    {(user?.role === "admin" || user?.permissions?.accounts?.delete) && <button onClick={() => onDelete(acc.id)} className="text-rose-600 hover:text-rose-900 font-medium">Delete</button>}'
    )

    # 7. Clear selectedAccount when clicking "Accounts" in nav
    content = content.replace(
        'onClick={() => { if(tab.name === "Suppliers") setSelectedSupplier(null); }}',
        'onClick={() => { if(tab.name === "Suppliers") setSelectedSupplier(null); if(tab.name === "Accounts") setSelectedAccount(null); }}'
    )

    with open(app_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Success implementing account ledger")

if __name__ == '__main__':
    main()