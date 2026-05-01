const fs = require('fs');

const file = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Dashboard layout
content = content.replace(
  /<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">/,
  '<div className="grid grid-cols-1 gap-8">'
);

// 2. InvoiceTable Header
content = content.replace(
  /<th className="px-6 py-4 whitespace-nowrap">Due Date<\/th>/,
  '<th className="px-6 py-4 whitespace-nowrap">Due Date</th>\n          <th className="px-6 py-4 whitespace-nowrap">Due Status</th>'
);

// 3. InvoiceTable Logic inside map
const logicInsertion = `
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
            dueClass = 'bg-blue-50 text-blue-700 border-blue-200';
          }
`;

content = content.replace(
  /const supplierName = suppliers\.find\(s => s\.id === invoice\.supplierId\)\?\.name \|\| `ID: \$\{invoice\.supplierId\}`/,
  `$&${logicInsertion}`
);

// 4. InvoiceTable Row
content = content.replace(
  /<td className="px-6 py-4 whitespace-nowrap">\{format\(new Date\(invoice\.dueDate\), 'MMM dd, yyyy'\)\}<\/td>/,
  `$&
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={\`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border \${dueClass}\`}>
                  {dueStatus}
                </span>
              </td>`
);

// 5. Update colSpan
content = content.replace(
  /<td colSpan=\{showDescription \? \(onEditClick \? 8 : 7\) : 6\} className="px-6 py-8 text-center text-slate-500">No invoices found<\/td>/,
  '<td colSpan={showDescription ? (onEditClick ? 9 : 8) : 7} className="px-6 py-8 text-center text-slate-500">No invoices found</td>'
);


fs.writeFileSync(file, content);
console.log('Fixed Dashboard layout and added Due Status to Invoices');
