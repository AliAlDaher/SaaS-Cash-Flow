const fs = require('fs');

const file = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// Remove formatOverdueString completely
const targetStr = `const formatOverdueString = (dueDate: Date, todayDate: Date) => {
  const daysDiff = differenceInDays(todayDate, startOfDay(dueDate))
  if (daysDiff <= 0) return "Overdue"
  if (daysDiff === 1) return "Overdue 1 day"
  if (daysDiff >= 2 && daysDiff <= 6) return \`Overdue \${daysDiff} days\`
  if (daysDiff >= 7 && daysDiff <= 13) return "Overdue 1 week"
  if (daysDiff >= 14 && daysDiff <= 20) return "Overdue 2 weeks"
  
  const weeks = Math.floor(daysDiff / 7)
  return \`Overdue \${weeks} weeks\`
}`;

content = content.replace(targetStr, '');

// Also clean up oneWeekFromNow if it still exists
content = content.replace(/const oneWeekFromNow = addDays\(today, 7\)/, '');

fs.writeFileSync(file, content);
console.log('Fixed unused variables in TS');
