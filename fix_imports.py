import re

def main():
    file_path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    content = content.replace('import { CheckCircle, Star, Activity', 'import { Activity')

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Imports fixed")

if __name__ == '__main__':
    main()