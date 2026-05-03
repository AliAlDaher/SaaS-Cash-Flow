path = r'c:\\Users\\DELL\\.gemini\\antigravity\\brain\\1e70835b-96e1-481b-8a66-641bd45c1cc5\\cash-flow-system\\backend\\src\\routes\\accounts.ts'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old_checks = """      const paymentCount = await tx.payment.count({ where: { accountId: id } });
      const collectionCount = await tx.collection.count({ where: { accountId: id } });

      if (paymentCount > 0 || collectionCount > 0) {
        throw new Error('Cannot delete account because it has existing transactions.');
      }"""

new_checks = """      const paymentCount = await tx.payment.count({ where: { accountId: id } });
      const collectionCount = await tx.collection.count({ where: { accountId: id } });
      const adjustmentCount = await tx.accountAdjustment.count({ where: { accountId: id } });

      if (paymentCount > 0 || collectionCount > 0 || adjustmentCount > 0) {
        throw new Error('Cannot delete account because it has existing transactions or balance adjustments.');
      }"""

content = content.replace(old_checks, new_checks)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
