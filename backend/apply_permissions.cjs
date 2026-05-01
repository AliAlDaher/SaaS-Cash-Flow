const fs = require('fs');
const path = require('path');

const backendDir = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/backend/src';

// 1. Update middleware/auth.ts
const authFile = path.join(backendDir, 'middleware/auth.ts');
let authContent = fs.readFileSync(authFile, 'utf8');

const newRequirePermission = `export const requirePermission = (permission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user?.permissions?.[permission]) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
};`;

authContent = authContent.replace(/export const requirePermission = [\s\S]*?};\n};/m, newRequirePermission);
fs.writeFileSync(authFile, authContent);
console.log('Updated auth.ts');

// 2. Update routes
const routes = {
  'suppliers.ts': 'canManageSuppliers',
  'invoices.ts': 'canManageInvoices',
  'payments.ts': 'canManagePayments',
  'collections.ts': 'canManageCollections',
  'users.ts': 'canManageUsers'
};

for (const [filename, permission] of Object.entries(routes)) {
  const filePath = path.join(backendDir, 'routes', filename);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add requireAuth and requirePermission middleware
  if (!content.includes('router.use(requireAuth)')) {
    content = content.replace(/(const prisma = new PrismaClient\(\);\n)/, `$1\nrouter.use(requireAuth);\nrouter.use(requirePermission('${permission}'));\n`);
  } else {
    // If it already has requireAuth, add requirePermission
    if (!content.includes(`requirePermission('${permission}')`)) {
      content = content.replace(/router\.use\(requireAuth\);/, `router.use(requireAuth);\nrouter.use(requirePermission('${permission}'));`);
    }
  }

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${filename}`);
}

// 3. Update DELETE routes everywhere (including accounts.ts)
const routeFiles = fs.readdirSync(path.join(backendDir, 'routes'));
for (const filename of routeFiles) {
  if (!filename.endsWith('.ts')) continue;
  const filePath = path.join(backendDir, 'routes', filename);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace router.delete('/:id', async (req: Request, res: Response) => {
  // with router.delete('/:id', requirePermission('canDelete'), async (req: Request, res: Response) => {
  if (content.includes('router.delete') && !content.includes(`requirePermission('canDelete')`)) {
    content = content.replace(/router\.delete\('([^']+)',\s*async\s*\(/g, "router.delete('$1', requirePermission('canDelete'), async (");
    fs.writeFileSync(filePath, content);
    console.log(`Updated DELETE in ${filename}`);
  }
}
