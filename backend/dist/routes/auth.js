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
const prisma_1 = require("../prisma");
const prismaManager_1 = require("../prismaManager");
const permissions_1 = require("../utils/permissions");
const router = (0, express_1.Router)();
router.post('/login', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    const cleanEmail = email.toLowerCase().trim();
    try {
        // 1. Find the tenant mapping by email centrally
        const mapping = yield prisma_1.centralPrisma.tenantUser.findUnique({
            where: { email: cleanEmail }
        });
        if (!mapping) {
            return res.status(404).json({ error: 'User not found' });
        }
        // 2. Fetch the tenant configuration
        const tenant = yield prisma_1.centralPrisma.tenant.findUnique({
            where: { subdomain: mapping.subdomain }
        });
        if (!tenant) {
            return res.status(404).json({ error: 'Company workspace not found' });
        }
        // 3. Connect to the isolated tenant schema database
        const tenantClient = (0, prismaManager_1.getPrismaClientForTenant)(tenant.subdomain, tenant.dbConnectionString);
        // 4. Find the user inside the tenant's schema
        const user = yield tenantClient.user.findUnique({
            where: { email: cleanEmail }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found in workspace' });
        }
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const parsedPerms = (0, permissions_1.expandPermissions)(user.role, user.permissions);
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role, permissions: parsedPerms, subdomain: tenant.subdomain }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.status(200).json({
            token,
            subdomain: tenant.subdomain,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                permissions: parsedPerms
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
