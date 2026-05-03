import re

def main():
    schema_path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/backend/prisma/schema.prisma'
    with open(schema_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace Float with Decimal and add @db.Decimal(18, 4)
    # We need to be careful with where to add the @db.Decimal
    
    # 1. Replace Invoice fields
    content = content.replace('amount      Float', 'amount      Decimal  @db.Decimal(18, 4)')
    content = content.replace('paidAmount  Float    @default(0)', 'paidAmount  Decimal  @default(0) @db.Decimal(18, 4)')
    content = content.replace('reminderAmount Float?', 'reminderAmount Decimal? @db.Decimal(18, 4)')
    
    # 2. Replace Payment fields
    # amount already replaced? No, if it matches exact string.
    # Actually, let's use regex for safety
    content = re.sub(r'(\s+)amount(\s+)Float', r'\1amount\2Decimal  @db.Decimal(18, 4)', content)
    
    # 3. Replace Account fields
    content = content.replace('balance     Float        @default(0)', 'balance     Decimal      @default(0) @db.Decimal(18, 4)')
    
    # 4. Replace Collection fields
    content = content.replace('exchangeRate Float     @default(1)', 'exchangeRate Decimal   @default(1) @db.Decimal(18, 4)')
    content = content.replace('amountInBase Float', 'amountInBase Decimal @db.Decimal(18, 4)')

    with open(schema_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Success updating Prisma schema")

if __name__ == '__main__':
    main()