import re

def main():
    file_path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    bad_sig = 'function DashboardTab({ suppliers, invoices, accounts, collections }: { suppliers: Supplier[], invoices: Invoice[], accounts: Account[], collections: Collection[] }) {\n  const totalAmount'
    
    good_sig = '''function DashboardTab({ suppliers, invoices, accounts, collections, onRefresh }: { suppliers: Supplier[], invoices: Invoice[], accounts: Account[], collections: Collection[], onRefresh: () => void }) {
  const { user } = useAuth();

  const handleReminderToggle = async (id: number, reminder: boolean) => {
    try {
      const res = await apiFetch(`${API_URL}/invoices/${id}/reminder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminder })
      })
      if (!res.ok) throw new Error('Failed to toggle reminder')
      onRefresh()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const totalAmount'''
    
    content = content.replace(bad_sig, good_sig)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("DashboardTab sig updated")

if __name__ == '__main__':
    main()