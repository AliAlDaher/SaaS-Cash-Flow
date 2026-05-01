const fs = require('fs');
const file = 'src/ReportsTab.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace('import { Wallet, TrendingUp, AlertTriangle, Clock } from \'lucide-react\';', 'import { Wallet, TrendingUp, Clock } from \'lucide-react\';');
content = content.replace('export function ReportsTab({ invoices, payments, collections, suppliers, accounts }: any) {', 'export function ReportsTab({ invoices, payments, collections, suppliers }: any) {');
fs.writeFileSync(file, content);
