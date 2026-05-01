const fs = require('fs');

const file = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<td className="px-6 py-4">\{payment\.paymentDate \? format\(new Date\(payment\.paymentDate\), 'MMM dd, yyyy'\) : '-'\}<\/td>/g,
  '<td className="px-6 py-4 whitespace-nowrap">{payment.paymentDate ? format(new Date(payment.paymentDate), \'MMM dd, yyyy\') : \'-\'}</td>'
);

content = content.replace(
  /<td className="px-6 py-4 text-slate-600">\{format\(new Date\(coll\.receivedDate\), 'MMM dd, yyyy'\)\}<\/td>/g,
  '<td className="px-6 py-4 whitespace-nowrap text-slate-600">{format(new Date(coll.receivedDate), \'MMM dd, yyyy\')}</td>'
);

fs.writeFileSync(file, content);
console.log('Fixed missed dates');
