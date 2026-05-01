"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const client_1 = require("@prisma/client");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
const prisma = new client_1.PrismaClient();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/suppliers", suppliers_1.default);
app.use("/invoices", invoices_1.default);
app.use("/payments", payments_1.default);
app.use("/accounts", accounts_1.default);
app.use("/collections", collections_1.default);
app.use("/auth", auth_1.default);
app.use("/users", users_1.default);
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
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
