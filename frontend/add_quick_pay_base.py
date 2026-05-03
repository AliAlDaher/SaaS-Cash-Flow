path = r'c:\\Users\\DELL\\.gemini\\antigravity\\brain\\1e70835b-96e1-481b-8a66-641bd45c1cc5\\cash-flow-system\\frontend\\src\\App.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add QuickPayModal component
quick_pay_modal_code = """
function QuickPayModal({ isOpen, onClose, onConfirm, accounts }: { isOpen: boolean, onClose: () => void, onConfirm: (accountId: number) => void, accounts: Account[] }) {
  const [selectedAccountId, setSelectedAccountId] = useState('')

  useEffect(() => {
    if (isOpen && accounts.length > 0) {
      setSelectedAccountId(accounts[0].id.toString())
    }
  }, [isOpen, accounts])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAccountId) return
    onConfirm(parseInt(selectedAccountId))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Quick Pay</h2>
            <p className="text-sm text-slate-500">Select account to process this payment.</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Source Account</label>
            <select 
              value={selectedAccountId} 
              onChange={e => setSelectedAccountId(e.target.value)} 
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
              required
            >
              <option value="">Select Account</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name} (Balance: {acc.balance} JOD)</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all">Confirm Payment</button>
          </div>
        </form>
      </div>
    </div>
  )
}
"""

content = content.replace("function PaymentReminderModal", quick_pay_modal_code + "\nfunction PaymentReminderModal")

# 2. Add handleQuickPay state and logic
state_and_logic = """
  const [quickPayModal, setQuickPayModal] = useState<{ isOpen: boolean, invoice: Invoice | null }>({ isOpen: false, invoice: null });

  const handleQuickPay = async (accountId: number) => {
    if (!quickPayModal.invoice) return;
    const invoice = quickPayModal.invoice;
    try {
      const res = await apiFetch(`${API_URL}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: invoice.supplierId,
          amount: invoice.reminderAmount || (new Decimal(invoice.amount).minus(invoice.paidAmount).toNumber()),
          paymentDate: format(new Date(), 'yyyy-MM-dd'),
          accountId,
          invoiceId: invoice.id
        })
      });
      if (!res.ok) throw new Error('Failed to process quick pay');
      
      setQuickPayModal({ isOpen: false, invoice: null });
      setSuccessMessage("Payment processed successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
      
      await Promise.all([refreshPayments(), refreshInvoices(), refreshAccounts()]);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const openQuickPay = (invoice: Invoice) => {
    setQuickPayModal({ isOpen: true, invoice });
  };
"""

content = content.replace("  const handleToggleReminder =", state_and_logic + "\n  const handleToggleReminder =")

# 3. Add QuickPayModal call near the end
modal_call = """
      <QuickPayModal 
        isOpen={quickPayModal.isOpen} 
        onClose={() => setQuickPayModal({ isOpen: false, invoice: null })} 
        onConfirm={handleQuickPay}
        accounts={accounts}
      />
"""

content = content.replace("<DeleteConfirmModal", modal_call + "\n      <DeleteConfirmModal")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
