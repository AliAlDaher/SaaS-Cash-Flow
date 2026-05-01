const fs = require('fs');
const path = require('path');

const backendDir = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/backend/src';

const adminPermsCode = `
      "dashboard": { "view": true },
      "invoices": { "view": true, "create": true, "edit": true, "delete": true },
      "payments": { "view": true, "create": true, "edit": true, "delete": true },
      "collections": { "view": true, "create": true, "edit": true, "delete": true },
      "suppliers": { "view": true, "create": true, "edit": true, "delete": true },
      "accounts": { "view": true, "create": true, "edit": true, "delete": true },
      "users": { "view": true, "create": true, "edit": true, "delete": true }
`;

// 1. Update backend/src/middleware/auth.ts
const authFile = path.join(backendDir, 'middleware/auth.ts');
let authContent = fs.readFileSync(authFile, 'utf8');

authContent = authContent.replace(
  /export const requirePermission = [\s\S]*?};\n};/,
  `export const requirePermission = (moduleName: string, action: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (user?.role === 'admin') return next();
    if (!user?.permissions?.[moduleName]?.[action]) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};`
);
fs.writeFileSync(authFile, authContent);

// 2. Update routes/auth.ts (login admin perms override)
const loginAuthFile = path.join(backendDir, 'routes/auth.ts');
let loginAuthContent = fs.readFileSync(loginAuthFile, 'utf8');
loginAuthContent = loginAuthContent.replace(/parsedPerms = \{\s*"canViewDashboard"[\s\S]*?"canManageUsers": true\s*\};/, `parsedPerms = { ${adminPermsCode} };`);
fs.writeFileSync(loginAuthFile, loginAuthContent);

// 3. Update routes/users.ts (admin perms override)
const usersRouteFile = path.join(backendDir, 'routes/users.ts');
let usersRouteContent = fs.readFileSync(usersRouteFile, 'utf8');
usersRouteContent = usersRouteContent.replace(/perms = \{\s*"canViewDashboard"[\s\S]*?"canManageUsers": true\s*\};/g, `perms = { ${adminPermsCode} };`);
usersRouteContent = usersRouteContent.replace(/permissions = \{\s*"canViewDashboard"[\s\S]*?"canManageUsers": true\s*\};/g, `permissions = { ${adminPermsCode} };`);
fs.writeFileSync(usersRouteFile, usersRouteContent);

// 4. Update all route files to use granular permissions
const routesMap = {
  'suppliers.ts': 'suppliers',
  'invoices.ts': 'invoices',
  'payments.ts': 'payments',
  'collections.ts': 'collections',
  'users.ts': 'users',
  'accounts.ts': 'accounts'
};

for (const [filename, moduleName] of Object.entries(routesMap)) {
  const filePath = path.join(backendDir, 'routes', filename);
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove the global router.use(requirePermission(...))
  content = content.replace(/router\.use\(requirePermission\([^)]+\)\);\n?/, '');

  // Add granular permissions to route handlers
  // Note: users.ts has special endpoints like /:id/permissions. We will just map GET, POST, PUT, DELETE systematically.
  
  // Replace generic requirePermission('canDelete')
  content = content.replace(/requirePermission\('canDelete'\)/g, `requirePermission('${moduleName}', 'delete')`);

  // We need to inject middleware into router.get, router.post, router.put, router.delete
  const injectMiddleware = (method, action) => {
    // regex to find: router.get('/path', async (req, res) => ...
    // making sure we don't inject multiple times
    const regex = new RegExp(`router\\.${method}\\('([^']+)',\\s*(?!requirePermission)(async\\s*\\()`, 'g');
    content = content.replace(regex, `router.${method}('$1', requirePermission('${moduleName}', '${action}'), $2`);
  };

  injectMiddleware('get', 'view');
  injectMiddleware('post', 'create');
  injectMiddleware('put', 'edit');
  // injectMiddleware('delete', 'delete'); // already handled mostly, but just in case:
  const regexDelete = new RegExp(`router\\.delete\\('([^']+)',\\s*(?!requirePermission)(async\\s*\\()`, 'g');
  content = content.replace(regexDelete, `router.delete('$1', requirePermission('${moduleName}', 'delete'), $2`);

  fs.writeFileSync(filePath, content);
}

console.log('Backend routes updated');
