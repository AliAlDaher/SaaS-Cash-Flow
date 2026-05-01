const fs = require('fs');
const path = require('path');

const appFile = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx';
let appContent = fs.readFileSync(appFile, 'utf8');

// Update routing
appContent = appContent.replace(
  /<Route path="\/users" element=\{user\?\.role === 'admin' \? <UsersTab \/> : <AccessDenied \/>\} \/>/,
  '<Route path="/users" element={user?.permissions?.canManageUsers ? <UsersTab /> : <AccessDenied />} />'
);

// Add to tabs dynamically
appContent = appContent.replace(
  /const tabs = \[([^\]]+)\]/m,
  `const tabs = [$1];\n  if (user?.permissions?.canManageUsers) tabs.push({ name: 'Users', path: '/users' });`
);

fs.writeFileSync(appFile, appContent);

const usersBackendFile = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/backend/src/routes/users.ts';
let usersContent = fs.readFileSync(usersBackendFile, 'utf8');

const putPermsCode = `
router.put('/:id/permissions', async (req, res) => {
  const id = parseInt(req.params.id);
  const { permissions } = req.body;
  try {
    const permsStr = JSON.stringify(permissions || {});
    await prisma.$executeRaw\`UPDATE [User] SET permissions=\${permsStr}, updatedAt=GETDATE() WHERE id=\${id}\`;
    res.json({ message: 'Permissions updated' });
  } catch (error: any) {
    res.status(500).json({ error: 'Error updating permissions', details: error.message });
  }
});

router.put('/:id', async (req, res) => {`;

if (!usersContent.includes('put(\'/:id/permissions\'')) {
  usersContent = usersContent.replace(/router\.put\('\/:id',\s*async\s*\(req,\s*res\)\s*=>\s*\{/, putPermsCode);
}

fs.writeFileSync(usersBackendFile, usersContent);
console.log('Successfully updated App.tsx and users.ts');
