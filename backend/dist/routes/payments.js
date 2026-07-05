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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fifo_1 = require("../utils/fifo");
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const library_1 = require("@prisma/client/runtime/library");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.post('/', (0, auth_1.requirePermission)('payments', 'create'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { supplierId, amount, paymentDate, accountId, invoiceId, allocations } = req.body;
        if (!accountId) {
            return res.status(400).json({ error: 'accountId is required' });
        }
        const result = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const baseDate = paymentDate ? new Date(paymentDate) : new Date();
            const parsedAccountId = parseInt(accountId);
            const totalAmount = new library_1.Decimal(amount);
            const account = yield tx.account.findUnique({ where: { id: parsedAccountId } });
            if (!account || new library_1.Decimal(account.balance).lessThan(totalAmount)) {
                throw new Error('Insufficient balance in selected account');
            }
            // If allocations are provided (Manual Mode)
            if (allocations && Array.isArray(allocations) && allocations.length > 0) {
                for (const alloc of allocations) {
                    const allocAmount = new library_1.Decimal(alloc.amount);
                    if (allocAmount.lessThanOrEqualTo(0))
                        continue;
                    yield tx.payment.create({
                        data: {
                            supplierId: parseInt(supplierId),
                            amount: allocAmount,
                            paymentDate: baseDate,
                            accountId: parsedAccountId,
                            invoiceId: parseInt(alloc.invoiceId)
                        }
                    });
                }
            }
            else {
                // Auto Mode (FIFO)
                yield tx.payment.create({
                    data: {
                        supplierId: parseInt(supplierId),
                        amount: totalAmount,
                        paymentDate: baseDate,
                        accountId: parsedAccountId,
                        invoiceId: invoiceId ? parseInt(invoiceId) : null
                    }
                });
            }
            // Deduct total amount from account once
            yield tx.account.update({
                where: { id: parsedAccountId },
                data: { balance: { decrement: totalAmount } }
            });
            yield (0, fifo_1.recalculateFIFO)(tx, parseInt(supplierId));
            return { message: 'Payment processed successfully' };
        }), { timeout: 30000 });
        res.status(201).json(result);
    }
    catch (error) {
        next(error);
    }
}));
router.put('/:id', (0, auth_1.requirePermission)('payments', 'edit'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { supplierId, amount, paymentDate, accountId, invoiceId } = req.body;
        if (!accountId) {
            return res.status(400).json({ error: 'accountId is required' });
        }
        const updated = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const oldPayment = yield tx.payment.findUnique({ where: { id: parseInt(id) } });
            if (!oldPayment)
                throw new Error('Payment not found');
            if (oldPayment.chequeId) {
                throw new Error('Cannot modify a payment linked to a cheque. Please manage it via the Cheques tab.');
            }
            const newAmount = new library_1.Decimal(amount);
            const oldAmount = new library_1.Decimal(oldPayment.amount);
            const newAccountId = parseInt(accountId);
            const newSupplierId = parseInt(supplierId);
            // Fetch the target account to check balance
            const targetAccount = yield tx.account.findUnique({ where: { id: newAccountId } });
            if (!targetAccount)
                throw new Error('Account not found');
            // Calculate effective balance if we were to reverse the old payment
            let effectiveBalance = new library_1.Decimal(targetAccount.balance);
            if (oldPayment.accountId === newAccountId) {
                effectiveBalance = effectiveBalance.plus(oldAmount);
            }
            // (debug log removed)
            if (effectiveBalance.lessThan(newAmount)) {
                throw new Error(`Insufficient balance in selected account (Available: ${effectiveBalance}, Required: ${newAmount})`);
            }
            // Update balances
            if (oldPayment.accountId !== newAccountId) {
                // Give back to old account
                yield tx.account.update({
                    where: { id: oldPayment.accountId },
                    data: { balance: { increment: oldAmount } }
                });
                // Take from new account
                yield tx.account.update({
                    where: { id: newAccountId },
                    data: { balance: { decrement: newAmount } }
                });
            }
            else if (!oldAmount.equals(newAmount)) {
                // Same account, just adjust the difference
                const diff = newAmount.minus(oldAmount);
                yield tx.account.update({
                    where: { id: newAccountId },
                    data: { balance: { decrement: diff } }
                });
            }
            const updatedPayment = yield tx.payment.update({
                where: { id: parseInt(id) },
                data: {
                    supplierId: newSupplierId,
                    amount: newAmount,
                    paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
                    accountId: newAccountId,
                    invoiceId: invoiceId ? parseInt(invoiceId) : null
                }
            });
            if (!oldAmount.equals(newAmount) || oldPayment.supplierId !== newSupplierId || oldPayment.invoiceId !== (invoiceId ? parseInt(invoiceId) : null)) {
                if (oldPayment.supplierId !== newSupplierId) {
                    yield (0, fifo_1.recalculateFIFO)(tx, oldPayment.supplierId);
                }
                yield (0, fifo_1.recalculateFIFO)(tx, newSupplierId);
            }
            return updatedPayment;
        }), { timeout: 30000 });
        res.json(updated);
    }
    catch (error) {
        next(error);
    }
}));
router.get('/', (0, auth_1.requirePermission)('payments', 'view'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const hasAccountsView = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === 'admin' || ((_d = (_c = (_b = req.user) === null || _b === void 0 ? void 0 : _b.permissions) === null || _c === void 0 ? void 0 : _c.accounts) === null || _d === void 0 ? void 0 : _d.view);
        const payments = yield prisma_1.default.payment.findMany({
            orderBy: { id: "desc" },
            include: {
                account: true,
                invoice: true
            }
        });
        if (!hasAccountsView) {
            const filtered = payments.map(p => {
                if (p.account) {
                    const _a = p.account, { balance } = _a, rest = __rest(_a, ["balance"]);
                    return Object.assign(Object.assign({}, p), { account: rest });
                }
                return p;
            });
            return res.json(filtered);
        }
        res.json(payments);
    }
    catch (error) {
        next(error);
    }
}));
router.delete('/:id', (0, auth_1.requirePermission)('payments', 'delete'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const payment = yield tx.payment.findUnique({ where: { id: parseInt(id) } });
            if (!payment)
                throw new Error('Payment not found');
            if (payment.chequeId) {
                throw new Error('Cannot delete a payment linked to a cheque. Please manage it via the Cheques tab.');
            }
            yield tx.account.update({
                where: { id: payment.accountId },
                data: { balance: { increment: payment.amount } }
            });
            yield tx.payment.delete({ where: { id: parseInt(id) } });
            yield (0, fifo_1.recalculateFIFO)(tx, payment.supplierId);
        }), { timeout: 30000 });
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
