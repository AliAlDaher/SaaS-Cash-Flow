const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  "import Login from './Login'",
  "import Login from './Login'\nimport { ReportsTab } from './ReportsTab'"
);
fs.writeFileSync(file, content);
