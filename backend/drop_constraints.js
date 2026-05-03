const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tables = ['Account', 'Invoice', 'Payment', 'Collection'];
  
  for (const table of tables) {
    try {
      // Find default constraints for the table
      const constraints = await prisma.$queryRawUnsafe(`
        SELECT name, OBJECT_NAME(parent_object_id) as table_name
        FROM sys.default_constraints
        WHERE parent_object_id = OBJECT_ID('${table}')
      `);
      
      for (const c of constraints) {
        console.log(`Dropping constraint ${c.name} on ${table}`);
        await prisma.$executeRawUnsafe(`ALTER TABLE [${table}] DROP CONSTRAINT [${c.name}]`);
      }
    } catch (e) {
      console.error(`Error processing table ${table}:`, e.message);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());