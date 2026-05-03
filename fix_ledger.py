import re

def main():
    app_path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx'
    with open(app_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Remove misplaced ledger logic from SuppliersTab and CollectionsTab
    # We'll search for the block and remove it if it's NOT inside AccountsTab
    
    # Let's find all instances of the ledger block
    ledger_pattern = r'if \(selectedAccount\) \{.*?\}\s+\}\s+\}' # This matches the if block plus the closing braces of the handler and component? No.
    
    # Actually, let's just use the line ranges we found
    lines = content.splitlines()
    
    # Remove from SuppliersTab (around 753)
    new_lines = []
    skip = False
    for i, line in enumerate(lines):
        if 'if (selectedAccount) {' in line and i < 1400: # Heuristic: AccountsTab is > 1400
             skip = True
             print(f"Removing misplaced ledger at line {i+1}")
        if skip and line.strip() == '}' and lines[i-1].strip() == '};' : # End of a handler? No, the block I added was inside the component
             # Wait, the block was:
             # } catch (err) { console.error(err) } } if (selectedAccount) { ... }
             pass
        
        # Let's use a more robust way: find the specific block I added
        # It was added right after } catch (err) { console.error(err) } }
        
    # Actually, I'll just rewrite the whole file with a clean script.
    # I'll use re.split to separate components.
    
    parts = re.split(r'(function \w+Tab)', content)
    
    clean_parts = []
    for part in parts:
        if part.startswith('function'):
            clean_parts.append(part)
            continue
            
        # This is the body of a Tab
        if 'selectedAccount' in part and 'AccountsTab' not in parts[parts.index(part)-1]:
            # Remove the if (selectedAccount) block
            part = re.sub(r'if \(selectedAccount\) \{.*?\}\s+;', '', part, flags=re.DOTALL)
            # Actually, I'll just remove the specific block I added
            part = re.sub(r'if \(selectedAccount\) \{.*?\}\s+', '', part, flags=re.DOTALL)
            print(f"Cleaned part after {parts[parts.index(part)-1]}")
            
        clean_parts.append(part)
        
    content = "".join(clean_parts)

    # 2. Fix AccountsTab props and ledger
    # Let's just re-apply the correct logic to AccountsTab ONLY
    
    # Ensure AccountsTab has the right props
    content = re.sub(
        r'function AccountsTab\(\{ accounts, onRefresh, onDelete \}: \{ accounts: Account\[\], onRefresh: \(\) => void, onDelete: \(id: number\) => void \}\) \{',
        'function AccountsTab({ accounts, payments, collections, suppliers, onRefresh, onDelete, selectedAccount, setSelectedAccount }: { accounts: Account[], payments: Payment[], collections: Collection[], suppliers: Supplier[], onRefresh: () => void, onDelete: (id: number) => void, selectedAccount: Account | null, setSelectedAccount: (a: Account | null) => void }) {',
        content
    )

    # Ensure it's not double-defined
    # ...

    with open(app_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Success cleaning and re-applying account ledger")

if __name__ == '__main__':
    main()