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
const fifo_1 = require("../utils/fifo");
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const library_1 = require("@prisma/client/runtime/library");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
// Get all cheques
router.get('/', (0, auth_1.requirePermission)('cheques', 'view'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cheques = yield prisma_1.default.cheque.findMany({
            include: {
                account: true,
                supplier: true,
                invoice: true
            },
            orderBy: { chequeDate: 'asc' }
        });
        res.json(cheques);
    }
    catch (error) {
        next(error);
    }
}));
// Create cheque
router.post('/', (0, auth_1.requirePermission)('cheques', 'create'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { amount, chequeDate, accountId, supplierId, invoiceId, note } = req.body;
        if (!accountId) {
            return res.status(400).json({ error: 'Account is required.' });
        }
        const parsedAccountId = parseInt(accountId);
        const accountExists = yield prisma_1.default.account.findUnique({ where: { id: parsedAccountId } });
        if (!accountExists) {
            return res.status(400).json({ error: 'Selected account does not exist.' });
        }
        if (supplierId) {
            const parsedSupplierId = parseInt(supplierId);
            const supplierExists = yield prisma_1.default.supplier.findUnique({ where: { id: parsedSupplierId } });
            if (!supplierExists) {
                return res.status(400).json({ error: `Selected supplier (ID ${parsedSupplierId}) does not exist.` });
            }
        }
        if (invoiceId) {
            const parsedInvoiceId = parseInt(invoiceId);
            const invoiceExists = yield prisma_1.default.invoice.findUnique({ where: { id: parsedInvoiceId } });
            if (!invoiceExists) {
                return res.status(400).json({ error: `Invoice with ID ${parsedInvoiceId} does not exist.` });
            }
        }
        const { deductFromBalance } = req.body;
        const result = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const cheque = yield tx.cheque.create({
                data: {
                    amount: new library_1.Decimal(amount),
                    chequeDate: new Date(chequeDate),
                    accountId: parsedAccountId,
                    supplierId: supplierId ? parseInt(supplierId) : null,
                    invoiceId: invoiceId ? parseInt(invoiceId) : null,
                    status: 'Pending',
                    note: note || null,
                    deductFromBalance: Boolean(deductFromBalance)
                }
            });
            if (deductFromBalance && supplierId) {
                yield tx.payment.create({
                    data: {
                        supplierId: parseInt(supplierId),
                        amount: new library_1.Decimal(amount),
                        paymentDate: new Date(chequeDate),
                        accountId: parsedAccountId,
                        invoiceId: invoiceId ? parseInt(invoiceId) : null,
                        chequeId: cheque.id
                    }
                });
                yield (0, fifo_1.recalculateFIFO)(tx, parseInt(supplierId));
            }
            return cheque;
        }), { timeout: 30000 });
        res.status(201).json(result);
    }
    catch (error) {
        next(error);
    }
}));
// Update status
router.patch('/:id/status', (0, auth_1.requirePermission)('cheques', 'edit'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status } = req.body; // Pending, Cleared, Bounced
        const result = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const oldCheque = yield tx.cheque.findUnique({ where: { id: parseInt(id) } });
            if (!oldCheque)
                throw new Error('Cheque not found');
            if (oldCheque.status === status)
                return oldCheque;
            if (status === 'Cleared' && oldCheque.status !== 'Cleared') {
                yield tx.account.update({
                    where: { id: oldCheque.accountId },
                    data: { balance: { decrement: oldCheque.amount } }
                });
            }
            else if (oldCheque.status === 'Cleared' && status !== 'Cleared') {
                yield tx.account.update({
                    where: { id: oldCheque.accountId },
                    data: { balance: { increment: oldCheque.amount } }
                });
            }
            const updated = yield tx.cheque.update({
                where: { id: parseInt(id) },
                data: { status }
            });
            return updated;
        }), { timeout: 30000 });
        res.json(result);
    }
    catch (error) {
        next(error);
    }
}));
// Update/Edit cheque
router.put('/:id', (0, auth_1.requirePermission)('cheques', 'edit'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { amount, chequeDate, accountId, supplierId, invoiceId, note, status, deductFromBalance } = req.body;
        if (!accountId) {
            return res.status(400).json({ error: 'Account is required.' });
        }
        const parsedAccountId = parseInt(accountId);
        const accountExists = yield prisma_1.default.account.findUnique({ where: { id: parsedAccountId } });
        if (!accountExists) {
            return res.status(400).json({ error: 'Selected account does not exist.' });
        }
        if (supplierId) {
            const parsedSupplierId = parseInt(supplierId);
            const supplierExists = yield prisma_1.default.supplier.findUnique({ where: { id: parsedSupplierId } });
            if (!supplierExists) {
                return res.status(400).json({ error: `Selected supplier (ID ${parsedSupplierId}) does not exist.` });
            }
        }
        if (invoiceId) {
            const parsedInvoiceId = parseInt(invoiceId);
            const invoiceExists = yield prisma_1.default.invoice.findUnique({ where: { id: parsedInvoiceId } });
            if (!invoiceExists) {
                return res.status(400).json({ error: `Invoice with ID ${parsedInvoiceId} does not exist.` });
            }
        }
        const chequeId = parseInt(id);
        const result = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const oldCheque = yield tx.cheque.findUnique({
                where: { id: chequeId },
                include: { payment: true }
            });
            if (!oldCheque)
                throw new Error('Cheque not found');
            const targetStatus = status !== undefined ? status : oldCheque.status;
            const targetAmount = amount !== undefined ? new library_1.Decimal(amount) : oldCheque.amount;
            const targetAccountId = parsedAccountId;
            const targetSupplierId = supplierId ? parseInt(supplierId) : null;
            const targetInvoiceId = invoiceId ? parseInt(invoiceId) : null;
            const targetDeductFromBalance = deductFromBalance !== undefined ? Boolean(deductFromBalance) : oldCheque.deductFromBalance;
            // Handle account balance adjustments if the cheque is Cleared
            if (oldCheque.status === 'Cleared') {
                yield tx.account.update({
                    where: { id: oldCheque.accountId },
                    data: { balance: { increment: oldCheque.amount } }
                });
            }
            if (targetStatus === 'Cleared') {
                yield tx.account.update({
                    where: { id: targetAccountId },
                    data: { balance: { decrement: targetAmount } }
                });
            }
            // Handle linked payment updates
            if (oldCheque.payment) {
                if (targetDeductFromBalance && targetSupplierId) {
                    yield tx.payment.update({
                        where: { id: oldCheque.payment.id },
                        data: {
                            supplierId: targetSupplierId,
                            amount: targetAmount,
                            paymentDate: chequeDate ? new Date(chequeDate) : oldCheque.chequeDate,
                            accountId: targetAccountId,
                            invoiceId: targetInvoiceId
                        }
                    });
                    if (oldCheque.supplierId !== targetSupplierId) {
                        if (oldCheque.supplierId) {
                            yield (0, fifo_1.recalculateFIFO)(tx, oldCheque.supplierId);
                        }
                        yield (0, fifo_1.recalculateFIFO)(tx, targetSupplierId);
                    }
                    else {
                        yield (0, fifo_1.recalculateFIFO)(tx, targetSupplierId);
                    }
                }
                else {
                    yield tx.payment.delete({
                        where: { id: oldCheque.payment.id }
                    });
                    if (oldCheque.supplierId) {
                        yield (0, fifo_1.recalculateFIFO)(tx, oldCheque.supplierId);
                    }
                }
            }
            else {
                if (targetDeductFromBalance && targetSupplierId) {
                    yield tx.payment.create({
                        data: {
                            supplierId: targetSupplierId,
                            amount: targetAmount,
                            paymentDate: chequeDate ? new Date(chequeDate) : oldCheque.chequeDate,
                            accountId: targetAccountId,
                            invoiceId: targetInvoiceId,
                            chequeId: chequeId
                        }
                    });
                    yield (0, fifo_1.recalculateFIFO)(tx, targetSupplierId);
                }
            }
            const updated = yield tx.cheque.update({
                where: { id: chequeId },
                data: {
                    amount: targetAmount,
                    chequeDate: chequeDate ? new Date(chequeDate) : oldCheque.chequeDate,
                    accountId: targetAccountId,
                    supplierId: targetSupplierId,
                    invoiceId: targetInvoiceId,
                    note: note !== undefined ? note : oldCheque.note,
                    status: targetStatus,
                    deductFromBalance: targetDeductFromBalance
                }
            });
            return updated;
        }), { timeout: 30000 });
        res.json(result);
    }
    catch (error) {
        res.status(400).json({ error: error.message || String(error) });
    }
}));
// Delete cheque
router.delete('/:id', (0, auth_1.requirePermission)('cheques', 'delete'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const cheque = yield tx.cheque.findUnique({
                where: { id: parseInt(id) },
                include: { payment: true }
            });
            if (!cheque)
                throw new Error('Cheque not found');
            if (cheque.payment) {
                yield tx.payment.delete({ where: { id: cheque.payment.id } });
                if (cheque.supplierId) {
                    yield (0, fifo_1.recalculateFIFO)(tx, cheque.supplierId);
                }
            }
            if (cheque.status === 'Cleared') {
                yield tx.account.update({
                    where: { id: cheque.accountId },
                    data: { balance: { increment: cheque.amount } }
                });
            }
            yield tx.cheque.delete({ where: { id: parseInt(id) } });
        }), { timeout: 30000 });
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
