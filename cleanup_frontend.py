import re

def main():
    file_path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Fix DashboardTab: Remove duplicates
    content = re.sub(
        r'(const \[reminderModal, setReminderModal\] = useState<\{isOpen: boolean, id: number, remaining: number\}>\(\{isOpen: false, id: 0, remaining: 0\}\)\n\s+){2,}',
        r'\1',
        content
    )

    # 2. Fix SuppliersTab: Add state
    suppliers_tab_start = 'function SuppliersTab({ suppliers, invoices, onRefresh, onDelete }: { suppliers: Supplier[], invoices: Invoice[], onRefresh: () => void, onDelete: (id: number) => void }) {'
    suppliers_tab_state = '\n  const [reminderModal, setReminderModal] = useState<{isOpen: boolean, id: number, remaining: number}>({isOpen: false, id: 0, remaining: 0})\n'
    if suppliers_tab_start in content and suppliers_tab_state not in content.split(suppliers_tab_start)[1][:500]:
         content = content.replace(suppliers_tab_start, suppliers_tab_start + suppliers_tab_state)

    # 3. Fix InvoicesTab: Add state
    invoices_tab_start = 'function InvoicesTab({ suppliers, invoices, onRefresh, onDelete }: { suppliers: Supplier[], invoices: Invoice[], onRefresh: () => void, onDelete?: (id: number) => void }) {'
    invoices_tab_state = '\n  const [reminderModal, setReminderModal] = useState<{isOpen: boolean, id: number, remaining: number}>({isOpen: false, id: 0, remaining: 0})\n'
    if invoices_tab_start in content and invoices_tab_state not in content.split(invoices_tab_start)[1][:500]:
        content = content.replace(invoices_tab_start, invoices_tab_start + invoices_tab_state)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Cleanup successful")

if __name__ == '__main__':
    main()