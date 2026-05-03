path = r'c:\Users\DELL\.gemini\antigravity\brain\1e70835b-96e1-481b-8a66-641bd45c1cc5\cash-flow-system\frontend\src\App.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

bad_block = """  const handleToggleReminder = async (id: number, reminder: boolean, amount?: number) => {
    try {

  const fetchData = async (showLoading = true) => {"""

good_block = """  const handleToggleReminder = async (id: number, reminder: boolean, amount?: number) => {
    try {
      const res = await apiFetch(`${API_URL}/invoices/${id}/reminder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminder, reminderAmount: amount })
      })
      if (!res.ok) throw new Error('Failed to toggle reminder')
      const updated = await res.json()
      setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, ...updated } : inv))
    } catch (err: any) {
      alert(err.message)
    }
  }

  const fetchData = async (showLoading = true) => {"""

content = content.replace(bad_block, good_block)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
