path = r'c:\\Users\\DELL\\.gemini\\antigravity\\brain\\1e70835b-96e1-481b-8a66-641bd45c1cc5\\cash-flow-system\\frontend\\src\\App.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

bad_effect_end = """    };



  const [name, setName] = useState('')"""

good_effect_end = """    };
    fetchDetails();
  }, [selectedAccount, setSelectedAccount]);

  const [name, setName] = useState('')"""

content = content.replace(bad_effect_end, good_effect_end)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
