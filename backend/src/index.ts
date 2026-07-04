import fs from 'fs';
import path from 'path';
import cron from 'node-cron';
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import suppliersRouter from './routes/suppliers';
import invoicesRouter from './routes/invoices';
import paymentsRouter from './routes/payments';
import accountsRouter from './routes/accounts';
import collectionsRouter from './routes/collections';
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import chequesRouter from './routes/cheques';
import expensesRouter from './routes/expenses';
import prisma from './prisma';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in the environment variables!');
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 3001;


const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:5173'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(express.json());

app.use("/suppliers", suppliersRouter);
app.use("/invoices", invoicesRouter);
app.use("/payments", paymentsRouter);
app.use("/accounts", accountsRouter);
app.use("/collections", collectionsRouter);
app.use("/auth", authRouter);
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


// Automated monthly expenses generation
cron.schedule('0 0 1 * *', async () => {
  console.log('Running monthly expenses generation...');
  try {
    const now = new Date();
    // Idempotency check: prevent duplicate generation if cron runs twice or server restarts on the 1st
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
      console.log('Monthly expenses already generated for this month. Skipping.');
      return;
    }

    // Deterministic account: Order by ID asc to ensure consistency across restarts
    const account = await prisma.account.findFirst({ orderBy: { id: 'asc' } });
    if (!account) {
      console.log('No accounts found. Skipping monthly expenses.');
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
        console.error('Failed to read categories.json in cron', e);
      }
    }
    
    for (const cat of categories) {
      await prisma.expense.create({
        data: {
          category: cat,
          amount: 0, // Default to 0, user will modify
          paidAmount: 0,
          date: now,
          accountId: account.id,
          note: `Automated monthly expense for ${now.toLocaleString('default', { month: 'long', year: 'numeric' })}`
        }
      });
    }
    console.log('Monthly expenses generated successfully.');
  } catch (error) {
    console.error('Error generating monthly expenses:', error);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
