const fs = require('fs');
const file = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/\{user\?\.permissions\?\.([a-zA-Z]+)\?\.(edit|delete) && \{/g, '{');
content = content.replace(/<\/button>\}\}/g, '</button>}');

// What about CollectionsTab and UsersTab which had editingUser or editCollectionId?
// In UsersTab:
// {user?.permissions?.users?.edit && {(user?.role === 'admin' || user?.permissions?.users?.edit) && <button onClick={() => handleEdit(u)} className="text-indigo-600 hover:text-indigo-900 font-medium mr-3">Edit</button>}}
// It matches!

fs.writeFileSync(file, content);
console.log('Fixed syntax errors via simple replace');
