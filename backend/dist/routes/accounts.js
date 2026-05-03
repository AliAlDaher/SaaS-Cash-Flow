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
router.post('/', (0, auth_1.requirePermission)('accounts', 'create'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, type, balance } = req.body;
        const account = yield prisma.account.create({
            data: {
                name,
                type,
                balance: balance ? new library_1.Decimal(balance) : new library_1.Decimal(0)
            }
        });
        res.status(201).json(account);
    }
    catch (error) {
        res.status(500).json({ error: 'Error creating account', details: error.message || String(error) });
    }
}));
router.get('/', (0, auth_1.requirePermission)('accounts', 'view'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accounts = yield prisma.account.findMany({ orderBy: { id: "desc" } });
        res.json(accounts);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching accounts', details: error.message || String(error) });
    }
}));
router.get('/:id', (0, auth_1.requirePermission)('accounts', 'view'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const account = yield prisma.account.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { adjustments: { orderBy: { createdAt: 'desc' } } }
        });
        if (!account)
            return res.status(404).json({ error: 'Account not found' });
        res.json(account);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching account', details: error.message || String(error) });
    }
}));
router.delete('/:id', (0, auth_1.requirePermission)('accounts', 'delete'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid account ID' });
    }
    try {
        yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const paymentCount = yield tx.payment.count({ where: { accountId: id } });
            const collectionCount = yield tx.collection.count({ where: { accountId: id } });
            const adjustmentCount = yield tx.accountAdjustment.count({ where: { accountId: id } });
            if (paymentCount > 0 || collectionCount > 0 || adjustmentCount > 0) {
                let reasons = [];
                if (paymentCount > 0)
                    reasons.push(`${paymentCount} payments`);
                if (collectionCount > 0)
                    reasons.push(`${collectionCount} collections`);
                if (adjustmentCount > 0)
                    reasons.push(`${adjustmentCount} adjustments`);
                throw new Error(`Cannot delete account. Linked data remaining: ${reasons.join(', ')}.`);
            }
            const account = yield tx.account.findUnique({ where: { id } });
            if (!account) {
                throw new Error('Account not found');
            }
            yield tx.account.delete({ where: { id } });
        }));
        res.status(200).json({ message: 'Account deleted successfully' });
    }
    catch (error) {
        res.status(400).json({ error: error.message || 'Error deleting account' });
    }
}));
router.post('/:id/reconcile', (0, auth_1.requirePermission)('accounts', 'edit'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { actualBalance, note } = req.body;
        const accountId = parseInt(id);
        const result = yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const account = yield tx.account.findUnique({ where: { id: accountId } });
            if (!account)
                throw new Error('Account not found');
            const systemBalance = new library_1.Decimal(account.balance);
            const targetBalance = new library_1.Decimal(actualBalance);
            const diff = targetBalance.minus(systemBalance);
            if (diff.equals(0)) {
                return { message: 'Balance is already in sync', account };
            }
            // Record the adjustment
            yield tx.accountAdjustment.create({
                data: {
                    accountId,
                    amount: diff,
                    systemBalance,
                    actualBalance: targetBalance,
                    note: note || 'Bank Reconciliation'
                }
            });
            // Update account balance
            const updatedAccount = yield tx.account.update({
                where: { id: accountId },
                data: { balance: targetBalance }
            });
            return updatedAccount;
        }));
        res.json(result);
    }
    catch (error) {
        res.status(400).json({ error: 'Error reconciling account', details: error.message || String(error) });
    }
}));
exports.default = router;
