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
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.post('/login', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    try {
        const user = yield prisma.user.findUnique({ where: { email } });
        console.log("USER FOUND:", user);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        console.log("PASSWORD MATCH:", isPasswordValid);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        let parsedPerms = {};
        if (user.role === 'admin') {
            parsedPerms =
                {
                    dashboard: { view: true },
                    reports: { view: true },
                    invoices: { view: true, create: true, edit: true, delete: true },
                    payments: { view: true, create: true, edit: true, delete: true },
                    cheques: { view: true, create: true, edit: true, delete: true },
                    expenses: { view: true, create: true, edit: true, delete: true },
                    collections: { view: true, create: true, edit: true, delete: true },
                    suppliers: { view: true, create: true, edit: true, delete: true },
                    accounts: { view: true, create: true, edit: true, delete: true },
                    users: { view: true, create: true, edit: true, delete: true }
                };
        }
        else {
            try {
                const flatPerms = user.permissions ? JSON.parse(user.permissions) : {};
                if (!flatPerms.invoices && (flatPerms.canManageInvoices !== undefined || flatPerms.canViewDashboard !== undefined)) {
                    parsedPerms = {
                        dashboard: { view: !!flatPerms.canViewDashboard },
                        invoices: { view: !!flatPerms.canManageInvoices, create: !!flatPerms.canManageInvoices, edit: !!flatPerms.canManageInvoices, delete: !!flatPerms.canDelete },
                        payments: { view: !!flatPerms.canManagePayments, create: !!flatPerms.canManagePayments, edit: !!flatPerms.canManagePayments, delete: !!flatPerms.canDelete },
                        collections: { view: !!flatPerms.canManageCollections, create: !!flatPerms.canManageCollections, edit: !!flatPerms.canManageCollections, delete: !!flatPerms.canDelete },
                        suppliers: { view: !!flatPerms.canManageSuppliers, create: !!flatPerms.canManageSuppliers, edit: !!flatPerms.canManageSuppliers, delete: !!flatPerms.canDelete },
                        accounts: { view: !!flatPerms.canManageAccounts, create: !!flatPerms.canManageAccounts, edit: !!flatPerms.canManageAccounts, delete: !!flatPerms.canDelete },
                        users: { view: !!flatPerms.canManageUsers, create: !!flatPerms.canManageUsers, edit: !!flatPerms.canManageUsers, delete: !!flatPerms.canManageUsers }
                    };
                }
                else {
                    parsedPerms = flatPerms;
                }
            }
            catch (e) {
                parsedPerms = {};
            }
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role, permissions: parsedPerms }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });
        res.status(200).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, permissions: parsedPerms } });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
