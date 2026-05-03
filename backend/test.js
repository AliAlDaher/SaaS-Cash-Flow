const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();

async function run() {
    try {
        const res = await prisma.invoice.update({
            where: { id: 1020 },
            data: { reminder: false, reminderAmount: null }
        });
        console.log("Success:", res);
    } catch (e) {
        console.error("Error:", e.message);
    }
}
run();
