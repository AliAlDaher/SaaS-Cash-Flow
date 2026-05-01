const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();

async function checkAdmin() {
  const users = await prisma.$queryRaw`SELECT * FROM [User]`;
  console.log(users);
}

checkAdmin().finally(() => prisma.$disconnect());
