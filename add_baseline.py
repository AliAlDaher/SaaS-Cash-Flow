import re

def main():
    schema_path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/backend/prisma/schema.prisma'
    with open(schema_path, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'reminderBaseline' not in content:
        content = content.replace(
            'reminderAmount Decimal? @db.Decimal(18, 4)',
            'reminderAmount Decimal? @db.Decimal(18, 4)\n  reminderBaseline Decimal @default(0) @db.Decimal(18, 4)'
        )

    with open(schema_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Success adding reminderBaseline to schema")

if __name__ == '__main__':
    main()