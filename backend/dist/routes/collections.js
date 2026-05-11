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
const getExchangeRate = (currency) => {
    if (currency === 'SAR')
        return 5.3;
    // Ignore USD as requested, fallback to 1
    return 1;
};
router.post('/', (0, auth_1.requirePermission)('collections', 'create'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { amount, currency, accountId, note, expectedDate, receivedDate, status } = req.body;
        // Ignore any exchangeRate sent from frontend
        const exchangeRate = getExchangeRate(currency);
        const amountInBase = new library_1.Decimal(amount).div(exchangeRate);
        const collection = yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const newCollection = yield tx.collection.create({
                data: {
                    amount: new library_1.Decimal(amount),
                    currency,
                    exchangeRate,
                    amountInBase,
                    accountId: parseInt(accountId),
                    note: note || '',
                    expectedDate: expectedDate ? new Date(expectedDate) : null,
                    receivedDate: receivedDate ? new Date(receivedDate) : new Date(),
                    status: status || 'received'
                }
            });
            if (status !== 'expected') {
                yield tx.account.update({
                    where: { id: parseInt(accountId) },
                    data: {
                        balance: { increment: amountInBase }
                    }
                });
            }
            return newCollection;
        }));
        res.status(201).json(collection);
    }
    catch (error) {
        next(error);
    }
}));
router.put('/:id', (0, auth_1.requirePermission)('collections', 'edit'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { amount, currency, accountId, note, expectedDate, receivedDate, status } = req.body;
        // Ignore any exchangeRate sent from frontend
        const exchangeRate = getExchangeRate(currency);
        const newAmountInBase = new library_1.Decimal(amount).div(exchangeRate);
        const collection = yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const existing = yield tx.collection.findUnique({ where: { id: parseInt(id) } });
            if (!existing)
                throw new Error('Collection not found');
            // 1. Reverse old
            if (existing.status !== 'expected') {
                yield tx.account.update({
                    where: { id: existing.accountId },
                    data: { balance: { decrement: existing.amountInBase } }
                });
            }
            // 2. Apply new
            const newStatus = status || existing.status;
            if (newStatus !== 'expected') {
                yield tx.account.update({
                    where: { id: parseInt(accountId) },
                    data: { balance: { increment: newAmountInBase } }
                });
            }
            // 3. Update collection record
            const updated = yield tx.collection.update({
                where: { id: parseInt(id) },
                data: {
                    amount: new library_1.Decimal(amount),
                    currency,
                    exchangeRate,
                    amountInBase: newAmountInBase,
                    accountId: parseInt(accountId),
                    note: note || '',
                    expectedDate: expectedDate ? new Date(expectedDate) : null,
                    receivedDate: receivedDate ? new Date(receivedDate) : existing.receivedDate,
                    status: newStatus
                }
            });
            return updated;
        }));
        res.json(collection);
    }
    catch (error) {
        res.status(400).json({ error: 'Error updating collection', details: error.message || String(error) });
    }
}));
router.get('/', (0, auth_1.requirePermission)('collections', 'view'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const hasAccountsView = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === 'admin' || ((_d = (_c = (_b = req.user) === null || _b === void 0 ? void 0 : _b.permissions) === null || _c === void 0 ? void 0 : _c.accounts) === null || _d === void 0 ? void 0 : _d.view);
        const collections = yield prisma.collection.findMany({
            orderBy: { id: "desc" },
            include: { account: true }
        });
        if (!hasAccountsView) {
            const filtered = collections.map(c => {
                if (c.account) {
                    const _a = c.account, { balance } = _a, rest = __rest(_a, ["balance"]);
                    return Object.assign(Object.assign({}, c), { account: rest });
                }
                return c;
            });
            return res.json(filtered);
        }
        res.json(collections);
    }
    catch (error) {
        next(error);
    }
}));
router.delete('/:id', (0, auth_1.requirePermission)('collections', 'delete'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const collection = yield tx.collection.findUnique({ where: { id: parseInt(id) } });
            if (!collection)
                throw new Error('Collection not found');
            // 1. Reverse account balance
            if (collection.status !== 'expected') {
                yield tx.account.update({
                    where: { id: collection.accountId },
                    data: { balance: { decrement: collection.amountInBase } }
                });
            }
            // 2. Delete collection
            yield tx.collection.delete({ where: { id: parseInt(id) } });
        }));
        res.status(204).send();
    }
    catch (error) {
        res.status(400).json({ error: 'Error deleting collection', details: error.message || String(error) });
    }
}));
router.patch('/:id/status', (0, auth_1.requirePermission)('collections', 'edit'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const collection = yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const existing = yield tx.collection.findUnique({ where: { id: parseInt(id) } });
            if (!existing)
                throw new Error('Collection not found');
            if (existing.status === 'received')
                throw new Error('Collection is already marked as received');
            // Update status and date
            const updated = yield tx.collection.update({
                where: { id: parseInt(id) },
                data: {
                    status: 'received',
                    receivedDate: new Date()
                }
            });
            // Increment balance
            yield tx.account.update({
                where: { id: existing.accountId },
                data: { balance: { increment: existing.amountInBase } }
            });
            return updated;
        }));
        res.json(collection);
    }
    catch (error) {
        res.status(400).json({ error: 'Error updating status', details: error.message || String(error) });
    }
}));
exports.default = router;
