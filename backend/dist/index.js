"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const node_cron_1 = __importDefault(require("node-cron"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const suppliers_1 = __importDefault(require("./routes/suppliers"));
const invoices_1 = __importDefault(require("./routes/invoices"));
const payments_1 = __importDefault(require("./routes/payments"));
const accounts_1 = __importDefault(require("./routes/accounts"));
const collections_1 = __importDefault(require("./routes/collections"));
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const cheques_1 = __importDefault(require("./routes/cheques"));
const expenses_1 = __importDefault(require("./routes/expenses"));
const prisma_1 = __importDefault(require("./prisma"));
const errorHandler_1 = require("./middleware/errorHandler");
dotenv_1.default.config();
if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined in the environment variables!');
    process.exit(1);
}
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:5173'];
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));
app.use(express_1.default.json());
app.use("/suppliers", suppliers_1.default);
app.use("/invoices", invoices_1.default);
app.use("/payments", payments_1.default);
app.use("/accounts", accounts_1.default);
app.use("/collections", collections_1.default);
app.use("/auth", auth_1.default);
app.use("/users", users_1.default);
app.use("/cheques", cheques_1.default);
app.use("/expenses", expenses_1.default);
app.use(errorHandler_1.errorHandler);
app.get('/', (req, res) => {
    res.send('Cash Flow API is running 🚀');
});
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Cash Flow Management System API is running',
        timestamp: new Date().toISOString()
    });
});
// Automated monthly expenses generation
node_cron_1.default.schedule('0 0 1 * *', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Running monthly expenses generation...');
    try {
        const now = new Date();
        // Idempotency check: prevent duplicate generation if cron runs twice or server restarts on the 1st
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        const existingCount = yield prisma_1.default.expense.count({
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
        const account = yield prisma_1.default.account.findFirst({ orderBy: { id: 'asc' } });
        if (!account) {
            console.log('No accounts found. Skipping monthly expenses.');
            return;
        }
        let categories = ['رواتب', 'الضمان الاجتماعي', 'كهرباء', 'إنترنت'];
        const categoriesFilePath = path_1.default.join(__dirname, '../categories.json');
        if (fs_1.default.existsSync(categoriesFilePath)) {
            try {
                const fileData = fs_1.default.readFileSync(categoriesFilePath, 'utf-8');
                const parsed = JSON.parse(fileData);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    categories = parsed;
                }
            }
            catch (e) {
                console.error('Failed to read categories.json in cron', e);
            }
        }
        for (const cat of categories) {
            yield prisma_1.default.expense.create({
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
    }
    catch (error) {
        console.error('Error generating monthly expenses:', error);
    }
}));
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
