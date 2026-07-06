import { centralPrisma } from './src/prisma';
import { getPrismaClientForTenant } from './src/prismaManager';

async function run() {
  try {
    const tenants = await centralPrisma.tenant.findMany();
    console.log(`Found ${tenants.length} tenants. Syncing users centrally...`);

    for (const tenant of tenants) {
      console.log(`Syncing users for tenant: "${tenant.subdomain}"...`);
      const tenantClient = getPrismaClientForTenant(tenant.subdomain, tenant.dbConnectionString);
      
      const users = await tenantClient.user.findMany();
      console.log(`Found ${users.length} users in tenant "${tenant.subdomain}".`);
      
      for (const user of users) {
        const email = user.email.toLowerCase().trim();
        // Insert into TenantUser centrally if not already exists
        const existing = await centralPrisma.tenantUser.findUnique({
          where: { email }
        });
        if (!existing) {
          await centralPrisma.tenantUser.create({
            data: {
              email,
              subdomain: tenant.subdomain
            }
          });
          console.log(`Registered user "${email}" under tenant "${tenant.subdomain}".`);
        } else {
          console.log(`User "${email}" is already registered centrally.`);
        }
      }
    }
    console.log("Migration complete!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await centralPrisma.$disconnect();
  }
}
run();
