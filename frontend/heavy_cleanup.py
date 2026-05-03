path = r'c:\\Users\\DELL\\.gemini\\antigravity\\brain\\1e70835b-96e1-481b-8a66-641bd45c1cc5\\cash-flow-system\\frontend\\src\\App.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Define the pattern to remove
# It usually starts with "const [isReconcileOpen, setIsReconcileOpen] = useState(false);"
# followed by handleReconcileConfirm and then the useEffect.

import re

# Match the whole block of injected code
# It might be slightly different in each place due to my previous attempts.
# I'll use a regex that matches the core parts.

pattern = r'\s*const \[isReconcileOpen, setIsReconcileOpen\] = useState\(false\);.*?}\s*};\s*useEffect\(\(\) => \{.*?\}, \[selectedAccount, setSelectedAccount\]\);'

# But I want to KEEP it in AccountsTab.
# AccountsTab starts at "function AccountsTab"

parts = re.split(r'(function AccountsTab)', content)

if len(parts) > 1:
    before_accounts = parts[0]
    accounts_and_after = "function AccountsTab" + parts[1]
    
    # Remove from before
    fixed_before = re.sub(pattern, "", before_accounts, flags=re.DOTALL)
    
    # Split after AccountsTab to avoid removing from subsequent tabs if needed
    # But actually, I'll only remove from before and AFTER the next function
    
    sub_parts = re.split(r'(function CollectionsTab|function UsersTab|function SuppliersTab|function InvoicesTab|function PaymentsTab)', accounts_and_after)
    
    accounts_part = sub_parts[0] + sub_parts[1] # AccountsTab + the next function name
    rest = "".join(sub_parts[2:])
    
    # Remove from rest
    fixed_rest = re.sub(pattern, "", rest, flags=re.DOTALL)
    
    # Reassemble
    # Wait, I need to keep the next function names.
    
    final_content = fixed_before + sub_parts[0]
    for i in range(1, len(sub_parts), 2):
        func_name = sub_parts[i]
        func_body = sub_parts[i+1] if i+1 < len(sub_parts) else ""
        final_content += func_name + re.sub(pattern, "", func_body, flags=re.DOTALL)
else:
    # If AccountsTab not found, just try to remove everything (oops)
    final_content = re.sub(pattern, "", content, flags=re.DOTALL)

# Final cleanup of any stray "fetchDetails" pieces
final_content = final_content.replace("\n\n    fetchDetails();\n  }, [selectedAccount, setSelectedAccount]);", "")

with open(path, 'w', encoding='utf-8') as f:
    f.write(final_content)
