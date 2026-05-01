const fs = require('fs');
const file = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Update routing checks (hide pages based on module.view)
content = content.replace(/user\?\.permissions\?\.canManageAccounts/g, 'user?.permissions?.accounts?.view');
content = content.replace(/user\?\.permissions\?\.canManageSuppliers/g, 'user?.permissions?.suppliers?.view');
content = content.replace(/user\?\.permissions\?\.canManageInvoices/g, 'user?.permissions?.invoices?.view');
content = content.replace(/user\?\.permissions\?\.canManagePayments/g, 'user?.permissions?.payments?.view');
content = content.replace(/user\?\.permissions\?\.canManageCollections/g, 'user?.permissions?.collections?.view');
content = content.replace(/user\?\.permissions\?\.canManageUsers/g, 'user?.permissions?.users?.view');

// Dashboard doesn't have a direct "manage" previously, but it had "canViewDashboard" maybe? Wait, dashboard is typically default page. Let's see if there is any `canViewDashboard`.
content = content.replace(/user\?\.permissions\?\.canViewDashboard/g, 'user?.permissions?.dashboard?.view');

// 2. Hide create/edit/delete buttons based on granular permissions
// Since each tab is a separate component, I should replace `user?.permissions?.canDelete` with `user?.permissions?.<moduleName>?.delete`
const tabReplacements = [
  { tab: 'AccountsTab', module: 'accounts' },
  { tab: 'SuppliersTab', module: 'suppliers' },
  { tab: 'InvoicesTab', module: 'invoices' },
  { tab: 'PaymentsTab', module: 'payments' },
  { tab: 'CollectionsTab', module: 'collections' },
  { tab: 'UsersTab', module: 'users' }
];

for (const {tab, module} of tabReplacements) {
  // Regex to find the function block
  const regex = new RegExp(`function ${tab}\\([\\s\\S]*?^}`, 'gm');
  content = content.replace(regex, (match) => {
    let replaced = match;
    replaced = replaced.replace(/user\?\.permissions\?\.canDelete/g, `user?.permissions?.${module}?.delete`);
    replaced = replaced.replace(/user\?\.permissions\?\.canEdit/g, `user?.permissions?.${module}?.edit`);
    replaced = replaced.replace(/user\?\.permissions\?\.canCreate/g, `user?.permissions?.${module}?.create`);
    // Some tabs had `user?.permissions?.[editingAccount ? 'canEdit' : 'canCreate']`
    replaced = replaced.replace(/user\?\.permissions\?\u002E\[[^\]]+\]/g, (innerMatch) => {
      if (innerMatch.includes('canEdit') && innerMatch.includes('canCreate')) {
         // something like user?.permissions?.[editingX ? 'canEdit' : 'canCreate']
         const varName = innerMatch.match(/([a-zA-Z0-9]+)\s*\?/);
         if (varName && varName[1]) {
           return `(user?.permissions?.${module}?.[${varName[1]} ? 'edit' : 'create'])`;
         }
      }
      return innerMatch;
    });
    return replaced;
  });
}

// 3. Update UsersTab UI to use a table for permissions
const oldPermissionsUI = /<div className="mt-4">\s*<label className="block text-sm font-medium mb-2">Permissions<\/label>[\s\S]*?<\/div>\s*<\/div>/m;

const newPermissionsUI = `<div className="mt-4 overflow-x-auto">
              <label className="block text-sm font-medium mb-2">Permissions</label>
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-3 border-b border-slate-200">Module</th>
                    <th className="p-3 border-b border-slate-200 text-center">View</th>
                    <th className="p-3 border-b border-slate-200 text-center">Create</th>
                    <th className="p-3 border-b border-slate-200 text-center">Edit</th>
                    <th className="p-3 border-b border-slate-200 text-center">Delete</th>
                    <th className="p-3 border-b border-slate-200 text-center">All</th>
                  </tr>
                </thead>
                <tbody>
                  {['dashboard', 'invoices', 'payments', 'collections', 'suppliers', 'accounts', 'users'].map((mod) => {
                    const modPerms = permissions[mod] || {};
                    const isAll = modPerms.view && modPerms.create && modPerms.edit && modPerms.delete;
                    
                    const handleToggleAll = (e: React.ChangeEvent<HTMLInputElement>) => {
                      const val = e.target.checked;
                      setPermissions({
                        ...permissions,
                        [mod]: { view: val, create: val, edit: val, delete: val }
                      });
                    };

                    const handleToggleAction = (action: string, val: boolean) => {
                      setPermissions({
                        ...permissions,
                        [mod]: { ...modPerms, [action]: val }
                      });
                    };

                    return (
                      <tr key={mod} className="border-b border-slate-100">
                        <td className="p-3 capitalize font-medium">{mod}</td>
                        <td className="p-3 text-center">
                          <input type="checkbox" checked={!!modPerms.view} onChange={(e) => handleToggleAction('view', e.target.checked)} />
                        </td>
                        <td className="p-3 text-center">
                          {mod !== 'dashboard' && <input type="checkbox" checked={!!modPerms.create} onChange={(e) => handleToggleAction('create', e.target.checked)} />}
                        </td>
                        <td className="p-3 text-center">
                          {mod !== 'dashboard' && <input type="checkbox" checked={!!modPerms.edit} onChange={(e) => handleToggleAction('edit', e.target.checked)} />}
                        </td>
                        <td className="p-3 text-center">
                          {mod !== 'dashboard' && <input type="checkbox" checked={!!modPerms.delete} onChange={(e) => handleToggleAction('delete', e.target.checked)} />}
                        </td>
                        <td className="p-3 text-center border-l border-slate-100 bg-slate-50">
                          {mod !== 'dashboard' && <input type="checkbox" checked={!!isAll} onChange={handleToggleAll} />}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>`;

content = content.replace(oldPermissionsUI, newPermissionsUI);

// remove const permKeys = [...]
content = content.replace(/const permKeys = \[[^\]]+\];/g, '');

fs.writeFileSync(file, content);
console.log('Frontend updated.');
