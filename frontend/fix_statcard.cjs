const fs = require('fs');
const file = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<StatCard title="Expected Collections" value=\{<FormatCurrency amount=\{totalExpected\} \/>\} icon=\{<Clock className="w-5 h-5 text-orange-500" \/>\} valueColor="text-orange-600" \/\} icon=\{<Wallet className="w-5 h-5 text-emerald-600" \/>\} \/>/,
  '<StatCard title="Expected Collections" value={<FormatCurrency amount={totalExpected} />} icon={<Clock className="w-5 h-5 text-orange-500" />} valueColor="text-orange-600" />'
);

fs.writeFileSync(file, content);
console.log('Fixed syntax error in App.tsx');
