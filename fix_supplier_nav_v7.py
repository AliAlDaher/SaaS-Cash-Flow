import re

def main():
    app_path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx'
    with open(app_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Lines are 0-indexed in the list, so line 1181 is index 1180
    # Wait, the line numbers in view_file were:
    # 1181:                     const s = suppliers.find(sup => sup.id === invoice.supplierId);
    # 1263:                     const s = suppliers.find(sup => sup.id === payment.supplierId);
    
    # Let's find them by content to be safe
    for i in range(len(lines)):
        if 'const s = suppliers.find(sup => sup.id === invoice.supplierId);' in lines[i] and i < 1200:
             lines[i] = lines[i].replace('invoice.supplierId', 'payment.supplierId')
             print(f"Fixed line {i+1}")
        elif 'const s = suppliers.find(sup => sup.id === payment.supplierId);' in lines[i] and i > 1200:
             lines[i] = lines[i].replace('payment.supplierId', 'invoice.supplierId')
             print(f"Fixed line {i+1}")

    with open(app_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)

    print("Success fixing supplier nav v7")

if __name__ == '__main__':
    main()