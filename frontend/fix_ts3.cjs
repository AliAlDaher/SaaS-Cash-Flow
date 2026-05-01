const fs = require('fs');

const file = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

const startIndex = lines.findIndex(l => l.includes('const formatOverdueString = (dueDate: Date, todayDate: Date) => {'));

if (startIndex !== -1) {
  let endIndex = startIndex;
  for (let i = startIndex; i < lines.length; i++) {
    if (lines[i].includes('return `Overdue ${weeks} weeks`')) {
      endIndex = i + 1; // including the closing brace
      break;
    }
  }
  lines.splice(startIndex, endIndex - startIndex + 1);
}

fs.writeFileSync(file, lines.join('\n'));
console.log('Successfully removed unused variables');
