const fs = require('fs');

const file = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// The problematic lines look like this:
// {user?.permissions?.suppliers?.edit && {(user?.role === 'admin' || user?.permissions?.suppliers?.edit) && <button ... >Edit</button>}}
// We want to replace it with:
// {(user?.role === 'admin' || user?.permissions?.suppliers?.edit) && <button ... >Edit</button>}

const regex = /\{user\?\.permissions\?\.([a-zA-Z]+)\?\.(edit|delete)\s*&&\s*\{(\(user\?\.role === 'admin' \|\| user\?\.permissions\?\.\1\?\.\2\)\s*&&\s*<button[^>]+>(?:Edit|Delete)<\/button>)\}\}/g;

content = content.replace(regex, '{$3}');

// Also there might be cases where it's `[something ? 'edit' : 'create']`? The regex matches `\.(edit|delete)`. 

fs.writeFileSync(file, content);
console.log('Fixed syntax errors');
