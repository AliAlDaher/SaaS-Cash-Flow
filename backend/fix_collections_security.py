path = r'c:\Users\DELL\.gemini\antigravity\brain\1e70835b-96e1-481b-8a66-641bd45c1cc5\cash-flow-system\backend\src\routes\collections.ts'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add AuthRequest import
content = content.replace("import { requireAuth, requirePermission } from '../middleware/auth';", "import { requireAuth, requirePermission, AuthRequest } from '../middleware/auth';")

# Update GET /collections to include account but filter balance
old_get = """router.get('/', requirePermission('collections', 'view'), async (req: Request, res: Response) => {
  try {
    const collections = await prisma.collection.findMany({ orderBy: { id: "desc" }
    });
    res.json(collections);
  } catch (error: any) {
    res.status(500).json({ error: 'Error fetching collections', details: error.message || String(error) });
  }
});"""

new_get = """router.get('/', requirePermission('collections', 'view'), async (req: AuthRequest, res: Response) => {
  try {
    const hasAccountsView = req.user?.role === 'admin' || req.user?.permissions?.accounts?.view;
    
    const collections = await prisma.collection.findMany({ 
      orderBy: { id: "desc" },
      include: { account: true }
    });

    if (!hasAccountsView) {
      const filtered = collections.map(c => {
        if (c.account) {
          const { balance, ...rest } = c.account as any;
          return { ...c, account: rest };
        }
        return c;
      });
      return res.json(filtered);
    }

    res.json(collections);
  } catch (error: any) {
    res.status(500).json({ error: 'Error fetching collections', details: error.message || String(error) });
  }
});"""

content = content.replace(old_get, new_get)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
