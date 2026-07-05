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
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const library_1 = require("@prisma/client/runtime/library");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.post('/', (0, auth_1.requirePermission)('invoices', 'create'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { supplierId, amount, invoiceDate, description, dueDate: customDueDate } = req.body;
        if (!supplierId || amount === undefined || amount === null || isNaN(Number(amount)) || Number(amount) <= 0) {
            return res.status(400).json({ error: 'supplierId and a positive amount are required' });
        }
        const supplier = yield prisma_1.default.supplier.findUnique({
            where: { id: parseInt(supplierId) }
        });
        if (!supplier) {
            return res.status(404).json({ error: 'Supplier not found' });
        }
        const baseDate = invoiceDate ? new Date(invoiceDate) : new Date();
        const dueDate = customDueDate ? new Date(customDueDate) : (() => {
            const d = new Date(baseDate);
            d.setDate(d.getDate() + (supplier.paymentTermDays || 0));
            return d;
        })();
        const invoice = yield prisma_1.default.invoice.create({
            data: {
                supplierId: parseInt(supplierId),
                amount: new library_1.Decimal(amount),
                invoiceDate: baseDate,
                dueDate,
                description: description || null,
            },
        });
        res.status(201).json(invoice);
    }
    catch (error) {
        next(error);
    }
}));
router.put('/:id', (0, auth_1.requirePermission)('invoices', 'edit'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { amount, invoiceDate, description, dueDate: customDueDate } = req.body;
        const parsedAmount = new library_1.Decimal(amount);
        const existingInvoice = yield prisma_1.default.invoice.findUnique({
            where: { id: parseInt(id) },
            include: { supplier: true }
        });
        if (!existingInvoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        if (parsedAmount.lessThan(new library_1.Decimal(existingInvoice.paidAmount))) {
            return res.status(400).json({ error: 'Amount cannot be less than already paid amount' });
        }
        const baseDate = invoiceDate ? new Date(invoiceDate) : existingInvoice.invoiceDate;
        const dueDate = customDueDate ? new Date(customDueDate) : (() => {
            const d = new Date(baseDate);
            d.setDate(d.getDate() + (existingInvoice.supplier.paymentTermDays || 0));
            return d;
        })();
        const invoice = yield prisma_1.default.invoice.update({
            where: { id: parseInt(id) },
            data: {
                amount: parsedAmount,
                invoiceDate: baseDate,
                dueDate,
                description: description !== undefined ? description : existingInvoice.description
            }
        });
        res.json(invoice);
    }
    catch (error) {
        res.status(400).json({ error: 'Error updating invoice', details: error.message || String(error) });
    }
}));
router.get('/', (0, auth_1.requirePermission)('invoices', 'view'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = req.query.page ? parseInt(req.query.page) : undefined;
        const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
        const search = req.query.search ? req.query.search : undefined;
        const supplierId = req.query.supplierId ? parseInt(req.query.supplierId) : undefined;
        const whereClause = {};
        if (supplierId) {
            whereClause.supplierId = supplierId;
        }
        if (search) {
            whereClause.OR = [
                { description: { contains: search, mode: 'insensitive' } },
                { supplier: { name: { contains: search, mode: 'insensitive' } } },
            ];
        }
        if (page !== undefined && limit !== undefined) {
            const skip = (page - 1) * limit;
            const [invoices, totalCount] = yield Promise.all([
                prisma_1.default.invoice.findMany({
                    where: whereClause,
                    skip,
                    take: limit,
                    orderBy: { id: "desc" },
                    include: { supplier: true }
                }),
                prisma_1.default.invoice.count({ where: whereClause })
            ]);
            res.json({
                invoices,
                totalPages: Math.ceil(totalCount / limit),
                totalCount,
                currentPage: page
            });
        }
        else {
            const invoices = yield prisma_1.default.invoice.findMany({
                where: whereClause,
                orderBy: { id: "desc" },
                include: { supplier: true }
            });
            res.json(invoices);
        }
    }
    catch (error) {
        next(error);
    }
}));
router.delete('/:id', (0, auth_1.requirePermission)('invoices', 'delete'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const invoiceId = parseInt(id);
        const invoice = yield prisma_1.default.invoice.findUnique({ where: { id: invoiceId } });
        if (!invoice)
            return res.status(404).json({ error: 'Invoice not found' });
        if (new library_1.Decimal(invoice.paidAmount).greaterThan(0)) {
            return res.status(400).json({ error: 'Cannot delete invoice because it has payments applied.' });
        }
        yield prisma_1.default.invoice.delete({ where: { id: invoiceId } });
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
}));
router.patch('/:id/reminder', (0, auth_1.requirePermission)('invoices', 'edit'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { reminder, reminderAmount } = req.body;
        const existing = yield prisma_1.default.invoice.findUnique({ where: { id: parseInt(id) } });
        if (!existing)
            return res.status(404).json({ error: 'Invoice not found' });
        const updateData = { reminder: Boolean(reminder) };
        if (reminder) {
            updateData.reminderBaseline = existing.paidAmount;
            if (reminderAmount !== undefined) {
                updateData.reminderAmount = reminderAmount === null ? null : new library_1.Decimal(reminderAmount);
            }
        }
        else {
            updateData.reminderAmount = null;
            updateData.reminderBaseline = 0;
        }
        const invoice = yield prisma_1.default.invoice.update({
            where: { id: parseInt(id) },
            data: updateData
        });
        res.json(invoice);
    }
    catch (error) {
        res.status(400).json({ error: 'Error updating invoice reminder', details: error.message || String(error) });
    }
}));
exports.default = router;
