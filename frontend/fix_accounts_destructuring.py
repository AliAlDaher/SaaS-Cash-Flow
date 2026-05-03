path = r'c:\\Users\\DELL\\.gemini\\antigravity\\brain\\1e70835b-96e1-481b-8a66-641bd45c1cc5\\cash-flow-system\\frontend\\src\\App.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old_start = 'function AccountsTab({ accounts, payments, collections, suppliers, onRefresh, onDelete, selectedAccount, setSelectedAccount }: { accounts: Account[], payments: Payment[], collections: Collection[], suppliers: Supplier[], onRefresh: () => void, setSuppliers?: React.Dispatch<React.SetStateAction<Supplier[]>>, setInvoices?: React.Dispatch<React.SetStateAction<Invoice[]>>, setPayments?: React.Dispatch<React.SetStateAction<Payment[]>>, setAccounts?: React.Dispatch<React.SetStateAction<Account[]>>, setCollections?: React.Dispatch<React.SetStateAction<Collection[]>>, onDelete: (id: number) => void, selectedAccount: Account | null, setSelectedAccount: (a: Account | null) => void, setAccounts?: React.Dispatch<React.SetStateAction<Account[]>> }) {'

new_start = 'function AccountsTab({ accounts, payments, collections, suppliers, onRefresh, onDelete, selectedAccount, setSelectedAccount, setAccounts }: { accounts: Account[], payments: Payment[], collections: Collection[], suppliers: Supplier[], onRefresh: () => void, setSuppliers?: React.Dispatch<React.SetStateAction<Supplier[]>>, setInvoices?: React.Dispatch<React.SetStateAction<Invoice[]>>, setPayments?: React.Dispatch<React.SetStateAction<Payment[]>>, setAccounts?: React.Dispatch<React.SetStateAction<Account[]>>, setCollections?: React.Dispatch<React.SetStateAction<Collection[]>>, onDelete: (id: number) => void, selectedAccount: Account | null, setSelectedAccount: (a: Account | null) => void }) {'

content = content.replace(old_start, new_start)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
