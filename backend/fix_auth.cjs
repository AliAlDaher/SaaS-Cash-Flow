const fs = require('fs');
const file = 'src/routes/auth.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  'dashboard: { view: true },',
  'dashboard: { view: true },\n  reports: { view: true },'
);
fs.writeFileSync(file, content);
