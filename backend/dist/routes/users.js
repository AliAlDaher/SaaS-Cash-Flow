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
router.get('/', (0, auth_1.requirePermission)('users', 'view'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma.$queryRaw `SELECT id, email, name, role, permissions, createdAt, updatedAt FROM [User]`;
        const mapped = (Array.isArray(users) ? users : []).map(u => {
            let perms = {};
            if (u.role === 'admin') {
                perms =
                    {
                        dashboard: { view: true },
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
        res.status(500).json({ error: 'Error fetching users', details: error.message });
    }
}));
router.post('/', (0, auth_1.requirePermission)('users', 'create'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { email, password, name, role, permissions } = req.body;
    if (role === 'admin') {
        permissions =
            {
                dashboard: { view: true },
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
        yield prisma.$executeRaw `INSERT INTO [User] (email, password, name, role, permissions, createdAt, updatedAt) VALUES (${email}, ${hashed}, ${name}, ${role || 'user'}, ${permsStr}, GETDATE(), GETDATE())`;
        res.status(201).json({ message: 'User created' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error creating user', details: error.message });
    }
}));
router.put('/:id/permissions', (0, auth_1.requirePermission)('users', 'edit'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    const { permissions } = req.body;
    try {
        const permsStr = JSON.stringify(permissions || {});
        yield prisma.$executeRaw `UPDATE [User] SET permissions=${permsStr}, updatedAt=GETDATE() WHERE id=${id}`;
        res.json({ message: 'Permissions updated' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error updating permissions', details: error.message });
    }
}));
router.put('/:id', (0, auth_1.requirePermission)('users', 'edit'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    let { email, password, name, role, permissions } = req.body;
    if (role === 'admin') {
        permissions =
            {
                dashboard: { view: true },
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
        if (password) {
            const hashed = yield bcrypt_1.default.hash(password, 10);
            yield prisma.$executeRaw `UPDATE [User] SET email=${email}, password=${hashed}, name=${name}, role=${role}, permissions=${permsStr}, updatedAt=GETDATE() WHERE id=${id}`;
        }
        else {
            yield prisma.$executeRaw `UPDATE [User] SET email=${email}, name=${name}, role=${role}, permissions=${permsStr}, updatedAt=GETDATE() WHERE id=${id}`;
        }
        res.json({ message: 'User updated' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error updating user', details: error.message });
    }
}));
router.delete('/:id', (0, auth_1.requirePermission)('users', 'delete'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    try {
        yield prisma.$executeRaw `DELETE FROM [User] WHERE id=${id}`;
        res.json({ message: 'User deleted' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error deleting user', details: error.message });
    }
}));
exports.default = router;
