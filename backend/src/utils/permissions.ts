import { Decimal } from '@prisma/client/runtime/library';

export const ADMIN_PERMISSIONS = {
  dashboard: { view: true },
  reports: { view: true },
  invoices: { view: true, create: true, edit: true, delete: true },
  payments: { view: true, create: true, edit: true, delete: true },
  cheques: { view: true, create: true, edit: true, delete: true },
  expenses: { view: true, create: true, edit: true, delete: true },
  collections: { view: true, create: true, edit: true, delete: true },
  suppliers: { view: true, create: true, edit: true, delete: true },
  accounts: { view: true, create: true, edit: true, delete: true },
  users: { view: true, create: true, edit: true, delete: true }
};

export function expandPermissions(role: string, permsJson: string | null): any {
  if (role === 'admin') {
    return ADMIN_PERMISSIONS;
  }
  try {
    const flatPerms = permsJson ? JSON.parse(permsJson) : {};
    if (!flatPerms.invoices && (flatPerms.canManageInvoices !== undefined || flatPerms.canViewDashboard !== undefined)) {
      return {
        dashboard: { view: !!flatPerms.canViewDashboard },
        reports: { view: !!flatPerms.canViewDashboard },
        invoices: { view: !!flatPerms.canManageInvoices, create: !!flatPerms.canManageInvoices, edit: !!flatPerms.canManageInvoices, delete: !!flatPerms.canDelete },
        payments: { view: !!flatPerms.canManagePayments, create: !!flatPerms.canManagePayments, edit: !!flatPerms.canManagePayments, delete: !!flatPerms.canDelete },
        cheques: { view: !!flatPerms.canManageInvoices, create: !!flatPerms.canManageInvoices, edit: !!flatPerms.canManageInvoices, delete: !!flatPerms.canDelete },
        expenses: { view: !!flatPerms.canManageInvoices, create: !!flatPerms.canManageInvoices, edit: !!flatPerms.canManageInvoices, delete: !!flatPerms.canDelete },
        collections: { view: !!flatPerms.canManageCollections, create: !!flatPerms.canManageCollections, edit: !!flatPerms.canManageCollections, delete: !!flatPerms.canDelete },
        suppliers: { view: !!flatPerms.canManageSuppliers, create: !!flatPerms.canManageSuppliers, edit: !!flatPerms.canManageSuppliers, delete: !!flatPerms.canDelete },
        accounts: { view: !!flatPerms.canManageAccounts, create: !!flatPerms.canManageAccounts, edit: !!flatPerms.canManageAccounts, delete: !!flatPerms.canDelete },
        users: { view: !!flatPerms.canManageUsers, create: !!flatPerms.canManageUsers, edit: !!flatPerms.canManageUsers, delete: !!flatPerms.canManageUsers }
      };
    }
    return flatPerms;
  } catch (e) {
    return {};
  }
}
