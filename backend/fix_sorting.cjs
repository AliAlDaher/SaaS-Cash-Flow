const fs = require('fs');
const path = require('path');

const routesDir = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/backend/src/routes';

// 1. invoices.ts
const invoicesPath = path.join(routesDir, 'invoices.ts');
let invoicesContent = fs.readFileSync(invoicesPath, 'utf8');
invoicesContent = invoicesContent.replace(
  /const invoices = await prisma\.invoice\.findMany\(\);/,
  'const invoices = await prisma.invoice.findMany({ orderBy: { id: "desc" }, include: { supplier: true } });'
);
invoicesContent = invoicesContent.replace(
  /const invoices = await prisma\.invoice\.findMany\(\{\s*where: \{ supplierId: parseInt\(supplierId\) \},\s*\}\);/,
  'const invoices = await prisma.invoice.findMany({ where: { supplierId: parseInt(supplierId) }, orderBy: { id: "desc" } });'
);
fs.writeFileSync(invoicesPath, invoicesContent);

// 2. collections.ts
const collectionsPath = path.join(routesDir, 'collections.ts');
let collectionsContent = fs.readFileSync(collectionsPath, 'utf8');
collectionsContent = collectionsContent.replace(
  /const collections = await prisma\.collection\.findMany\(\{\s*orderBy: \{ createdAt: 'desc' \}/,
  'const collections = await prisma.collection.findMany({ orderBy: { id: "desc" }'
);
// Also in case it doesn't have orderBy:
collectionsContent = collectionsContent.replace(
  /const collections = await prisma\.collection\.findMany\(\{\s*include: \{ account: true \}\s*\}\);/,
  'const collections = await prisma.collection.findMany({ orderBy: { id: "desc" }, include: { account: true } });'
);
fs.writeFileSync(collectionsPath, collectionsContent);

// 3. payments.ts
const paymentsPath = path.join(routesDir, 'payments.ts');
let paymentsContent = fs.readFileSync(paymentsPath, 'utf8');
paymentsContent = paymentsContent.replace(
  /const payments = await prisma\.payment\.findMany\(\{\s*orderBy: \{ createdAt: 'desc' \}/,
  'const payments = await prisma.payment.findMany({ orderBy: { id: "desc" }'
);
fs.writeFileSync(paymentsPath, paymentsContent);

// 4. accounts.ts
const accountsPath = path.join(routesDir, 'accounts.ts');
let accountsContent = fs.readFileSync(accountsPath, 'utf8');
accountsContent = accountsContent.replace(
  /const accounts = await prisma\.account\.findMany\(\);/,
  'const accounts = await prisma.account.findMany({ orderBy: { id: "desc" } });'
);
fs.writeFileSync(accountsPath, accountsContent);

// 5. suppliers.ts
const suppliersPath = path.join(routesDir, 'suppliers.ts');
let suppliersContent = fs.readFileSync(suppliersPath, 'utf8');
suppliersContent = suppliersContent.replace(
  /const suppliers = await prisma\.supplier\.findMany\(\);/,
  'const suppliers = await prisma.supplier.findMany({ orderBy: { id: "desc" } });'
);
fs.writeFileSync(suppliersPath, suppliersContent);

console.log('Fixed backend sorting globally');
