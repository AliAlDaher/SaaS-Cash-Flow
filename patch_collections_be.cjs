const fs = require('fs');
const file = 'backend/src/routes/collections.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'const { amount, currency, accountId, note, receivedDate, status } = req.body;',
  'const { amount, currency, accountId, note, expectedDate, receivedDate, status } = req.body;'
);

content = content.replace(
  /note: note \|\| '',\r?\n\s*receivedDate: receivedDate \? new Date\(receivedDate\) : existing\.receivedDate,/g,
  "note: note || '',\n          expectedDate: expectedDate ? new Date(expectedDate) : null,\n          receivedDate: receivedDate ? new Date(receivedDate) : existing.receivedDate,"
);

fs.writeFileSync(file, content);
