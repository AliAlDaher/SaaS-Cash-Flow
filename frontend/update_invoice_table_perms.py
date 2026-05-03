path = r'c:\\Users\\DELL\\.gemini\\antigravity\\brain\\1e70835b-96e1-481b-8a66-641bd45c1cc5\\cash-flow-system\\frontend\\src\\App.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Edit Button internal check in InvoiceTable
old_edit = '{onEditClick && <button onClick={() => onEditClick(invoice)} className="text-sky-600 hover:text-sky-900 font-medium text-sm mr-4">Edit</button>}'
new_edit = '{onEditClick && (user?.role === "admin" || user?.permissions?.invoices?.edit) && <button onClick={() => onEditClick(invoice)} className="text-sky-600 hover:text-sky-900 font-medium text-sm mr-4">Edit</button>}'

content = content.replace(old_edit, new_edit)

# 2. Update Delete Button internal check in InvoiceTable
old_delete = '{onDeleteClick && <button onClick={() => onDeleteClick(invoice.id)} className="text-rose-600 hover:text-rose-900 font-medium text-sm">Delete</button>}'
new_delete = '{onDeleteClick && (user?.role === "admin" || user?.permissions?.invoices?.delete) && <button onClick={() => onDeleteClick(invoice.id)} className="text-rose-600 hover:text-rose-900 font-medium text-sm">Delete</button>}'

content = content.replace(old_delete, new_delete)

# 3. Update the overall column condition to be simpler
# If the handlers are provided, show the column. The handlers themselves carry the "intent" of the parent to show actions.
old_col_cond = '{(onEditClick || onDeleteClick || onQuickPay) && <th className="px-6 py-4 whitespace-nowrap text-right">Actions</th>}'
new_col_cond = '{(onEditClick || onDeleteClick || onQuickPay) && (user?.role === "admin" || user?.permissions?.invoices?.edit || user?.permissions?.invoices?.delete || user?.permissions?.payments?.create) && <th className="px-6 py-4 whitespace-nowrap text-right">Actions</th>}'

content = content.replace(old_col_cond, new_col_cond)

# Also update the cell condition
old_cell_cond = '{(onEditClick || onDeleteClick || onQuickPay) && ('
new_cell_cond = '{(onEditClick || onDeleteClick || onQuickPay) && (user?.role === "admin" || user?.permissions?.invoices?.edit || user?.permissions?.invoices?.delete || user?.permissions?.payments?.create) && ('

content = content.replace(old_cell_cond, new_cell_cond)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
