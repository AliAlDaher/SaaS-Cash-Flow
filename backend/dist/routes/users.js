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
const prisma_1 = __importDefault(require("../prisma"));
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
    // (debug log removed)
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    if (role === 'admin') {
        permissions = permissions_1.ADMIN_PERMISSIONS;
    }
    try {
        const hashed = yield bcrypt_1.default.hash(password, 10);
        const permsStr = JSON.stringify(permissions || {});
        const newUser = yield prisma_1.default.user.create({
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
router.put('/:id', (0, auth_1.requirePermission)('users', 'edit'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const id = parseInt(req.params.id);
    let { email, password, name, role, permissions } = req.body;
    // (debug log removed)
    if (role === 'admin') {
        permissions = permissions_1.ADMIN_PERMISSIONS;
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
