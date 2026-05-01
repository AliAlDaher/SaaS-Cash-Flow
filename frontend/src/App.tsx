import { useEffect, useState } from 'react'
import { Activity, FileText, CheckCircle, AlertCircle, Clock, CreditCard, AlertTriangle, Landmark, TrendingUp, Wallet, ArrowLeft } from 'lucide-react'
import { format, startOfDay, addDays, isBefore, isEqual } from 'date-fns'
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom'
import Login from './Login'
import { ReportsTab } from './ReportsTab'

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
  createdAt: string
  supplier?: Supplier
}

type Payment = {
  id: number
  supplierId: number
  accountId: number
  amount: number
  paymentDate: string
  createdAt: string
  account?: Account
}

type Account = {
  id: number
  name: string
  type: string
  balance: number
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



const API_URL = 'http://localhost:3001'

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
  return res;
};



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        />
        </Routes>
    </BrowserRouter>
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true);
      const fetchIfPermitted = async (module: string, endpoint: string) => {
        if (user?.role === 'admin' || user?.permissions?.[module]?.view) {
          const res = await apiFetch(`${API_URL}${endpoint}`);
          if (!res.ok) throw new Error(`Failed to fetch ${module}`);
          return res.json();
        }
        return [];
      };

      const [suppliersRes, invoicesRes, paymentsRes, accountsRes, collectionsRes] = await Promise.all([
        fetchIfPermitted('suppliers', '/suppliers'),
        fetchIfPermitted('invoices', '/invoices'),
        fetchIfPermitted('payments', '/payments'),
        fetchIfPermitted('accounts', '/accounts'),
        fetchIfPermitted('collections', '/collections')
      ]);

      setSuppliers(suppliersRes);
      setInvoices(invoicesRes);
      setPayments(paymentsRes);
      setAccounts(accountsRes);
      setCollections(collectionsRes);
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
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || `Failed to delete ${deleteModal.title}`)
      }
      setSuccessMessage(`${deleteModal.title} deleted successfully`)
      setDeleteModal({ ...deleteModal, isOpen: false })
      fetchData()
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      alert(err.message)
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
  if (user?.permissions?.dashboard?.view) tabs.push({ name: 'Dashboard', path: '/' });
  if (user?.permissions?.reports?.view) tabs.push({ name: 'Reports', path: '/reports' });
  if (user?.permissions?.accounts?.view) tabs.push({ name: 'Accounts', path: '/accounts' });
  if (user?.permissions?.collections?.view) tabs.push({ name: 'Collections', path: '/collections' });
  if (user?.permissions?.suppliers?.view) tabs.push({ name: 'Suppliers', path: '/suppliers' });
  if (user?.permissions?.invoices?.view) tabs.push({ name: 'Invoices', path: '/invoices' });
  if (user?.permissions?.payments?.view) tabs.push({ name: 'Payments', path: '/payments' });
  if (user?.permissions?.users?.view) tabs.push({ name: 'Users', path: '/users' });

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Activity className="text-sky-600 w-8 h-8 mr-3" />
              <span className="text-xl font-bold text-slate-800 tracking-tight">CashFlow</span>
            </div>
            <div className="flex space-x-8">
              
              {tabs.map((tab) => {
                const isActive = location.pathname === tab.path
                return (
                  <Link
                    key={tab.name}
                    to={tab.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border-sky-500 text-sky-600'
                        : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                    }`}
                  >
                    {tab.name}
                  </Link>
                )
              })}
              <button
                onClick={() => {
                  localStorage.clear();
                  navigate('/login');
                }}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 transition-colors ml-4 self-center"
              >
                Logout
              </button>

            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 mt-8">
        <Routes>
          <Route path="/" element={user?.permissions?.dashboard?.view ? <DashboardTab suppliers={suppliers} invoices={invoices} accounts={accounts} collections={collections} /> : <AccessDenied />} />
          <Route path="/reports" element={user?.permissions?.reports?.view ? <ReportsTab invoices={invoices} payments={payments} collections={collections} suppliers={suppliers} accounts={accounts} /> : <AccessDenied />} />
          <Route path="/accounts" element={user?.permissions?.accounts?.view ? <AccountsTab accounts={accounts} onRefresh={fetchData} onDelete={(id) => openDeleteModal(id, 'accounts', 'Account')}  /> : <AccessDenied />} />
          <Route path="/collections" element={user?.permissions?.collections?.view ? <CollectionsTab accounts={accounts} collections={collections} onRefresh={fetchData} onDelete={(id) => openDeleteModal(id, 'collections', 'Collection')}  /> : <AccessDenied />} />
          <Route path="/suppliers" element={user?.permissions?.suppliers?.view ? <SuppliersTab suppliers={suppliers} invoices={invoices} onRefresh={fetchData} onDelete={(id) => openDeleteModal(id, 'suppliers', 'Supplier')}  /> : <AccessDenied />} />
          <Route path="/invoices" element={user?.permissions?.invoices?.view ? <InvoicesTab suppliers={suppliers} invoices={invoices} onRefresh={fetchData} onDelete={(id) => openDeleteModal(id, 'invoices', 'Invoice')}  /> : <AccessDenied />} />
          <Route path="/payments" element={user?.permissions?.payments?.view ? <PaymentsTab suppliers={suppliers} payments={payments} accounts={accounts} onRefresh={fetchData} onDelete={(id) => openDeleteModal(id, 'payments', 'Payment')}  /> : <AccessDenied />} />
          <Route path="/users" element={user?.permissions?.users?.view ? <UsersTab /> : <AccessDenied />} />
        </Routes>
      </main>

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

function FormatCurrency({ amount }: { amount: number }) {
  return (
    <span>
      {amount.toLocaleString(undefined, {minimumFractionDigits: 2})} <span className="text-[0.65em] opacity-60 ml-0.5">JOD</span>
    </span>
  )
}


function DashboardTab({ suppliers, invoices, accounts, collections }: { suppliers: Supplier[], invoices: Invoice[], accounts: Account[], collections: Collection[] }) {
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0)
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0)
  const totalRemaining = totalAmount - totalPaid
  const totalCash = accounts.reduce((sum, acc) => sum + acc.balance, 0)
  const totalExpected = collections.filter(c => c.status === 'expected').reduce((sum, c) => sum + c.amountInBase, 0)

  // --- Upcoming & Overdue Payments Logic ---
  const today = startOfDay(new Date())
  const threeWeeksFromNow = addDays(today, 21)
  

  // Total Due (Today)
  const totalDueToday = invoices.reduce((sum, inv) => {
    const due = startOfDay(new Date(inv.dueDate))
    // due <= today
    if (!isBefore(today, due)) {
      return sum + Math.max(0, inv.amount - inv.paidAmount)
    }
    return sum
  }, 0)

  const unpaidInvoices = invoices.filter(inv => inv.amount > inv.paidAmount)
  const scopeInvoices = unpaidInvoices.filter(inv => {
    const due = new Date(inv.dueDate)
    return isBefore(due, today) || !isBefore(threeWeeksFromNow, due)
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
    remainingAmount: number
    isGrouped: boolean
    statusClass: string
    statusLabel: string
    textColor: string
    isPartial?: boolean
  }

  const upcomingRows: DisplayRow[] = []

  Object.entries(supplierGroups).forEach(([supplierIdStr, supsInvoices]) => {
    const supplierId = parseInt(supplierIdStr)
    const supplierName = suppliers.find(s => s.id === supplierId)?.name || `Supplier ${supplierId}`
    
    const overdueInvoices = supsInvoices.filter(inv => isBefore(startOfDay(new Date(inv.dueDate)), today))
    const upcomingInvs = supsInvoices.filter(inv => !isBefore(startOfDay(new Date(inv.dueDate)), today))

    if (overdueInvoices.length > 1) {
      const totalRemaining = overdueInvoices.reduce((sum, inv) => sum + (inv.amount - inv.paidAmount), 0)
      const totalPaid = overdueInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0)
      const earliestDueDate = overdueInvoices.reduce((earliest, inv) => {
        const due = new Date(inv.dueDate)
        return isBefore(due, earliest) ? due : earliest
      }, new Date(overdueInvoices[0].dueDate))
      
      upcomingRows.push({
        id: `group-overdue-${supplierId}`,
        supplierName,
        dueDate: earliestDueDate,
        remainingAmount: totalRemaining,
        isGrouped: true,
        statusClass: "bg-rose-50 text-rose-700 border-rose-200",
        statusLabel: "Overdue",
        textColor: "text-rose-600 font-bold",
        isPartial: totalPaid > 0
      })
    } else if (overdueInvoices.length === 1) {
      const inv = overdueInvoices[0]
      const due = new Date(inv.dueDate)
      upcomingRows.push({
        id: `inv-${inv.id}`,
        supplierName,
        dueDate: due,
        remainingAmount: inv.amount - inv.paidAmount,
        isGrouped: false,
        statusClass: "bg-rose-50 text-rose-700 border-rose-200",
        statusLabel: "Overdue",
        textColor: "text-rose-600 font-bold",
        isPartial: inv.paidAmount > 0
      })
    }

    upcomingInvs.forEach(inv => {
      const due = new Date(inv.dueDate)
      const remainingAmount = inv.amount - inv.paidAmount
      
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
        supplierName,
        dueDate: due,
        remainingAmount,
        isGrouped: false,
        statusClass,
        statusLabel,
        textColor,
        isPartial: inv.paidAmount > 0
      })
    })
  })

  upcomingRows.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())

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
            <h2 className="text-lg font-bold text-slate-800">Upcoming & Overdue Payments (3 Weeks)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Supplier</th>
                  <th className="px-6 py-4 whitespace-nowrap">Due Date</th>
                  <th className="px-6 py-4 whitespace-nowrap text-right">Remaining Amount</th>
                  <th className="px-6 py-4 whitespace-nowrap">Due Status</th>
                  <th className="px-6 py-4 whitespace-nowrap">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {upcomingRows.map(row => (
                  <tr key={row.id} className={`hover:bg-slate-50/50 transition-colors`}>
                    <td className={`px-6 py-4 font-medium ${row.textColor}`}>{row.supplierName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">{format(row.dueDate, 'MMM dd, yyyy')}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-right font-bold ${row.textColor}`}>
                      <FormatCurrency amount={row.remainingAmount} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${row.statusClass}`}>
                        {row.statusLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {row.isPartial ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                          Partial
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                          Unpaid
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {upcomingRows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No upcoming or overdue payments!</td>
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
            <InvoiceTable invoices={invoices.slice(0, 5)} suppliers={suppliers} />
          </div>
        </div>
        
      </div>
    </div>
  )
}

function SuppliersTab({ suppliers, invoices, onRefresh, onDelete }: { suppliers: Supplier[], invoices: Invoice[], onRefresh: () => void, onDelete: (id: number) => void }) {
  const { user } = useAuth();

  const [newSupplierName, setNewSupplierName] = useState('')
  const [newSupplierPriority, setNewSupplierPriority] = useState(1)
  const [newSupplierPaymentTerms, setNewSupplierPaymentTerms] = useState(0)
  const [editSupplierId, setEditSupplierId] = useState<number | null>(null)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)

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
      await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSupplierName, priority: newSupplierPriority, paymentTermDays: newSupplierPaymentTerms })
      })
      handleCancelEdit()
      onRefresh()
    } catch (err) {
      console.error(err)
    }
  }

  if (selectedSupplier) {
    const supplierInvoices = invoices.filter(inv => inv.supplierId === selectedSupplier.id)
    const totalInvoicesCount = supplierInvoices.length;
    const totalAmount = supplierInvoices.reduce((acc, inv) => acc + inv.amount, 0);
    const totalPaid = supplierInvoices.reduce((acc, inv) => acc + inv.paidAmount, 0);
    const remaining = totalAmount - totalPaid;

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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <InvoiceTable invoices={supplierInvoices} suppliers={suppliers} showDescription={true} />
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
            {suppliers.map(supplier => (
              <tr key={supplier.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-slate-500">#{supplier.id}</td>
                <td className="px-6 py-4 font-medium text-slate-700">{supplier.name}</td>
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
            {suppliers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No suppliers found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function InvoicesTab({ suppliers, invoices, onRefresh, onDelete }: { suppliers: Supplier[], invoices: Invoice[], onRefresh: () => void, onDelete?: (id: number) => void }) {
  const { user } = useAuth();

  const [newInvoiceSupplierId, setNewInvoiceSupplierId] = useState('')
  const [newInvoiceAmount, setNewInvoiceAmount] = useState('')
  const [newInvoiceDate, setNewInvoiceDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [newInvoiceDescription, setNewInvoiceDescription] = useState('')
  const [editInvoiceId, setEditInvoiceId] = useState<number | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [filterSupplierId, setFilterSupplierId] = useState<string>('')

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
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save invoice')
      }
      handleCancelEdit()
      onRefresh()
    } catch (err: any) {
      setFormError(err.message)
      console.error(err)
    }
  }

  const filteredInvoices = filterSupplierId ? invoices.filter(inv => inv.supplierId.toString() === filterSupplierId) : invoices;

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
            {((user?.permissions?.invoices?.[user ? 'edit' : 'create'])) ? <button type="submit" className="w-full sm:w-auto bg-emerald-600 text-white rounded-lg px-6 py-2 font-medium hover:bg-emerald-700 transition-colors">{editInvoiceId ? 'Update Invoice' : 'Add Invoice'}</button> : null}
            {editInvoiceId && <button type="button" onClick={handleCancelEdit} className="w-full sm:w-auto bg-slate-100 text-slate-700 rounded-lg px-6 py-2 font-medium hover:bg-slate-200 transition-colors">Cancel</button>}
          </div>
        </form>
      </div>

      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800">All Invoices</h2>
        <select value={filterSupplierId} onChange={e => setFilterSupplierId(e.target.value)} className="border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-sky-500 bg-white min-w-[200px]">
          <option value="">All Suppliers</option>
          {suppliers.map(s => <option key={s.id} value={s.id.toString()}>{s.name}</option>)}
        </select>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <InvoiceTable invoices={filteredInvoices} suppliers={suppliers} showDescription={true} onEditClick={(user?.role === 'admin' || user?.permissions?.invoices?.edit) ? handleEditClick : undefined} onDeleteClick={(user?.role === 'admin' || user?.permissions?.invoices?.delete) ? onDelete : undefined} />
      </div>
    </div>
  )
}

function PaymentsTab({ suppliers, payments, accounts, onRefresh, onDelete }: { suppliers: Supplier[], payments: Payment[], accounts: Account[], onRefresh: () => void, onDelete: (id: number) => void }) {
  const { user } = useAuth();

  const [paymentSupplierId, setPaymentSupplierId] = useState('')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [paymentAccountId, setPaymentAccountId] = useState('')
  const [editPaymentId, setEditPaymentId] = useState<number | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

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
    
    if (!editPaymentId && acc && pAmount > acc.balance) {
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
          paymentDate: paymentDate 
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
        <form onSubmit={handleAddPayment} className="space-y-4">
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
                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} (Bal: {acc.balance.toLocaleString()})</option>)}
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

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Payment History</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/50 text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Supplier</th>
              <th className="px-6 py-4">Account</th>
              <th className="px-6 py-4 whitespace-nowrap text-right">Amount</th>
              <th className="px-6 py-4 whitespace-nowrap">Payment Date</th>
              <th className="px-6 py-4 whitespace-nowrap text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments.map(payment => {
              const supplierName = suppliers.find(s => s.id === payment.supplierId)?.name || `ID: ${payment.supplierId}`
              const accountName = payment.accountId ? (accounts.find(a => a.id === payment.accountId)?.name || `ID: ${payment.accountId}`) : '-'
              return (
                <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-slate-500">#{payment.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-700">{supplierName}</td>
                  <td className="px-6 py-4 text-slate-500">{accountName}</td>
                  <td className="px-6 py-4 font-bold text-rose-600 flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-700">Outgoing</span>
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
            {payments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No payments found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function InvoiceTable({ invoices, suppliers, showDescription = false, onEditClick, onDeleteClick }: { invoices: Invoice[], suppliers: Supplier[], showDescription?: boolean, onEditClick?: (inv: Invoice) => void, onDeleteClick?: (id: number) => void }) {
  return (
    <table className="w-full text-left text-sm">
      <thead className="bg-slate-50/50 text-slate-500 font-medium">
        <tr>
          <th className="px-6 py-4">ID</th>
          <th className="px-6 py-4">Supplier</th>
          {showDescription && <th className="px-6 py-4">Description / Invoice No.</th>}
          <th className="px-6 py-4 whitespace-nowrap">Invoice Date</th>
          <th className="px-6 py-4 whitespace-nowrap text-right">Amount</th>
          <th className="px-6 py-4 whitespace-nowrap">Due Date</th>
          <th className="px-6 py-4 whitespace-nowrap">Due Status</th>
          <th className="px-6 py-4 whitespace-nowrap">Payment Status</th>
          {onEditClick && <th className="px-6 py-4 whitespace-nowrap text-right">Actions</th>}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {invoices.map(invoice => {
          const isPaid = invoice.paidAmount >= invoice.amount
          const isPartial = invoice.paidAmount > 0 && invoice.paidAmount < invoice.amount
          const supplierName = suppliers.find(s => s.id === invoice.supplierId)?.name || `ID: ${invoice.supplierId}`
          const due = startOfDay(new Date(invoice.dueDate));
          const todayDate = startOfDay(new Date());
          let dueStatus = 'Upcoming';
          let dueClass = 'bg-slate-50 text-slate-700 border-slate-200';

          if (isPaid) {
            dueStatus = '-';
            dueClass = 'bg-slate-50 text-slate-400 border-slate-100';
          } else if (isBefore(due, todayDate)) {
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
              <td className="px-6 py-4 font-medium text-slate-700">{supplierName}</td>
              {showDescription && (
                <td className="px-6 py-4 text-slate-600 truncate max-w-xs" title={invoice.description}>
                  {invoice.description || '-'}
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap text-slate-600">{invoice.invoiceDate ? format(new Date(invoice.invoiceDate), 'MMM dd, yyyy') : '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <FormatCurrency amount={invoice.amount} />
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
              {onEditClick && (
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button onClick={() => onEditClick(invoice)} className="text-sky-600 hover:text-sky-900 font-medium text-sm mr-4">Edit</button>
                  {onDeleteClick && <button onClick={() => onDeleteClick(invoice.id)} className="text-rose-600 hover:text-rose-900 font-medium text-sm">Delete</button>}
                </td>
              )}
            </tr>
          )
        })}
        {invoices.length === 0 && (
          <tr>
            <td colSpan={showDescription ? (onEditClick ? 9 : 8) : 8} className="px-6 py-8 text-center text-slate-500">No invoices found</td>
          </tr>
        )}
      </tbody>
    </table>
  )
}

function AccountsTab({ accounts, onRefresh, onDelete }: { accounts: Account[], onRefresh: () => void, onDelete: (id: number) => void }) {
  const { user } = useAuth();

  const [name, setName] = useState('')
  const [type, setType] = useState('Bank')

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
            {accounts.map(acc => (
              <tr key={acc.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-slate-500">#{acc.id}</td>
                <td className="px-6 py-4 font-medium text-slate-700">
                  <div className="flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-slate-400" /> {acc.name}
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
                  {(user?.role === 'admin' || user?.permissions?.accounts?.delete) && <button onClick={() => onDelete(acc.id)} className="text-rose-600 hover:text-rose-900 font-medium">Delete</button>}
                </td>
              </tr>
            ))}
            {accounts.length === 0 && (
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

function CollectionsTab({ accounts, collections, onRefresh, onDelete }: { accounts: Account[], collections: Collection[], onRefresh: () => void, onDelete: (id: number) => void }) {
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
      alert(err.message);
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

      <div className="mb-4 flex gap-2">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === 'all' ? 'bg-sky-100 text-sky-700' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>All</button>
        <button onClick={() => setFilter('expected')} className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === 'expected' ? 'bg-orange-100 text-orange-700' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Expected</button>
        <button onClick={() => setFilter('received')} className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === 'received' ? 'bg-emerald-100 text-emerald-700' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Received</button>
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
            {collections.filter(c => filter === 'all' || c.status === filter).map(coll => {
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
            {collections.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-500">No collections found</td>
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
      alert(err.message);
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
      alert(err.message);
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input required value={name} onChange={e=>setName(e.target.value)} className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password {editingUser && '(Leave blank to keep current)'}</label>
              <input type="password" required={!editingUser} value={password} onChange={e=>setPassword(e.target.value)} className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select value={role} onChange={e=>setRole(e.target.value)} className="w-full border rounded p-2">
                <option value="user">User</option>
                <option value="admin">Admin</option>
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
                    <th className="p-3 border-b border-slate-200 text-center">All</th>
                  </tr>
                </thead>
                <tbody>
                  {['dashboard', 'reports', 'invoices', 'payments', 'collections', 'suppliers', 'accounts', 'users'].map((mod) => {
                    const modPerms = permissions[mod] || {};
                    const isAll = modPerms.view && modPerms.create && modPerms.edit && modPerms.delete;
                    
                    const handleToggleAll = (e: React.ChangeEvent<HTMLInputElement>) => {
                      const val = e.target.checked;
                      setPermissions({
                        ...permissions,
                        [mod]: { view: val, create: val, edit: val, delete: val }
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
