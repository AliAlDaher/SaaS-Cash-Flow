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
// Add new expense (created as Unpaid with paidAmount = 0, no bank account deduction on creation)
router.post('/', auth_1.requireAuth, (0, auth_1.requirePermission)('expenses', 'create'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { category, amount, accountId, date, note } = req.body;
    try {
        const expense = yield prisma.expense.create({
            data: {
                category,
                amount,
                paidAmount: 0, // Unpaid by default
                accountId: parseInt(accountId),
                date: new Date(date),
                note
            }
        });
        res.json(expense);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create expense' });
    }
}));
// Delete expense (restores any actually paid amount back to the account balance)
router.delete('/:id', auth_1.requireAuth, (0, auth_1.requirePermission)('expenses', 'delete'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
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
// Pay/clear a planned expense (supports partial payments, deducts chosen bank account balance)
router.patch('/:id/pay', auth_1.requireAuth, (0, auth_1.requirePermission)('expenses', 'edit'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const { accountId, amount } = req.body;
        const result = yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const expense = yield tx.expense.findUnique({ where: { id } });
            if (!expense)
                throw new Error('Expense not found');
            const remaining = Number(expense.amount) - Number(expense.paidAmount);
            if (remaining <= 0)
                throw new Error('Expense is already fully paid');
            // Default payment amount is the remaining balance
            const paymentAmount = amount !== undefined ? Number(amount) : remaining;
            if (paymentAmount <= 0)
                throw new Error('Payment amount must be greater than 0');
            if (paymentAmount > remaining)
                throw new Error('Payment amount cannot exceed remaining amount');
            const parsedAccountId = parseInt(accountId);
            // 1. Deduct from the selected payment account balance
            yield tx.account.update({
                where: { id: parsedAccountId },
                data: { balance: { decrement: paymentAmount } }
            });
            // 2. Increment paidAmount on the expense, update accountId, date, and set reminder to false if fully paid
            const isFullyPaid = (Number(expense.paidAmount) + paymentAmount) >= Number(expense.amount);
            const updated = yield tx.expense.update({
                where: { id },
                data: {
                    accountId: parsedAccountId,
                    paidAmount: { increment: paymentAmount },
                    date: new Date(), // Set date to actual payment execution date
                    reminder: isFullyPaid ? false : expense.reminder // Clear reminder checkmark only when fully paid
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
router.patch('/:id/postpone', auth_1.requireAuth, (0, auth_1.requirePermission)('cheques', 'create'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const { postponeDate, reason } = req.body;
        const existing = yield prisma.expense.findUnique({ where: { id } });
        if (!existing)
            return res.status(404).json({ error: 'Expense not found' });
        const originalDateStr = new Date(existing.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
        const targetDateStr = new Date(postponeDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
        const postponementLog = "[Postponed from " + originalDateStr + " to " + targetDateStr + (reason ? ": " + reason : "") + "]";
        const updatedNote = existing.note
            ? existing.note + " " + postponementLog
            : postponementLog;
        const expense = yield prisma.expense.update({
            where: { id },
            data: {
                date: new Date(postponeDate),
                reminder: false, // Automatically clears the manager reminder!
                note: updatedNote
            }
        });
        res.json(expense);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
exports.default = router;
