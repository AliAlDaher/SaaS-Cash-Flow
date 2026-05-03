path = r'c:\\Users\\DELL\\.gemini\\antigravity\\brain\\1e70835b-96e1-481b-8a66-641bd45c1cc5\\cash-flow-system\\frontend\\src\\App.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the call to AccountsTab (line 363 approx)
old_call = 'onDelete={(id) => openDeleteModal(id, "accounts", "Account")} selectedAccount={selectedAccount} setSelectedAccount={setSelectedAccount} />'
new_call = 'onDelete={(id) => openDeleteModal(id, "accounts", "Account")} selectedAccount={selectedAccount} setSelectedAccount={setSelectedAccount} setAccounts={setAccounts} />'

content = content.replace(old_call, new_call)

# 2. Update the prop definition in AccountsTab (line 1609 approx)
old_props = 'onDelete: (id: number) => void, selectedAccount: Account | null, setSelectedAccount: (a: Account | null) => void }) {'
new_props = 'onDelete: (id: number) => void, selectedAccount: Account | null, setSelectedAccount: (a: Account | null) => void, setAccounts?: React.Dispatch<React.SetStateAction<Account[]>> }) {'

content = content.replace(old_props, new_props)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
