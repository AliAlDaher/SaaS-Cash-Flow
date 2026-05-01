const fs = require('fs');

const file = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// Dashboard upcoming payments table
content = content.replace(
  /<th className="px-6 py-4">Remaining Amount<\/th>/,
  '<th className="px-6 py-4 whitespace-nowrap text-right">Remaining Amount</th>'
);
content = content.replace(
  /<td className=\{`px-6 py-4 font-bold \$\{row\.textColor\}`\}>/g,
  '<td className={`px-6 py-4 whitespace-nowrap text-right font-bold ${row.textColor}`}>'
);
content = content.replace(
  /<th className="px-6 py-4">Due Date<\/th>/g,
  '<th className="px-6 py-4 whitespace-nowrap">Due Date</th>'
);
content = content.replace(
  /<td className="px-6 py-4 text-slate-600">\{format\(row\.dueDate, 'MMM dd, yyyy'\)\}<\/td>/g,
  '<td className="px-6 py-4 whitespace-nowrap text-slate-600">{format(row.dueDate, \'MMM dd, yyyy\')}</td>'
);


// Suppliers table
content = content.replace(
  /<th className="px-6 py-4">Terms<\/th>/,
  '<th className="px-6 py-4 whitespace-nowrap">Terms</th>'
);
content = content.replace(
  /<td className="px-6 py-4">\s*<span className="inline-flex/g,
  '<td className="px-6 py-4 whitespace-nowrap">\n                  <span className="inline-flex'
);


// Payments table
content = content.replace(
  /<th className="px-6 py-4">Payment Date<\/th>/g,
  '<th className="px-6 py-4 whitespace-nowrap">Payment Date</th>'
);
content = content.replace(
  /<td className="px-6 py-4 text-slate-600">\{format\(new Date\(payment\.paymentDate\), 'MMM dd, yyyy'\)\}<\/td>/g,
  '<td className="px-6 py-4 whitespace-nowrap text-slate-600">{format(new Date(payment.paymentDate), \'MMM dd, yyyy\')}</td>'
);


// Invoice table headers
content = content.replace(
  /<th className="px-6 py-4">Invoice Date<\/th>/g,
  '<th className="px-6 py-4 whitespace-nowrap">Invoice Date</th>'
);
content = content.replace(
  /<th className="px-6 py-4">Amount<\/th>/g,
  '<th className="px-6 py-4 whitespace-nowrap text-right">Amount</th>'
);
content = content.replace(
  /<th className="px-6 py-4">Status<\/th>/g,
  '<th className="px-6 py-4 whitespace-nowrap">Status</th>'
);

// Invoice table rows
content = content.replace(
  /<td className="px-6 py-4 text-slate-600">\{invoice\.invoiceDate \? format\(new Date\(invoice\.invoiceDate\), 'MMM dd, yyyy'\) : '-'\}<\/td>/g,
  '<td className="px-6 py-4 whitespace-nowrap text-slate-600">{invoice.invoiceDate ? format(new Date(invoice.invoiceDate), \'MMM dd, yyyy\') : \'-\'}</td>'
);
content = content.replace(
  /<td className="px-6 py-4">\s*<FormatCurrency amount=\{invoice\.amount\} \/>\s*<\/td>/g,
  '<td className="px-6 py-4 whitespace-nowrap text-right">\n                <FormatCurrency amount={invoice.amount} />\n              </td>'
);
content = content.replace(
  /<td className="px-6 py-4">\{format\(new Date\(invoice\.dueDate\), 'MMM dd, yyyy'\)\}<\/td>/g,
  '<td className="px-6 py-4 whitespace-nowrap">{format(new Date(invoice.dueDate), \'MMM dd, yyyy\')}</td>'
);


// Payments Amount TD
content = content.replace(
  /<td className="px-6 py-4 font-bold">\s*<FormatCurrency amount=\{payment\.amount\} \/>\s*<\/td>/g,
  '<td className="px-6 py-4 whitespace-nowrap text-right font-bold">\n                  <FormatCurrency amount={payment.amount} />\n                </td>'
);


// Accounts table
content = content.replace(
  /<th className="px-6 py-4">Balance<\/th>/,
  '<th className="px-6 py-4 whitespace-nowrap text-right">Balance</th>'
);
content = content.replace(
  /<td className="px-6 py-4 font-bold">\s*<FormatCurrency amount=\{account\.balance\} \/>\s*<\/td>/g,
  '<td className="px-6 py-4 whitespace-nowrap text-right font-bold">\n                  <FormatCurrency amount={account.balance} />\n                </td>'
);


// Collections table
content = content.replace(
  /<th className="px-6 py-4">Date<\/th>/,
  '<th className="px-6 py-4 whitespace-nowrap">Date</th>'
);
content = content.replace(
  /<th className="px-6 py-4">Original Amount<\/th>/,
  '<th className="px-6 py-4 whitespace-nowrap text-right">Original Amount</th>'
);
content = content.replace(
  /<th className="px-6 py-4">Amount \(JOD\)<\/th>/,
  '<th className="px-6 py-4 whitespace-nowrap text-right">Amount (JOD)</th>'
);

content = content.replace(
  /<td className="px-6 py-4 text-slate-600">\{format\(new Date\(collection\.receivedDate\), 'MMM dd, yyyy'\)\}<\/td>/g,
  '<td className="px-6 py-4 whitespace-nowrap text-slate-600">{format(new Date(collection.receivedDate), \'MMM dd, yyyy\')}</td>'
);
content = content.replace(
  /<td className="px-6 py-4 text-slate-600">\s*\{collection\.amount\.toLocaleString[^\n]+\n\s*<span className="text-xs text-slate-400 ml-1">\{collection\.currency\}<\/span>\s*<\/td>/g,
  (match) => match.replace('className="px-6 py-4 text-slate-600"', 'className="px-6 py-4 whitespace-nowrap text-right text-slate-600"')
);

content = content.replace(
  /<td className="px-6 py-4">\s*\{collection\.status === 'expected' \?\s*\(/g,
  '<td className="px-6 py-4 whitespace-nowrap">\n                  {collection.status === \'expected\' ? ('
);

// Collections Amount TD was replaced by status code earlier, wait no, AmountInBase is right before it.
content = content.replace(
  /<td className="px-6 py-4 font-bold">\s*<FormatCurrency amount=\{collection\.amountInBase\} \/>\s*<\/td>\s*<td className="px-6 py-4 whitespace-nowrap">/g,
  '<td className="px-6 py-4 whitespace-nowrap text-right font-bold">\n                  <FormatCurrency amount={collection.amountInBase} />\n                </td>\n                <td className="px-6 py-4 whitespace-nowrap">'
);

// Just to be safe, find any remaining `<td className="px-6 py-4 font-bold">` around `<FormatCurrency` and make them right-aligned
content = content.replace(
  /<td className="px-6 py-4 font-bold">\s*<FormatCurrency/g,
  '<td className="px-6 py-4 whitespace-nowrap text-right font-bold">\n                  <FormatCurrency'
);

// Make sure Actions columns are whitespace nowrap
content = content.replace(
  /<th className="px-6 py-4 text-right">Actions<\/th>/g,
  '<th className="px-6 py-4 whitespace-nowrap text-right">Actions</th>'
);
content = content.replace(
  /<td className="px-6 py-4 text-right">/g,
  '<td className="px-6 py-4 whitespace-nowrap text-right">'
);
content = content.replace(
  /<td className="px-6 py-4 space-x-3 text-right">/g,
  '<td className="px-6 py-4 whitespace-nowrap space-x-3 text-right">'
);


fs.writeFileSync(file, content);
console.log('UI formatting improved successfully');
