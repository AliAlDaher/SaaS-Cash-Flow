const fs = require('fs');
const path = require('path');

const backendDir = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/backend/src';

// 1. Update auth.ts middleware
const authFile = path.join(backendDir, 'middleware/auth.ts');
let authContent = fs.readFileSync(authFile, 'utf8');

const newRequirePermission = `export const requirePermission = (moduleName: string, action: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (user?.role === 'admin') return next();

    if (!user?.permissions?.[moduleName]?.[action]) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};`;
authContent = authContent.replace(/export const requirePermission = [\s\S]*?};\n};/m, newRequirePermission);
fs.writeFileSync(authFile, authContent);

const adminPermsStr = `
{
  dashboard: { view: true },
  invoices: { view: true, create: true, edit: true, delete: true },
  payments: { view: true, create: true, edit: true, delete: true },
  collections: { view: true, create: true, edit: true, delete: true },
  suppliers: { view: true, create: true, edit: true, delete: true },
  accounts: { view: true, create: true, edit: true, delete: true },
  users: { view: true, create: true, edit: true, delete: true }
}
`;

// Update auth route (login)
const authRouteFile = path.join(backendDir, 'routes/auth.ts');
let authRouteContent = fs.readFileSync(authRouteFile, 'utf8');
authRouteContent = authRouteContent.replace(
  /parsedPerms = \{[\s\S]*?\};/,
  `parsedPerms = ${adminPermsStr};`
);
fs.writeFileSync(authRouteFile, authRouteContent);

// Update users route
const usersRouteFile = path.join(backendDir, 'routes/users.ts');
let usersRouteContent = fs.readFileSync(usersRouteFile, 'utf8');
usersRouteContent = usersRouteContent.replace(
  /perms = \{[\s\S]*?\};/,
  `perms = ${adminPermsStr};`
);
usersRouteContent = usersRouteContent.replace(
  /permissions = \{[\s\S]*?\};/g,
  `permissions = ${adminPermsStr};`
);
fs.writeFileSync(usersRouteFile, usersRouteContent);

// Update route permissions
const routeModules = {
  'suppliers.ts': 'suppliers',
  'invoices.ts': 'invoices',
  'payments.ts': 'payments',
  'collections.ts': 'collections',
  'users.ts': 'users',
  'accounts.ts': 'accounts'
};

for (const [filename, moduleName] of Object.entries(routeModules)) {
  const filePath = path.join(backendDir, 'routes', filename);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove router.use(requirePermission(...))
  content = content.replace(/router\.use\(requirePermission\([^)]+\)\);\n?/g, '');
  
  // Update endpoint permissions
  content = content.replace(/router\.get\('([^']+)',(\s*)async/g, `router.get('$1', requirePermission('${moduleName}', 'view'),$2async`);
  content = content.replace(/router\.post\('([^']+)',(\s*)async/g, `router.post('$1', requirePermission('${moduleName}', 'create'),$2async`);
  content = content.replace(/router\.put\('([^']+)',(\s*)async/g, `router.put('$1', requirePermission('${moduleName}', 'edit'),$2async`);
  
  // For DELETE, it might already have requirePermission('canDelete')
  content = content.replace(/router\.delete\('([^']+)',\s*requirePermission\('[^']+'\),\s*async/g, `router.delete('$1', requirePermission('${moduleName}', 'delete'), async`);
  content = content.replace(/router\.delete\('([^']+)',\s*async/g, `router.delete('$1', requirePermission('${moduleName}', 'delete'), async`);
  
  fs.writeFileSync(filePath, content);
  console.log(`Updated permissions in ${filename}`);
}

console.log('Backend refactoring completed.');
