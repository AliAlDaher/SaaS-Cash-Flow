const fs = require('fs');

const file = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/const totalPaid = inv\.paidAmount\s*const due = new Date\(inv\.dueDate\)/, 'const due = new Date(inv.dueDate)');

fs.writeFileSync(file, content);
console.log('Fixed totalPaid error');
