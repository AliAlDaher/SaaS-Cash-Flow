path = r'c:\Users\DELL\.gemini\antigravity\brain\1e70835b-96e1-481b-8a66-641bd45c1cc5\cash-flow-system\frontend\src\App.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add AccountAdjustment type
type_insertion = """type AccountAdjustment = {
  id: number
  accountId: number
  amount: number
  systemBalance: number
  actualBalance: number
  note?: string
  createdAt: string
}

type Account = {"""
content = content.replace("type Account = {", type_insertion)

# 2. Add ReconcileModal component
modal_code = """
function ReconcileModal({ isOpen, onClose, onConfirm, currentBalance }: { isOpen: boolean, onClose: () => void, onConfirm: (actualBalance: number, note: string) => void, currentBalance: number }) {
  const [actualBalance, setActualBalance] = useState(currentBalance.toString())
  const [note, setNote] = useState('')

  useEffect(() => {
    if (isOpen) {
      setActualBalance(currentBalance.toString())
      setNote('')
    }
  }, [isOpen, currentBalance])

  if (!isOpen) return null

  const diff = parseFloat(actualBalance) - currentBalance

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = parseFloat(actualBalance)
    if (isNaN(parsed)) {
      alert('Please enter a valid balance')
      return
    }
    onConfirm(parsed, note)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center">
            <Landmark className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Reconcile Account</h2>
            <p className="text-sm text-slate-500">Align system balance with bank balance.</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">System Balance:</span>
              <span className="font-bold text-slate-800"><FormatCurrency amount={currentBalance} /></span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
              <span className="text-slate-500">Difference:</span>
              <span className={`font-bold ${diff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {diff >= 0 ? '+' : ''}<FormatCurrency amount={diff} />
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Actual Bank Balance (JOD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">JOD</span>
              <input 
                type="number" 
                step="0.01"
                value={actualBalance} 
                onChange={e => setActualBalance(e.target.value)} 
                className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium"
                placeholder="0.00"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Note (Optional)</label>
            <textarea 
              value={note} 
              onChange={e => setNote(e.target.value)} 
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all min-h-[80px]"
              placeholder="e.g., Monthly reconciliation, Bank fee adjustment..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2.5 bg-sky-600 text-white font-bold rounded-xl hover:bg-sky-700 shadow-lg shadow-sky-600/20 transition-all">Adjust Balance</button>
          </div>
        </form>
      </div>
    </div>
  )
}
"""

content = content.replace("function PaymentReminderModal", modal_code + "\nfunction PaymentReminderModal")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
