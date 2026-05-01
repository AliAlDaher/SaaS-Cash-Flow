const fs = require('fs');
const file = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

const badString = `          <Route path="/payments" element={user?.permissions?.payments?.view ? <PaymentsTab suppliers={suppliers} payments={payments} accounts={accounts} onRefresh={fetchData} onDelete={(id) =>\n          <Route path="/users" element={user?.permissions?.users?.view ? <UsersTab /> : <AccessDenied />} /> openDeleteModal(id, 'payments', 'Payment')}  /> : <AccessDenied />} />`;
const goodString = `          <Route path="/payments" element={user?.permissions?.payments?.view ? <PaymentsTab suppliers={suppliers} payments={payments} accounts={accounts} onRefresh={fetchData} onDelete={(id) => openDeleteModal(id, 'payments', 'Payment')}  /> : <AccessDenied />} />\n          <Route path="/users" element={user?.permissions?.users?.view ? <UsersTab /> : <AccessDenied />} />`;

content = content.replace(badString, goodString);
fs.writeFileSync(file, content);
console.log('Fixed Route');
