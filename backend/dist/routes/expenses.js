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
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get all expenses
router.get('/', auth_1.requireAuth, (0, auth_1.requirePermission)('expenses', 'view'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const expenses = yield prisma_1.default.expense.findMany({
            include: { account: true },
            orderBy: { date: 'desc' }
        });
        res.json(expenses);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
}));
// Generate monthly recurring expenses on demand (e.g. before the month starts)
router.post('/generate-monthly', auth_1.requireAuth, (0, auth_1.requirePermission)('expenses', 'create'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { accountId, targetMonth } = req.body; // targetMonth: "2026-06" (YYYY-MM)
        if (!accountId)
            return res.status(400).json({ error: 'accountId is required' });
        // Parse target month or default to next month
        let targetDate;
        if (targetMonth) {
            targetDate = new Date(targetMonth + '-01');
        }
        else {
            const now = new Date();
            targetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        }
        const monthLabel = targetDate.toLocaleString('ar-SA', { month: 'long', year: 'numeric' });
        let recurringCategories = ['رواتب', 'الضمان الاجتماعي', 'كهرباء', 'إنترنت'];
        const categoriesFilePath = path_1.default.join(__dirname, '../../categories.json');
        if (fs_1.default.existsSync(categoriesFilePath)) {
            try {
                const fileData = fs_1.default.readFileSync(categoriesFilePath, 'utf-8');
                const parsed = JSON.parse(fileData);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    recurringCategories = parsed;
                }
            }
            catch (e) {
                console.error('Failed to read categories.json in generate-monthly', e);
            }
        }
        const created = [];
        for (const category of recurringCategories) {
            const expense = yield prisma_1.default.expense.create({
                data: {
                    category,
                    amount: 0,
                    paidAmount: 0,
                    accountId: parseInt(accountId),
                    date: targetDate,
                    note: 'مصروف شهري - ' + monthLabel
                }
            });
            created.push(expense);
        }
        res.json({ success: true, created });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}));
// Add new expense (handling Paid/Unpaid status toggles and account deductions)
router.post('/', auth_1.requireAuth, (0, auth_1.requirePermission)('expenses', 'create'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { category, amount, accountId, date, note, status } = req.body;
    try {
        const parsedAmount = parseFloat(amount);
        const parsedAccountId = parseInt(accountId);
        if (!category || amount === undefined || amount === null || isNaN(parsedAmount) || parsedAmount <= 0 || accountId === undefined || accountId === null || isNaN(parsedAccountId) || !date || isNaN(Date.parse(date))) {
            return res.status(400).json({ error: 'category, positive amount, accountId, and a valid date are required' });
        }
        const isPaid = status === 'paid';
        const expense = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // 1. Deduct from account balance immediately if Paid
            if (isPaid && parsedAmount > 0) {
                yield tx.account.update({
                    where: { id: parsedAccountId },
                    data: { balance: { decrement: parsedAmount } }
                });
            }
            // 2. Create the expense record
            const created = yield tx.expense.create({
                data: {
                    category,
                    amount: parsedAmount,
                    paidAmount: isPaid ? parsedAmount : 0, // Unpaid or Paid
                    accountId: parsedAccountId,
                    date: new Date(date),
                    note
                }
            });
            return created;
        }));
        res.status(201).json(expense);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message || 'Failed to create expense' });
    }
}));
// Delete expense (restores any actually paid amount back to the account balance)
router.delete('/:id', auth_1.requireAuth, (0, auth_1.requirePermission)('expenses', 'delete'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const expense = yield tx.expense.findUnique({ where: { id } });
            if (!expense)
                throw new Error('Expense not found');
            // Add back only the actually paid amount to the account balance
            if (Number(expense.paidAmount) > 0) {
                yield tx.account.update({
                    where: { id: expense.accountId },
                    data: { balance: { increment: expense.paidAmount } }
                });
            }
            yield tx.expense.delete({ where: { id } });
        }));
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
// Toggle reminder status
router.patch('/:id/reminder', auth_1.requireAuth, (0, auth_1.requirePermission)('expenses', 'edit'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const { reminder } = req.body;
        const updated = yield prisma_1.default.expense.update({
            where: { id },
            data: { reminder: Boolean(reminder) }
        });
        res.json(updated);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
// Edit expense details (handling Paid/Unpaid changes and adjusting account balances)
router.patch('/:id(\\d+)', auth_1.requireAuth, (0, auth_1.requirePermission)('expenses', 'edit'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const { category, amount, accountId, date, note, status } = req.body;
        const updated = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const expense = yield tx.expense.findUnique({ where: { id } });
            if (!expense)
                throw new Error('Expense not found');
            const oldAmount = Number(expense.amount);
            const oldPaid = Number(expense.paidAmount);
            const oldAccountId = expense.accountId;
            const newAmount = amount !== undefined ? parseFloat(amount) : oldAmount;
            const newAccountId = accountId !== undefined ? parseInt(accountId) : oldAccountId;
            const isPaid = status !== undefined ? status === 'paid' : (oldPaid >= oldAmount);
            const newPaid = isPaid ? newAmount : 0;
            // 1. Revert the old payment from the old account
            if (oldPaid > 0) {
                yield tx.account.update({
                    where: { id: oldAccountId },
                    data: { balance: { increment: oldPaid } }
                });
            }
            // 2. Apply the new payment to the new account
            if (newPaid > 0) {
                yield tx.account.update({
                    where: { id: newAccountId },
                    data: { balance: { decrement: newPaid } }
                });
            }
            const updatedExpense = yield tx.expense.update({
                where: { id },
                data: {
                    category,
                    amount: newAmount,
                    paidAmount: newPaid,
                    accountId: newAccountId,
                    date: date ? new Date(date) : undefined,
                    note
                }
            });
            return updatedExpense;
        }));
        res.json(updated);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
const categoriesFilePath = path_1.default.join(__dirname, '../../categories.json');
const defaultCategoriesList = ['إيجار', 'محروقات', 'رواتب', 'صيانة', 'كهرباء', 'مياه', 'إنترنت', 'مستلزمات مكتبية', 'تسويق', 'ضرائب', 'الضمان الاجتماعي', 'أخرى'];
router.get('/categories', auth_1.requireAuth, (req, res) => {
    try {
        if (fs_1.default.existsSync(categoriesFilePath)) {
            const data = fs_1.default.readFileSync(categoriesFilePath, 'utf-8');
            return res.json(JSON.parse(data));
        }
        res.json(defaultCategoriesList);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/categories', auth_1.requireAuth, (0, auth_1.requirePermission)('expenses', 'edit'), (req, res) => {
    try {
        const { categories } = req.body;
        if (!Array.isArray(categories)) {
            return res.status(400).json({ error: 'categories must be an array' });
        }
        fs_1.default.writeFileSync(categoriesFilePath, JSON.stringify(categories, null, 2), 'utf-8');
        res.json({ success: true, categories });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
