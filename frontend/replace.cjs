const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "if (user?.permissions?.dashboard?.view) tabs.push({ name: 'Dashboard', path: '/' });",
  "if (user?.permissions?.dashboard?.view) tabs.push({ name: 'Dashboard', path: '/' });\n  if (user?.permissions?.reports?.view) tabs.push({ name: 'Reports', path: '/reports' });"
);

content = content.replace(
  '<Route path="/" element={user?.permissions?.dashboard?.view ? <DashboardTab suppliers={suppliers} invoices={invoices} accounts={accounts} collections={collections} /> : <AccessDenied />} />',
  '<Route path="/" element={user?.permissions?.dashboard?.view ? <DashboardTab suppliers={suppliers} invoices={invoices} accounts={accounts} collections={collections} /> : <AccessDenied />} />\n          <Route path="/reports" element={user?.permissions?.reports?.view ? <ReportsTab invoices={invoices} payments={payments} collections={collections} suppliers={suppliers} accounts={accounts} /> : <AccessDenied />} />'
);

content = content.replace(
  "['dashboard', 'invoices', 'payments', 'collections', 'suppliers', 'accounts', 'users']",
  "['dashboard', 'reports', 'invoices', 'payments', 'collections', 'suppliers', 'accounts', 'users']"
);

content = content.replace(/{mod !== 'dashboard' &&/g, "{mod !== 'dashboard' && mod !== 'reports' &&");

fs.writeFileSync(file, content);
