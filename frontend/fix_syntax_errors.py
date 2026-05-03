path = r'c:\\Users\\DELL\\.gemini\\antigravity\\brain\\1e70835b-96e1-481b-8a66-641bd45c1cc5\\cash-flow-system\\frontend\\src\\App.tsx'

with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    # Specifically target the broken lines in UsersTab
    if i == 2384 and "fetchDetails();" in line:
        continue
    if i == 2385 and "}, [selectedAccount, setSelectedAccount]);" in line:
        continue
    new_lines.append(line)

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
