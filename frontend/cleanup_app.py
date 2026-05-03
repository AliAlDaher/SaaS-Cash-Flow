path = r'c:\\Users\\DELL\\.gemini\\antigravity\\brain\\1e70835b-96e1-481b-8a66-641bd45c1cc5\\cash-flow-system\\frontend\\src\\App.tsx'

with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# I'll rebuild the file line by line to remove the duplicates.
new_lines = []
in_bad_block = False
skip_next_empty = False

# Blocks to remove from where they don't belong:
# - const [isReconcileOpen, setIsReconcileOpen] = useState(false);
# - const handleReconcileConfirm = ...
# - useEffect for fetchDetails

for i, line in enumerate(lines):
    # Detect start of unwanted injection in UsersTab or CollectionsTab
    # Note: in AccountsTab it IS wanted.
    # AccountsTab starts at line 1819 (in the viewed version).
    
    # Actually, a safer way:
    # Any handleReconcileConfirm inside UsersTab (line 2381+) is bad.
    # Any handleReconcileConfirm inside CollectionsTab (line 1992+) is bad.
    
    if i > 1990: # Approximating line numbers
        if 'const [isReconcileOpen, setIsReconcileOpen] = useState(false);' in line:
            continue
        if 'const handleReconcileConfirm = async' in line:
            in_bad_block = True
            continue
        if in_bad_block and '};' in line:
            in_bad_block = False
            continue
        if in_bad_block:
            continue
        if 'useEffect(() => {' in line and 'fetchDetails' in lines[i+1]:
            in_bad_block = True
            continue
            
    new_lines.append(line)

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
