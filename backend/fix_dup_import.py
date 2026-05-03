path = r'c:\\Users\\DELL\\.gemini\\antigravity\\brain\\1e70835b-96e1-481b-8a66-641bd45c1cc5\\cash-flow-system\\backend\\src\\routes\\accounts.ts'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import { AuthRequest } from '../middleware/auth';", "")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
