import { centralPrisma } from './src/prisma';
async function run() {
  try {
    const tenants = await centralPrisma.tenant.findMany();
    console.log("Registered Tenants:", tenants);
  } catch (err) {
    console.error("Error fetching tenants:", err);
  }
}
run();
