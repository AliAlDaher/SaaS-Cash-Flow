import re

def main():
    path = 'c:/Users/DELL/.gemini/antigravity/brain/1e70835b-96e1-481b-8a66-641bd45c1cc5/cash-flow-system/frontend/src/App.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update SuppliersTab calculations
    content = content.replace(
        'const totalAmount = supplierInvoices.reduce((acc, inv) => acc + inv.amount, 0);',
        'const totalAmount = supplierInvoices.reduce((acc, inv) => acc.plus(new Decimal(inv.amount)), new Decimal(0)).toNumber();'
    )
    content = content.replace(
        'const totalPaid = supplierInvoices.reduce((acc, inv) => acc + inv.paidAmount, 0);',
        'const totalPaid = supplierInvoices.reduce((acc, inv) => acc.plus(new Decimal(inv.paidAmount)), new Decimal(0)).toNumber();'
    )
    content = content.replace(
        'const remaining = totalAmount - totalPaid;',
        'const remaining = new Decimal(totalAmount).minus(totalPaid).toNumber();'
    )

    # 2. Update PaymentsTab balance check
    content = content.replace(
        'if (!editPaymentId && acc && pAmount > acc.balance) {',
        'if (!editPaymentId && acc && new Decimal(pAmount).greaterThan(new Decimal(acc.balance))) {'
    )

    # 3. Update AccountsTab calculations
    content = content.replace(
        'value={<FormatCurrency amount={accountCollections.reduce((sum, t) => sum + t.amount, 0)}/>}',
        'value={<FormatCurrency amount={accountCollections.reduce((sum, t) => sum.plus(new Decimal(t.amount)), new Decimal(0)).toNumber()}/>}'
    )
    content = content.replace(
        'value={<FormatCurrency amount={accountPayments.reduce((sum, t) => sum + t.amount, 0)}/>}',
        'value={<FormatCurrency amount={accountPayments.reduce((sum, t) => sum.plus(new Decimal(t.amount)), new Decimal(0)).toNumber()}/>}'
    )

    # 4. Update InvoiceTable remaining amount logic
    # Find the line like: <FormatCurrency amount={invoice.amount - invoice.paidAmount} />
    content = re.sub(
        r'<FormatCurrency amount=\{invoice\.amount - invoice\.paidAmount\} />',
        r'<FormatCurrency amount={new Decimal(invoice.amount).minus(invoice.paidAmount).toNumber()} />',
        content
    )

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Success updating App.tsx with remaining Decimal logic")

if __name__ == '__main__':
    main()