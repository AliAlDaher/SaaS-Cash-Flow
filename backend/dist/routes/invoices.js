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
router.post('/', (0, auth_1.requirePermission)('invoices', 'create'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
                amount: parseFloat(amount),
                invoiceDate: baseDate,
                dueDate,
                description: description || null,
            },
        });
        res.status(201).json(invoice);
    }
    catch (error) {
        res.status(500).json({ error: 'Error creating invoice', details: error.message || String(error) });
    }
}));
router.put('/:id', (0, auth_1.requirePermission)('invoices', 'edit'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { amount, invoiceDate, description } = req.body;
        const parsedAmount = parseFloat(amount);
        const existingInvoice = yield prisma.invoice.findUnique({
            where: { id: parseInt(id) },
            include: { supplier: true }
        });
        if (!existingInvoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        if (parsedAmount < existingInvoice.paidAmount) {
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
router.get('/', (0, auth_1.requirePermission)('invoices', 'view'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const invoices = yield prisma.invoice.findMany();
        res.json(invoices);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching invoices', details: error.message || String(error) });
    }
}));
router.get('/:supplierId', (0, auth_1.requirePermission)('invoices', 'view'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { supplierId } = req.params;
        const invoices = yield prisma.invoice.findMany({
            where: { supplierId: parseInt(supplierId) },
        });
        res.json(invoices);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching supplier invoices', details: error.message || String(error) });
    }
}));
router.delete('/:id', (0, auth_1.requirePermission)('invoices', 'delete'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const invoiceId = parseInt(id);
        const invoice = yield prisma.invoice.findUnique({ where: { id: invoiceId } });
        if (!invoice)
            return res.status(404).json({ error: 'Invoice not found' });
        if (invoice.paidAmount > 0) {
            return res.status(400).json({ error: 'Cannot delete invoice because it has payments applied.' });
        }
        yield prisma.invoice.delete({ where: { id: invoiceId } });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Error deleting invoice', details: error.message || String(error) });
    }
}));
exports.default = router;
