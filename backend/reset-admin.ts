import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function resetAdminPassword() {
  const email = 'admin@local.com';
  const newPassword = '123456';

  console.log(`Resetting password for ${email}...`);

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  try {
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
      },
    });
    console.log(`Successfully reset password for: ${updatedUser.email}`);
  } catch (error) {
    console.error(`Error: User ${email} not found or update failed.`);
  }
}

resetAdminPassword()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
