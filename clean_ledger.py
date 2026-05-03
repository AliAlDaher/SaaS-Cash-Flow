import re

def main():
    app_path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx'
    with open(app_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # We know the ranges from view_file:
    # SuppliersTab misplaced block: 753 to 834 (approx)
    # CollectionsTab misplaced block: 1742 to 1823 (approx)
    
    new_lines = []
    i = 0
    while i < len(lines):
        line_num = i + 1
        # Misplaced in SuppliersTab
        if line_num == 753 and 'if (selectedAccount) {' in lines[i]:
            print(f"Skipping block at {line_num}")
            while i < len(lines) and 'if (selectedAccount)' not in lines[i]: i += 1 # find start
            # The block ends at 834
            while i < len(lines) and i < 834: i += 1
            continue
            
        # Misplaced in CollectionsTab
        if line_num == 1742 and 'if (selectedAccount) {' in lines[i]:
            print(f"Skipping block at {line_num}")
            while i < len(lines) and i < 1823: i += 1
            continue
            
        new_lines.append(lines[i])
        i += 1

    with open(app_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)

    print("Success cleaning ledger")

if __name__ == '__main__':
    main()