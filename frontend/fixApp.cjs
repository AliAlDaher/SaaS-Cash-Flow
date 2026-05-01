const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  "if (user?.permissions?.reports?.view) tabs.push({ name: 'Reports', path: '/reports' });\\n  if (user?.permissions?.reports?.view) tabs.push({ name: 'Reports', path: '/reports' });",
  "if (user?.permissions?.reports?.view) tabs.push({ name: 'Reports', path: '/reports' });"
);
fs.writeFileSync(file, content);
