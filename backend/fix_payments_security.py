path = r'c:\Users\DELL\.gemini\antigravity\brain\1e70835b-96e1-481b-8a66-641bd45c1cc5\cash-flow-system\backend\src\routes\payments.ts'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add AuthRequest import
content = content.replace("import { requireAuth, requirePermission } from '../middleware/auth';", "import { requireAuth, requirePermission, AuthRequest } from '../middleware/auth';")

# Update GET /payments
old_get = """router.get('/', requirePermission('payments', 'view'), async (req: Request, res: Response) => {
  try {
    const payments = await prisma.payment.findMany({ orderBy: { id: "desc" },
      include: { account: true, invoice: true }
    });
    res.json(payments);
  } catch (error: any) {
    res.status(500).json({ error: 'Error fetching payments', details: error.message || String(error) });
  }
});"""

new_get = """router.get('/', requirePermission('payments', 'view'), async (req: AuthRequest, res: Response) => {
  try {
    const hasAccountsView = req.user?.role === 'admin' || req.user?.permissions?.accounts?.view;
    
    const payments = await prisma.payment.findMany({ 
      orderBy: { id: "desc" },
      include: { 
        account: true, 
        invoice: true 
      } 
    });

    if (!hasAccountsView) {
      const filtered = payments.map(p => {
        if (p.account) {
          const { balance, ...rest } = p.account as any;
          return { ...p, account: rest };
        }
        return p;
      });
      return res.json(filtered);
    }

    res.json(payments);
  } catch (error: any) {
    res.status(500).json({ error: 'Error fetching payments', details: error.message || String(error) });
  }
});"""

content = content.replace(old_get, new_get)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
