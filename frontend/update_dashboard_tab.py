path = r'c:\\Users\\DELL\\.gemini\\antigravity\\brain\\1e70835b-96e1-481b-8a66-641bd45c1cc5\\cash-flow-system\\frontend\\src\\App.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update DashboardTab props
old_dash_props = 'function DashboardTab({ suppliers, invoices, accounts, collections, onSupplierClick, onToggleReminder }: { suppliers: Supplier[], invoices: Invoice[], accounts: Account[], collections: Collection[], onSupplierClick?: (s: Supplier) => void, onToggleReminder: (id: number, r: boolean, a?: number) => Promise<void> }) {'

new_dash_props = 'function DashboardTab({ suppliers, invoices, accounts, collections, onSupplierClick, onToggleReminder, onQuickPay }: { suppliers: Supplier[], invoices: Invoice[], accounts: Account[], collections: Collection[], onSupplierClick?: (s: Supplier) => void, onToggleReminder: (id: number, r: boolean, a?: number) => Promise<void>, onQuickPay?: (inv: Invoice) => void }) {'

content = content.replace(old_dash_props, new_dash_props)

# 2. Update Header: change "Pay Now" to "Select" and add "Actions"
old_header = """                  <th className="px-6 py-4">Supplier</th>
                  <th className="px-6 py-4 text-center">Pay Now</th>
                  <th className="px-6 py-4 whitespace-nowrap">Due Date</th>"""

new_header = """                  <th className="px-6 py-4">Supplier</th>
                  <th className="px-6 py-4 text-center">Select</th>
                  <th className="px-6 py-4 whitespace-nowrap">Due Date</th>"""

content = content.replace(old_header, new_header)

old_header_end = """                  <th className="px-6 py-4 whitespace-nowrap">Payment Status</th>
                </tr>"""

new_header_end = """                  <th className="px-6 py-4 whitespace-nowrap">Payment Status</th>
                  <th className="px-6 py-4 whitespace-nowrap text-right">Actions</th>
                </tr>"""

content = content.replace(old_header_end, new_header_end)

# 3. Add Quick Pay button to row
old_row_end = """                      )}
                    </td>
                  </tr>"""

new_row_end = """                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {row.reminder && onQuickPay && (user?.role === 'admin' || user?.permissions?.payments?.create) && (
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
                  </tr>"""

content = content.replace(old_row_end, new_row_end)

# 4. Update colSpan for empty row
content = content.replace('<td colSpan={7}', '<td colSpan={8}')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
