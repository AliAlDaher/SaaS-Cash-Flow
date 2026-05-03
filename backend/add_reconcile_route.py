path = r'c:\Users\DELL\.gemini\antigravity\brain\1e70835b-96e1-481b-8a66-641bd45c1cc5\cash-flow-system\backend\src\routes\accounts.ts'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update imports
content = content.replace("from '../middleware/auth';", "from '../middleware/auth', AuthRequest } from '../middleware/auth';")
content = content.replace("from '../middleware/auth', AuthRequest }", "from '../middleware/auth';\nimport { AuthRequest }") # Fix if replacement was messy

# Actually cleaner to just do this:
content = content.replace("import { requireAuth, requirePermission } from '../middleware/auth';", "import { requireAuth, requirePermission, AuthRequest } from '../middleware/auth';")

# 2. Add the reconcile route before the export
new_route = """
router.post('/:id/reconcile', requirePermission('accounts', 'edit'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { actualBalance, note } = req.body;
    const accountId = parseInt(id);

    const result = await prisma.$transaction(async (tx) => {
      const account = await tx.account.findUnique({ where: { id: accountId } });
      if (!account) throw new Error('Account not found');

      const systemBalance = new Decimal(account.balance);
      const targetBalance = new Decimal(actualBalance);
      const diff = targetBalance.minus(systemBalance);

      if (diff.equals(0)) {
        return { message: 'Balance is already in sync', account };
      }

      // Record the adjustment
      await (tx as any).accountAdjustment.create({
        data: {
          accountId,
          amount: diff,
          systemBalance,
          actualBalance: targetBalance,
          note: note || 'Bank Reconciliation'
        }
      });

      // Update account balance
      const updatedAccount = await tx.account.update({
        where: { id: accountId },
        data: { balance: targetBalance }
      });

      return updatedAccount;
    });

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: 'Error reconciling account', details: error.message || String(error) });
  }
});

"""

content = content.replace("export default router;", new_route + "export default router;")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
