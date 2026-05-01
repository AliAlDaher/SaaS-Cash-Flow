const fs = require('fs');

const file = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /import \{ format, startOfDay, addDays, isBefore, differenceInDays, isEqual \} from 'date-fns'/,
  "import { format, startOfDay, addDays, isBefore, isEqual } from 'date-fns'"
);

fs.writeFileSync(file, content);
console.log('Removed differenceInDays import');
