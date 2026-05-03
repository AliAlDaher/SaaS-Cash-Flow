import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@local.com';
  const password = '123456';
  const role = 'admin';

  console.log('Seeding admin user...');

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    console.log('Admin user already exists. Skipping...');
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  
  const defaultPermissions = {
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

  const admin = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role,
      name: 'System Admin',
      permissions: JSON.stringify(defaultPermissions)
    },
  });

  console.log(`Admin user created: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
