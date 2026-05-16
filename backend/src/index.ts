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
    const account = await prisma.account.findFirst();
    if (!account) {
      console.log('No accounts found. Skipping monthly expenses.');
      return;
    }

    const categories = ['رواتب', 'الضمان الاجتماعي', 'كهرباء', 'إنترنت'];
    const now = new Date();
    
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
