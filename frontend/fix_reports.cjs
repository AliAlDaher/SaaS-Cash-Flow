const fs = require('fs');
const file = 'src/ReportsTab.tsx';
let content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');
lines[9] = '        <p className={\	ext-2xl font-bold \\}>{value}</p>';
fs.writeFileSync(file, lines.join('\n'));
