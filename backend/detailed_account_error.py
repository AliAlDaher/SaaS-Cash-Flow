path = r'c:\\Users\\DELL\\.gemini\\antigravity\\brain\\1e70835b-96e1-481b-8a66-641bd45c1cc5\\cash-flow-system\\backend\\src\\routes\\accounts.ts'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

new_logic = """      const paymentCount = await tx.payment.count({ where: { accountId: id } });
      const collectionCount = await tx.collection.count({ where: { accountId: id } });
      const adjustmentCount = await tx.accountAdjustment.count({ where: { accountId: id } });

      if (paymentCount > 0 || collectionCount > 0 || adjustmentCount > 0) {
        let reasons = [];
        if (paymentCount > 0) reasons.push(`${paymentCount} payments`);
        if (collectionCount > 0) reasons.push(`${collectionCount} collections`);
        if (adjustmentCount > 0) reasons.push(`${adjustmentCount} adjustments`);
        throw new Error(`Cannot delete account. Linked data remaining: ${reasons.join(', ')}.`);
      }"""

# Find the block I added in the previous turn
old_block = """      const paymentCount = await tx.payment.count({ where: { accountId: id } });
      const collectionCount = await tx.collection.count({ where: { accountId: id } });
      const adjustmentCount = await tx.accountAdjustment.count({ where: { accountId: id } });

      if (paymentCount > 0 || collectionCount > 0 || adjustmentCount > 0) {
        throw new Error('Cannot delete account because it has existing transactions or balance adjustments.');
      }"""

content = content.replace(old_block, new_logic)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
