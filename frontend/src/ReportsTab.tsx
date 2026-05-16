import { Decimal } from 'decimal.js';
import React, { useState } from 'react';
import { format, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import { Wallet, TrendingUp, Clock } from 'lucide-react';

function StatCard({ title, value, icon, valueColor }: { title: string, value: React.ReactNode, icon: React.ReactNode, valueColor?: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between">
      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
        <p className={`text-2xl font-bold ${valueColor || "text-slate-800"}`}>{value}</p>
      </div>
      <div className="bg-slate-50 p-3 rounded-xl">
        {icon}
      </div>
    </div>
  )
}

function FormatCurrency({ amount }: { amount: any }) {
  return (
    <span>
      {new Decimal(amount || 0).toNumber().toLocaleString(undefined, {minimumFractionDigits: 2})} <span className="text-[0.65em] opacity-60 ml-0.5">JOD</span>
    </span>
  )
}

export function ReportsTab({ invoices, payments, collections, suppliers, accounts, onSupplierClick }: any) {
  const [fromDate, setFromDate] = useState(format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const filteredInvoices = invoices.filter((i: any) => {
    const d = new Date(i.invoiceDate);
    return !isBefore(d, startOfDay(new Date(fromDate))) && !isAfter(d, endOfDay(new Date(toDate)));
  }).sort((a: any, b: any) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());

  const filteredPayments = payments.filter((p: any) => {
    const d = new Date(p.paymentDate);
    return !isBefore(d, startOfDay(new Date(fromDate))) && !isAfter(d, endOfDay(new Date(toDate)));
  }).sort((a: any, b: any) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

  const filteredCollections = collections.filter((c: any) => {
    const d = new Date(c.receivedDate);
    return !isBefore(d, startOfDay(new Date(fromDate))) && !isAfter(d, endOfDay(new Date(toDate)));
  }).sort((a: any, b: any) => new Date(b.receivedDate).getTime() - new Date(a.receivedDate).getTime());


    const totalIncoming = filteredCollections.filter((c: any) => c.status === 'received').reduce((sum: any, c: any) => sum.plus(new Decimal(c.amountInBase)), new Decimal(0)).toNumber();
  const totalOutgoing = filteredPayments.reduce((sum: any, p: any) => sum.plus(new Decimal(p.amount)), new Decimal(0)).toNumber();

  let totalAdjustments = 0;
  if (accounts) {
    accounts.forEach((acc: any) => {
      if (acc.adjustments) {
        acc.adjustments.forEach((adj: any) => {
          const d = new Date(adj.createdAt || adj.date);
          if (!isBefore(d, startOfDay(new Date(fromDate))) && !isAfter(d, endOfDay(new Date(toDate)))) {
            totalAdjustments = new Decimal(totalAdjustments).plus(new Decimal(adj.amount)).toNumber();
          }
        });
      }
    });
  }

  const netCash = new Decimal(totalIncoming).minus(totalOutgoing).plus(totalAdjustments).toNumber();
  const expectedCollections = filteredCollections.filter((c: any) => c.status === 'expected').reduce((sum: any, c: any) => sum.plus(new Decimal(c.amountInBase)), new Decimal(0)).toNumber();

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Financial Reports</h1>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">From</label>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="border border-slate-300 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-sky-500" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">To</label>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="border border-slate-300 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-sky-500" />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Incoming (Collections)" value={<FormatCurrency amount={totalIncoming} />} icon={<TrendingUp className="w-5 h-5 text-emerald-500" />} valueColor="text-emerald-600" />
        <StatCard title="Total Outgoing (Payments)" value={<FormatCurrency amount={totalOutgoing} />} icon={<TrendingUp className="w-5 h-5 text-rose-500 transform rotate-180" />} valueColor="text-rose-600" />
        <StatCard title="Net Cash" value={<FormatCurrency amount={netCash} />} icon={<Wallet className="w-5 h-5 text-sky-500" />} valueColor={netCash >= 0 ? "text-sky-600" : "text-rose-600"} />
        <StatCard title="Expected Collections" value={<FormatCurrency amount={expectedCollections} />} icon={<Clock className="w-5 h-5 text-orange-500" />} valueColor="text-orange-600" />
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">Recent Collections (Incoming)</h2>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Note</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCollections.map((c: any) => (
                <tr key={c.id}>
                  <td className="px-6 py-4">{format(new Date(c.receivedDate), 'MMM dd, yyyy')}</td>
                  <td className="px-6 py-4">{c.note} {c.status === 'expected' ? '(Expected)' : ''}</td>
                  <td className="px-6 py-4 text-right font-bold text-emerald-600"><FormatCurrency amount={c.amountInBase} /></td>
                </tr>
              ))}
              {filteredCollections.length === 0 && <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">No collections in this period</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">Recent Payments (Outgoing)</h2>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Supplier</th>
                <th className="px-6 py-4">Applied To</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map((p: any) => (
                <tr key={p.id}>
                  <td className="px-6 py-4">{format(new Date(p.paymentDate), 'MMM dd, yyyy')}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => {
                        const s = suppliers.find((sup: any) => sup.id === p.supplierId);
                        if (s && onSupplierClick) onSupplierClick(s);
                      }}
                      className="hover:text-sky-600 hover:underline transition-colors text-left"
                    >
                      {suppliers.find((s:any)=>s.id===p.supplierId)?.name || p.supplierId}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    {p.invoiceId ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-100">
                        Inv #{p.invoiceId}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-50 text-slate-500 border border-slate-100">
                        FIFO
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-rose-600"><FormatCurrency amount={p.amount} /></td>
                </tr>
              ))}
              {filteredPayments.length === 0 && <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">No payments in this period</td></tr>}
            </tbody>
          </table>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">Recent Invoices</h2>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Supplier</th>
                <th className="px-6 py-4">Applied To</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((i: any) => (
                <tr key={i.id}>
                  <td className="px-6 py-4">{format(new Date(i.invoiceDate), 'MMM dd, yyyy')}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => {
                        const s = suppliers.find((sup: any) => sup.id === i.supplierId);
                        if (s && onSupplierClick) onSupplierClick(s);
                      }}
                      className="hover:text-sky-600 hover:underline transition-colors text-left"
                    >
                      {suppliers.find((s:any)=>s.id===i.supplierId)?.name || i.supplierId}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right"><FormatCurrency amount={i.amount} /></td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">No invoices in this period</td></tr>}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}
