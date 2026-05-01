const fs = require('fs');
const file = 'src/ReportsTab.tsx';
let content = fs.readFileSync(file, 'utf8');
const lines = content.split(/\r?\n/);
lines[9] = '        <p className={`text-2xl font-bold ${valueColor || "text-slate-800"}`}>{value}</p>';
fs.writeFileSync(file, lines.join('\n'));
