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
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Only admin can access users
router.use(auth_1.requireAuth);
router.get('/', (0, auth_1.requirePermission)('users', 'view'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma.user.findMany({
            orderBy: { createdAt: 'desc' }
        });
        const mapped = users.map(u => {
            let perms = {};
            if (u.role === 'admin') {
                perms = {
                    dashboard: { view: true },
                    reports: { view: true },
                    invoices: { view: true, create: true, edit: true, delete: true },
                    payments: { view: true, create: true, edit: true, delete: true },
                    collections: { view: true, create: true, edit: true, delete: true },
                    suppliers: { view: true, create: true, edit: true, delete: true },
                    accounts: { view: true, create: true, edit: true, delete: true },
                    users: { view: true, create: true, edit: true, delete: true }
                };
            }
            else {
                try {
                    const flatPerms = u.permissions ? JSON.parse(u.permissions) : {};
                    if (!flatPerms.invoices && (flatPerms.canManageInvoices !== undefined || flatPerms.canViewDashboard !== undefined)) {
                        perms = {
                            dashboard: { view: !!flatPerms.canViewDashboard },
                            reports: { view: !!flatPerms.canViewDashboard },
                            invoices: { view: !!flatPerms.canManageInvoices, create: !!flatPerms.canManageInvoices, edit: !!flatPerms.canManageInvoices, delete: !!flatPerms.canDelete },
                            payments: { view: !!flatPerms.canManagePayments, create: !!flatPerms.canManagePayments, edit: !!flatPerms.canManagePayments, delete: !!flatPerms.canDelete },
                            collections: { view: !!flatPerms.canManageCollections, create: !!flatPerms.canManageCollections, edit: !!flatPerms.canManageCollections, delete: !!flatPerms.canDelete },
                            suppliers: { view: !!flatPerms.canManageSuppliers, create: !!flatPerms.canManageSuppliers, edit: !!flatPerms.canManageSuppliers, delete: !!flatPerms.canDelete },
                            accounts: { view: !!flatPerms.canManageAccounts, create: !!flatPerms.canManageAccounts, edit: !!flatPerms.canManageAccounts, delete: !!flatPerms.canDelete },
                            users: { view: !!flatPerms.canManageUsers, create: !!flatPerms.canManageUsers, edit: !!flatPerms.canManageUsers, delete: !!flatPerms.canManageUsers }
                        };
                    }
                    else {
                        perms = flatPerms;
                    }
                }
                catch (e) {
                    perms = {};
                }
            }
            return Object.assign(Object.assign({}, u), { permissions: perms });
        });
        res.json(mapped);
    }
    catch (error) {
        next(error);
    }
}));
router.post('/', (0, auth_1.requirePermission)('users', 'create'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    let { email, password, name, role, permissions } = req.body;
    console.log("CREATING USER:", { email, name, role });
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    if (role === 'admin') {
        permissions = {
            dashboard: { view: true },
            reports: { view: true },
            invoices: { view: true, create: true, edit: true, delete: true },
            payments: { view: true, create: true, edit: true, delete: true },
            collections: { view: true, create: true, edit: true, delete: true },
            suppliers: { view: true, create: true, edit: true, delete: true },
            accounts: { view: true, create: true, edit: true, delete: true },
            users: { view: true, create: true, edit: true, delete: true }
        };
    }
    try {
        const hashed = yield bcrypt_1.default.hash(password, 10);
        const permsStr = JSON.stringify(permissions || {});
        const newUser = yield prisma.user.create({
            data: {
                email,
                password: hashed,
                name,
                role: role || 'user',
                permissions: permsStr
            }
        });
        res.status(201).json({ message: 'User created', user: { id: newUser.id, email: newUser.email } });
    }
    catch (error) {
        if (error.code === 'P2002' && ((_b = (_a = error.meta) === null || _a === void 0 ? void 0 : _a.target) === null || _b === void 0 ? void 0 : _b.includes('email'))) {
            return res.status(400).json({ error: "Email already exists" });
        }
        console.error("CREATE USER ERROR:", error);
        next(error);
    }
}));
router.put('/:id/permissions', (0, auth_1.requirePermission)('users', 'edit'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    const { permissions } = req.body;
    try {
        const permsStr = JSON.stringify(permissions || {});
        yield prisma.user.update({
            where: { id },
            data: { permissions: permsStr }
        });
        res.json({ message: 'Permissions updated' });
    }
    catch (error) {
        next(error);
    }
}));
router.put('/:id', (0, auth_1.requirePermission)('users', 'edit'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const id = parseInt(req.params.id);
    let { email, password, name, role, permissions } = req.body;
    console.log("UPDATING USER:", { id, email, name, role });
    if (role === 'admin') {
        permissions = {
            dashboard: { view: true },
            reports: { view: true },
            invoices: { view: true, create: true, edit: true, delete: true },
            payments: { view: true, create: true, edit: true, delete: true },
            collections: { view: true, create: true, edit: true, delete: true },
            suppliers: { view: true, create: true, edit: true, delete: true },
            accounts: { view: true, create: true, edit: true, delete: true },
            users: { view: true, create: true, edit: true, delete: true }
        };
    }
    try {
        const permsStr = JSON.stringify(permissions || {});
        const updateData = {
            email,
            name,
            role,
            permissions: permsStr
        };
        if (password) {
            updateData.password = yield bcrypt_1.default.hash(password, 10);
        }
        yield prisma.user.update({
            where: { id },
            data: updateData
        });
        res.json({ message: 'User updated' });
    }
    catch (error) {
        if (error.code === 'P2002' && ((_b = (_a = error.meta) === null || _a === void 0 ? void 0 : _a.target) === null || _b === void 0 ? void 0 : _b.includes('email'))) {
            return res.status(400).json({ error: "Email already exists" });
        }
        console.error("UPDATE USER ERROR:", error);
        next(error);
    }
}));
router.delete('/:id', (0, auth_1.requirePermission)('users', 'delete'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    try {
        yield prisma.user.delete({
            where: { id }
        });
        res.json({ message: 'User deleted' });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
