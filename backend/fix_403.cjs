const fs = require('fs');

const backendDir = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/backend/src';
const frontendDir = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src';

// 1. Update App.tsx fetchData
const appTsxFile = frontendDir + '/App.tsx';
let appContent = fs.readFileSync(appTsxFile, 'utf8');

const oldFetchData = /const fetchData = async \(\) => \{[\s\S]*?finally \{\s*setLoading\(false\)\s*\}\s*\}/;
const newFetchData = `const fetchData = async () => {
    try {
      setLoading(true);
      const fetchIfPermitted = async (module: string, endpoint: string) => {
        if (user?.role === 'admin' || user?.permissions?.[module]?.view) {
          const res = await apiFetch(\`\${API_URL}\${endpoint}\`);
          if (!res.ok) throw new Error(\`Failed to fetch \${module}\`);
          return res.json();
        }
        return [];
      };

      const [suppliersRes, invoicesRes, paymentsRes, accountsRes, collectionsRes] = await Promise.all([
        fetchIfPermitted('suppliers', '/suppliers'),
        fetchIfPermitted('invoices', '/invoices'),
        fetchIfPermitted('payments', '/payments'),
        fetchIfPermitted('accounts', '/accounts'),
        fetchIfPermitted('collections', '/collections')
      ]);

      setSuppliers(suppliersRes);
      setInvoices(invoicesRes);
      setPayments(paymentsRes);
      setAccounts(accountsRes);
      setCollections(collectionsRes);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }`;

appContent = appContent.replace(oldFetchData, newFetchData);

// Fix unexpected JSON error globally in apiFetch just in case
const oldApiFetch = /const apiFetch = async \(url: string, options: RequestInit = \{\}\) => \{[\s\S]*?return fetch\(url, fetchOptions\);\s*\}/;
const newApiFetch = `const apiFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: \`Bearer \${token}\` } : {}),
    ...options.headers,
  };
  const fetchOptions: RequestInit = { ...options, headers };
  return fetch(url, fetchOptions);
}`;
appContent = appContent.replace(oldApiFetch, newApiFetch);

fs.writeFileSync(appTsxFile, appContent);


// 2. Update auth.ts to map old flat permissions
const authTsxFile = backendDir + '/routes/auth.ts';
let authContent = fs.readFileSync(authTsxFile, 'utf8');

const oldAuthParse = /try \{\s*parsedPerms = user\.permissions \? JSON\.parse\(user\.permissions\) : \{\};\s*\} catch\(e\) \{\}/;
const newAuthParse = `try {
        const flatPerms = user.permissions ? JSON.parse(user.permissions) : {};
        if (!flatPerms.invoices && (flatPerms.canManageInvoices !== undefined || flatPerms.canViewDashboard !== undefined)) {
           parsedPerms = {
             dashboard: { view: !!flatPerms.canViewDashboard },
             invoices: { view: !!flatPerms.canManageInvoices, create: !!flatPerms.canManageInvoices, edit: !!flatPerms.canManageInvoices, delete: !!flatPerms.canDelete },
             payments: { view: !!flatPerms.canManagePayments, create: !!flatPerms.canManagePayments, edit: !!flatPerms.canManagePayments, delete: !!flatPerms.canDelete },
             collections: { view: !!flatPerms.canManageCollections, create: !!flatPerms.canManageCollections, edit: !!flatPerms.canManageCollections, delete: !!flatPerms.canDelete },
             suppliers: { view: !!flatPerms.canManageSuppliers, create: !!flatPerms.canManageSuppliers, edit: !!flatPerms.canManageSuppliers, delete: !!flatPerms.canDelete },
             accounts: { view: !!flatPerms.canManageAccounts, create: !!flatPerms.canManageAccounts, edit: !!flatPerms.canManageAccounts, delete: !!flatPerms.canDelete },
             users: { view: !!flatPerms.canManageUsers, create: !!flatPerms.canManageUsers, edit: !!flatPerms.canManageUsers, delete: !!flatPerms.canManageUsers }
           };
        } else {
           parsedPerms = flatPerms;
        }
      } catch(e) {
        parsedPerms = {};
      }`;

authContent = authContent.replace(oldAuthParse, newAuthParse);
fs.writeFileSync(authTsxFile, authContent);


// 3. Update users.ts to map old flat permissions on GET /
const usersTsxFile = backendDir + '/routes/users.ts';
let usersContent = fs.readFileSync(usersTsxFile, 'utf8');

const oldUsersParse = /try \{ perms = u\.permissions \? JSON\.parse\(u\.permissions\) : \{\}; \} catch\(e\) \{\}/;
const newUsersParse = `try {
          const flatPerms = u.permissions ? JSON.parse(u.permissions) : {};
          if (!flatPerms.invoices && (flatPerms.canManageInvoices !== undefined || flatPerms.canViewDashboard !== undefined)) {
            perms = {
              dashboard: { view: !!flatPerms.canViewDashboard },
              invoices: { view: !!flatPerms.canManageInvoices, create: !!flatPerms.canManageInvoices, edit: !!flatPerms.canManageInvoices, delete: !!flatPerms.canDelete },
              payments: { view: !!flatPerms.canManagePayments, create: !!flatPerms.canManagePayments, edit: !!flatPerms.canManagePayments, delete: !!flatPerms.canDelete },
              collections: { view: !!flatPerms.canManageCollections, create: !!flatPerms.canManageCollections, edit: !!flatPerms.canManageCollections, delete: !!flatPerms.canDelete },
              suppliers: { view: !!flatPerms.canManageSuppliers, create: !!flatPerms.canManageSuppliers, edit: !!flatPerms.canManageSuppliers, delete: !!flatPerms.canDelete },
              accounts: { view: !!flatPerms.canManageAccounts, create: !!flatPerms.canManageAccounts, edit: !!flatPerms.canManageAccounts, delete: !!flatPerms.canDelete },
              users: { view: !!flatPerms.canManageUsers, create: !!flatPerms.canManageUsers, edit: !!flatPerms.canManageUsers, delete: !!flatPerms.canManageUsers }
            };
          } else {
            perms = flatPerms;
          }
        } catch(e) {
          perms = {};
        }`;

usersContent = usersContent.replace(oldUsersParse, newUsersParse);
fs.writeFileSync(usersTsxFile, usersContent);

console.log('Scripts executed successfully');
