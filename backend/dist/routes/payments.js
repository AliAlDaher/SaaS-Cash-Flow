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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const library_1 = require("@prisma/client/runtime/library");
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
        const invoices = yield tx.invoice.findMany({
            where: { supplierId },
            orderBy: { createdAt: 'asc' }
        });
        const payments = yield tx.payment.findMany({
            where: { supplierId },
            orderBy: [{ paymentDate: 'asc' }, { createdAt: 'asc' }]
        });
        const invoicePaidAmounts = {};
        invoices.forEach((inv) => invoicePaidAmounts[inv.id] = new library_1.Decimal(0));
        let unlinkedPaymentsTotal = new library_1.Decimal(0);
        for (const p of payments) {
            const amount = new library_1.Decimal(p.amount);
            if (p.invoiceId && invoicePaidAmounts[p.invoiceId] !== undefined) {
                invoicePaidAmounts[p.invoiceId] = invoicePaidAmounts[p.invoiceId].plus(amount);
            }
            else {
                unlinkedPaymentsTotal = unlinkedPaymentsTotal.plus(amount);
            }
        }
        for (const inv of invoices) {
            const invAmount = new library_1.Decimal(inv.amount);
            let specificPaid = invoicePaidAmounts[inv.id];
            let remainingAmount = invAmount.minus(specificPaid);
            if (remainingAmount.isNegative()) {
                unlinkedPaymentsTotal = unlinkedPaymentsTotal.plus(remainingAmount.abs());
                specificPaid = invAmount;
                remainingAmount = new library_1.Decimal(0);
            }
            let fifoApplied = new library_1.Decimal(0);
            if (unlinkedPaymentsTotal.greaterThan(0) && remainingAmount.greaterThan(0)) {
                fifoApplied = library_1.Decimal.min(remainingAmount, unlinkedPaymentsTotal);
                unlinkedPaymentsTotal = unlinkedPaymentsTotal.minus(fifoApplied);
            }
            const newPaidAmount = specificPaid.plus(fifoApplied);
            const updateData = { paidAmount: newPaidAmount };
            if (inv.reminder) {
                const baseline = new library_1.Decimal(inv.reminderBaseline || 0);
                const requested = inv.reminderAmount ? new library_1.Decimal(inv.reminderAmount) : new library_1.Decimal(inv.amount).minus(baseline);
                const target = baseline.plus(requested);
                if (newPaidAmount.greaterThanOrEqualTo(target)) {
                    updateData.reminder = false;
                    updateData.reminderAmount = null;
                    updateData.reminderBaseline = 0;
                }
            }
            yield tx.invoice.update({
                where: { id: inv.id },
                data: updateData
            });
        }
    });
}
router.post('/', (0, auth_1.requirePermission)('payments', 'create'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { supplierId, amount, paymentDate, accountId, invoiceId } = req.body;
        if (!accountId) {
            return res.status(400).json({ error: 'accountId is required' });
        }
        const payment = yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const baseDate = paymentDate ? new Date(paymentDate) : new Date();
            const parsedAmount = new library_1.Decimal(amount);
            const parsedAccountId = parseInt(accountId);
            const account = yield tx.account.findUnique({ where: { id: parsedAccountId } });
            if (!account || new library_1.Decimal(account.balance).lessThan(parsedAmount)) {
                throw new Error('Insufficient balance in selected account');
            }
            const newPayment = yield tx.payment.create({
                data: {
                    supplierId: parseInt(supplierId),
                    amount: parsedAmount,
                    paymentDate: baseDate,
                    accountId: parsedAccountId,
                    invoiceId: invoiceId ? parseInt(invoiceId) : null
                }
            });
            yield tx.account.update({
                where: { id: parsedAccountId },
                data: { balance: { decrement: parsedAmount } }
            });
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
        const { supplierId, amount, paymentDate, accountId, invoiceId } = req.body;
        if (!accountId) {
            return res.status(400).json({ error: 'accountId is required' });
        }
        const payment = yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const oldPayment = yield tx.payment.findUnique({ where: { id: parseInt(id) } });
            if (!oldPayment)
                throw new Error('Payment not found');
            const newAmount = new library_1.Decimal(amount);
            const newAccountId = parseInt(accountId);
            const newSupplierId = parseInt(supplierId);
            if (oldPayment.accountId !== newAccountId || !new library_1.Decimal(oldPayment.amount).equals(newAmount)) {
                yield tx.account.update({
                    where: { id: oldPayment.accountId },
                    data: { balance: { increment: oldPayment.amount } }
                });
                const newAccount = yield tx.account.findUnique({ where: { id: newAccountId } });
                if (!newAccount || newAccount.balance < newAmount) {
                    throw new Error('Insufficient balance in selected account');
                }
                yield tx.account.update({
                    where: { id: newAccountId },
                    data: { balance: { decrement: newAmount } }
                });
            }
            const updatedPayment = yield tx.payment.update({
                where: { id: parseInt(id) },
                data: {
                    supplierId: newSupplierId,
                    amount: newAmount,
                    paymentDate: new Date(paymentDate),
                    accountId: newAccountId,
                    invoiceId: invoiceId ? parseInt(invoiceId) : null
                }
            });
            if (oldPayment.amount !== newAmount || oldPayment.supplierId !== newSupplierId || oldPayment.invoiceId !== (invoiceId ? parseInt(invoiceId) : null)) {
                if (oldPayment.supplierId !== newSupplierId) {
                    yield recalculateFIFO(tx, oldPayment.supplierId);
                }
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
    var _a, _b, _c, _d;
    try {
        const hasAccountsView = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === 'admin' || ((_d = (_c = (_b = req.user) === null || _b === void 0 ? void 0 : _b.permissions) === null || _c === void 0 ? void 0 : _c.accounts) === null || _d === void 0 ? void 0 : _d.view);
        const payments = yield prisma.payment.findMany({
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
            yield tx.account.update({
                where: { id: payment.accountId },
                data: { balance: { increment: payment.amount } }
            });
            yield tx.payment.delete({ where: { id: parseInt(id) } });
            yield recalculateFIFO(tx, payment.supplierId);
        }));
        res.status(204).send();
    }
    catch (error) {
        res.status(400).json({ error: 'Error deleting payment', details: error.message || String(error) });
    }
}));
exports.default = router;
