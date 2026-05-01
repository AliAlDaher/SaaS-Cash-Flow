const fs = require('fs');
const file = 'src/ReportsTab.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  /<p className={.ext-2xl font-bold }>{value}<\/p>/,
  '<p className={	ext-2xl font-bold \}>{value}</p>'
);
fs.writeFileSync(file, content);
