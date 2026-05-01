const fs = require('fs');

const file = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /import \{ Activity, FileText, CheckCircle, AlertCircle, Clock, CreditCard, AlertTriangle, Landmark, TrendingUp, Wallet \} from 'lucide-react'/,
  "import { Activity, FileText, CheckCircle, AlertCircle, Clock, CreditCard, AlertTriangle, Landmark, TrendingUp, Wallet, ArrowLeft } from 'lucide-react'"
);

fs.writeFileSync(file, content);
console.log('Added ArrowLeft import');
