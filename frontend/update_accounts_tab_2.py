path = r'c:\\Users\\DELL\\.gemini\\antigravity\\brain\\1e70835b-96e1-481b-8a66-641bd45c1cc5\\cash-flow-system\\frontend\\src\\App.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the table row for Adjustments
old_row = """                  <td className="px-6 py-4">
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
                  </td>"""

new_row = """                  <td className="px-6 py-4">
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
                  </td>"""

content = content.replace(old_row, new_row)

# 2. Add ReconcileModal call at the end of the return statement of AccountsTab
# I'll find the last </div> of the selectedAccount view
# Actually it's easier to add it before the last </div> of the whole component return
content = content.replace('    </div>\n    );\n  }\n\n  return (', '      <ReconcileModal isOpen={isReconcileOpen} onClose={() => setIsReconcileOpen(false)} onConfirm={handleReconcileConfirm} currentBalance={selectedAccount.balance} />\n    </div>\n    );\n  }\n\n  return (')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
