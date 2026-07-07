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




app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
