import re

def main():
    file_path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/backend/prisma/schema.prisma'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Using regex to be safe with spaces
    content = re.sub(r'reminder\s+Boolean\s+@default\(false\)', 'reminder    Boolean  @default(false)\n  reminderAmount Float?', content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Success prisma")

if __name__ == '__main__':
    main()