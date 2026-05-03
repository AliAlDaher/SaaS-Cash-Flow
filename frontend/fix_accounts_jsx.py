import re
path = r'c:\\Users\\DELL\\.gemini\\antigravity\\brain\\1e70835b-96e1-481b-8a66-641bd45c1cc5\\cash-flow-system\\frontend\\src\\App.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# I'll find the start of the if (selectedAccount) block and replace it until the return (
# Wait, it's safer to replace the whole return block inside the if.

pattern = r'if \(selectedAccount\) \{.*?return \(\s*<div className="space-y-8 animate-in fade-in duration-200">.*?</div>\s*\);\s*\}'
# This is tricky because of nested divs.

# Let's try to find the specific problematic section.
bad_header_end = """          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">"""

good_header_end = """        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">"""

content = content.replace(bad_header_end, good_header_end)

# Also fix the end of the if (selectedAccount) block
bad_block_end = """        </div>
        <ReconcileModal isOpen={isReconcileOpen} onClose={() => setIsReconcileOpen(false)} onConfirm={handleReconcileConfirm} currentBalance={selectedAccount.balance} />
    </div>
    );
  }"""

good_block_end = """        </div>
        <ReconcileModal isOpen={isReconcileOpen} onClose={() => setIsReconcileOpen(false)} onConfirm={handleReconcileConfirm} currentBalance={selectedAccount.balance} />
      </div>
    );
  }"""

content = content.replace(bad_block_end, good_block_end)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
