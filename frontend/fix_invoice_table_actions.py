path = r'c:\\Users\\DELL\\.gemini\\antigravity\\brain\\1e70835b-96e1-481b-8a66-641bd45c1cc5\\cash-flow-system\\frontend\\src\\App.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Header Condition
old_header = '{onEditClick && <th className="px-6 py-4 whitespace-nowrap text-right">Actions</th>}'
new_header = '{(onEditClick || onDeleteClick || onQuickPay) && <th className="px-6 py-4 whitespace-nowrap text-right">Actions</th>}'

content = content.replace(old_header, new_header)

# 2. Update Cell Condition
old_cell_start = '{onEditClick && ('
new_cell_start = '{(onEditClick || onDeleteClick || onQuickPay) && ('

content = content.replace(old_cell_start, new_cell_start)

# 3. Ensure internal buttons don't double check if possible, or just be safe
# The current internal checks are:
# {invoice.reminder && onQuickPay && (user?.role === "admin" || user?.permissions?.payments?.create) && ...}
# <button onClick={() => onEditClick(invoice)}>Edit</button>
# {onDeleteClick && <button onClick={() => onDeleteClick(invoice.id)}>Delete</button>}

# I need to wrap Edit button in a check too if it might be undefined
old_edit_button = '<button onClick={() => onEditClick(invoice)} className="text-sky-600 hover:text-sky-900 font-medium text-sm mr-4">Edit</button>'
new_edit_button = '{onEditClick && <button onClick={() => onEditClick(invoice)} className="text-sky-600 hover:text-sky-900 font-medium text-sm mr-4">Edit</button>}'

content = content.replace(old_edit_button, new_edit_button)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
