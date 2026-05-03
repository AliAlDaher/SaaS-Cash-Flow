path = r'c:\Users\DELL\.gemini\antigravity\brain\1e70835b-96e1-481b-8a66-641bd45c1cc5\cash-flow-system\frontend\src\App.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old_account_type = """type Account = {
  id: number
  name: string
  type: string
  balance: number
  createdAt: string
}"""

new_account_type = """type Account = {
  id: number
  name: string
  type: string
  balance: number
  createdAt: string
  adjustments?: AccountAdjustment[]
}"""

content = content.replace(old_account_type, new_account_type)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
