const fs = require('fs');
const path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/backend/prisma/schema.prisma';
const content = generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlserver"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Supplier {
  id        Int       @id @default(autoincrement())
  name      String
  priority  Int
  createdAt DateTime  @default(now())
  invoices  Invoice[]
  payments  Payment[]
}

model Invoice {
  id          Int      @id @default(autoincrement())
  supplierId  Int
  supplier    Supplier @relation(fields: [supplierId], references: [id])
  amount      Float
  paidAmount  Float    @default(0)
  dueDate     DateTime
  createdAt   DateTime @default(now())
}

model Payment {
  id          Int      @id @default(autoincrement())
  supplierId  Int
  supplier    Supplier @relation(fields: [supplierId], references: [id])
  amount      Float
  createdAt   DateTime @default(now())
}
;
fs.writeFileSync(path, content, 'utf8');