import React, { useEffect, useState } from 'react'
import { Decimal } from 'decimal.js'
import { Activity, FileText, CheckCircle, AlertCircle, Clock, CreditCard, AlertTriangle, Landmark, TrendingUp, Wallet, ArrowLeft, Search } from 'lucide-react'
import { format, startOfDay, addDays, isBefore, isEqual } from 'date-fns'
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom'
import Login from './Login'
import { ReportsTab } from './ReportsTab'

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800">
          <h2 className="text-xl font-bold mb-2">Something went wrong.</h2>
          <pre className="text-xs overflow-auto">{this.state.error?.toString()}</pre>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-lg"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}


// Types
type Supplier = {
  id: number
  name: string
  priority: number
  paymentTermDays: number
  createdAt: string
}

type Invoice = {
  id: number
  supplierId: number
  amount: number
  paidAmount: number
  invoiceDate: string
  dueDate: string
  description?: string
  reminder?: boolean
  reminderAmount?: number | null
    isCheque?: boolean
    chequeStatus?: string
  reminderBaseline?: number
  createdAt: string
  supplier?: Supplier
}

type Payment = {
  id: number
  supplierId: number
  accountId: number
  invoiceId?: number | null
  amount: number
  paymentDate: string
  createdAt: string
  account?: Account
  invoice?: Invoice
}

type AccountAdjustment = {
  id: number
  accountId: number
  amount: number
  systemBalance: number
  actualBalance: number
  note?: string
  createdAt: string
}

type Account = {
  id: number
  name: string
  type: string
  balance: number
  createdAt: string
  adjustments?: AccountAdjustment[]
}


type Expense = {
  id: number
  category: string
  amount: number
  accountId: number
  account?: Account
  date: string
  note?: string
  createdAt: string
}

type Cheque = {
  id: number
  amount: number
  chequeDate: string
  status: 'Pending' | 'Cleared' | 'Bounced'
  accountId: number
  supplierId?: number | null
  invoiceId?: number | null
  account?: Account
  supplier?: Supplier
  invoice?: Invoice
  createdAt: string
}

type Collection = {
  id: number
  amount: number
  currency: string
  exchangeRate: number
  amountInBase: number
  accountId: number
  account?: Account
  note: string
  expectedDate?: string
  receivedDate: string
  status?: string
  createdAt: string
}


function useAuth() {
  const rawUser = localStorage.getItem('user');
  let user = null;
  if (rawUser) {
    try { user = JSON.parse(rawUser); } catch(e) {}
  }

  const token = localStorage.getItem('token');

  return {
    user,
    token,
    isAuthenticated: !!token
  };
}

function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <AlertTriangle className="w-16 h-16 text-rose-500 mb-4" />
      <h2 className="text-2xl font-bold text-slate-800">Access Denied</h2>
      <p className="text-slate-600 mt-2">You do not have permission to view this page.</p>
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }
  return <>{children}</>;
}



const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const apiFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers = new Headers(options.headers || {});
  if (token) headers.set('Authorization', 'Bearer ' + token);
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    localStorage.clear();
    window.location.href = '/login';
  }
  if (!res.ok) {
    try {
      const data = await res.json();
      const error: any = new Error(data.error || 'Request failed');
      error.details = data.details;
      throw error;
    } catch(e: any) { if (e.message) throw e; throw new Error('Server error: ' + res.status); }
  }
  return res;
};




type ErrorListener = (msg: string | null) => void;
let globalErrorListener: ErrorListener | null = null;
export const setGlobalErrorListener = (listener: ErrorListener | null) => {
  globalErrorListener = listener;
};
export const showError = (msg: string) => {
  if (globalErrorListener) {
    globalErrorListener(msg);
  } else {
    console.error(msg);
  }
};

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="*" element={<ProtectedRoute><MainLayout /></ProtectedRoute>} />
        </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  )
}

function MainLayout() {
  const { user } = useAuth();


  const location = useLocation()
  const navigate = useNavigate()
  

  

  
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [cheques, setCheques] = useState<Cheque[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)

  const handleSupplierClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    navigate("/suppliers");
  };


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
  const refreshCheques = () => fetchModule('cheques', '/cheques', setCheques);
  const refreshExpenses = () => fetchModule('expenses', '/expenses', setExpenses);


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
      showError(err.message);
    }
  };

  const openQuickPay = (invoice: Invoice) => {
    setQuickPayModal({ isOpen: true, invoice });
  };

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
      showError(err.message)
    }
  }

  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      setLoading(true);


      await Promise.all([
        refreshSuppliers(),
        refreshInvoices(),
        refreshPayments(),
        refreshAccounts(),
        refreshCollections(),
        refreshCheques(),
        refreshExpenses()
      ]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, id: number | null, type: string, title: string }>({
    isOpen: false,
    id: null,
    type: '',
    title: ''
  })
  const [isDeleting, setIsDeleting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setGlobalErrorListener((msg) => {
      setErrorMessage(msg);
      if (msg) setTimeout(() => setErrorMessage(null), 4000);
    });
    return () => setGlobalErrorListener(null);
  }, []);
  

  const openDeleteModal = (id: number, type: string, title: string) => {
    setDeleteModal({ isOpen: true, id, type, title })
  }

  const confirmDelete = async () => {
    if (!deleteModal.id) return
    setIsDeleting(true)
    try {
      const res = await apiFetch(`${API_URL}/${deleteModal.type}/${deleteModal.id}`, {
        method: 'DELETE'
      })
      
      let data: any = {}
      const contentType = res.headers.get('content-type')
      if (res.status !== 204 && contentType && contentType.includes('application/json')) {
        data = await res.json()
      } else if (res.status !== 204) {
        const text = await res.text()
        if (!res.ok) {
          throw new Error(text.substring(0, 100) || `Server returned ${res.status}`)
        }
      }

      if (!res.ok) {
        throw new Error(data.error || `Failed to delete ${deleteModal.title}`)
      }
      setSuccessMessage(`${deleteModal.title} deleted successfully`)
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
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      showError(err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-sky-500 rounded-full mb-4"></div>
          <p className="text-slate-500 text-lg">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Error</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-sky-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-sky-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

    const tabs = [];
  if (user?.role === "admin" || user?.permissions?.dashboard?.view) tabs.push({ name: 'Dashboard', path: '/' });
  if (user?.role === "admin" || user?.permissions?.reports?.view) tabs.push({ name: 'Reports', path: '/reports' });
  if (user?.role === "admin" || user?.permissions?.accounts?.view) tabs.push({ name: 'Accounts', path: '/accounts' });
  if (user?.role === "admin" || user?.permissions?.collections?.view) tabs.push({ name: 'Collections', path: '/collections' });
  if (user?.role === "admin" || user?.permissions?.suppliers?.view) tabs.push({ name: 'Suppliers', path: '/suppliers' });
  if (user?.role === "admin" || user?.permissions?.invoices?.view) tabs.push({ name: 'Invoices', path: '/invoices' });
  if (user?.role === "admin" || user?.permissions?.payments?.view) tabs.push({ name: 'Payments', path: '/payments' });
  if (user?.role === "admin" || user?.permissions?.cheques?.view) tabs.push({ name: 'Cheques', path: '/cheques' });
  if (user?.role === "admin" || user?.permissions?.expenses?.view) tabs.push({ name: 'Expenses', path: '/expenses' });
  if (user?.role === "admin" || user?.permissions?.users?.view) tabs.push({ name: 'Users', path: '/users' });

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 md:py-0 md:h-16 gap-3 md:gap-0">
            {/* Logo and Mobile Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Activity className="text-sky-600 w-8 h-8 mr-3" />
                <span className="text-xl font-bold text-slate-800 tracking-tight">SLCash</span>
              </div>
              
              {/* Logout Button (mobile layout) */}
              <button
                onClick={() => {
                  localStorage.clear();
                  navigate('/login');
                }}
                className="md:hidden inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-sky-600 hover:bg-sky-700 transition-colors"
              >
                Logout
              </button>
            </div>
            
            {/* Scrollable Tabs Wrapper */}
            <div className="flex items-center overflow-x-auto no-scrollbar scroll-smooth -mx-4 px-4 md:mx-0 md:px-0">
              <div className="flex space-x-6 md:space-x-8 whitespace-nowrap pb-1 md:pb-0">
                {tabs.map((tab) => {
                  const isActive = location.pathname === tab.path
                  return (
                    <Link
                      key={tab.name}
                      to={tab.path}
                      onClick={() => { if(tab.name === "Suppliers") setSelectedSupplier(null); if(tab.name === "Accounts") setSelectedAccount(null); }}
                      className={`inline-flex items-center pb-2 md:py-4 border-b-2 text-sm font-medium transition-all ${
                        isActive
                          ? 'border-sky-500 text-sky-600 font-semibold'
                          : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                      }`}
                    >
                      {tab.name}
                    </Link>
                  )
                })}
              </div>
              
              {/* Logout Button (desktop layout) */}
              <button
                onClick={() => {
                  localStorage.clear();
                  navigate('/login');
                }}
                className="hidden md:inline-flex items-center px-3.5 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-sky-600 hover:bg-sky-700 transition-colors ml-6 self-center"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 mt-8">
        <Routes>
          <Route path="/expenses" element={(user?.role === "admin" || user?.permissions?.expenses?.view) ? <ExpensesTab accounts={accounts} expenses={expenses} onRefresh={async () => { await refreshExpenses(); await refreshAccounts(); }} onDelete={(id) => openDeleteModal(id, 'expenses', 'Expense')} /> : <AccessDenied />} />
          <Route path="/" element={(user?.role === "admin" || user?.permissions?.dashboard?.view) ? <DashboardTab suppliers={suppliers} invoices={invoices} accounts={accounts} collections={collections} cheques={cheques} expenses={expenses} onToggleReminder={handleToggleReminder} onSupplierClick={handleSupplierClick} onQuickPay={openQuickPay} /> : <AccessDenied />} />
          <Route path="/reports" element={(user?.role === "admin" || user?.permissions?.reports?.view) ? <ReportsTab invoices={invoices} payments={payments} collections={collections} suppliers={suppliers} accounts={accounts} onSupplierClick={handleSupplierClick} onQuickPay={openQuickPay} /> : <AccessDenied />} />
          <Route path="/accounts" element={(user?.role === "admin" || user?.permissions?.accounts?.view) ? <AccountsTab accounts={accounts} payments={payments} collections={collections} suppliers={suppliers} expenses={expenses} onRefresh={refreshAccounts} onDelete={(id) => openDeleteModal(id, "accounts", "Account")} openDeleteModal={openDeleteModal} selectedAccount={selectedAccount} setSelectedAccount={setSelectedAccount} setAccounts={setAccounts} /> : <AccessDenied />} />
          <Route path="/collections" element={(user?.role === "admin" || user?.permissions?.collections?.view) ? <CollectionsTab accounts={accounts} collections={collections} onRefresh={async () => { await refreshCollections(),
        refreshCheques(),
        refreshExpenses(); await refreshAccounts(); }} onDelete={(id) => openDeleteModal(id, 'collections', 'Collection')}  /> : <AccessDenied />} />
          <Route path="/suppliers" element={(user?.role === "admin" || user?.permissions?.suppliers?.view) ? <SuppliersTab suppliers={suppliers} invoices={invoices} payments={payments} accounts={accounts} onRefresh={refreshSuppliers} onToggleReminder={handleToggleReminder} setSuppliers={setSuppliers} onDelete={(id) => openDeleteModal(id, "suppliers", "Supplier")} selectedSupplier={selectedSupplier} setSelectedSupplier={setSelectedSupplier} onSupplierClick={handleSupplierClick} onQuickPay={openQuickPay} /> : <AccessDenied />} />
          <Route path="/invoices" element={(user?.role === "admin" || user?.permissions?.invoices?.view) ? <InvoicesTab suppliers={suppliers} invoices={invoices} onRefresh={refreshInvoices} onToggleReminder={handleToggleReminder} setInvoices={setInvoices} onDelete={(id) => openDeleteModal(id, "invoices", "Invoice")} onSupplierClick={handleSupplierClick} onQuickPay={openQuickPay} /> : <AccessDenied />} />
          <Route path="/payments" element={(user?.role === "admin" || user?.permissions?.payments?.view) ? <PaymentsTab suppliers={suppliers} payments={payments} accounts={accounts} invoices={invoices} onRefresh={async () => { await Promise.all([refreshPayments(), refreshInvoices(), refreshAccounts()]); }} onDelete={(id) => openDeleteModal(id, "payments", "Payment")} onSupplierClick={handleSupplierClick} /> : <AccessDenied />} />
          <Route path="/cheques" element={(user?.role === "admin" || user?.permissions?.cheques?.view) ? <ChequesTab suppliers={suppliers} accounts={accounts} cheques={cheques} onRefresh={async () => { await refreshCheques(),
        refreshExpenses(); await refreshAccounts(); }} onDelete={(id) => openDeleteModal(id, 'cheques', 'Cheque')} /> : <AccessDenied />} />
          <Route path="/users" element={(user?.role === "admin" || user?.permissions?.users?.view) ? <UsersTab /> : <AccessDenied />} />
          </Routes>
      </main>

      
      <QuickPayModal 
        isOpen={quickPayModal.isOpen} 
        onClose={() => setQuickPayModal({ isOpen: false, invoice: null })} 
        onConfirm={handleQuickPay}
        accounts={accounts}
      />

      <DeleteConfirmModal 
        isOpen={deleteModal.isOpen} 
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })} 
        onConfirm={confirmDelete}
        title={deleteModal.title}
        loading={isDeleting}
      />

      {successMessage && (
        <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-right-8 duration-300">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700">
            <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="font-medium">{successMessage}</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="fixed bottom-8 left-8 z-50 animate-in slide-in-from-left-8 duration-300">
          <div className="bg-rose-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-rose-700">
            <div className="w-8 h-8 bg-rose-500/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <p className="font-medium">{errorMessage}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ title, value, icon, valueColor }: { title: string, value: React.ReactNode, icon: React.ReactNode, valueColor?: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between">
      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
        <p className={`text-2xl font-bold ${valueColor || 'text-slate-800'}`}>{value}</p>
      </div>
      <div className="bg-slate-50 p-3 rounded-xl">
        {icon}
      </div>
    </div>
  )
}

function FormatCurrency({ amount }: { amount: number | string | any }) {
  return (
    <span>
      {(Number(amount) || 0).toLocaleString(undefined, {minimumFractionDigits: 2})} <span className="text-[0.65em] opacity-60 ml-0.5">JOD</span>
    </span>
  )
}





function EditAdjustmentModal({ isOpen, onClose, onConfirm, initialNote }: { isOpen: boolean, onClose: () => void, onConfirm: (note: string) => void, initialNote: string }) {
  const [note, setNote] = useState(initialNote);

  useEffect(() => {
    if (isOpen) setNote(initialNote);
  }, [initialNote, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 transition-all">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-8">
          <h3 className="text-2xl font-bold text-slate-900 mb-6">Edit Adjustment Note</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Note</label>
              <textarea 
                value={note} 
                onChange={e => setNote(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-sky-500 min-h-[100px]"
                placeholder="Describe the adjustment..."
              />
            </div>
          </div>
        </div>
        <div className="bg-slate-50/50 px-8 py-6 flex items-center justify-end gap-3 border-t border-slate-100">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition-all">Cancel</button>
          <button onClick={() => onConfirm(note)} className="px-6 py-2.5 text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-all shadow-lg shadow-sky-200">Save Changes</button>
        </div>
      </div>
    </div>
  );
}

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
      showError('Please enter a valid balance')
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

function PaymentReminderModal({ isOpen, onClose, onConfirm, remainingAmount }: { isOpen: boolean, onClose: () => void, onConfirm: (amount: number) => void, remainingAmount: number }) {
  const [amount, setAmount] = useState(remainingAmount.toString())

  useEffect(() => {
    if (isOpen) setAmount(remainingAmount.toString())
  }, [isOpen, remainingAmount])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = parseFloat(amount)
    if (isNaN(parsed) || parsed <= 0 || parsed > remainingAmount) {
      showError('Please enter a valid amount (up to ' + remainingAmount + ')')
      return
    }
    onConfirm(parsed)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Payment Selection</h2>
            <p className="text-sm text-slate-500">Set the amount to pay for this invoice.</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Amount to Pay (JOD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">JOD</span>
              <input 
                type="number" 
                step="0.01"
                max={remainingAmount}
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
                className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                required
                autoFocus
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">Maximum allowed: {remainingAmount.toLocaleString()} JOD</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200">Confirm Payment</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DashboardTab({ suppliers, invoices, accounts, collections, cheques, expenses, onSupplierClick, onToggleReminder, onQuickPay }: { suppliers: Supplier[], invoices: Invoice[], accounts: Account[], collections: Collection[], cheques: Cheque[], expenses: Expense[], onSupplierClick?: (s: Supplier) => void, onToggleReminder: (id: number, r: boolean, a?: number) => Promise<void>, onQuickPay?: (inv: Invoice) => void }) {
  const { user } = useAuth();


  const [showSelectedOnly, setShowSelectedOnly] = useState(false);

  const [reminderModal, setReminderModal] = useState<{isOpen: boolean, id: number, remaining: number}>({isOpen: false, id: 0, remaining: 0})


  const totalAmount = invoices.reduce((sum, inv) => sum.plus(new Decimal(inv.amount)), new Decimal(0)).toNumber()
  const totalPaid = invoices.reduce((sum, inv) => sum.plus(new Decimal(inv.paidAmount)), new Decimal(0)).toNumber()
  const totalRemaining = new Decimal(totalAmount).minus(totalPaid).toNumber()
  const totalCash = accounts.reduce((sum, acc) => sum.plus(new Decimal(acc.balance)), new Decimal(0)).toNumber()
  const totalExpected = collections.filter(c => c.status === 'expected').reduce((sum, c) => sum.plus(new Decimal(c.amountInBase)), new Decimal(0)).toNumber()

  // --- Upcoming & Overdue Payments Logic ---
  const today = startOfDay(new Date())
  const fortyFiveDaysFromNow = addDays(today, 45)
  

  // Total Due (Today)
  const totalDueToday = invoices.reduce((sum, inv) => {
    const due = startOfDay(new Date(inv.dueDate))
    // due <= today
    if (!isBefore(today, due)) {
      const remaining = new Decimal(inv.amount).minus(inv.paidAmount);
      return sum.plus(remaining.greaterThan(0) ? remaining : 0);
    }
    return sum
  }, new Decimal(0)).toNumber()

  const unpaidInvoices = invoices.filter(inv => new Decimal(inv.amount).greaterThan(inv.paidAmount))
  const scopeInvoices = unpaidInvoices.filter(inv => {
    const due = new Date(inv.dueDate)
    return isBefore(due, today) || !isBefore(fortyFiveDaysFromNow, due)
  })

  const supplierGroups: Record<number, Invoice[]> = {}
  scopeInvoices.forEach(inv => {
    if (!supplierGroups[inv.supplierId]) {
      supplierGroups[inv.supplierId] = []
    }
    supplierGroups[inv.supplierId].push(inv)
  })

  type DisplayRow = {
    id: string
    supplierName: string
    dueDate: Date
    totalAmount: number
    remainingAmount: number
    isGrouped: boolean
    statusClass: string
    statusLabel: string
    textColor: string
    isPartial?: boolean
    invoiceId?: number
    reminder?: boolean
    reminderAmount?: number | null
    isCheque?: boolean
    chequeStatus?: string
  reminderBaseline?: number
  isPaid?: boolean
  }

  const upcomingRows: DisplayRow[] = []

  Object.entries(supplierGroups).forEach(([supplierIdStr, supsInvoices]) => {
    const supplierId = parseInt(supplierIdStr)
    const supplierName = suppliers.find(s => s.id === supplierId)?.name || `Supplier ${supplierId}`
    
    const overdueInvoices = supsInvoices.filter(inv => isBefore(startOfDay(new Date(inv.dueDate)), today))
    const upcomingInvs = supsInvoices.filter(inv => !isBefore(startOfDay(new Date(inv.dueDate)), today))

    overdueInvoices.forEach(inv => {
      const due = new Date(inv.dueDate)
      upcomingRows.push({
        id: `inv-${inv.id}`,
        invoiceId: inv.id,
        supplierName,
        dueDate: due,
        totalAmount: new Decimal(inv.amount).toNumber(),
        remainingAmount: new Decimal(inv.amount).minus(inv.paidAmount).toNumber(),
        isGrouped: false,
        statusClass: "bg-rose-50 text-rose-700 border-rose-200",
        statusLabel: "Overdue",
        textColor: "text-rose-600 font-bold",
        isPartial: new Decimal(inv.paidAmount).greaterThan(0) && new Decimal(inv.amount).minus(inv.paidAmount).greaterThan(0),
        isPaid: new Decimal(inv.amount).minus(inv.paidAmount).lessThanOrEqualTo(0),
        reminder: inv.reminder,
        reminderAmount: inv.reminderAmount
      })
    })

    upcomingInvs.forEach(inv => {
      const due = new Date(inv.dueDate)
      
      
      let statusClass = "bg-sky-50 text-sky-700 border-sky-200"
      let statusLabel = "Upcoming"
      let textColor = "text-sky-700 font-medium"

      if (isEqual(startOfDay(due), today)) {
        statusClass = "bg-orange-50 text-orange-700 border-orange-200"
        statusLabel = "Due Today"
        textColor = "text-orange-600 font-medium"
      }
      
      upcomingRows.push({
        id: `inv-${inv.id}`,
        invoiceId: inv.id,
        supplierName,
        dueDate: due,
        totalAmount: new Decimal(inv.amount).toNumber(),
        remainingAmount: new Decimal(inv.amount).minus(inv.paidAmount).toNumber(),
        isGrouped: false,
        statusClass,
        statusLabel,
        textColor,
        isPartial: new Decimal(inv.paidAmount).greaterThan(0) && new Decimal(inv.amount).minus(inv.paidAmount).greaterThan(0),
        isPaid: new Decimal(inv.amount).minus(inv.paidAmount).lessThanOrEqualTo(0),
        reminder: inv.reminder,
        reminderAmount: inv.reminderAmount
      })
    })
  })

  
    // Add Pending Cheques to Dashboard
    cheques.filter(c => c.status === 'Pending').forEach(c => {
      const due = new Date(c.chequeDate)
      if (isBefore(due, fortyFiveDaysFromNow)) {
        const isOverdue = isBefore(startOfDay(due), today)
        const isToday = isEqual(startOfDay(due), today)
        
        upcomingRows.push({
          id: `chq-${c.id}`,
          supplierName: suppliers.find(s => s.id === c.supplierId)?.name || 'Generic Cheque',
          dueDate: due,
          totalAmount: c.amount,
          remainingAmount: c.amount,
          isGrouped: false,
          statusClass: isOverdue ? "bg-rose-50 text-rose-700 border-rose-200" : (isToday ? "bg-orange-50 text-orange-700 border-orange-200" : "bg-sky-50 text-sky-700 border-sky-200"),
          statusLabel: "Cheque Payment",
          textColor: isOverdue ? "text-rose-600 font-bold" : "text-sky-700 font-medium",
          isCheque: true,
          chequeStatus: c.status
        })
      }
    })

  upcomingRows.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
  const finalRows = showSelectedOnly ? upcomingRows.filter(r => r.reminder) : upcomingRows;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Dashboard Overview</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Cash" value={<FormatCurrency amount={totalCash} />} icon={<Wallet className="w-5 h-5 text-sky-500" />} valueColor="text-sky-600" />
        <StatCard title="Expected Collections" value={<FormatCurrency amount={totalExpected} />} icon={<Clock className="w-5 h-5 text-orange-500" />} valueColor="text-orange-600" />
        <StatCard title="Total Remaining" value={<FormatCurrency amount={totalRemaining} />} icon={<Clock className="w-5 h-5 text-sky-500" />} />
        <StatCard 
          title="Total Due (Today)" 
          value={<FormatCurrency amount={totalDueToday} />} 
          icon={<AlertTriangle className={`w-5 h-5 ${totalDueToday > 0 ? 'text-rose-500' : 'text-slate-400'}`} />} 
          valueColor={totalDueToday > 0 ? 'text-rose-600' : 'text-slate-800'}
        />
      </div>

      <div className="grid grid-cols-1 gap-8">
        
<div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <div className="flex flex-1 items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Upcoming & Overdue Payments (1.5 Months)</h2>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-600">Show Selected Only</span>
                <button 
                  onClick={() => setShowSelectedOnly(!showSelectedOnly)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${showSelectedOnly ? 'bg-sky-600' : 'bg-slate-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showSelectedOnly ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Supplier</th>
                  <th className="px-6 py-4 text-center">Select</th>
                  <th className="px-6 py-4 whitespace-nowrap">Due Date</th>
                  <th className="px-6 py-4 whitespace-nowrap text-right">Full Amount</th>
                  <th className="px-6 py-4 whitespace-nowrap text-right">Remaining Amount</th>
                  <th className="px-6 py-4 whitespace-nowrap">Due Status</th>
                  <th className="px-6 py-4 whitespace-nowrap">Payment Status</th>
                  <th className="px-6 py-4 whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {finalRows.map(row => (
                  <tr key={row.id} className={`hover:bg-slate-50/50 transition-colors`}>
                    <td className={`px-6 py-4 font-medium ${row.textColor}`}>
                      <button 
                        onClick={() => {
                          const s = suppliers.find(sup => sup.name === row.supplierName);
                          if (s && onSupplierClick) onSupplierClick(s);
                        }}
                        className="hover:underline transition-colors text-left"
                      >
                        {row.supplierName}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {(user?.role === "admin" || user?.permissions?.invoices?.reminder) && row.invoiceId ? (
                        <div className="flex flex-col items-center gap-1">
                          <button onClick={() => {
                            if (!row.reminder) {
                              setReminderModal({ isOpen: true, id: row.invoiceId!, remaining: row.remainingAmount });
                            } else {
                              onToggleReminder!(row.invoiceId!, false);
                            }
                          }} className={`transition-colors ${row.reminder ? 'text-emerald-500 hover:text-emerald-600' : 'text-slate-300 hover:text-emerald-400'}`}>
                            <CheckCircle className={`w-5 h-5 ${row.reminder ? 'fill-current text-emerald-500' : ''}`} />
                          </button>
                          {row.reminder && row.reminderAmount && <span className="text-[10px] font-bold text-emerald-600">{row.reminderAmount} JOD</span>}
                        </div>
                      ) : row.reminder ? (
                        <div className="flex flex-col items-center gap-1">
                          <CheckCircle className="w-5 h-5 mx-auto text-emerald-500 fill-current" />
                          {row.reminderAmount && <span className="text-[10px] font-bold text-emerald-600">{row.reminderAmount} JOD</span>}
                        </div>
                      ) : (
                        <CheckCircle className="w-5 h-5 mx-auto text-slate-200" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">{format(row.dueDate, 'MMM dd, yyyy')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-slate-500">
                      <FormatCurrency amount={row.totalAmount} />
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-right font-bold ${row.textColor}`}>
                      <FormatCurrency amount={row.remainingAmount} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${row.statusClass}`}>
                        {row.statusLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {row.isCheque ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${row.chequeStatus === "Pending" ? "bg-amber-50 text-amber-700 border-amber-200" : (row.chequeStatus === "Cleared" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200")}`}>
                          {row.chequeStatus}
                        </span>
                      ) : (row as any).isPaid ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Paid
                        </span>
                      ) : row.isPartial ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                          Partial
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                          Unpaid
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {row.reminder && onQuickPay && (user?.role === 'admin' || user?.permissions?.cheques?.create) && (
                        <button 
                          onClick={() => {
                            const inv = invoices.find(i => i.id === row.invoiceId);
                            if (inv) onQuickPay(inv);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-all border border-emerald-100"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          Pay Now
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {finalRows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-slate-500">showSelectedOnly ? "No invoices selected for payment!" : "No upcoming or overdue payments!"</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-500" />
            <h2 className="text-lg font-bold text-slate-800">Recent Invoices</h2>
          </div>
          <div className="overflow-x-auto">
            {/* NO description shown here */}
            <InvoiceTable invoices={invoices.slice(0, 5)} suppliers={suppliers} onReminderToggle={onToggleReminder} canToggleReminder={user?.role === "admin" || user?.permissions?.invoices?.reminder} onOpenReminderModal={(id, rem) => setReminderModal({isOpen: true, id, remaining: rem})} onSupplierClick={onSupplierClick} onQuickPay={onQuickPay} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-rose-500" />
            <h2 className="text-lg font-bold text-slate-800">Recent Expenses</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses?.slice(0, 5).map(exp => (
                  <tr key={exp.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{format(new Date(exp.date), 'MMM dd')}</td>
                    <td className="px-6 py-4 font-medium">{exp.category}</td>
                    <td className="px-6 py-4 text-right font-bold text-rose-600"><FormatCurrency amount={exp.amount} /></td>
                  </tr>
                ))}
                {(expenses?.length || 0) === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-500">No expenses recorded</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        
      </div>
      <PaymentReminderModal 
        isOpen={reminderModal.isOpen} 
        onClose={() => setReminderModal({ ...reminderModal, isOpen: false })} 
        remainingAmount={reminderModal.remaining} 
        onConfirm={(amount) => {
          onToggleReminder!(reminderModal.id, true, amount)
          setReminderModal({ ...reminderModal, isOpen: false })
        }} 
      />
    </div>
  )
}

function SuppliersTab({ suppliers, invoices, payments, accounts, onRefresh, onDelete, selectedSupplier, setSelectedSupplier, onSupplierClick, onToggleReminder, setSuppliers, onQuickPay }: { suppliers: Supplier[], invoices: Invoice[], payments: Payment[], accounts: Account[], onRefresh: () => void, onDelete: (id: number) => void, selectedSupplier: Supplier | null, setSelectedSupplier: (s: Supplier | null) => void, onSupplierClick?: (s: Supplier) => void, onToggleReminder: (id: number, r: boolean, a?: number) => Promise<void>, setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>, onQuickPay?: (inv: Invoice) => void }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [reminderModal, setReminderModal] = useState<{isOpen: boolean, id: number, remaining: number}>({isOpen: false, id: 0, remaining: 0})

  const { user } = useAuth();



  const [newSupplierName, setNewSupplierName] = useState('')
  const [newSupplierPriority, setNewSupplierPriority] = useState(1)
  const [newSupplierPaymentTerms, setNewSupplierPaymentTerms] = useState(0)
  const [editSupplierId, setEditSupplierId] = useState<number | null>(null)
  
  const filteredSuppliers = suppliers.filter(s => 
    searchTerm === '' || s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.priority.toString().includes(searchTerm)
  );

  const handleEditClick = (supplier: Supplier) => {
    setEditSupplierId(supplier.id)
    setNewSupplierName(supplier.name)
    setNewSupplierPriority(supplier.priority)
    setNewSupplierPaymentTerms(supplier.paymentTermDays)
  }

  const handleCancelEdit = () => {
    setEditSupplierId(null)
    setNewSupplierName('')
    setNewSupplierPriority(1)
    setNewSupplierPaymentTerms(0)
  }

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editSupplierId ? `${API_URL}/suppliers/${editSupplierId}` : `${API_URL}/suppliers`
      const method = editSupplierId ? 'PUT' : 'POST'
      const res = await apiFetch(url, {
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
      handleCancelEdit()
    } catch (err) {
      console.error(err)
    }
  }


  if (selectedSupplier) {
    const supplierInvoices = invoices.filter(inv => inv.supplierId === selectedSupplier.id)
    const totalInvoicesCount = supplierInvoices.length;
    const totalAmount = supplierInvoices.reduce((acc, inv) => acc.plus(new Decimal(inv.amount)), new Decimal(0)).toNumber();
    const totalPaid = supplierInvoices.reduce((acc, inv) => acc.plus(new Decimal(inv.paidAmount)), new Decimal(0)).toNumber();
    const remaining = new Decimal(totalAmount).minus(totalPaid).toNumber();

    return (
      <div className="space-y-8 animate-in fade-in duration-200">
        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedSupplier(null)} className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{selectedSupplier.name} - Invoices</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Invoices" value={totalInvoicesCount} icon={<FileText className="w-5 h-5 text-sky-500"/>} />
          <StatCard title="Total Amount" value={<FormatCurrency amount={totalAmount}/>} icon={<Wallet className="w-5 h-5 text-sky-500"/>} />
          <StatCard title="Total Paid" value={<FormatCurrency amount={totalPaid}/>} icon={<CheckCircle className="w-5 h-5 text-emerald-500"/>} valueColor="text-emerald-600" />
          <StatCard title="Remaining Balance" value={<FormatCurrency amount={remaining}/>} icon={<AlertTriangle className="w-5 h-5 text-orange-500"/>} valueColor="text-orange-600" />
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto mb-8">
          <div className="p-6 border-b border-slate-100">
             <h2 className="text-lg font-bold text-slate-800">Associated Invoices</h2>
          </div>
          <InvoiceTable invoices={supplierInvoices} suppliers={suppliers} showDescription={true} onReminderToggle={onToggleReminder} canToggleReminder={user?.role === "admin" || user?.permissions?.invoices?.reminder} onOpenReminderModal={(id, rem) => setReminderModal({isOpen: true, id, remaining: rem})} onSupplierClick={onSupplierClick} onQuickPay={onQuickPay} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-sky-500" />
            <h2 className="text-lg font-bold text-slate-800">Payment History</h2>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Account</th>
                <th className="px-6 py-4">Applied To</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-right">Actions</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.filter(p => p.supplierId === selectedSupplier.id).map(payment => {
                const accountName = accounts.find(a => a.id === payment.accountId)?.name || payment.accountId
                return (
                  <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-slate-500">#{payment.id}</td>
                    <td className="px-6 py-4 text-slate-500">{accountName}</td>
                    <td className="px-6 py-4">
                      {payment.invoiceId ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-100">
                          Invoice #{payment.invoiceId}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          Auto (FIFO)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-rose-600">
                      <FormatCurrency amount={payment.amount} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                      {format(new Date(payment.paymentDate), 'MMM dd, yyyy')}
                    </td>
                  </tr>
                )
              })}
              {payments.filter(p => p.supplierId === selectedSupplier.id).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No payment history found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Suppliers Management</h1>
      </header>

      {(user?.role === 'admin' || (editSupplierId ? user?.permissions?.suppliers?.edit : user?.permissions?.suppliers?.create)) && (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 max-w-3xl">
        <h2 className="text-lg font-bold text-slate-800 mb-4">{editSupplierId ? 'Edit Supplier' : 'Add New Supplier'}</h2>
        <form onSubmit={handleAddSupplier} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input required type="text" value={newSupplierName} onChange={e => setNewSupplierName(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-sky-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <input required type="number" value={newSupplierPriority} onChange={e => setNewSupplierPriority(parseInt(e.target.value))} className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Payment Terms (Days)</label>
              <select required value={newSupplierPaymentTerms} onChange={e => setNewSupplierPaymentTerms(parseInt(e.target.value))} className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-sky-500">
                <option value={0}>Cash (0 days)</option>
                <option value={30}>Net 30</option>
                <option value={45}>Net 45</option>
                <option value={60}>Net 60</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {((user?.permissions?.suppliers?.[editSupplierId ? 'edit' : 'create'])) ? <button type="submit" className="w-full sm:w-auto bg-sky-600 text-white rounded-lg px-6 py-2 font-medium hover:bg-sky-700 transition-colors">{editSupplierId ? 'Update Supplier' : 'Save Supplier'}</button> : null}
            {editSupplierId && <button type="button" onClick={handleCancelEdit} className="w-full sm:w-auto bg-slate-100 text-slate-700 rounded-lg px-6 py-2 font-medium hover:bg-slate-200 transition-colors">Cancel</button>}
          </div>
        </form>
      </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h2 className="text-xl font-bold text-slate-800">All Suppliers</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search suppliers..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500 w-full sm:w-64"
          />
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/50 text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4 whitespace-nowrap">Terms</th>
              <th className="px-6 py-4">Priority</th>
              <th className="px-6 py-4 whitespace-nowrap text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSuppliers.map(supplier => (
              <tr key={supplier.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-slate-500">#{supplier.id}</td>
                <td className="px-6 py-4 font-medium text-slate-700">
                  <button 
                    onClick={() => setSelectedSupplier(supplier)}
                    className="hover:text-sky-600 hover:underline transition-colors text-left"
                  >
                    {supplier.name}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                    {supplier.paymentTermDays === 0 ? 'Cash' : `Net ${supplier.paymentTermDays}`}
                  </span>
                </td>
                <td className="px-6 py-4">{supplier.priority}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {(user?.role === 'admin' || user?.permissions?.suppliers?.edit) && <button onClick={() => handleEditClick(supplier)} className="text-sky-600 hover:text-sky-900 font-medium mr-3">Edit</button>}
                  {(user?.role === 'admin' || user?.permissions?.suppliers?.delete) && <button onClick={() => onDelete(supplier.id)} className="text-rose-600 hover:text-rose-900 font-medium">Delete</button>}
                </td>
              </tr>
            ))}
            {filteredSuppliers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No suppliers found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <PaymentReminderModal 
        isOpen={reminderModal.isOpen} 
        onClose={() => setReminderModal({ ...reminderModal, isOpen: false })} 
        remainingAmount={reminderModal.remaining} 
        onConfirm={(amount) => {
          onToggleReminder!(reminderModal.id, true, amount)
          setReminderModal({ ...reminderModal, isOpen: false })
        }} 
      />
    </div>
  )
}

function InvoicesTab({ suppliers, invoices, onRefresh, onDelete, onSupplierClick, onToggleReminder, setInvoices, onQuickPay }: { suppliers: Supplier[], invoices: Invoice[], onRefresh: () => void, onDelete?: (id: number) => void, onSupplierClick?: (s: Supplier) => void, onToggleReminder: (id: number, r: boolean, a?: number) => Promise<void>, setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>, onQuickPay?: (inv: Invoice) => void }) {
  const [searchTerm, setSearchTerm] = useState("")
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
  });

  const handleEditClick = (inv: Invoice) => {
    setEditInvoiceId(inv.id)
    setNewInvoiceSupplierId(inv.supplierId.toString())
    setNewInvoiceAmount(inv.amount.toString())
    setNewInvoiceDate(format(new Date(inv.invoiceDate), 'yyyy-MM-dd'))
    setNewInvoiceDescription(inv.description || '')
    setFormError(null)
  }

  const handleCancelEdit = () => {
    setEditInvoiceId(null)
    setNewInvoiceSupplierId('')
    setNewInvoiceAmount('')
    setNewInvoiceDate(format(new Date(), 'yyyy-MM-dd'))
    setNewInvoiceDescription('')
    setFormError(null)
  }

  const handleAddInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    try {
      const url = editInvoiceId ? `${API_URL}/invoices/${editInvoiceId}` : `${API_URL}/invoices`
      const method = editInvoiceId ? 'PUT' : 'POST'
      const res = await apiFetch(url, {
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
      handleCancelEdit()
    } catch (err: any) {
      setFormError(err.message)
      console.error(err)
    }
  }


  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Invoices</h1>
      </header>

      {(user?.role === 'admin' || (editInvoiceId ? user?.permissions?.invoices?.edit : user?.permissions?.invoices?.create)) && (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 max-w-4xl">
        <h2 className="text-lg font-bold text-slate-800 mb-4">{editInvoiceId ? 'Edit Invoice' : 'Add New Invoice'}</h2>
        {formError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {formError}
          </div>
        )}
        <form onSubmit={handleAddInvoice} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Supplier</label>
              <select required disabled={!!editInvoiceId} value={newInvoiceSupplierId} onChange={e => setNewInvoiceSupplierId(e.target.value)} className={`w-full border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-sky-500 ${editInvoiceId ? 'bg-slate-100' : ''}`}>
                <option value="">Select Supplier</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount (JOD)</label>
              <input required type="number" step="0.01" value={newInvoiceAmount} onChange={e => setNewInvoiceAmount(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Invoice Date</label>
              <input required type="date" value={newInvoiceDate} onChange={e => setNewInvoiceDate(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description / Supplier Invoice No. (Optional)</label>
            <input type="text" value={newInvoiceDescription} onChange={e => setNewInvoiceDescription(e.target.value)} placeholder="e.g. INV-2026-042 or Services rendered" className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-sky-500" />
          </div>
          <div className="flex items-center gap-3">
            {((user?.permissions?.invoices?.[editInvoiceId ? 'edit' : 'create'])) ? <button type="submit" className="w-full sm:w-auto bg-emerald-600 text-white rounded-lg px-6 py-2 font-medium hover:bg-emerald-700 transition-colors">{editInvoiceId ? 'Update Invoice' : 'Add Invoice'}</button> : null}
            {editInvoiceId && <button type="button" onClick={handleCancelEdit} className="w-full sm:w-auto bg-slate-100 text-slate-700 rounded-lg px-6 py-2 font-medium hover:bg-slate-200 transition-colors">Cancel</button>}
          </div>
        </form>
      </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <h2 className="text-xl font-bold text-slate-800">All Invoices</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search invoices..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500 w-full sm:w-64"
            />
          </div>
          <select value={filterSupplierId} onChange={e => setFilterSupplierId(e.target.value)} className="border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-sky-500 bg-white min-w-[200px]">
            <option value="">All Suppliers</option>
            {suppliers.map(s => <option key={s.id} value={s.id.toString()}>{s.name}</option>)}
          </select>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto">
        <InvoiceTable invoices={filteredInvoices} suppliers={suppliers} showDescription={true} onEditClick={handleEditClick} onDeleteClick={onDelete} onReminderToggle={onToggleReminder} canToggleReminder={user?.role === "admin" || user?.permissions?.invoices?.reminder} onOpenReminderModal={(id, rem) => setReminderModal({isOpen: true, id, remaining: rem})} onSupplierClick={onSupplierClick} onQuickPay={onQuickPay} />
      </div>
      <PaymentReminderModal 
        isOpen={reminderModal.isOpen} 
        onClose={() => setReminderModal({ ...reminderModal, isOpen: false })} 
        remainingAmount={reminderModal.remaining} 
        onConfirm={(amount) => {
          onToggleReminder!(reminderModal.id, true, amount)
          setReminderModal({ ...reminderModal, isOpen: false })
        }} 
      />
    </div>
  )
}

function PaymentsTab({ suppliers, payments, accounts, invoices, onRefresh, onDelete, onSupplierClick }: { suppliers: Supplier[], payments: Payment[], accounts: Account[], invoices: Invoice[], onRefresh: () => void, onDelete: (id: number) => void, onSupplierClick?: (s: Supplier) => void }) {
  const [searchTerm, setSearchTerm] = useState("")
  const { user } = useAuth();



  const [paymentSupplierId, setPaymentSupplierId] = useState('')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [paymentAccountId, setPaymentAccountId] = useState('')
  const [paymentMode, setPaymentMode] = useState<'auto' | 'manual'>('auto')
  const [selectedInvoices, setSelectedInvoices] = useState<number[]>([])
  const [manualAllocations, setManualAllocations] = useState<Record<number, string>>({})
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
  });

  const handleEditClick = (payment: Payment) => {
    setEditPaymentId(payment.id)
    setPaymentSupplierId(payment.supplierId.toString())
    setPaymentAmount(payment.amount.toString())
    setPaymentDate(format(new Date(payment.paymentDate), 'yyyy-MM-dd'))
    setPaymentAccountId(payment.accountId.toString())
    setFormError(null)
  }

  const handleCancelEdit = () => {
    setEditPaymentId(null)
    setPaymentSupplierId('')
    setPaymentAmount('')
    setPaymentDate(format(new Date(), 'yyyy-MM-dd'))
    setPaymentAccountId('')
    setFormError(null)
  }

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    
    const pAmount = parseFloat(paymentAmount)
    const pAccountId = parseInt(paymentAccountId)
    const acc = accounts.find(a => a.id === pAccountId)
    
    if (!editPaymentId && acc && new Decimal(pAmount).greaterThan(new Decimal(acc.balance))) {
      setFormError('Amount exceeds account balance')
      return
    }

    try {
      const url = editPaymentId ? `${API_URL}/payments/${editPaymentId}` : `${API_URL}/payments`
      const method = editPaymentId ? 'PUT' : 'POST'

      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          supplierId: paymentSupplierId, 
          accountId: pAccountId,
          amount: paymentAmount,
          paymentDate: paymentDate,
          allocations: paymentMode === 'manual' ? selectedInvoices.map(id => ({
            invoiceId: id,
            amount: parseFloat(manualAllocations[id] || '0')
          })).filter(a => a.amount > 0) : null
        })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || errorData.details || 'Failed to save payment')
      }

      handleCancelEdit()
      onRefresh()
    } catch (err: any) {
      setFormError(err.message)
      console.error(err)
    }
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Payments</h1>
      </header>

      {(user?.role === 'admin' || (editPaymentId ? user?.permissions?.payments?.edit : user?.permissions?.payments?.create)) && (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 max-w-4xl">
        <h2 className="text-lg font-bold text-slate-800 mb-4">{editPaymentId ? 'Edit Payment' : 'Record Payment'}</h2>
        {formError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {formError}
          </div>
        )}
        <form onSubmit={handleAddPayment} className="space-y-6">
          <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit mb-4">
            <button type="button" onClick={() => setPaymentMode('auto')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${paymentMode === 'auto' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Auto (FIFO)</button>
            <button type="button" onClick={() => setPaymentMode('manual')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${paymentMode === 'manual' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Manual Selection</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Supplier</label>
              <select required value={paymentSupplierId} onChange={e => setPaymentSupplierId(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-sky-500">
                <option value="">Select Supplier</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Payment Account</label>
              <select required value={paymentAccountId} onChange={e => setPaymentAccountId(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-sky-500">
                <option value="">Select Account</option>
                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} (Bal: {acc.balance?.toLocaleString() || "0"})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount to Pay (JOD)</label>
              <input required type="number" step="0.01" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Payment Date</label>
              <input required type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
          </div>

          {paymentMode === 'manual' && paymentSupplierId && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Unpaid Invoices</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {invoices.filter(inv => inv.supplierId === parseInt(paymentSupplierId) && inv.paidAmount < inv.amount).map(inv => {
                  const remaining = inv.amount - inv.paidAmount;
                  const isSelected = selectedInvoices.includes(inv.id);
                  return (
                    <div key={inv.id} className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${isSelected ? 'bg-white border-sky-200 shadow-sm' : 'bg-white/50 border-transparent hover:border-slate-200'}`}>
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedInvoices([...selectedInvoices, inv.id]);
                            setManualAllocations({...manualAllocations, [inv.id]: remaining.toString()});
                          } else {
                            setSelectedInvoices(selectedInvoices.filter(id => id !== inv.id));
                            const newAlloc = {...manualAllocations};
                            delete newAlloc[inv.id];
                            setManualAllocations(newAlloc);
                          }
                        }}
                        className="w-5 h-5 text-sky-600 rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-800">Invoice #{inv.id}</p>
                        <p className="text-xs text-slate-500">Due: {format(new Date(inv.dueDate), 'MMM dd')} • Remaining: {remaining.toLocaleString()} JOD</p>
                      </div>
                      {isSelected && (
                        <div className="w-32">
                          <input 
                            type="number" 
                            step="0.01"
                            max={remaining}
                            value={manualAllocations[inv.id] || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setManualAllocations({...manualAllocations, [inv.id]: val});
                              // Update total amount
                              const total = Object.entries({...manualAllocations, [inv.id]: val})
                                .filter(([id]) => selectedInvoices.includes(parseInt(id)))
                                .reduce((sum, [_, amt]) => sum + (parseFloat(amt) || 0), 0);
                              setPaymentAmount(total.toString());
                            }}
                            className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
                            placeholder="Amount"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <button type="submit" className="w-full sm:w-auto bg-teal-600 text-white rounded-lg px-6 py-2 font-medium hover:bg-teal-700 transition-colors flex items-center justify-center gap-2">
              <CreditCard className="w-4 h-4" /> {editPaymentId ? 'Update Payment' : 'Process Payment'}
            </button>
            {editPaymentId && (
              <button type="button" onClick={handleCancelEdit} className="w-full sm:w-auto bg-slate-100 text-slate-700 rounded-lg px-6 py-2 font-medium hover:bg-slate-200 transition-colors">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h2 className="text-xl font-bold text-slate-800">Payment History</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search payments..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500 w-full sm:w-64"
          />
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/50 text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Supplier</th>
              <th className="px-6 py-4">Account</th>
              <th className="px-6 py-4">Applied To</th>
              <th className="px-6 py-4 text-right">Amount</th>
              <th className="px-6 py-4 whitespace-nowrap">Payment Date</th>
              <th className="px-6 py-4 whitespace-nowrap text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
          {filteredPayments.map(payment => {
              const supplierName = suppliers.find(s => s.id === payment.supplierId)?.name || `ID: ${payment.supplierId}`
              const accountName = payment.accountId ? (accounts.find(a => a.id === payment.accountId)?.name || `ID: ${payment.accountId}`) : '-'
              return (
                <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-slate-500">#{payment.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-700">
                    <button 
                      onClick={() => {
                        const s = suppliers.find(sup => sup.id === payment.supplierId);
                        if (s && onSupplierClick) onSupplierClick(s);
                      }}
                      className="hover:text-sky-600 hover:underline transition-colors text-left"
                    >
                      {supplierName}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{accountName}</td>
                  <td className="px-6 py-4">
                    {payment.invoiceId ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-100">
                        Invoice #{payment.invoiceId}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        Auto (FIFO)
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-rose-600">
                    <FormatCurrency amount={payment.amount} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{payment.paymentDate ? format(new Date(payment.paymentDate), 'MMM dd, yyyy') : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {(user?.role === 'admin' || user?.permissions?.payments?.edit) && <button onClick={() => handleEditClick(payment)} className="text-sky-600 hover:text-sky-900 font-medium mr-3">Edit</button>}
                    {(user?.role === 'admin' || user?.permissions?.payments?.delete) && <button onClick={() => onDelete(payment.id)} className="text-rose-600 hover:text-rose-900 font-medium">Delete</button>}
                  </td>
                </tr>
              )
            })}
            {filteredPayments.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-slate-500">No payments found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function InvoiceTable({ invoices, suppliers, showDescription = false, onEditClick, onDeleteClick, onReminderToggle, canToggleReminder, onOpenReminderModal, onSupplierClick, onQuickPay }: { invoices: Invoice[], suppliers: Supplier[], showDescription?: boolean, onEditClick?: (inv: Invoice) => void, onDeleteClick?: (id: number) => void, onReminderToggle?: (id: number, reminder: boolean, amount?: number) => void, canToggleReminder?: boolean, onOpenReminderModal?: (id: number, remaining: number) => void, onSupplierClick?: (s: Supplier) => void, onQuickPay?: (inv: Invoice) => void }) {
  const { user } = useAuth();
  return (
    <table className="w-full text-left text-sm">
      <thead className="bg-slate-50/50 text-slate-500 font-medium">
        <tr>
          <th className="px-6 py-4">ID</th>
          <th className="px-6 py-4">Supplier</th>
          <th className="px-6 py-4 text-center">Pay Now</th>
          {showDescription && <th className="px-6 py-4">Description / Invoice No.</th>}
          <th className="px-6 py-4 whitespace-nowrap">Invoice Date</th>
          <th className="px-6 py-4 whitespace-nowrap text-right">Full Amount</th>
          <th className="px-6 py-4 whitespace-nowrap text-right">Remaining Amount</th>
          <th className="px-6 py-4 whitespace-nowrap">Due Date</th>
          <th className="px-6 py-4 whitespace-nowrap">Due Status</th>
          <th className="px-6 py-4 whitespace-nowrap">Payment Status</th>
          {(onEditClick || onDeleteClick || onQuickPay) && (user?.role === "admin" || user?.permissions?.invoices?.edit || user?.permissions?.invoices?.delete || user?.permissions?.cheques?.create) && (user?.role === "admin" || user?.permissions?.invoices?.edit || user?.permissions?.invoices?.delete || user?.permissions?.cheques?.create) && <th className="px-6 py-4 whitespace-nowrap text-right">Actions</th>}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {invoices.map(invoice => {
          const fullAmount = new Decimal(invoice.amount);
          const paidAmount = new Decimal(invoice.paidAmount);
          const remainingAmount = fullAmount.minus(paidAmount);

          const isPaid = remainingAmount.lessThanOrEqualTo(0);
          const isPartial = paidAmount.greaterThan(0) && remainingAmount.greaterThan(0);

          const supplierName = suppliers.find(s => s.id === invoice.supplierId)?.name || `ID: ${invoice.supplierId}`
          const due = startOfDay(new Date(invoice.dueDate));
          const todayDate = startOfDay(new Date());
          let dueStatus = 'Upcoming';
          let dueClass = 'bg-slate-50 text-slate-700 border-slate-200';

          if (isBefore(due, todayDate)) {
            dueStatus = 'Overdue';
            dueClass = 'bg-rose-50 text-rose-700 border-rose-200';
          } else if (isEqual(due, todayDate)) {
            dueStatus = 'Due Today';
            dueClass = 'bg-orange-50 text-orange-700 border-orange-200';
          } else {
            dueStatus = 'Upcoming';
            dueClass = 'bg-sky-50 text-sky-700 border-sky-200';
          }

          
          return (
            <tr key={invoice.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4 text-slate-500">#{invoice.id}</td>
              <td className="px-6 py-4 font-medium text-slate-700">
                <button 
                  onClick={() => {
                    const s = suppliers.find(sup => sup.id === invoice.supplierId);
                    if (s && onSupplierClick) onSupplierClick(s);
                  }}
                  className="hover:text-sky-600 hover:underline transition-colors text-left"
                >
                  {supplierName}
                </button>
              </td>
              <td className="px-6 py-4 text-center">
                {!isPaid && (dueStatus === 'Overdue' || dueStatus === 'Due Today') ? (
                  canToggleReminder ? (
                    <div className="flex flex-col items-center gap-1">
                      <button onClick={() => {
                        if (!invoice.reminder) {
                          if (onOpenReminderModal) onOpenReminderModal(invoice.id, invoice.amount - invoice.paidAmount);
                        } else {
                          if (onReminderToggle) onReminderToggle(invoice.id, false);
                        }
                      }} className={`transition-colors ${invoice.reminder ? 'text-emerald-500 hover:text-emerald-600' : 'text-slate-300 hover:text-emerald-400'}`}>
                        <CheckCircle className={`w-5 h-5 ${invoice.reminder ? 'fill-current text-emerald-500' : ''}`} />
                      </button>
                      {invoice.reminder && invoice.reminderAmount && (
                        <span className="text-[10px] font-bold text-emerald-600">
                          {new Decimal(invoice.reminderBaseline || 0).plus(invoice.reminderAmount).minus(invoice.paidAmount).toNumber().toLocaleString()} JOD
                        </span>
                      )}
                    </div>
                  ) : invoice.reminder ? (
                    <div className="flex flex-col items-center gap-1">
                      <CheckCircle className="w-5 h-5 mx-auto text-emerald-500 fill-current" />
                      {invoice.reminderAmount && <span className="text-[10px] font-bold text-emerald-600">{invoice.reminderAmount} JOD</span>}
                    </div>
                  ) : (
                    <CheckCircle className="w-5 h-5 mx-auto text-slate-200" />
                  )
                ) : (
                  <span className="text-slate-300">-</span>
                )}
              </td>
              {showDescription && (
                <td className="px-6 py-4 text-slate-600 truncate max-w-xs" title={invoice.description}>
                  {invoice.description || '-'}
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap text-slate-600">{invoice.invoiceDate ? format(new Date(invoice.invoiceDate), 'MMM dd, yyyy') : '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-slate-500">
                <FormatCurrency amount={invoice.amount} />
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-right font-bold ${isPaid ? 'text-emerald-600' : isPartial ? 'text-orange-600' : 'text-slate-700'}`}>
                <FormatCurrency amount={new Decimal(invoice.amount).minus(invoice.paidAmount).toNumber()} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${dueClass}`}>
                  {dueStatus}
                </span>
              </td>
              <td className="px-6 py-4">
                {isPaid ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Paid
                  </span>
                ) : isPartial ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                    Partial
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                    Unpaid
                  </span>
                )}
              </td>
              {(onEditClick || onDeleteClick || onQuickPay) && (user?.role === "admin" || user?.permissions?.invoices?.edit || user?.permissions?.invoices?.delete || user?.permissions?.cheques?.create) && (
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {invoice.reminder && onQuickPay && (user?.role === 'admin' || user?.permissions?.cheques?.create) && (
                    <button 
                      onClick={() => onQuickPay(invoice)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-all border border-emerald-100 mr-3"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      Pay Now
                    </button>
                  )}
                  {onEditClick && (user?.role === "admin" || user?.permissions?.invoices?.edit) && <button onClick={() => onEditClick(invoice)} className="text-sky-600 hover:text-sky-900 font-medium text-sm mr-4">Edit</button>}
                  {onDeleteClick && (user?.role === "admin" || user?.permissions?.invoices?.delete) && <button onClick={() => onDeleteClick(invoice.id)} className="text-rose-600 hover:text-rose-900 font-medium text-sm">Delete</button>}
                </td>
              )}
            </tr>
          )
        })}
        {invoices.length === 0 && (
          <tr>
            <td colSpan={9 + (showDescription ? 1 : 0) + (onEditClick ? 1 : 0)} className="px-6 py-8 text-center text-slate-500">No invoices found</td>
          </tr>
        )}
      </tbody>
    </table>
  )
}

function AccountsTab({ accounts, payments, collections, suppliers, expenses, onRefresh, onDelete, selectedAccount, setSelectedAccount, setAccounts, openDeleteModal }: { accounts: Account[], payments: Payment[], collections: Collection[], suppliers: Supplier[], expenses: Expense[], onRefresh: () => void, setSuppliers?: React.Dispatch<React.SetStateAction<Supplier[]>>, setInvoices?: React.Dispatch<React.SetStateAction<Invoice[]>>, setPayments?: React.Dispatch<React.SetStateAction<Payment[]>>, setAccounts?: React.Dispatch<React.SetStateAction<Account[]>>, setCollections?: React.Dispatch<React.SetStateAction<Collection[]>>, onDelete: (id: number) => void, selectedAccount: Account | null, setSelectedAccount: (a: Account | null) => void, openDeleteModal: (id: number, type: string, title: string) => void }) {
  const [searchTerm, setSearchTerm] = useState("")
  const { user } = useAuth();
  const [isReconcileOpen, setIsReconcileOpen] = useState(false);
  const [editAdjustment, setEditAdjustment] = useState<{id: number, note: string} | null>(null);

  const handleDeleteTransaction = (t: any) => {
    const id = parseInt(t.id.split('-')[1]);
    const prefix = t.id.split('-')[0];
    const type = prefix === 'pay' ? 'payments' : prefix === 'coll' ? 'collections' : 'accounts/adjustments';
    const title = prefix === 'pay' ? 'Payment' : prefix === 'coll' ? 'Collection' : 'Adjustment';
    openDeleteModal(id, type, title);
  };

  const handleEditTransaction = (t: any) => {
    if (t.type === 'Adjustment') {
      setEditAdjustment({ id: parseInt(t.id.split('-')[1]), note: t.description });
    } else {
      showError(`Please go to the ${t.type === 'Incoming' ? 'Collections' : 'Payments'} tab to edit this transaction.`);
    }
  };

  const handleEditAdjustmentConfirm = async (note: string) => {
    if (!editAdjustment) return;
    try {
      const res = await apiFetch(`${API_URL}/accounts/adjustments/${editAdjustment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note })
      });
      if (!res.ok) throw new Error('Failed to update adjustment');
      
      setEditAdjustment(null);
      onRefresh();
      // Update local selectedAccount state
      const accRes = await apiFetch(`${API_URL}/accounts/${selectedAccount!.id}`);
      if (accRes.ok) setSelectedAccount(await accRes.json());
    } catch (err: any) {
      showError(err.message);
    }
  };

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
      showError(err.message);
    }
  };

  useEffect(() => {
    const fetchDetails = async () => {
      if (selectedAccount && !selectedAccount.adjustments) {
        try {
          const res = await apiFetch(`${API_URL}/accounts/${selectedAccount.id}`);
          if (res.ok) {
            const fullAccount = await res.json();
            setSelectedAccount(fullAccount);
          }
        } catch (err) {
          console.error('Error fetching account details:', err);
        }
      }
    };
    fetchDetails();
  }, [selectedAccount, setSelectedAccount]);

  const [name, setName] = useState('')
  const [type, setType] = useState('Bank')
  
  const filteredAccounts = accounts.filter(a => 
    searchTerm === '' || a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.type.toLowerCase().includes(searchTerm.toLowerCase()) || a.balance.toString().includes(searchTerm)
  );

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiFetch(`${API_URL}/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type })
      })
      setName('')
      setType('Bank')
      onRefresh()
    } catch (err) {
      console.error(err)
    }
  }
  if (selectedAccount) {
    const accountPayments = payments.filter(p => p.accountId === selectedAccount.id).map(p => ({
      id: `pay-${p.id}`,
      date: new Date(p.paymentDate),
      type: 'Outgoing' as const,
      description: suppliers.find(s => s.id === p.supplierId)?.name || `Supplier ID: ${p.supplierId}`,
      amount: p.amount
    }));

    
    const accountExpenses = expenses.filter(e => e.accountId === selectedAccount.id).map(e => ({
      id: `exp-${e.id}`,
      date: new Date(e.date),
      type: 'Outgoing' as const,
      description: e.category + (e.note ? `: ${e.note}` : ''),
      amount: e.amount
    }));

    const accountCollections = collections.filter(c => c.accountId === selectedAccount.id).map(c => ({
      id: `coll-${c.id}`,
      date: new Date(c.receivedDate || c.createdAt),
      type: 'Incoming' as const,
      description: c.note || 'Collection',
      amount: c.amountInBase
    }));

        const accountAdjustments = (selectedAccount.adjustments || []).map(adj => ({
      id: `adj-${adj.id}`,
      date: new Date(adj.createdAt),
      type: 'Adjustment' as const,
      description: adj.note || 'Balance Adjustment',
      amount: adj.amount,
      actual: adj.actualBalance,
      system: adj.systemBalance
    }));

    const allTransactions = [...accountPayments, ...accountCollections, ...accountAdjustments, ...accountExpenses].sort((a, b) => b.date.getTime() - a.date.getTime());


    return (
      <div className="space-y-8 animate-in fade-in duration-200">
        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedAccount(null)} className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
             <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{selectedAccount.name} - Ledger</h1>
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
          </div>
             <p className="text-slate-500 text-sm">Account Type: {selectedAccount.type}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
           <StatCard title="Current Balance" value={<FormatCurrency amount={selectedAccount.balance}/>} icon={<Wallet className="w-5 h-5 text-sky-500"/>} />
           <StatCard title="Total Inflow" value={<FormatCurrency amount={accountCollections.reduce((sum, t) => sum.plus(new Decimal(t.amount)), new Decimal(0)).toNumber()}/>} icon={<TrendingUp className="w-5 h-5 text-emerald-500"/>} valueColor="text-emerald-600" />
           <StatCard title="Total Outflow" value={<FormatCurrency amount={accountPayments.reduce((sum, t) => sum.plus(new Decimal(t.amount)), new Decimal(0)).toNumber()}/>} icon={<CreditCard className="w-5 h-5 text-rose-500"/>} valueColor="text-rose-600" />
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
                        : t.type === 'Outgoing'
                          ? 'bg-rose-50 text-rose-700 border-rose-100'
                          : 'bg-sky-50 text-sky-700 border-sky-100'
                    }`}>
                      {t.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-medium">
                    {t.description}
                    {(t as any).type === 'Adjustment' && (
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        System: <FormatCurrency amount={(t as any).system} /> → Actual: <FormatCurrency amount={(t as any).actual} />
                      </div>
                    )}
                  </td>
                  <td className={`px-6 py-4 text-right font-bold ${
                    t.type === 'Incoming' ? 'text-emerald-600' : t.type === 'Outgoing' ? 'text-rose-600' : 'text-sky-600'
                  }`}>
                    {t.type === 'Incoming' ? '+' : t.type === 'Outgoing' ? '-' : (new Decimal(t.amount).greaterThan(0) ? '+' : '')}<FormatCurrency amount={t.amount} />
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    {(user?.role === 'admin' || user?.permissions?.accounts?.edit) && (
                      <button onClick={() => handleEditTransaction(t)} className="text-sky-600 hover:text-sky-900 font-medium mr-3">Edit</button>
                    )}
                    {(user?.role === 'admin' || user?.permissions?.accounts?.delete) && (
                      <button onClick={() => handleDeleteTransaction(t)} className="text-rose-600 hover:text-rose-900 font-medium">Delete</button>
                    )}
                  </td>
                </tr>
              ))}
              {allTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No transactions found for this account</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <EditAdjustmentModal isOpen={!!editAdjustment} onClose={() => setEditAdjustment(null)} onConfirm={handleEditAdjustmentConfirm} initialNote={editAdjustment?.note || ''} />
        <ReconcileModal isOpen={isReconcileOpen} onClose={() => setIsReconcileOpen(false)} onConfirm={handleReconcileConfirm} currentBalance={selectedAccount.balance} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Accounts Management</h1>
      </header>

      {(user?.role === 'admin' || user?.permissions?.accounts?.create) && (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 max-w-3xl">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Add New Account</h2>
        <form onSubmit={handleAddAccount} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Account Name</label>
              <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Arab Bank USD" className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select required value={type} onChange={e => setType(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-sky-500">
                <option value="Bank">Bank</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
          </div>
          {user?.permissions?.accounts?.create ? <button type="submit" className="w-full sm:w-auto bg-sky-600 text-white rounded-lg px-6 py-2 font-medium hover:bg-sky-700 transition-colors">Create Account</button> : null}
        </form>
      </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h2 className="text-xl font-bold text-slate-800">Existing Accounts</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search accounts..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500 w-full sm:w-64"
          />
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/50 text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4 whitespace-nowrap text-right">Balance</th>
              <th className="px-6 py-4 whitespace-nowrap text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAccounts.map(acc => (
              <tr key={acc.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-slate-500">#{acc.id}</td>
                <td className="px-6 py-4 font-medium text-slate-700">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSelectedAccount(acc)} className="flex items-center gap-2 hover:text-sky-600 hover:underline transition-colors text-left">
                      <Landmark className="w-4 h-4 text-slate-400" /> {acc.name}
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                    {acc.type}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-slate-800">
                  <FormatCurrency amount={acc.balance} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button onClick={() => setSelectedAccount(acc)} className="text-sky-600 hover:text-sky-900 font-medium mr-4">View Ledger</button>
                    {(user?.role === "admin" || user?.permissions?.accounts?.delete) && <button onClick={() => onDelete(acc.id)} className="text-rose-600 hover:text-rose-900 font-medium">Delete</button>}
                </td>
              </tr>
            ))}
            {filteredAccounts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No accounts found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CollectionsTab({ accounts, collections, onRefresh, onDelete }: { accounts: Account[], collections: Collection[], onRefresh: () => void, setSuppliers?: React.Dispatch<React.SetStateAction<Supplier[]>>, setInvoices?: React.Dispatch<React.SetStateAction<Invoice[]>>, setPayments?: React.Dispatch<React.SetStateAction<Payment[]>>, setAccounts?: React.Dispatch<React.SetStateAction<Account[]>>, setCollections?: React.Dispatch<React.SetStateAction<Collection[]>>, onDelete: (id: number) => void }) {
  const [searchTerm, setSearchTerm] = useState("")
  const { user } = useAuth();


  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('JOD')
  const [accountId, setAccountId] = useState('')
  const [note, setNote] = useState('')
  const [receivedDate, setReceivedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [expectedDate, setExpectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [editCollectionId, setEditCollectionId] = useState<number | null>(null)
  const [filter, setFilter] = useState('all')
  const [isExpected, setIsExpected] = useState(false)
  
  const filtered = (filter === 'all' ? collections : collections.filter(c => c.status === filter)).filter(c => {
    const accName = accounts.find(a => a.id === c.accountId)?.name || '';
    return searchTerm === '' || 
      (c.note || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      accName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.amount.toString().includes(searchTerm) ||
      c.currency.toLowerCase().includes(searchTerm.toLowerCase());
  });


  const handleEditClick = (coll: Collection) => {
    setEditCollectionId(coll.id)
    setAmount(coll.amount.toString())
    setCurrency(coll.currency)
    setAccountId(coll.accountId.toString())
    setNote(coll.note)
    setReceivedDate(format(new Date(coll.receivedDate), 'yyyy-MM-dd'))
    setExpectedDate(coll.expectedDate ? format(new Date(coll.expectedDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'))
    setIsExpected(coll.status === 'expected')
  }

  const handleCancelEdit = () => {
    setEditCollectionId(null)
    setAmount('')
    setCurrency('JOD')
    setAccountId('')
    setNote('')
    setReceivedDate(format(new Date(), 'yyyy-MM-dd'))
    setExpectedDate(format(new Date(), 'yyyy-MM-dd'))
  }

  const handleAddCollection = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editCollectionId ? `${API_URL}/collections/${editCollectionId}` : `${API_URL}/collections`
      const method = editCollectionId ? 'PUT' : 'POST'
      await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: parseFloat(amount), 
          currency, 
          accountId: parseInt(accountId),
          note,
          receivedDate,
          expectedDate: isExpected ? expectedDate : null,
          status: isExpected ? 'expected' : 'received'
        })
      })
      handleCancelEdit()
      onRefresh()
    } catch (err) {
      console.error(err)
    }
  }

  const handleMarkReceived = async (id: number) => {
    try {
      const res = await apiFetch(`${API_URL}/collections/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || errorData.details || 'Failed to update status');
      }
      onRefresh();
    } catch (err: any) {
      showError(err.message);
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Collections</h1>
      </header>

      {(user?.role === 'admin' || (editCollectionId ? user?.permissions?.collections?.edit : user?.permissions?.collections?.create)) && (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 max-w-4xl">
        <h2 className="text-lg font-bold text-slate-800 mb-4">{editCollectionId ? 'Edit Collection' : 'Record Inbound Funds'}</h2>
        <form onSubmit={handleAddCollection} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
              <input required type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
              <select required value={currency} onChange={e => setCurrency(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-sky-500">
                <option value="JOD">JOD</option>
                <option value="SAR">SAR</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">Conversion applied automatically</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Deposit Account</label>
              <select required value={accountId} onChange={e => setAccountId(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-sky-500">
                <option value="">Select Account</option>
                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-1 sm:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                <input type="checkbox" checked={isExpected} onChange={e => setIsExpected(e.target.checked)} className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500" />
                This is an Expected Collection (Not received yet)
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Note (Source / Description)</label>
              <input required type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Sales Revenue Q2" className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            {isExpected ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Expected Date</label>
                <input required type="date" value={expectedDate} onChange={e => setExpectedDate(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-sky-500" />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Received Date</label>
                <input required type="date" value={receivedDate} onChange={e => setReceivedDate(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-sky-500" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" className="w-full sm:w-auto bg-blue-600 text-white rounded-lg px-6 py-2 font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              <TrendingUp className="w-4 h-4" /> {editCollectionId ? 'Update Collection' : 'Add Collection'}
            </button>
            {editCollectionId && <button type="button" onClick={handleCancelEdit} className="w-full sm:w-auto bg-slate-100 text-slate-700 rounded-lg px-6 py-2 font-medium hover:bg-slate-200 transition-colors">Cancel</button>}
          </div>
        </form>
      </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex gap-2">
          <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === 'all' ? 'bg-sky-100 text-sky-700' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>All</button>
          <button onClick={() => setFilter('expected')} className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === 'expected' ? 'bg-orange-100 text-orange-700' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Expected</button>
          <button onClick={() => setFilter('received')} className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === 'received' ? 'bg-emerald-100 text-emerald-700' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Received</button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search collections..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500 w-full sm:w-64"
          />
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/50 text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4 whitespace-nowrap">Date</th>
              <th className="px-6 py-4">Note</th>
              <th className="px-6 py-4">Account</th>
              <th className="px-6 py-4 whitespace-nowrap text-right">Original Amount</th>
              <th className="px-6 py-4 whitespace-nowrap text-right">Amount (JOD)</th>
              <th className="px-6 py-4 whitespace-nowrap text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(coll => {
              const account = accounts.find(a => a.id === coll.accountId)
              return (
                <tr key={coll.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-slate-500">#{coll.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                    {coll.status === 'expected' && coll.expectedDate 
                      ? <span className="text-orange-600 font-medium">Exp: {format(new Date(coll.expectedDate), 'MMM dd, yyyy')}</span> 
                      : format(new Date(coll.receivedDate), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">{coll.note}</td>
                  <td className="px-6 py-4">{account ? account.name : `ID: ${coll.accountId}`}</td>
                  <td className="px-6 py-4 text-slate-500">
                    {coll.amount.toLocaleString()} {coll.currency} {coll.currency !== 'JOD' ? `(@${coll.exchangeRate})` : ''}
                  </td>
                  <td className="px-6 py-4 font-bold text-emerald-600 flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700">Incoming</span>
                    <FormatCurrency amount={coll.amountInBase} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {coll.status === 'expected' && (user?.role === 'admin' || user?.permissions?.collections?.edit) && (
                      <button onClick={() => handleMarkReceived(coll.id)} className="text-emerald-600 hover:text-emerald-900 font-medium mr-3">Mark Received</button>
                    )}
                    {(user?.role === 'admin' || user?.permissions?.collections?.edit) && <button onClick={() => handleEditClick(coll)} className="text-sky-600 hover:text-sky-900 font-medium mr-3">Edit</button>}
                    {(user?.role === 'admin' || user?.permissions?.collections?.delete) && <button onClick={() => onDelete(coll.id)} className="text-rose-600 hover:text-rose-900 font-medium">Delete</button>}
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-slate-500">No collections found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function DeleteConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  loading 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onConfirm: () => void, 
  title: string,
  loading: boolean 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 transition-all">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-8">
          <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mb-6">
            <AlertTriangle className="w-7 h-7 text-rose-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">Delete {title}</h3>
          <p className="text-slate-600 leading-relaxed">Are you sure you want to delete this {title.toLowerCase()}? This action is permanent and cannot be undone.</p>
        </div>
        <div className="bg-slate-50/50 px-8 py-6 flex items-center justify-end gap-3 border-t border-slate-100">
          <button 
            disabled={loading}
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            disabled={loading}
            onClick={onConfirm}
            className="px-6 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-rose-200 active:scale-95 disabled:opacity-70"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              'Confirm Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default App




function UsersTab() {
  const { user } = useAuth();




  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState<any>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('user');
  const [permissions, setPermissions] = useState<any>({});

  const fetchUsers = async () => {
    try {
      const res = await apiFetch(API_URL + '/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      setUsers(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingUser ? API_URL + '/users/' + editingUser.id : API_URL + '/users';
      const method = editingUser ? 'PUT' : 'POST';
      const body: any = { email, name, role, permissions };
      if (password) body.password = password;
      
      const res = await apiFetch(url, { method, body: JSON.stringify(body) });
      if (!res.ok) throw new Error('Failed to save user');
      
      setEditingUser(null);
      setEmail(''); setPassword(''); setName(''); setRole('user'); setPermissions({});
      fetchUsers();
    } catch(err: any) {
      console.error("Save Error:", err);
      showError(err.message + (err.details ? ": " + err.details : ""));
    }
  };

  const handleEdit = (u: any) => {
    setEditingUser(u);
    setEmail(u.email);
    setName(u.name || '');
    setRole(u.role);
    setPermissions(u.permissions || {});
    setPassword('');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await apiFetch(API_URL + '/users/' + id, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      fetchUsers();
    } catch(err: any) {
      console.error("Save Error:", err);
      showError(err.message + (err.details ? ": " + err.details : ""));
    }
  };

  if (loading) return <div>Loading users...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">User Management</h1>
      
      {(user?.role === 'admin' || (editingUser ? user?.permissions?.users?.edit : user?.permissions?.users?.create)) && (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-w-4xl">
        <h2 className="text-lg font-bold mb-4">{editingUser ? 'Edit User' : 'Add User'}</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-slate-700">Full Name</label>
              <input required value={name} onChange={e=>setName(e.target.value)} className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-sky-500" placeholder="e.g. John Doe" />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-slate-700">Email Address</label>
              <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-sky-500" placeholder="e.g. john@example.com" />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-slate-700">Password {editingUser && <span className="text-slate-400 font-normal">(Leave blank to keep)</span>}</label>
              <input type="password" required={!editingUser} value={password} onChange={e=>setPassword(e.target.value)} className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-sky-500" placeholder="••••••••" />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-slate-700">User Role</label>
              <select value={role} onChange={e=>setRole(e.target.value)} className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-sky-500 bg-white">
                <option value="user">User (Restricted Access)</option>
                <option value="admin">Administrator (Full Access)</option>
              </select>
            </div>
          </div>
          
          {role !== 'admin' && (
            
            <div className="mt-4 overflow-x-auto">
              <label className="block text-sm font-medium mb-2">Permissions</label>
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-3 border-b border-slate-200">Module</th>
                    <th className="p-3 border-b border-slate-200 text-center">View</th>
                    <th className="p-3 border-b border-slate-200 text-center">Create</th>
                    <th className="p-3 border-b border-slate-200 text-center">Edit</th>
                    <th className="p-3 border-b border-slate-200 text-center">Delete</th>
                    <th className="p-3 border-b border-slate-200 text-center">Reminder</th>
                    <th className="p-3 border-b border-slate-200 text-center">All</th>
                  </tr>
                </thead>
                <tbody>
                  {['dashboard', 'reports', 'invoices', 'payments', 'cheques', 'expenses', 'collections', 'suppliers', 'accounts', 'users'].map((mod) => {
                    const modPerms = permissions[mod] || {};
                    const isAll = modPerms.view && modPerms.create && modPerms.edit && modPerms.delete && (mod === "invoices" ? modPerms.reminder : true);
                    
                    const handleToggleAll = (e: React.ChangeEvent<HTMLInputElement>) => {
                      const val = e.target.checked;
                      setPermissions({
                        ...permissions,
                        [mod]: { view: val, create: val, edit: val, delete: val, ...(mod === "invoices" ? { reminder: val } : {}) }
                      });
                    };

                    const handleToggleAction = (action: string, val: boolean) => {
                      setPermissions({
                        ...permissions,
                        [mod]: { ...modPerms, [action]: val }
                      });
                    };

                    return (
                      <tr key={mod} className="border-b border-slate-100">
                        <td className="p-3 capitalize font-medium">{mod}</td>
                        <td className="p-3 text-center">
                          <input type="checkbox" checked={!!modPerms.view} onChange={(e) => handleToggleAction('view', e.target.checked)} />
                        </td>
                        <td className="p-3 text-center">
                          {mod !== 'dashboard' && mod !== 'reports' && <input type="checkbox" checked={!!modPerms.create} onChange={(e) => handleToggleAction('create', e.target.checked)} />}
                        </td>
                        <td className="p-3 text-center">
                          {mod !== 'dashboard' && mod !== 'reports' && <input type="checkbox" checked={!!modPerms.edit} onChange={(e) => handleToggleAction('edit', e.target.checked)} />}
                        </td>
                        <td className="p-3 text-center">
                          {mod !== 'dashboard' && mod !== 'reports' && <input type="checkbox" checked={!!modPerms.delete} onChange={(e) => handleToggleAction('delete', e.target.checked)} />}
                        </td>
                        <td className="p-3 text-center">
                          {mod === 'invoices' && <input type="checkbox" checked={!!modPerms.reminder} onChange={(e) => handleToggleAction('reminder', e.target.checked)} />}
                        </td>
                        <td className="p-3 text-center border-l border-slate-100 bg-slate-50">
                          {mod !== 'dashboard' && mod !== 'reports' && <input type="checkbox" checked={!!isAll} onChange={handleToggleAll} />}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          )}

          <div className="flex gap-3 pt-4">
            {((user?.permissions?.users?.[user ? 'edit' : 'create'])) ? <button type="submit" className="bg-sky-600 text-white px-4 py-2 rounded font-medium">{editingUser ? 'Update' : 'Create'}</button> : null}
            {editingUser && <button type="button" onClick={() => setEditingUser(null)} className="bg-slate-200 px-4 py-2 rounded font-medium">Cancel</button>}
          </div>
        </form>
      </div>

      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50"><tr><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Role</th><th className="p-4">Actions</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t">
                <td className="p-4">{u.name}</td>
                <td className="p-4">{u.email}</td>
                <td className="p-4"><span className="bg-slate-100 px-2 py-1 rounded">{u.role}</span></td>
                <td className="p-4">
                  {(user?.role === 'admin' || user?.permissions?.users?.edit) && <button onClick={()=>handleEdit(u)} className="text-sky-600 hover:text-sky-900 font-medium mr-3">Edit</button>}
                  <button onClick={()=>handleDelete(u.id)} className="text-red-600 font-medium">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function getUser() {
  return JSON.parse(localStorage.getItem('user') || 'null');
}
function ChequesTab({ suppliers, accounts, cheques, onRefresh, onDelete }: { suppliers: Supplier[], accounts: Account[], cheques: Cheque[], onRefresh: () => void, onDelete: (id: number) => void }) {
  const [searchTerm, setSearchTerm] = useState("")
  const { user } = useAuth();
  
  const [amount, setAmount] = useState('')
  const [chequeDate, setChequeDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [accountId, setAccountId] = useState('')
  const [supplierId, setSupplierId] = useState('')
  const [invoiceId, setInvoiceId] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const handleAddCheque = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    try {
      const res = await apiFetch(`${API_URL}/cheques`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount, 
          chequeDate, 
          accountId, 
          supplierId: supplierId || null, 
          invoiceId: invoiceId || null 
        })
      })
      if (!res.ok) throw new Error('Failed to create cheque')
      setAmount('')
      setAccountId('')
      setSupplierId('')
      setInvoiceId('')
      onRefresh()
    } catch (err: any) {
      setFormError(err.message)
    }
  }

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const res = await apiFetch(`${API_URL}/cheques/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (!res.ok) throw new Error('Failed to update status')
      onRefresh()
    } catch (err: any) {
      showError(err.message)
    }
  }

  const filteredCheques = cheques.filter(c => {
    const sName = suppliers.find(s => s.id === c.supplierId)?.name || 'Generic'
    const accName = accounts.find(a => a.id === c.accountId)?.name || ''
    return searchTerm === '' || 
      sName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      accName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.amount.toString().includes(searchTerm)
  })

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Cheques</h1>
      </header>

      {(user?.role === 'admin' || user?.permissions?.cheques?.create) && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 max-w-4xl">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Issue New Cheque</h2>
          {formError && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {formError}
            </div>
          )}
          <form onSubmit={handleAddCheque} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount (JOD)</label>
              <input required type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cheque Date</label>
              <input required type="date" value={chequeDate} onChange={e => setChequeDate(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Account</label>
              <select required value={accountId} onChange={e => setAccountId(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-sky-500">
                <option value="">Select Account</option>
                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} (Bal: {acc.balance?.toLocaleString() || "0"})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Supplier (Optional)</label>
              <select value={supplierId} onChange={e => setSupplierId(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-sky-500">
                <option value="">No Supplier</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Invoice ID (Optional)</label>
              <input type="number" value={invoiceId} onChange={e => setInvoiceId(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-sky-500" placeholder="e.g. 123" />
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full bg-sky-600 text-white rounded-lg px-6 py-2 font-medium hover:bg-sky-700 transition-colors">Issue Cheque</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Cheque Registry</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search cheques..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500 w-64" />
          </div>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/50 text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-4">Due Date</th>
              <th className="px-6 py-4">Supplier</th>
              <th className="px-6 py-4">Account</th>
              <th className="px-6 py-4 text-right">Amount</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCheques.map(cheque => {
              const supplier = suppliers.find(s => s.id === cheque.supplierId)
              const account = accounts.find(a => a.id === cheque.accountId)
              const isOverdue = isBefore(startOfDay(new Date(cheque.chequeDate)), startOfDay(new Date())) && cheque.status === 'Pending'
              
              return (
                <tr key={cheque.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-700">{format(new Date(cheque.chequeDate), 'MMM dd, yyyy')}</span>
                      {isOverdue && <span className="text-[10px] font-bold text-rose-50 border border-rose-200 bg-rose-500 px-1 rounded inline-block w-fit mt-0.5">Overdue</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-medium">{supplier?.name || 'Generic'}</td>
                  <td className="px-6 py-4 text-slate-500">{account?.name || '-'}</td>
                  <td className="px-6 py-4 text-right font-bold text-slate-900"><FormatCurrency amount={cheque.amount} /></td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      cheque.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      cheque.status === 'Cleared' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {cheque.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {cheque.status === 'Pending' && (
                      <>
                        <button onClick={() => handleStatusChange(cheque.id, 'Cleared')} className="text-emerald-600 hover:text-emerald-800 text-xs font-bold px-2 py-1 bg-emerald-50 rounded border border-emerald-100">Clear</button>
                        <button onClick={() => handleStatusChange(cheque.id, 'Bounced')} className="text-rose-600 hover:text-rose-800 text-xs font-bold px-2 py-1 bg-rose-50 rounded border border-rose-100">Bounce</button>
                      </>
                    )}
                    {cheque.status !== 'Pending' && (
                      <button onClick={() => handleStatusChange(cheque.id, 'Pending')} className="text-slate-500 hover:text-slate-700 text-xs font-bold px-2 py-1 bg-slate-50 rounded border border-slate-100">Reset</button>
                    )}
                    {(user?.role === 'admin' || user?.permissions?.cheques?.delete) && (
                      <button onClick={() => onDelete(cheque.id)} className="text-rose-400 hover:text-rose-600 ml-2"><AlertCircle className="w-4 h-4 inline" /></button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}


function ExpensesTab({ accounts, expenses, onRefresh, onDelete }: { accounts: Account[], expenses: Expense[], onRefresh: () => void, onDelete: (id: number) => void }) {
  const { user } = useAuth()
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [accountId, setAccountId] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [note, setNote] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    try {
      const res = await apiFetch(`${API_URL}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, amount: parseFloat(amount), accountId, date, note })
      })
      if (!res.ok) throw new Error('Failed to add expense')
      setCategory('')
      setAmount('')
      setAccountId('')
      setNote('')
      onRefresh()
    } catch (err: any) {
      setFormError(err.message)
    }
  }

  const filteredExpenses = expenses.filter(exp => 
    exp.category.toLowerCase().includes(searchTerm.toLowerCase()) || 
    exp.note?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const categories = ['Rent', 'Fuel', 'Salary', 'Maintenance', 'Electricity', 'Water', 'Internet', 'Office Supplies', 'Marketing', 'Taxes', 'Other']

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Expenses</h1>
      </header>

      {(user?.role === 'admin' || user?.permissions?.expenses?.create) && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 max-w-4xl">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Record New Expense</h2>
          {formError && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {formError}
            </div>
          )}
          <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select required value={category} onChange={e => setCategory(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-sky-500">
                <option value="">Select Category</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount (JOD)</label>
              <input required type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Account</label>
              <select required value={accountId} onChange={e => setAccountId(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-sky-500">
                <option value="">Select Account</option>
                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} (Bal: {acc.balance?.toLocaleString() || "0"})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input required type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Note (Optional)</label>
              <input type="text" value={note} onChange={e => setNote(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-sky-500" placeholder="e.g. Monthly rent for office" />
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full bg-rose-600 text-white rounded-lg px-6 py-2 font-medium hover:bg-rose-700 transition-colors">Record Expense</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Expense Registry</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search expenses..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500 w-64" />
          </div>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/50 text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Account</th>
              <th className="px-6 py-4">Note</th>
              <th className="px-6 py-4 text-right">Amount</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredExpenses.map(expense => {
              const account = accounts.find(a => a.id === expense.accountId)
              return (
                <tr key={expense.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-slate-700">{format(new Date(expense.date), 'MMM dd, yyyy')}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{expense.category}</td>
                  <td className="px-6 py-4 text-slate-500">{account?.name || '-'}</td>
                  <td className="px-6 py-4 text-slate-500 max-w-xs truncate">{expense.note || '-'}</td>
                  <td className="px-6 py-4 text-right font-bold text-rose-600"><FormatCurrency amount={expense.amount} /></td>
                  <td className="px-6 py-4 text-right">
                    {(user?.role === 'admin' || user?.permissions?.expenses?.delete) && (
                      <button onClick={() => onDelete(expense.id)} className="text-rose-400 hover:text-rose-600 ml-2"><AlertCircle className="w-4 h-4 inline" /></button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
