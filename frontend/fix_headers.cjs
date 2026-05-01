const fs = require('fs');

const file = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// --- 1. Fix InvoiceTable Headers ---
content = content.replace(
  /<th className="px-6 py-4 whitespace-nowrap">Due Date<\/th>\s*<th className="px-6 py-4 whitespace-nowrap">Status<\/th>/,
  `<th className="px-6 py-4 whitespace-nowrap">Due Date</th>
          <th className="px-6 py-4 whitespace-nowrap">Due Status</th>
          <th className="px-6 py-4 whitespace-nowrap">Payment Status</th>`
);

// --- 2. Fix DashboardTab Headers ---
content = content.replace(
  /<th className="px-6 py-4 whitespace-nowrap">Due Status<\/th>\s*<\/tr>/,
  `<th className="px-6 py-4 whitespace-nowrap">Due Status</th>
                  <th className="px-6 py-4 whitespace-nowrap">Payment Status</th>
                </tr>`
);

// --- 3. Add isPartial to DisplayRow Type ---
content = content.replace(
  /textColor: string\s*\}/,
  `textColor: string
    isPartial?: boolean
  }`
);

// --- 4. Update upcomingRows pushing logic ---
// Grouped Overdue
content = content.replace(
  /const totalRemaining = overdueInvoices\.reduce\(\(sum, inv\) => sum \+ \(inv\.amount - inv\.paidAmount\), 0\)/,
  `const totalRemaining = overdueInvoices.reduce((sum, inv) => sum + (inv.amount - inv.paidAmount), 0)
      const totalPaid = overdueInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0)`
);

content = content.replace(
  /textColor: "text-rose-600 font-bold"\s*\}\)/,
  `textColor: "text-rose-600 font-bold",
        isPartial: totalPaid > 0
      })`
);

// Single Overdue
content = content.replace(
  /const inv = overdueInvoices\[0\]/,
  `const inv = overdueInvoices[0]
      const totalPaid = inv.paidAmount`
);

// We know the regex might not match exactly, so I will replace by matching `isGrouped: false` context.
// Let's use a safer approach for single overdue:
content = content.replace(
  /isGrouped: false,\s*statusClass: "bg-rose-50 text-rose-700 border-rose-200",\s*statusLabel: "Overdue",\s*textColor: "text-rose-600 font-bold"\s*\}\)/,
  `isGrouped: false,
        statusClass: "bg-rose-50 text-rose-700 border-rose-200",
        statusLabel: "Overdue",
        textColor: "text-rose-600 font-bold",
        isPartial: inv.paidAmount > 0
      })`
);

// Upcoming
content = content.replace(
  /remainingAmount,\s*isGrouped: false,\s*statusClass,\s*statusLabel,\s*textColor\s*\}\)/,
  `remainingAmount,
        isGrouped: false,
        statusClass,
        statusLabel,
        textColor,
        isPartial: inv.paidAmount > 0
      })`
);


// --- 5. Update upcomingRows table rendering ---
// Add the new Payment Status td
const upcomingTdRegex = /<span className=\{\`inline-flex items-center px-2\.5 py-0\.5 rounded-full text-xs font-medium border \$\{row\.statusClass\}\`\}>\s*\{row\.statusLabel\}\s*<\/span>\s*<\/td>/;

content = content.replace(upcomingTdRegex, `$&
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
                    </td>`);


// Change colSpan from 4 to 5
content = content.replace(
  /<td colSpan=\{4\} className="px-6 py-8 text-center text-slate-500">No upcoming or overdue payments!<\/td>/,
  `<td colSpan={5} className="px-6 py-8 text-center text-slate-500">No upcoming or overdue payments!</td>`
);


// And fix colSpan for invoices in InvoiceTable
content = content.replace(
  /<td colSpan=\{showDescription \? \(onEditClick \? 9 : 8\) : 7\} className="px-6 py-8 text-center text-slate-500">/,
  `<td colSpan={showDescription ? (onEditClick ? 9 : 8) : 8} className="px-6 py-8 text-center text-slate-500">`
);

fs.writeFileSync(file, content);
console.log('Fixed headers and columns');
