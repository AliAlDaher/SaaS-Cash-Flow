const fs = require('fs');

const appFile = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx';
const loginFile = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/Login.tsx';

function updateFile(file) {
  let content = fs.readFileSync(file, 'utf8');

  // 1. Navbar Logo Replacement in App.tsx
  if (file === appFile) {
    const navbarLogoRegex = /<div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">\s*<LayoutDashboard className="w-6 h-6 text-white" \/>\s*<\/div>\s*<span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">PayFlow Pro<\/span>/;
    
    // In case colors were changed or different
    const fallbackNavbarRegex = /<div className="w-10 h-10[^>]*>\s*<LayoutDashboard[^>]*\/>\s*<\/div>\s*<span className="text-xl font-bold[^>]*>PayFlow Pro<\/span>/;

    const newLogoHtml = `<img src="/logo.jpg" alt="Smart Lines" className="h-10 w-auto object-contain drop-shadow-sm" />`;

    if (navbarLogoRegex.test(content)) {
      content = content.replace(navbarLogoRegex, newLogoHtml);
    } else if (fallbackNavbarRegex.test(content)) {
      content = content.replace(fallbackNavbarRegex, newLogoHtml);
    }
    
    // Also change "PayFlow Pro" in window title or login if any
    content = content.replace(/PayFlow Pro/g, 'Smart Lines');

    // 2. Dashboard Cards Colors
    // Total Cash -> sky
    content = content.replace(
      /<StatCard title="Total Cash" value=\{<FormatCurrency amount=\{totalCash\} \/>\} icon=\{<Wallet className="w-5 h-5 text-emerald-500" \/>\} valueColor="text-emerald-600" \/>/,
      `<StatCard title="Total Cash" value={<FormatCurrency amount={totalCash} />} icon={<Wallet className="w-5 h-5 text-sky-500" />} valueColor="text-sky-600" />`
    );
    // Total Remaining -> sky
    content = content.replace(
      /<StatCard title="Total Remaining" value=\{<FormatCurrency amount=\{totalRemaining\} \/>\} icon=\{<Clock className="w-5 h-5 text-amber-500" \/>\} \/>/,
      `<StatCard title="Total Remaining" value={<FormatCurrency amount={totalRemaining} />} icon={<Clock className="w-5 h-5 text-sky-500" />} />`
    );

    // 3. Status colors updates
    // Partial payment: amber -> orange
    content = content.replace(
      /bg-amber-50 text-amber-700 border border-amber-200/g,
      'bg-orange-50 text-orange-700 border border-orange-200'
    );
    // Upcoming: blue -> sky
    content = content.replace(
      /bg-blue-50 text-blue-700 border-blue-200/g,
      'bg-sky-50 text-sky-700 border-sky-200'
    );
  }

  if (file === loginFile) {
    // Replace PayFlow Pro
    content = content.replace(/PayFlow Pro/g, 'Smart Lines');
    // Replace layout dashboard icon with logo
    const loginLogoRegex = /<div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 mb-6">\s*<LayoutDashboard className="w-8 h-8 text-white" \/>\s*<\/div>/;
    const newLoginLogo = `<img src="/logo.jpg" alt="Smart Lines" className="h-16 w-auto object-contain mb-6 drop-shadow-md" />`;
    if (loginLogoRegex.test(content)) {
      content = content.replace(loginLogoRegex, newLoginLogo);
    } else {
      content = content.replace(
        /<div className="w-16 h-16[^>]*>\s*<LayoutDashboard[^>]*\/>\s*<\/div>/,
        newLoginLogo
      );
    }
  }

  // 4. Global Color Replace (indigo -> sky)
  // We use sky as primary brand blue. 
  content = content.replace(/indigo/g, 'sky');

  fs.writeFileSync(file, content);
}

updateFile(appFile);
updateFile(loginFile);
console.log('UI theme and logos updated successfully');
