const fs = require('fs');
const path = require('path');

const srcDir = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/backend/src';
const routesDir = path.join(srcDir, 'routes');

if (!fs.existsSync(routesDir)) {
  fs.mkdirSync(routesDir, { recursive: true });
}

const suppliersTs = `import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Create a new supplier
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, priority } = req.body;
    const supplier = await prisma.supplier.create({
      data: { name, priority },
    });
    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ error: 'Error creating supplier' });
  }
});

// Get all suppliers
router.get('/', async (req: Request, res: Response) => {
  try {
    const suppliers = await prisma.supplier.findMany();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching suppliers' });
  }
});

// Get a single supplier
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const supplier = await prisma.supplier.findUnique({
      where: { id: parseInt(id) },
    });
    if (supplier) {
      res.json(supplier);
    } else {
      res.status(404).json({ error: 'Supplier not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching supplier' });
  }
});

// Update a supplier
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, priority } = req.body;
    const supplier = await prisma.supplier.update({
      where: { id: parseInt(id) },
      data: { name, priority },
    });
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: 'Error updating supplier' });
  }
});

// Delete a supplier
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.supplier.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting supplier' });
  }
});

export default router;
`;

fs.writeFileSync(path.join(routesDir, 'suppliers.ts'), suppliersTs, 'utf8');

const indexTsPath = path.join(srcDir, 'index.ts');
let indexTs = fs.readFileSync(indexTsPath, 'utf8');

if (!indexTs.includes("import suppliersRouter")) {
  indexTs = indexTs.replace("import dotenv from 'dotenv';", "import dotenv from 'dotenv';\nimport suppliersRouter from './routes/suppliers';");
}

if (!indexTs.includes('app.use("/suppliers"')) {
  indexTs = indexTs.replace('app.use(express.json());', 'app.use(express.json());\n\napp.use("/suppliers", suppliersRouter);');
}

fs.writeFileSync(indexTsPath, indexTs, 'utf8');