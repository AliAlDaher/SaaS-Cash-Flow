import re
path = r'c:\\Users\\DELL\\.gemini\\antigravity\\brain\\1e70835b-96e1-481b-8a66-641bd45c1cc5\\cash-flow-system\\frontend\\src\\App.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'\s*const \[isReconcileOpen, setIsReconcileOpen\] = useState\(false\);.*?}\s*};\s*useEffect\(\(\) => \{.*?\}, \[selectedAccount, setSelectedAccount\]\);'

# Any leftover pieces from failed attempts
cleanup_pattern = r'\n\s*fetchDetails\(\);\n\s*\}, \[selectedAccount, setSelectedAccount\]\);'

parts = re.split(r'(function \w+Tab)', content)

final_parts = []
# parts[0] is the start of the file (types, main App component)
final_parts.append(re.sub(pattern, "", parts[0], flags=re.DOTALL))

for i in range(1, len(parts), 2):
    func_name = parts[i]
    func_body = parts[i+1] if i+1 < len(parts) else ""
    
    if "AccountsTab" in func_name:
        # KEEP IT
        final_parts.append(func_name)
        final_parts.append(func_body)
    else:
        # REMOVE IT
        final_parts.append(func_name)
        final_parts.append(re.sub(pattern, "", func_body, flags=re.DOTALL))

final_content = "".join(final_parts)
final_content = re.sub(cleanup_pattern, "", final_content, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(final_content)
