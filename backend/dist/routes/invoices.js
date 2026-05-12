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
router.post('/', (0, auth_1.requirePermission)('invoices', 'create'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { supplierId, amount, invoiceDate, description } = req.body;
        const supplier = yield prisma.supplier.findUnique({
            where: { id: parseInt(supplierId) }
        });
        if (!supplier) {
            return res.status(404).json({ error: 'Supplier not found' });
        }
        const baseDate = invoiceDate ? new Date(invoiceDate) : new Date();
        const dueDate = new Date(baseDate);
        dueDate.setDate(dueDate.getDate() + (supplier.paymentTermDays || 0));
        const invoice = yield prisma.invoice.create({
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
        const { amount, invoiceDate, description } = req.body;
        const parsedAmount = new library_1.Decimal(amount);
        const existingInvoice = yield prisma.invoice.findUnique({
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
        const dueDate = new Date(baseDate);
        dueDate.setDate(dueDate.getDate() + (existingInvoice.supplier.paymentTermDays || 0));
        const invoice = yield prisma.invoice.update({
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
        const invoices = yield prisma.invoice.findMany({ orderBy: { id: "desc" }, include: { supplier: true } });
        res.json(invoices);
    }
    catch (error) {
        next(error);
    }
}));
router.get('/:supplierId', (0, auth_1.requirePermission)('invoices', 'view'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { supplierId } = req.params;
        const invoices = yield prisma.invoice.findMany({ where: { supplierId: parseInt(supplierId) }, orderBy: { id: "desc" } });
        res.json(invoices);
    }
    catch (error) {
        next(error);
    }
}));
router.delete('/:id', (0, auth_1.requirePermission)('invoices', 'delete'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const invoiceId = parseInt(id);
        const invoice = yield prisma.invoice.findUnique({ where: { id: invoiceId } });
        if (!invoice)
            return res.status(404).json({ error: 'Invoice not found' });
        if (new library_1.Decimal(invoice.paidAmount).greaterThan(0)) {
            return res.status(400).json({ error: 'Cannot delete invoice because it has payments applied.' });
        }
        yield prisma.invoice.delete({ where: { id: invoiceId } });
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
}));
router.patch('/:id/reminder', (0, auth_1.requirePermission)('invoices', 'reminder'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { reminder, reminderAmount } = req.body;
        const existing = yield prisma.invoice.findUnique({ where: { id: parseInt(id) } });
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
        const invoice = yield prisma.invoice.update({
            where: { id: parseInt(id) },
            data: updateData
        });
        res.json(invoice);
    }
    catch (error) {
        res.status(400).json({ error: 'Error updating invoice reminder', details: error.message || String(error) });
    }
}));
router.patch('/:id/postpone', (0, auth_1.requirePermission)('cheques', 'create'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { postponeDate, reason } = req.body;
        const existing = yield prisma.invoice.findUnique({ where: { id: parseInt(id) } });
        if (!existing)
            return res.status(404).json({ error: 'Invoice not found' });
        const originalDateStr = new Date(existing.dueDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
        const targetDateStr = new Date(postponeDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
        const postponementLog = "[Postponed from " + originalDateStr + " to " + targetDateStr + (reason ? ": " + reason : "") + "]";
        const updatedDescription = existing.description
            ? existing.description + " " + postponementLog
            : postponementLog;
        const invoice = yield prisma.invoice.update({
            where: { id: parseInt(id) },
            data: {
                dueDate: new Date(postponeDate),
                reminder: false, // Automatically clears the manager reminder!
                reminderAmount: null,
                reminderBaseline: 0,
                description: updatedDescription
            }
        });
        res.json(invoice);
    }
    catch (error) {
        res.status(400).json({ error: 'Error postponing invoice', details: error.message || String(error) });
    }
}));
exports.default = router;
