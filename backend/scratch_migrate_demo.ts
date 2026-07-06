import { centralPrisma } from './src/prisma';
async function run() {
  try {
    const updated = await centralPrisma.tenant.updateMany({
      where: { subdomain: 'demo' },
      data: { subscriptionCode: '123456' }
    });
    console.log("Successfully updated demo tenant:", updated);
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await centralPrisma.$disconnect();
  }
}
run();
