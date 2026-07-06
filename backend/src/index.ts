import fs from 'fs';
import path from 'path';
import cron from 'node-cron';
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import compression from 'compression';
import suppliersRouter from './routes/suppliers';
import invoicesRouter from './routes/invoices';
import paymentsRouter from './routes/payments';
import accountsRouter from './routes/accounts';
import collectionsRouter from './routes/collections';
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import chequesRouter from './routes/cheques';
import expensesRouter from './routes/expenses';
import onboardingRouter from './routes/onboarding';
import prisma, { centralPrisma, tenantStorage } from './prisma';
import { getPrismaClientForTenant } from './prismaManager';
import { tenantMiddleware } from './middleware/tenantMiddleware';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in the environment variables!');
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 3001;

// CORS configured to dynamically accept subdomains of localhost:5173 or production domain
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    try {
      const url = new URL(origin);
      const hostname = url.hostname;
      if (
        hostname === 'localhost' ||
        hostname.endsWith('.localhost') ||
        origin === process.env.FRONTEND_URL
      ) {
        return callback(null, true);
      }
    } catch (e) {}
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());
app.use(compression());

// Public onboarding and authentication endpoints (without tenant middleware)
app.use("/onboarding", onboardingRouter);
app.use("/auth", authRouter);

// Apply tenant context middleware to protect and isolate cash flow endpoints
app.use(tenantMiddleware);

app.use("/suppliers", suppliersRouter);
app.use("/invoices", invoicesRouter);
app.use("/payments", paymentsRouter);
app.use("/accounts", accountsRouter);
app.use("/collections", collectionsRouter);
app.use("/users", usersRouter);
app.use("/cheques", chequesRouter);
app.use("/expenses", expensesRouter);

app.use(errorHandler);

app.get('/', (req: Request, res: Response) => {
  res.send('Cash Flow API is running 🚀');
});



// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'Cash Flow Management System API is running',
    timestamp: new Date().toISOString()
  });
});


// Automated monthly expenses generation across all tenant databases
cron.schedule('0 0 1 * *', async () => {
  console.log('[Cron] Running monthly expenses generation across all tenants...');
  try {
    // Fetch all active registered tenants from the Central DB
    const tenants = await centralPrisma.tenant.findMany();
    
    for (const tenant of tenants) {
      console.log(`[Cron] Seeding expenses for company subdomain: "${tenant.subdomain}"`);
      try {
        const tenantClient = getPrismaClientForTenant(tenant.subdomain, tenant.dbConnectionString);
        
        // Execute the seeding logic in the context of this tenant's database connection
        await tenantStorage.run(tenantClient, async () => {
          const now = new Date();
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
          
          const existingCount = await prisma.expense.count({
            where: {
              note: { startsWith: 'Automated monthly expense for' },
              date: {
                gte: startOfMonth,
                lte: endOfMonth
              }
            }
          });
          
          if (existingCount > 0) {
            console.log(`[Cron] Monthly expenses already generated for "${tenant.subdomain}". Skipping.`);
            return;
          }

          const account = await prisma.account.findFirst({ orderBy: { id: 'asc' } });
          if (!account) {
            console.log(`[Cron] No bank accounts found for "${tenant.subdomain}". Skipping.`);
            return;
          }

          let categories = ['رواتب', 'الضمان الاجتماعي', 'كهرباء', 'إنترنت'];
          const categoriesFilePath = path.join(__dirname, '../categories.json');
          if (fs.existsSync(categoriesFilePath)) {
            try {
              const fileData = fs.readFileSync(categoriesFilePath, 'utf-8');
              const parsed = JSON.parse(fileData);
              if (Array.isArray(parsed) && parsed.length > 0) {
                categories = parsed;
              }
            } catch (e) {
              console.error(`[Cron] Failed to read categories.json for "${tenant.subdomain}"`, e);
            }
          }
          
          for (const cat of categories) {
            await prisma.expense.create({
              data: {
                category: cat,
                amount: 0,
                paidAmount: 0,
                date: now,
                accountId: account.id,
                note: `Automated monthly expense for ${now.toLocaleString('default', { month: 'long', year: 'numeric' })}`
              }
            });
          }
          console.log(`[Cron] Monthly expenses successfully generated for "${tenant.subdomain}".`);
        });
      } catch (tenantError) {
        console.error(`[Cron] Failed expense generation for tenant "${tenant.subdomain}":`, tenantError);
      }
    }
  } catch (error) {
    console.error('[Cron] Fatal error in monthly expenses cron job:', error);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
