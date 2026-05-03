path = r'c:\Users\DELL\.gemini\antigravity\brain\1e70835b-96e1-481b-8a66-641bd45c1cc5\cash-flow-system\backend\prisma\schema.prisma'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old_account = """model Account {
  id          Int          @id @default(autoincrement())
  name        String
  type        String
  balance     Decimal      @default(0) @db.Decimal(18, 4)
  createdAt   DateTime     @default(now())
  collections Collection[]
  payments    Payment[]
}"""

new_account = """model Account {
  id          Int          @id @default(autoincrement())
  name        String
  type        String
  balance     Decimal      @default(0) @db.Decimal(18, 4)
  createdAt   DateTime     @default(now())
  collections Collection[]
  payments    Payment[]
  adjustments AccountAdjustment[]
}

model AccountAdjustment {
  id              Int      @id @default(autoincrement())
  accountId       Int
  amount          Decimal  @db.Decimal(18, 4)
  systemBalance   Decimal  @db.Decimal(18, 4)
  actualBalance   Decimal  @db.Decimal(18, 4)
  note            String?
  createdAt       DateTime @default(now())
  account         Account  @relation(fields: [accountId], references: [id])
}"""

content = content.replace(old_account, new_account)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
