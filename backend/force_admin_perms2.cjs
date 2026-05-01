const fs = require('fs');

const adminPermsCode = `
      "canViewDashboard": true,
      "canManageSuppliers": true,
      "canManageInvoices": true,
      "canManagePayments": true,
      "canManageCollections": true,
      "canDelete": true,
      "canManageUsers": true
`;

const authFile = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/backend/src/routes/auth.ts';
let authContent = fs.readFileSync(authFile, 'utf8');

authContent = authContent.replace(
  /let parsedPerms = \{\};\s*try \{\s*parsedPerms = user\.permissions \? JSON\.parse\(user\.permissions\) : \{\};\s*\} catch\(e\) \{\}/,
  `let parsedPerms: any = {};
    if (user.role === 'admin') {
      parsedPerms = { ${adminPermsCode} };
    } else {
      try {
        parsedPerms = user.permissions ? JSON.parse(user.permissions) : {};
      } catch(e) {}
    }`
);
fs.writeFileSync(authFile, authContent);

const usersFile = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/backend/src/routes/users.ts';
let usersContent = fs.readFileSync(usersFile, 'utf8');

usersContent = usersContent.replace(
  /let perms = \{\};\s*try \{ perms = u\.permissions \? JSON\.parse\(u\.permissions\) : \{\}; \} catch\(e\) \{\}/,
  `let perms: any = {};
      if (u.role === 'admin') {
        perms = { ${adminPermsCode} };
      } else {
        try { perms = u.permissions ? JSON.parse(u.permissions) : {}; } catch(e) {}
      }`
);

usersContent = usersContent.replace(
  /const { email, password, name, role, permissions } = req\.body;/g,
  `let { email, password, name, role, permissions } = req.body;
  if (role === 'admin') {
    permissions = { ${adminPermsCode} };
  }`
);

fs.writeFileSync(usersFile, usersContent);

console.log('Successfully enforced admin permissions');
