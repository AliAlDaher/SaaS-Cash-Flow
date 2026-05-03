import re

def main():
    file_path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update InvoiceTable column name
    content = content.replace(
        '<th className="px-6 py-4 text-center">Priority</th>',
        '<th className="px-6 py-4 text-center">Pay Now</th>'
    )

    # 2. Add invoiceId and reminder to DisplayRow
    content = content.replace(
        '    isPartial?: boolean\n  }',
        '    isPartial?: boolean\n    invoiceId?: number\n    reminder?: boolean\n  }'
    )

    # 3. Replace grouping logic in DashboardTab with individual rows
    bad_grouping = '''    if (overdueInvoices.length > 1) {
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
    }'''

    good_individual = '''    overdueInvoices.forEach(inv => {
      const due = new Date(inv.dueDate)
      upcomingRows.push({
        id: `inv-${inv.id}`,
        invoiceId: inv.id,
        supplierName,
        dueDate: due,
        remainingAmount: inv.amount - inv.paidAmount,
        isGrouped: false,
        statusClass: "bg-rose-50 text-rose-700 border-rose-200",
        statusLabel: "Overdue",
        textColor: "text-rose-600 font-bold",
        isPartial: inv.paidAmount > 0,
        reminder: inv.reminder
      })
    })'''
    
    content = content.replace(bad_grouping, good_individual)

    # 4. Add invoiceId and reminder to upcomingInvs.forEach
    content = content.replace(
        '''      upcomingRows.push({
        id: `inv-${inv.id}`,
        supplierName,
        dueDate: due,
        remainingAmount,
        isGrouped: false,
        statusClass,
        statusLabel,
        textColor,
        isPartial: inv.paidAmount > 0
      })''',
        '''      upcomingRows.push({
        id: `inv-${inv.id}`,
        invoiceId: inv.id,
        supplierName,
        dueDate: due,
        remainingAmount,
        isGrouped: false,
        statusClass,
        statusLabel,
        textColor,
        isPartial: inv.paidAmount > 0,
        reminder: inv.reminder
      })'''
    )

    # 5. Add Pay Now header to Upcoming Payments table
    content = content.replace(
        '''                  <th className="px-6 py-4">Supplier</th>
                  <th className="px-6 py-4 whitespace-nowrap">Due Date</th>''',
        '''                  <th className="px-6 py-4">Supplier</th>
                  <th className="px-6 py-4 text-center">Pay Now</th>
                  <th className="px-6 py-4 whitespace-nowrap">Due Date</th>'''
    )

    # 6. Add CheckCircle icon to imports instead of Activity (Wait, Star is already imported. I'll add CheckCircle if it's not)
    if 'import { Star, Activity' in content:
        content = content.replace('import { Star, Activity', 'import { CheckCircle, Star, Activity')
    elif 'CheckCircle' not in content:
        content = content.replace('import { Star,', 'import { CheckCircle, Star,')

    # 7. Add CheckCircle cell to Upcoming Payments table
    content = content.replace(
        '''                    <td className={`px-6 py-4 font-medium ${row.textColor}`}>{row.supplierName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">{format(row.dueDate, 'MMM dd, yyyy')}</td>''',
        '''                    <td className={`px-6 py-4 font-medium ${row.textColor}`}>{row.supplierName}</td>
                    <td className="px-6 py-4 text-center">
                      {(user?.role === "admin" || user?.permissions?.invoices?.reminder) && row.invoiceId ? (
                        <button onClick={() => handleReminderToggle(row.invoiceId!, !row.reminder)} className={`transition-colors ${row.reminder ? 'text-emerald-500 hover:text-emerald-600' : 'text-slate-300 hover:text-emerald-400'}`}>
                          <CheckCircle className={`w-5 h-5 ${row.reminder ? 'fill-current text-emerald-500' : ''}`} />
                        </button>
                      ) : row.reminder ? (
                        <CheckCircle className="w-5 h-5 mx-auto text-emerald-500 fill-current" />
                      ) : (
                        <CheckCircle className="w-5 h-5 mx-auto text-slate-200" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">{format(row.dueDate, 'MMM dd, yyyy')}</td>'''
    )

    # 8. Update colSpan for empty Upcoming table
    content = content.replace(
        '<td colSpan={5} className="px-6 py-8 text-center text-slate-500">No upcoming or overdue payments!</td>',
        '<td colSpan={6} className="px-6 py-8 text-center text-slate-500">No upcoming or overdue payments!</td>'
    )

    # 9. In InvoiceTable, replace Star with CheckCircle, and ONLY show if due or overdue AND unpaid.
    # Actually, the user says "only appear for invoices that are due or overdue".
    # And if unpaid.
    # We already have dueStatus and isPaid.
    # If isPaid is true, we should not show the toggle, or we just render an empty space!
    
    # Let's find the InvoiceTable cell:
    bad_cell = '''              <td className="px-6 py-4 text-center">
                {canToggleReminder ? (
                  <button onClick={() => onReminderToggle && onReminderToggle(invoice.id, !invoice.reminder)} className={`transition-colors ${invoice.reminder ? 'text-amber-500 hover:text-amber-600' : 'text-slate-300 hover:text-amber-400'}`}>
                    <Star className={`w-5 h-5 ${invoice.reminder ? 'fill-current' : ''}`} />
                  </button>
                ) : (
                  <Star className={`w-5 h-5 mx-auto ${invoice.reminder ? 'text-amber-500 fill-current' : 'text-slate-200'}`} />
                )}
              </td>'''

    good_cell = '''              <td className="px-6 py-4 text-center">
                {!isPaid && (dueStatus === 'Overdue' || dueStatus === 'Due Today') ? (
                  canToggleReminder ? (
                    <button onClick={() => onReminderToggle && onReminderToggle(invoice.id, !invoice.reminder)} className={`transition-colors ${invoice.reminder ? 'text-emerald-500 hover:text-emerald-600' : 'text-slate-300 hover:text-emerald-400'}`}>
                      <CheckCircle className={`w-5 h-5 ${invoice.reminder ? 'fill-current text-emerald-500' : ''}`} />
                    </button>
                  ) : invoice.reminder ? (
                    <CheckCircle className="w-5 h-5 mx-auto text-emerald-500 fill-current" />
                  ) : (
                    <CheckCircle className="w-5 h-5 mx-auto text-slate-200" />
                  )
                ) : (
                  <span className="text-slate-300">-</span>
                )}
              </td>'''
    
    content = content.replace(bad_cell, good_cell)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Success frontend2")

if __name__ == '__main__':
    main()