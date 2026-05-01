const fs = require('fs');
const file = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/backend/src/routes/accounts.ts';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('router.use(requireAuth)')) {
  content = content.replace(/(const prisma = new PrismaClient\(\);\n)/, "$1\nrouter.use(requireAuth);\n");
  fs.writeFileSync(file, content);
  console.log('Added requireAuth to accounts.ts');
} else {
  console.log('requireAuth already present');
}
