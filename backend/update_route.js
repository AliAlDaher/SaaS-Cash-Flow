const fs = require('fs');
const path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/backend/src/routes/suppliers.ts';
let content = fs.readFileSync(path, 'utf8');
content = content.replace("res.status(500).json({ error: 'Error fetching suppliers' });", "res.status(500).json({ error: 'Error fetching suppliers', details: error.message || String(error) });");
fs.writeFileSync(path, content, 'utf8');