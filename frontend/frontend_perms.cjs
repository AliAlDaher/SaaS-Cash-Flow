const fs = require('fs');

const frontendFile = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx';
let content = fs.readFileSync(frontendFile, 'utf8');

// Update routing and tabs logic
content = content.replace(/user\?\.permissions\?\.canManageSuppliers/g, "user?.permissions?.suppliers?.view");
content = content.replace(/user\?\.permissions\?\.canManageInvoices/g, "user?.permissions?.invoices?.view");
content = content.replace(/user\?\.permissions\?\.canManagePayments/g, "user?.permissions?.payments?.view");
content = content.replace(/user\?\.permissions\?\.canManageCollections/g, "user?.permissions?.collections?.view");
content = content.replace(/user\?\.permissions\?\.canManageUsers/g, "user?.permissions?.users?.view");
content = content.replace(/user\?\.permissions\?\.canManageAccounts/g, "user?.permissions?.accounts?.view");
content = content.replace(/user\?\.permissions\?\.canViewDashboard/g, "user?.permissions?.dashboard?.view");

// Update inside tabs (edit, delete, create)
// I will just use specific string replacements since there are distinct components

// SuppliersTab
content = content.replace(/function SuppliersTab[^]*?return \([\s\S]*?<\/div>\s*\)\s*}/, (match) => {
  let m = match.replace(/user\?\.permissions\?\.\[[^]+\]/g, "(user?.permissions?.suppliers?.[editSupplierId ? 'edit' : 'create'])");
  m = m.replace(/user\?\.permissions\?\.canEdit/g, "user?.permissions?.suppliers?.edit");
  m = m.replace(/user\?\.permissions\?\.canDelete/g, "user?.permissions?.suppliers?.delete");
  return m;
});

// InvoicesTab
content = content.replace(/function InvoicesTab[^]*?return \([\s\S]*?<\/div>\s*\)\s*}/, (match) => {
  let m = match.replace(/user\?\.permissions\?\.\[[^]+\]/g, "(user?.permissions?.invoices?.[editInvoiceId ? 'edit' : 'create'])");
  m = m.replace(/user\?\.permissions\?\.canEdit/g, "user?.permissions?.invoices?.edit");
  m = m.replace(/user\?\.permissions\?\.canDelete/g, "user?.permissions?.invoices?.delete");
  return m;
});

// PaymentsTab
content = content.replace(/function PaymentsTab[^]*?return \([\s\S]*?<\/div>\s*\)\s*}/, (match) => {
  let m = match.replace(/user\?\.permissions\?\.\[[^]+\]/g, "(user?.permissions?.payments?.[editPaymentId ? 'edit' : 'create'])");
  m = m.replace(/user\?\.permissions\?\.canEdit/g, "user?.permissions?.payments?.edit");
  m = m.replace(/user\?\.permissions\?\.canDelete/g, "user?.permissions?.payments?.delete");
  return m;
});

// AccountsTab
content = content.replace(/function AccountsTab[^]*?return \([\s\S]*?<\/div>\s*\)\s*}/, (match) => {
  let m = match.replace(/user\?\.permissions\?\.\[[^]+\]/g, "(user?.permissions?.accounts?.[editAccountId ? 'edit' : 'create'])");
  m = m.replace(/user\?\.permissions\?\.canEdit/g, "user?.permissions?.accounts?.edit");
  m = m.replace(/user\?\.permissions\?\.canDelete/g, "user?.permissions?.accounts?.delete");
  return m;
});

// CollectionsTab
content = content.replace(/function CollectionsTab[^]*?return \([\s\S]*?<\/div>\s*\)\s*}/, (match) => {
  let m = match.replace(/user\?\.permissions\?\.\[[^]+\]/g, "(user?.permissions?.collections?.[editCollectionId ? 'edit' : 'create'])");
  m = m.replace(/user\?\.permissions\?\.canEdit/g, "user?.permissions?.collections?.edit");
  m = m.replace(/user\?\.permissions\?\.canDelete/g, "user?.permissions?.collections?.delete");
  return m;
});

// Update UsersTab Permissions Matrix
const permMatrixUI = `
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Permissions</label>
              <div className="overflow-hidden border border-slate-200 rounded-lg">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Module</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-slate-500 uppercase">View</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-slate-500 uppercase">Create</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-slate-500 uppercase">Edit</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-slate-500 uppercase">Delete</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-slate-500 uppercase">All</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {['dashboard', 'invoices', 'payments', 'collections', 'suppliers', 'accounts', 'users'].map((mod) => (
                      <tr key={mod}>
                        <td className="px-4 py-2 text-sm font-medium text-slate-900 capitalize">{mod}</td>
                        {['view', 'create', 'edit', 'delete'].map(action => (
                          <td key={action} className="px-4 py-2 text-center">
                            {!(mod === 'dashboard' && action !== 'view') && (
                              <input 
                                type="checkbox" 
                                checked={!!permissions[mod]?.[action]} 
                                onChange={(e) => setPermissions({...permissions, [mod]: {...(permissions[mod] || {}), [action]: e.target.checked}})} 
                              />
                            )}
                          </td>
                        ))}
                        <td className="px-4 py-2 text-center">
                          {mod !== 'dashboard' && (
                            <button 
                              type="button" 
                              onClick={() => setPermissions({...permissions, [mod]: {view: true, create: true, edit: true, delete: true}})} 
                              className="text-xs text-indigo-600 font-medium"
                            >
                              Select All
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
`;

// UsersTab
content = content.replace(/function UsersTab[^]*?return \([\s\S]*?<\/div>\s*\)\s*}/, (match) => {
  let m = match.replace(/user\?\.permissions\?\.\[[^]+\]/g, "(user?.permissions?.users?.[editingUser ? 'edit' : 'create'])");
  m = m.replace(/user\?\.permissions\?\.canEdit/g, "user?.permissions?.users?.edit");
  m = m.replace(/user\?\.permissions\?\.canDelete/g, "user?.permissions?.users?.delete");
  
  // Replace the permKeys and old checkbox mapping with the new table
  m = m.replace(/const permKeys = \[[^\]]+\];/, '');
  m = m.replace(/<div className="mt-4">[\s\S]*?<\/div>\s*<\/div>\s*\)}/m, permMatrixUI + '\n          )}');
  
  return m;
});

fs.writeFileSync(frontendFile, content);
console.log('App.tsx updated');
