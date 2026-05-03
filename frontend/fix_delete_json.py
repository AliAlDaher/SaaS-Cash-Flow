path = r'c:\\Users\\DELL\\.gemini\\antigravity\\brain\\1e70835b-96e1-481b-8a66-641bd45c1cc5\\cash-flow-system\\frontend\\src\\App.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old_line = '      const data = await res.json()'
new_line = '      const data = res.status !== 204 ? await res.json() : {}'

# Use a more specific replacement if possible to avoid hitting other lines
target = """      const res = await apiFetch(`${API_URL}/${deleteModal.type}/${deleteModal.id}`, {
        method: 'DELETE'
      })
      const data = await res.json()"""

replacement = """      const res = await apiFetch(`${API_URL}/${deleteModal.type}/${deleteModal.id}`, {
        method: 'DELETE'
      })
      const data = res.status !== 204 ? await res.json() : {}"""

content = content.replace(target, replacement)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
