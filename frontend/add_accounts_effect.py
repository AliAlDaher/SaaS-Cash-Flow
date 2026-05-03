path = r'c:\\Users\\DELL\\.gemini\\antigravity\\brain\\1e70835b-96e1-481b-8a66-641bd45c1cc5\\cash-flow-system\\frontend\\src\\App.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

effect_code = """  useEffect(() => {
    const fetchDetails = async () => {
      if (selectedAccount && !selectedAccount.adjustments) {
        try {
          const res = await apiFetch(`${API_URL}/accounts/${selectedAccount.id}`);
          if (res.ok) {
            const fullAccount = await res.json();
            setSelectedAccount(fullAccount);
          }
        } catch (err) {
          console.error('Error fetching account details:', err);
        }
      }
    };
    fetchDetails();
  }, [selectedAccount, setSelectedAccount]);
"""

content = content.replace("    } catch (err: any) {\n      alert(err.message);\n    }\n  };", "    } catch (err: any) {\n      alert(err.message);\n    }\n  };\n\n" + effect_code)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
