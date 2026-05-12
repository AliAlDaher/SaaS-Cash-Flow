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
const library_1 = require("@prisma/client/runtime/library");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.use(auth_1.requireAuth);
// Get all cheques
router.get('/', (0, auth_1.requirePermission)('cheques', 'view'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cheques = yield prisma.cheque.findMany({
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
        const { amount, chequeDate, accountId, supplierId, invoiceId } = req.body;
        if (!accountId) {
            return res.status(400).json({ error: 'Account is required.' });
        }
        const parsedAccountId = parseInt(accountId);
        const accountExists = yield prisma.account.findUnique({ where: { id: parsedAccountId } });
        if (!accountExists) {
            return res.status(400).json({ error: 'Selected account does not exist.' });
        }
        if (supplierId) {
            const parsedSupplierId = parseInt(supplierId);
            const supplierExists = yield prisma.supplier.findUnique({ where: { id: parsedSupplierId } });
            if (!supplierExists) {
                return res.status(400).json({ error: `Selected supplier (ID ${parsedSupplierId}) does not exist.` });
            }
        }
        if (invoiceId) {
            const parsedInvoiceId = parseInt(invoiceId);
            const invoiceExists = yield prisma.invoice.findUnique({ where: { id: parsedInvoiceId } });
            if (!invoiceExists) {
                return res.status(400).json({ error: `Invoice with ID ${parsedInvoiceId} does not exist.` });
            }
        }
        const cheque = yield prisma.cheque.create({
            data: {
                amount: new library_1.Decimal(amount),
                chequeDate: new Date(chequeDate),
                accountId: parsedAccountId,
                supplierId: supplierId ? parseInt(supplierId) : null,
                invoiceId: invoiceId ? parseInt(invoiceId) : null,
                status: 'Pending'
            }
        });
        res.status(201).json(cheque);
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
        const result = yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
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
        }));
        res.json(result);
    }
    catch (error) {
        next(error);
    }
}));
// Delete cheque
router.delete('/:id', (0, auth_1.requirePermission)('cheques', 'delete'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const cheque = yield tx.cheque.findUnique({ where: { id: parseInt(id) } });
            if (!cheque)
                throw new Error('Cheque not found');
            if (cheque.status === 'Cleared') {
                yield tx.account.update({
                    where: { id: cheque.accountId },
                    data: { balance: { increment: cheque.amount } }
                });
            }
            yield tx.cheque.delete({ where: { id: parseInt(id) } });
        }));
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
}));
// Postpone cheque due date
router.patch('/:id/postpone', (0, auth_1.requirePermission)('cheques', 'create'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { postponeDate, reason } = req.body;
        const existing = yield prisma.cheque.findUnique({ where: { id: parseInt(id) } });
        if (!existing)
            return res.status(404).json({ error: 'Cheque not found' });
        const originalDateStr = new Date(existing.chequeDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
        const targetDateStr = new Date(postponeDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
        const postponementLog = "[Postponed from " + originalDateStr + " to " + targetDateStr + (reason ? ": " + reason : "") + "]";
        const newNote = existing.note
            ? existing.note + " " + postponementLog
            : postponementLog;
        const updated = yield prisma.cheque.update({
            where: { id: parseInt(id) },
            data: {
                chequeDate: new Date(postponeDate),
                note: newNote
            }
        });
        res.json(updated);
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
