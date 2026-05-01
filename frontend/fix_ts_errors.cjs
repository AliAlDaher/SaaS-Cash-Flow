const fs = require('fs');

const file = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// Find and remove formatOverdueString
content = content.replace(/function formatOverdueString[\s\S]*?return \`Overdue \$\{weeks\} week\$\{weeks > 1 \? 's' : ''\}\`\n\s*\}/, '');

// Find and remove oneWeekFromNow
content = content.replace(/const oneWeekFromNow = addDays\(today, 7\)/, '');

fs.writeFileSync(file, content);
console.log('Removed unused TS variables');
