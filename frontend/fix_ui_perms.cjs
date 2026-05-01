const fs = require('fs');

const file = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Invoices table buttons (passed as props)
content = content.replace(
  /<InvoiceTable invoices=\{invoices\} suppliers=\{suppliers\} showDescription=\{true\} onEditClick=\{handleEditClick\} onDeleteClick=\{onDelete\} \/>/g,
  `<InvoiceTable invoices={invoices} suppliers={suppliers} showDescription={true} onEditClick={(user?.role === 'admin' || user?.permissions?.invoices?.edit) ? handleEditClick : undefined} onDeleteClick={(user?.role === 'admin' || user?.permissions?.invoices?.delete) ? onDelete : undefined} />`
);

content = content.replace(
  /<InvoiceTable invoices=\{invoices\.slice\(0, 5\)\} suppliers=\{suppliers\} \/>/g,
  `<InvoiceTable invoices={invoices.slice(0, 5)} suppliers={suppliers} />`
);

// 2. Hide forms
const tabs = [
  { fn: 'SuppliersTab', mod: 'suppliers', editVar: 'editSupplierId' },
  { fn: 'InvoicesTab', mod: 'invoices', editVar: 'editInvoiceId' },
  { fn: 'PaymentsTab', mod: 'payments', editVar: 'editPaymentId' },
  { fn: 'AccountsTab', mod: 'accounts', editVar: 'editAccountId' },
  { fn: 'CollectionsTab', mod: 'collections', editVar: 'editCollectionId' },
  { fn: 'UsersTab', mod: 'users', editVar: 'editingUser' },
];

for (const tab of tabs) {
  // Find where the form block starts. It's the first <div className="bg-white... p-6 ... max-w-..."> after <header> or <h1>
  const regex = new RegExp(`function ${tab.fn}\\([\\s\\S]*?return \\(\\s*<div className="space-y-8">\\s*(?:<header>[\\s\\S]*?<\\/header>|<h1[\\s\\S]*?<\\/h1>)\\s*(<div className="bg-white[^>]+p-6[^>]+>)`);
  const match = content.match(regex);
  
  if (match) {
    const divOpen = match[1];
    const replacement = `{(user?.role === 'admin' || (${tab.editVar} ? user?.permissions?.${tab.mod}?.edit : user?.permissions?.${tab.mod}?.create)) && (\n      ${divOpen}`;
    
    // Now we need to find the closing </div> of this block.
    // It's followed by `<div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">` (the table container)
    // We can replace `</form>\n      </div>\n\n      <div className="bg-white rounded-2xl`
    const endRegex = new RegExp(`(<\\/form>\\s*<\\/div>\\s*)(<div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">)`);
    
    // Scoped replacement
    const tabStart = match.index;
    const nextTabStart = content.indexOf('function ', tabStart + 10);
    const tabContent = content.substring(tabStart, nextTabStart !== -1 ? nextTabStart : content.length);
    
    let updatedTabContent = tabContent.replace(divOpen, replacement);
    updatedTabContent = updatedTabContent.replace(endRegex, `$1)}\n\n      $2`);
    
    content = content.substring(0, tabStart) + updatedTabContent + content.substring(nextTabStart !== -1 ? nextTabStart : content.length);
  }
}

// 3. Fix inline action buttons in tables
// Replace static Edit/Delete buttons with conditional rendering in each Tab function
function wrapButtons(tabName, module) {
  const tabStart = content.indexOf(`function ${tabName}(`);
  const nextTabStart = content.indexOf('function ', tabStart + 10);
  let tabContent = content.substring(tabStart, nextTabStart !== -1 ? nextTabStart : content.length);

  // Edit button
  tabContent = tabContent.replace(
    /(?:\{\(\(user\?\.permissions\?\.([a-zA-Z]+)\?\.edit\)\)\s*\?\s*)?<button onClick=\{[^}]+\}\s+className="text-indigo-600[^"]*">Edit<\/button>(?:\s*:\s*null\})?/g,
    (match) => {
      // Extract the onClick
      const onClickMatch = match.match(/onClick=\{([^}]+)\}/);
      if (onClickMatch) {
        return `{(user?.role === 'admin' || user?.permissions?.${module}?.edit) && <button onClick={${onClickMatch[1]}} className="text-indigo-600 hover:text-indigo-900 font-medium mr-3">Edit</button>}`;
      }
      return match;
    }
  );

  // Delete button
  tabContent = tabContent.replace(
    /(?:\{\(\(user\?\.permissions\?\.([a-zA-Z]+)\?\.delete\)\)\s*\?\s*)?<button onClick=\{[^}]+\}\s+className="text-rose-600[^"]*">Delete<\/button>(?:\s*:\s*null\})?/g,
    (match) => {
      // Extract the onClick
      const onClickMatch = match.match(/onClick=\{([^}]+)\}/);
      if (onClickMatch) {
        return `{(user?.role === 'admin' || user?.permissions?.${module}?.delete) && <button onClick={${onClickMatch[1]}} className="text-rose-600 hover:text-rose-900 font-medium">Delete</button>}`;
      }
      return match;
    }
  );

  content = content.substring(0, tabStart) + tabContent + content.substring(nextTabStart !== -1 ? nextTabStart : content.length);
}

wrapButtons('SuppliersTab', 'suppliers');
wrapButtons('PaymentsTab', 'payments');
wrapButtons('AccountsTab', 'accounts');
wrapButtons('CollectionsTab', 'collections');
wrapButtons('UsersTab', 'users');

fs.writeFileSync(file, content);
console.log('UI forms and buttons updated successfully');
