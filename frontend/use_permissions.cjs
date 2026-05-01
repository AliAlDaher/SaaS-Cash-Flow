const fs = require('fs');
const file = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace hasPermission(user, 'xxx') with user?.permissions?.xxx
content = content.replace(/hasPermission\(user, '([a-zA-Z]+)'\)/g, 'user?.permissions?.$1');

// Replace complex hasPermission calls
// hasPermission(user, editSupplierId ? 'canEdit' : 'canCreate')
content = content.replace(/hasPermission\(user, ([^)]+)\)/g, '(user?.permissions?.[$1])');

// Remove hasPermission definition
content = content.replace(/function hasPermission[\s\S]*?return user\?\.permissions\?\\.\[permissionName\] === true;\n}/g, '');

fs.writeFileSync(file, content);
console.log('Successfully updated App.tsx to use user?.permissions?.xxx');
