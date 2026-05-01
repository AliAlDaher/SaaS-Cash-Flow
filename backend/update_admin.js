const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateAdmin() {
  const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
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
}

updateAdmin()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
