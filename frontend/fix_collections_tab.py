path = r'c:\\Users\\DELL\\.gemini\\antigravity\\brain\\1e70835b-96e1-481b-8a66-641bd45c1cc5\\cash-flow-system\\frontend\\src\\App.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

bad_collections_start = """function CollectionsTab({ accounts, collections, onRefresh, onDelete }: { accounts: Account[], collections: Collection[], onRefresh: () => void, setSuppliers?: React.Dispatch<React.SetStateAction<Supplier[]>>, setInvoices?: React.Dispatch<React.SetStateAction<Invoice[]>>, setPayments?: React.Dispatch<React.SetStateAction<Payment[]>>, setAccounts?: React.Dispatch<React.SetStateAction<Account[]>>, setCollections?: React.Dispatch<React.SetStateAction<Collection[]>>, onDelete: (id: number) => void }) {
  const [searchTerm, setSearchTerm] = useState("")
  const { user } = useAuth();
  const [isReconcileOpen, setIsReconcileOpen] = useState(false);

  const handleReconcileConfirm = async (actualBalance: number, note: string) => {
    if (!selectedAccount) return;
    try {
      const res = await apiFetch(`${API_URL}/accounts/${selectedAccount.id}/reconcile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actualBalance, note })
      });
      if (!res.ok) throw new Error('Failed to reconcile account');
      const updatedAccount = await res.json();
      
      // Update global accounts state
      if (setAccounts) {
        setAccounts(prev => prev.map(a => a.id === selectedAccount.id ? { ...a, ...updatedAccount } : a));
      }
      // Update local selection
      setSelectedAccount({ ...selectedAccount, ...updatedAccount });
      setIsReconcileOpen(false);
      onRefresh(); // To ensure everything is in sync
    } catch (err: any) {
      alert(err.message);
    }
  };"""

good_collections_start = """function CollectionsTab({ accounts, collections, onRefresh, onDelete }: { accounts: Account[], collections: Collection[], onRefresh: () => void, setSuppliers?: React.Dispatch<React.SetStateAction<Supplier[]>>, setInvoices?: React.Dispatch<React.SetStateAction<Invoice[]>>, setPayments?: React.Dispatch<React.SetStateAction<Payment[]>>, setAccounts?: React.Dispatch<React.SetStateAction<Account[]>>, setCollections?: React.Dispatch<React.SetStateAction<Collection[]>>, onDelete: (id: number) => void }) {
  const [searchTerm, setSearchTerm] = useState("")
  const { user } = useAuth();"""

content = content.replace(bad_collections_start, good_collections_start)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
