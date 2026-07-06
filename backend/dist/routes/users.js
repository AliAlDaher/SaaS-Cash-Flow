"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const prisma_1 = __importStar(require("../prisma"));
const permissions_1 = require("../utils/permissions");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Only admin can access users
router.use(auth_1.requireAuth);
router.get('/', (0, auth_1.requirePermission)('users', 'view'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma_1.default.user.findMany({
            orderBy: { createdAt: 'desc' }
        });
        const mapped = users.map(u => {
            let perms = {};
            perms = (0, permissions_1.expandPermissions)(u.role, u.permissions);
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
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    const cleanEmail = email.toLowerCase().trim();
    if (role === 'admin') {
        permissions = permissions_1.ADMIN_PERMISSIONS;
    }
    try {
        // 1. Enforce global email uniqueness in TenantUser table
        const existingCentralUser = yield prisma_1.centralPrisma.tenantUser.findUnique({
            where: { email: cleanEmail }
        });
        if (existingCentralUser) {
            return res.status(400).json({ error: 'This email is already in use by another workspace.' });
        }
        const hashed = yield bcrypt_1.default.hash(password, 10);
        const permsStr = JSON.stringify(permissions || {});
        // 2. Create the user in the tenant database
        const newUser = yield prisma_1.default.user.create({
            data: {
                email: cleanEmail,
                password: hashed,
                name,
                role: role || 'user',
                permissions: permsStr
            }
        });
        // 3. Register the user centrally
        const subdomain = req.headers['x-tenant-subdomain'];
        yield prisma_1.centralPrisma.tenantUser.create({
            data: {
                email: cleanEmail,
                subdomain: subdomain.toLowerCase().trim()
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
router.put('/:id', (0, auth_1.requirePermission)('users', 'edit'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const id = parseInt(req.params.id);
    let { email, password, name, role, permissions } = req.body;
    if (role === 'admin') {
        permissions = permissions_1.ADMIN_PERMISSIONS;
    }
    const cleanEmail = email.toLowerCase().trim();
    try {
        const userToUpdate = yield prisma_1.default.user.findUnique({ where: { id } });
        if (!userToUpdate) {
            return res.status(404).json({ error: 'User not found' });
        }
        // If email is changing, check central uniqueness and update mapping
        if (userToUpdate.email.toLowerCase().trim() !== cleanEmail) {
            const existingCentralUser = yield prisma_1.centralPrisma.tenantUser.findUnique({
                where: { email: cleanEmail }
            });
            if (existingCentralUser) {
                return res.status(400).json({ error: 'This email is already in use by another workspace.' });
            }
            // Update central mapping
            yield prisma_1.centralPrisma.tenantUser.update({
                where: { email: userToUpdate.email.toLowerCase().trim() },
                data: { email: cleanEmail }
            });
        }
        const permsStr = JSON.stringify(permissions || {});
        const updateData = {
            email: cleanEmail,
            name,
            role,
            permissions: permsStr
        };
        if (password) {
            updateData.password = yield bcrypt_1.default.hash(password, 10);
        }
        yield prisma_1.default.user.update({
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
        const userToDelete = yield prisma_1.default.user.findUnique({ where: { id } });
        if (userToDelete) {
            // 1. Delete central mapping first
            yield prisma_1.centralPrisma.tenantUser.deleteMany({
                where: { email: userToDelete.email.toLowerCase().trim() }
            });
        }
        // 2. Delete user in tenant database
        yield prisma_1.default.user.delete({
            where: { id }
        });
        res.json({ message: 'User deleted' });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
