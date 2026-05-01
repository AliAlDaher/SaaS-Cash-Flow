const fs = require('fs');

// vite.config.ts
const viteConfigPath = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/vite.config.ts';
const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
`;
fs.writeFileSync(viteConfigPath, viteConfig, 'utf8');

// index.css
const cssPath = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/index.css';
const cssContent = `@import "tailwindcss";`;
fs.writeFileSync(cssPath, cssContent, 'utf8');

// App.tsx
const appPath = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx';
const appContent = `import { useEffect, useState } from 'react'
import { Activity, Users, FileText, CheckCircle, AlertCircle, Clock } from 'lucide-react'

// Types
type Supplier = {
  id: number
  name: string
  priority: number
  createdAt: string
}

type Invoice = {
  id: number
  supplierId: number
  amount: number
  paidAmount: number
  dueDate: string
  createdAt: string
  supplier?: Supplier
}

const API_URL = 'http://localhost:3001'

function App() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [suppliersRes, invoicesRes] = await Promise.all([
          fetch(\`\${API_URL}/suppliers\`),
          fetch(\`\${API_URL}/invoices\`)
        ])

        if (!suppliersRes.ok || !invoicesRes.ok) {
          throw new Error('Failed to fetch data')
        }

        const suppliersData = await suppliersRes.json()
        const invoicesData = await invoicesRes.json()

        setSuppliers(suppliersData)
        setInvoices(invoicesData)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-indigo-500 rounded-full mb-4"></div>
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
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0)
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0)
  const totalRemaining = totalAmount - totalPaid

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Cash Flow Dashboard</h1>
            <p className="text-slate-500 mt-1">Manage your suppliers and invoices</p>
          </div>
          <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center">
            <Activity className="text-indigo-600 w-6 h-6" />
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard title="Total Suppliers" value={suppliers.length} icon={<Users className="w-5 h-5 text-blue-500" />} />
          <StatCard title="Total Invoices" value={invoices.length} icon={<FileText className="w-5 h-5 text-indigo-500" />} />
          <StatCard title="Total Amount" value={\`$$\${totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}\`} icon={<span className="text-emerald-500 font-bold">$</span>} />
          <StatCard title="Total Paid" value={\`$$\${totalPaid.toLocaleString(undefined, {minimumFractionDigits: 2})}\`} icon={<CheckCircle className="w-5 h-5 text-teal-500" />} />
          <StatCard title="Total Remaining" value={\`$$\${totalRemaining.toLocaleString(undefined, {minimumFractionDigits: 2})}\`} icon={<Clock className="w-5 h-5 text-amber-500" />} />
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Suppliers Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden lg:col-span-1">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Suppliers</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/50 text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {suppliers.map(supplier => (
                    <tr key={supplier.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-700">{supplier.name}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                          {supplier.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {suppliers.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-6 py-8 text-center text-slate-500">No suppliers found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden lg:col-span-2">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Recent Invoices</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/50 text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Supplier</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Paid</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map(invoice => {
                    const isPaid = invoice.paidAmount >= invoice.amount
                    const isPartial = invoice.paidAmount > 0 && invoice.paidAmount < invoice.amount
                    const supplierName = suppliers.find(s => s.id === invoice.supplierId)?.name || \`ID: \${invoice.supplierId}\`
                    
                    return (
                      <tr key={invoice.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-slate-500">#{invoice.id}</td>
                        <td className="px-6 py-4 font-medium text-slate-700">{supplierName}</td>
                        <td className="px-6 py-4">$\${invoice.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                        <td className="px-6 py-4">$\${invoice.paidAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                        <td className="px-6 py-4">
                          {isPaid ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Paid
                            </span>
                          ) : isPartial ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                              Partial
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                              Unpaid
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                  {invoices.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No invoices found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between">
      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
      <div className="bg-slate-50 p-3 rounded-xl">
        {icon}
      </div>
    </div>
  )
}

export default App
`;
fs.writeFileSync(appPath, appContent, 'utf8');