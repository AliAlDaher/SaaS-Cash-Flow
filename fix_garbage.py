path = r'c:\Users\DELL\.gemini\antigravity\brain\1e70835b-96e1-481b-8a66-641bd45c1cc5\cash-flow-system\frontend\src\App.tsx'

with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False
for i, line in enumerate(lines):
    # Check for the garbage pattern
    if '/invoices/${id}/reminder`, {' in line:
        skip = True
        continue
    if skip:
        if 'alert(err.message)' in line:
            continue
        if '    }' in line and i > 0 and 'catch' in lines[i-1]:
            continue
        if '  }' in line and i > 1 and 'alert(err.message)' in lines[i-2]:
            skip = False
            continue
        continue
    new_lines.append(line)

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
