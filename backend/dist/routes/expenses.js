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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Get all expenses
router.get('/', auth_1.requireAuth, (0, auth_1.requirePermission)('expenses', 'view'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const expenses = yield prisma.expense.findMany({
            include: { account: true },
            orderBy: { date: 'desc' }
        });
        res.json(expenses);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
}));
// Add new expense
router.post('/', auth_1.requireAuth, (0, auth_1.requirePermission)('expenses', 'create'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { category, amount, accountId, date, note } = req.body;
    try {
        const result = yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const expDate = new Date(date);
            // Determine if it is a planned/future expense
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const targetDate = new Date(expDate);
            targetDate.setHours(0, 0, 0, 0);
            const isFuture = targetDate > today;
            const paid = !isFuture;
            const expense = yield tx.expense.create({
                data: {
                    category,
                    amount,
                    accountId: parseInt(accountId),
                    date: expDate,
                    note,
                    paid
                }
            });
            // Deduct from account balance ONLY if it is not a future/planned expense
            if (paid) {
                yield tx.account.update({
                    where: { id: parseInt(accountId) },
                    data: { balance: { decrement: amount } }
                });
            }
            return expense;
        }));
        res.json(result);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create expense' });
    }
}));
// Delete expense
router.delete('/:id', auth_1.requireAuth, (0, auth_1.requirePermission)('expenses', 'delete'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const expense = yield tx.expense.findUnique({ where: { id } });
            if (!expense)
                throw new Error('Expense not found');
            // Add back to account balance
            yield tx.account.update({
                where: { id: expense.accountId },
                data: { balance: { increment: expense.amount } }
            });
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
        const updated = yield prisma.expense.update({
            where: { id },
            data: { reminder: Boolean(reminder) }
        });
        res.json(updated);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
// Pay/clear a planned expense
router.patch('/:id/pay', auth_1.requireAuth, (0, auth_1.requirePermission)('expenses', 'edit'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const { accountId } = req.body;
        const result = yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const expense = yield tx.expense.findUnique({ where: { id } });
            if (!expense)
                throw new Error('Expense not found');
            if (expense.paid)
                throw new Error('Expense is already paid');
            const parsedAccountId = parseInt(accountId);
            // 1. Deduct from the selected payment account
            yield tx.account.update({
                where: { id: parsedAccountId },
                data: { balance: { decrement: expense.amount } }
            });
            // 2. Update the expense record with today's date, new account, clear reminder, and mark as paid
            const updated = yield tx.expense.update({
                where: { id },
                data: {
                    accountId: parsedAccountId,
                    date: new Date(), // Set to today (actual payment date)
                    reminder: false, // Clear reminder/approval checkmark
                    paid: true // Mark as fully paid!
                }
            });
            return updated;
        }));
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
exports.default = router;
