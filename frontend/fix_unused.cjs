const fs = require('fs');
const file = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/function App\(\) \{\s*const \{ user \} = useAuth\(\);/, 'function App() {');

fs.writeFileSync(file, content);
console.log('Fixed unused user variable');
