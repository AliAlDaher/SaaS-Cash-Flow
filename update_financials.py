import re

def main():
    file_path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update range in DashboardTab
    content = content.replace(
        'const threeWeeksFromNow = addDays(today, 21)',
        'const fortyFiveDaysFromNow = addDays(today, 45)'
    )
    content = content.replace('threeWeeksFromNow', 'fortyFiveDaysFromNow')

    # 2. Update DashboardTab header text
    content = content.replace(
        '<h2 className="text-lg font-bold text-slate-800">Upcoming & Overdue Payments (3 Weeks)</h2>',
        '<h2 className="text-lg font-bold text-slate-800">Upcoming & Overdue Payments (1.5 Months)</h2>'
    )

    # 3. Add totalAmount to DisplayRow
    content = content.replace(
        'remainingAmount: number',
        'totalAmount: number\n    remainingAmount: number'
    )

    # 4. Update upcomingRows.push in overdueInvoices (multi-line match)
    content = re.sub(
        r'dueDate: due,\s+remainingAmount: inv\.amount - inv\.paidAmount,',
        'dueDate: due,\n        totalAmount: inv.amount,\n        remainingAmount: inv.amount - inv.paidAmount,',
        content
    )

    # 5. Update upcomingRows.push in upcomingInvs (multi-line match)
    content = re.sub(
        r'dueDate: due,\s+remainingAmount,\s+isGrouped: false,',
        'dueDate: due,\n        totalAmount: inv.amount,\n        remainingAmount: inv.amount - inv.paidAmount,\n        isGrouped: false,',
        content
    )

    # 6. Update DashboardTab Table Header
    content = content.replace(
        '<th className="px-6 py-4 whitespace-nowrap text-right">Remaining Amount</th>',
        '<th className="px-6 py-4 whitespace-nowrap text-right">Full Amount</th>\n                  <th className="px-6 py-4 whitespace-nowrap text-right">Remaining Amount</th>'
    )

    # 7. Update DashboardTab Table Row
    content = re.sub(
        r'<td className={`px-6 py-4 whitespace-nowrap text-right font-bold \${row\.textColor}`}>\s+<FormatCurrency amount={row\.remainingAmount} />\s+</td>',
        '''<td className="px-6 py-4 whitespace-nowrap text-right text-slate-500">
                      <FormatCurrency amount={row.totalAmount} />
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-right font-bold ${row.textColor}`}>
                      <FormatCurrency amount={row.remainingAmount} />
                    </td>''',
        content
    )

    # 8. Update DashboardTab Empty State colSpan
    content = content.replace(
        '<td colSpan={6} className="px-6 py-8 text-center text-slate-500">No upcoming or overdue payments!</td>',
        '<td colSpan={7} className="px-6 py-8 text-center text-slate-500">No upcoming or overdue payments!</td>'
    )

    # 9. Update InvoiceTable Header
    content = content.replace(
        '<th className="px-6 py-4 whitespace-nowrap text-right">Amount</th>',
        '<th className="px-6 py-4 whitespace-nowrap text-right">Full Amount</th>\n          <th className="px-6 py-4 whitespace-nowrap text-right">Remaining Amount</th>'
    )

    # 10. Update InvoiceTable Row
    content = re.sub(
        r'<td className="px-6 py-4 whitespace-nowrap text-right">\s+<FormatCurrency amount={invoice\.amount} />\s+</td>',
        '''<td className="px-6 py-4 whitespace-nowrap text-right text-slate-500">
                <FormatCurrency amount={invoice.amount} />
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-right font-bold ${isPaid ? 'text-emerald-600' : isPartial ? 'text-orange-600' : 'text-slate-700'}`}>
                <FormatCurrency amount={invoice.amount - invoice.paidAmount} />
              </td>''',
        content
    )

    # 11. Update InvoiceTable Empty State colSpan
    content = content.replace(
        '<td colSpan={showDescription ? (onEditClick ? 10 : 9) : 9}',
        '<td colSpan={9 + (showDescription ? 1 : 0) + (onEditClick ? 1 : 0)}'
    )

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Dashboard and InvoiceTable updated")

if __name__ == '__main__':
    main()