const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  let account = await prisma.account.findFirst();
  if (!account) {
    account = await prisma.account.create({
      data: { name: 'Default Account', type: 'Bank', balance: 0 }
    });
  }
  const result = await prisma.payment.updateMany({
    where: { accountId: null },
    data: { accountId: account.id }
  });
  console.log('Updated payments:', result.count);
}
main().catch(console.error).finally(() => prisma.$disconnect());
