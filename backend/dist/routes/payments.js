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
router.use(auth_1.requireAuth);
function recalculateFIFO(tx, supplierId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Reset all invoices paidAmount to 0
        yield tx.invoice.updateMany({
            where: { supplierId },
            data: { paidAmount: 0 }
        });
        // Get all invoices ordered by createdAt asc
        const invoices = yield tx.invoice.findMany({
            where: { supplierId },
            orderBy: { createdAt: 'asc' }
        });
        // Get all payments for this supplier ordered by paymentDate asc
        const payments = yield tx.payment.findMany({
            where: { supplierId },
            orderBy: [{ paymentDate: 'asc' }, { createdAt: 'asc' }]
        });
        let totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
        for (const invoice of invoices) {
            if (totalPaid <= 0)
                break;
            const paymentForInvoice = Math.min(invoice.amount, totalPaid);
            yield tx.invoice.update({
                where: { id: invoice.id },
                data: { paidAmount: paymentForInvoice }
            });
            totalPaid -= paymentForInvoice;
        }
    });
}
router.post('/', (0, auth_1.requirePermission)('payments', 'create'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { supplierId, amount, paymentDate, accountId } = req.body;
        if (!accountId) {
            return res.status(400).json({ error: 'accountId is required' });
        }
        const payment = yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const baseDate = paymentDate ? new Date(paymentDate) : new Date();
            const parsedAmount = parseFloat(amount);
            const parsedAccountId = parseInt(accountId);
            // Check account balance
            const account = yield tx.account.findUnique({ where: { id: parsedAccountId } });
            if (!account || account.balance < parsedAmount) {
                throw new Error('Insufficient balance in selected account');
            }
            const newPayment = yield tx.payment.create({
                data: {
                    supplierId: parseInt(supplierId),
                    amount: parsedAmount,
                    paymentDate: baseDate,
                    accountId: parsedAccountId
                }
            });
            // Deduct from account
            yield tx.account.update({
                where: { id: parsedAccountId },
                data: { balance: { decrement: parsedAmount } }
            });
            // Recalculate FIFO
            yield recalculateFIFO(tx, parseInt(supplierId));
            return newPayment;
        }));
        res.status(201).json(payment);
    }
    catch (error) {
        res.status(400).json({ error: 'Error processing payment', details: error.message || String(error) });
    }
}));
router.put('/:id', (0, auth_1.requirePermission)('payments', 'edit'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { supplierId, amount, paymentDate, accountId } = req.body;
        if (!accountId) {
            return res.status(400).json({ error: 'accountId is required' });
        }
        const payment = yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const oldPayment = yield tx.payment.findUnique({ where: { id: parseInt(id) } });
            if (!oldPayment)
                throw new Error('Payment not found');
            const newAmount = parseFloat(amount);
            const newAccountId = parseInt(accountId);
            const newSupplierId = parseInt(supplierId);
            // Account logic
            if (oldPayment.accountId !== newAccountId || oldPayment.amount !== newAmount) {
                // 1. Reverse old amount
                yield tx.account.update({
                    where: { id: oldPayment.accountId },
                    data: { balance: { increment: oldPayment.amount } }
                });
                // 2. Check new balance
                const newAccount = yield tx.account.findUnique({ where: { id: newAccountId } });
                if (!newAccount || newAccount.balance < newAmount) {
                    throw new Error('Insufficient balance in selected account');
                }
                // 3. Deduct new amount
                yield tx.account.update({
                    where: { id: newAccountId },
                    data: { balance: { decrement: newAmount } }
                });
            }
            // Update payment record
            const updatedPayment = yield tx.payment.update({
                where: { id: parseInt(id) },
                data: {
                    supplierId: newSupplierId,
                    amount: newAmount,
                    paymentDate: new Date(paymentDate),
                    accountId: newAccountId
                }
            });
            // Maintain FIFO
            if (oldPayment.amount !== newAmount || oldPayment.supplierId !== newSupplierId) {
                // Recalculate FIFO for old supplier (if changed)
                if (oldPayment.supplierId !== newSupplierId) {
                    yield recalculateFIFO(tx, oldPayment.supplierId);
                }
                // Recalculate FIFO for new supplier
                yield recalculateFIFO(tx, newSupplierId);
            }
            return updatedPayment;
        }));
        res.json(payment);
    }
    catch (error) {
        res.status(400).json({ error: 'Error updating payment', details: error.message || String(error) });
    }
}));
router.get('/', (0, auth_1.requirePermission)('payments', 'view'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payments = yield prisma.payment.findMany({
            orderBy: { createdAt: 'desc' },
            include: { account: true }
        });
        res.json(payments);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching payments', details: error.message || String(error) });
    }
}));
router.delete('/:id', (0, auth_1.requirePermission)('payments', 'delete'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const payment = yield tx.payment.findUnique({ where: { id: parseInt(id) } });
            if (!payment)
                throw new Error('Payment not found');
            // 1. Restore account balance
            yield tx.account.update({
                where: { id: payment.accountId },
                data: { balance: { increment: payment.amount } }
            });
            // 2. Delete payment
            yield tx.payment.delete({ where: { id: parseInt(id) } });
            // 3. Undo FIFO allocation
            yield recalculateFIFO(tx, payment.supplierId);
        }));
        res.status(204).send();
    }
    catch (error) {
        res.status(400).json({ error: 'Error deleting payment', details: error.message || String(error) });
    }
}));
exports.default = router;
