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
router.post('/', (0, auth_1.requirePermission)('suppliers', 'create'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, priority, paymentTermDays } = req.body;
        const supplier = yield prisma.supplier.create({
            data: { name, priority, paymentTermDays: paymentTermDays ? parseInt(paymentTermDays) : 0 },
        });
        res.status(201).json(supplier);
    }
    catch (error) {
        next(error);
    }
}));
router.get('/', (0, auth_1.requirePermission)('suppliers', 'view'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const suppliers = yield prisma.supplier.findMany({ orderBy: { id: "desc" } });
        res.json(suppliers);
    }
    catch (error) {
        next(error);
    }
}));
router.get('/:id', (0, auth_1.requirePermission)('suppliers', 'view'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const supplier = yield prisma.supplier.findUnique({
            where: { id: parseInt(id) },
        });
        if (supplier) {
            res.json(supplier);
        }
        else {
            res.status(404).json({ error: 'Supplier not found' });
        }
    }
    catch (error) {
        next(error);
    }
}));
router.put('/:id', (0, auth_1.requirePermission)('suppliers', 'edit'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, priority, paymentTermDays } = req.body;
        const data = { name, priority };
        if (paymentTermDays !== undefined)
            data.paymentTermDays = parseInt(paymentTermDays);
        const supplier = yield prisma.supplier.update({
            where: { id: parseInt(id) },
            data,
        });
        res.json(supplier);
    }
    catch (error) {
        next(error);
    }
}));
router.delete('/:id', (0, auth_1.requirePermission)('suppliers', 'delete'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const supplierId = parseInt(id);
        const invoicesCount = yield prisma.invoice.count({ where: { supplierId } });
        const paymentsCount = yield prisma.payment.count({ where: { supplierId } });
        if (invoicesCount > 0 || paymentsCount > 0) {
            return res.status(400).json({ error: 'Cannot delete supplier because it has existing invoices or payments.' });
        }
        yield prisma.supplier.delete({
            where: { id: supplierId },
        });
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
