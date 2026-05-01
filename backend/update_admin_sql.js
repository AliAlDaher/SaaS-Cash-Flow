const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateAdmin() {
  try {
    const users = await prisma.$queryRaw`SELECT * FROM [User] WHERE role = 'admin'`;
    const admin = Array.isArray(users) ? users[0] : null;
    if (admin) {
      const defaultPerms = {
        canViewDashboard: true,
        canManageAccounts: true,
        canManageCollections: true,
        canManageSuppliers: true,
        canManageInvoices: true,
        canManagePayments: true,
        canDelete: true,
        canEdit: true,
        canCreate: true
      };
      await prisma.$executeRaw`UPDATE [User] SET permissions = ${JSON.stringify(defaultPerms)} WHERE id = ${admin.id}`;
      console.log('Admin permissions updated successfully');
    } else {
      console.log('No admin user found');
    }
  } catch (err) {
    console.error(err);
  }
}

updateAdmin()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
