path = r'c:\\Users\\DELL\\.gemini\\antigravity\\brain\\1e70835b-96e1-481b-8a66-641bd45c1cc5\\cash-flow-system\\frontend\\src\\App.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Simplify InvoicesTab call
old_tab_call = 'onEditClick={(user?.role === \'admin\' || user?.permissions?.invoices?.edit) ? handleEditClick : undefined} onDeleteClick={(user?.role === \'admin\' || user?.permissions?.invoices?.delete) ? onDelete : undefined}'
new_tab_call = 'onEditClick={handleEditClick} onDeleteClick={onDelete}'

content = content.replace(old_tab_call, new_tab_call)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
