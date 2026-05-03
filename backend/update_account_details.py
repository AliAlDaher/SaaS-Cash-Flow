path = r'c:\Users\DELL\.gemini\antigravity\brain\1e70835b-96e1-481b-8a66-641bd45c1cc5\cash-flow-system\backend\src\routes\accounts.ts'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old_get_id = """router.get('/:id', requirePermission('accounts', 'view'), async (req: Request, res: Response) => {
  try {
    const account = await prisma.account.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!account) return res.status(404).json({ error: 'Account not found' });
    res.json(account);
  } catch (error: any) {
    res.status(500).json({ error: 'Error fetching account', details: error.message || String(error) });
  }
});"""

new_get_id = """router.get('/:id', requirePermission('accounts', 'view'), async (req: Request, res: Response) => {
  try {
    const account = await prisma.account.findUnique({ 
      where: { id: parseInt(req.params.id) },
      include: { adjustments: { orderBy: { createdAt: 'desc' } } }
    });
    if (!account) return res.status(404).json({ error: 'Account not found' });
    res.json(account);
  } catch (error: any) {
    res.status(500).json({ error: 'Error fetching account', details: error.message || String(error) });
  }
});"""

content = content.replace(old_get_id, new_get_id)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
