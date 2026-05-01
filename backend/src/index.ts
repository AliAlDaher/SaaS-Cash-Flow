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
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.use("/suppliers", suppliersRouter);
app.use("/invoices", invoicesRouter);
app.use("/payments", paymentsRouter);
app.use("/accounts", accountsRouter);
app.use("/collections", collectionsRouter);
app.use("/auth", authRouter);
app.use("/users", usersRouter);

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
