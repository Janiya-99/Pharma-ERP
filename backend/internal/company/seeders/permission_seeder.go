package seeders

import (
	"github.com/pixandco/erp-phrma/internal/company/models"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

func SeedPermissions(db *gorm.DB, logger *zap.Logger) error {
	var modules []models.SoftwareModule
	if err := db.Find(&modules).Error; err != nil {
		return err
	}

	moduleMap := make(map[string]uint64)
	for _, m := range modules {
		moduleMap[m.SoftwareCode] = m.ID
	}

	permissions := []struct {
		SoftwareCode    string
		PermissionGroup string
		PermissionKey   string
		PermissionName  string
	}{
		// CONTROL CENTER
		{"CONTROL_CENTER", "Company Management", "control.company.view", "View Company"},
		{"CONTROL_CENTER", "Company Management", "control.company.update", "Update Company"},
		{"CONTROL_CENTER", "Branch Management", "control.branch.view", "View Branch"},
		{"CONTROL_CENTER", "Branch Management", "control.branch.create", "Create Branch"},
		{"CONTROL_CENTER", "Branch Management", "control.branch.update", "Update Branch"},
		{"CONTROL_CENTER", "Branch Management", "control.branch.delete", "Delete Branch"},
		{"CONTROL_CENTER", "Department Management", "control.department.view", "View Department"},
		{"CONTROL_CENTER", "Department Management", "control.department.create", "Create Department"},
		{"CONTROL_CENTER", "Department Management", "control.department.update", "Update Department"},
		{"CONTROL_CENTER", "Department Management", "control.department.delete", "Delete Department"},
		{"CONTROL_CENTER", "Designation Management", "control.designation.view", "View Designation"},
		{"CONTROL_CENTER", "Designation Management", "control.designation.create", "Create Designation"},
		{"CONTROL_CENTER", "Designation Management", "control.designation.update", "Update Designation"},
		{"CONTROL_CENTER", "Designation Management", "control.designation.delete", "Delete Designation"},
		{"CONTROL_CENTER", "User Management", "control.user.view", "View User"},
		{"CONTROL_CENTER", "User Management", "control.user.create", "Create User"},
		{"CONTROL_CENTER", "User Management", "control.user.update", "Update User"},
		{"CONTROL_CENTER", "User Management", "control.user.delete", "Delete User"},
		{"CONTROL_CENTER", "User Management", "control.user.reset_password", "Reset Password"},
		{"CONTROL_CENTER", "User Management", "control.user.change_status", "Change Status"},
		{"CONTROL_CENTER", "Branch Access", "control.access.branch.view", "View Branch Access"},
		{"CONTROL_CENTER", "Branch Access", "control.access.branch.assign", "Assign Branch Access"},
		{"CONTROL_CENTER", "Branch Access", "control.access.branch.remove", "Remove Branch Access"},
		{"CONTROL_CENTER", "Software Access", "control.access.software.view", "View Software Access"},
		{"CONTROL_CENTER", "Software Access", "control.access.software.assign", "Assign Software Access"},
		{"CONTROL_CENTER", "Software Access", "control.access.software.remove", "Remove Software Access"},
		{"CONTROL_CENTER", "Role Management", "control.role.view", "View Role"},
		{"CONTROL_CENTER", "Role Management", "control.role.create", "Create Role"},
		{"CONTROL_CENTER", "Role Management", "control.role.update", "Update Role"},
		{"CONTROL_CENTER", "Role Management", "control.role.delete", "Delete Role"},
		{"CONTROL_CENTER", "Permission Management", "control.permission.view", "View Permission"},
		{"CONTROL_CENTER", "Permission Management", "control.permission.assign", "Assign Permission"},
		{"CONTROL_CENTER", "User Access Matrix", "control.access_matrix.view", "View Access Matrix"},
		{"CONTROL_CENTER", "User Access Matrix", "control.access_matrix.assign", "Assign Access Matrix"},
		{"CONTROL_CENTER", "User Access Matrix", "control.access_matrix.remove", "Remove Access Matrix"},
		{"CONTROL_CENTER", "Audit Logs", "control.audit.view", "View Audit Logs"},
		{"CONTROL_CENTER", "Login Logs", "control.login_logs.view", "View Login Logs"},

		// FINANCE
		{"FINANCE", "Dashboard", "finance.dashboard.view", "View Finance Dashboard"},
		{"FINANCE", "Setup", "finance.financial_year.view", "View Financial Year"},
		{"FINANCE", "Setup", "finance.financial_year.create", "Create Financial Year"},
		{"FINANCE", "Setup", "finance.financial_year.update", "Update Financial Year"},
		{"FINANCE", "Setup", "finance.financial_year.close", "Close Financial Year"},
		{"FINANCE", "Setup", "finance.accounting_period.view", "View Accounting Period"},
		{"FINANCE", "Setup", "finance.accounting_period.create", "Create Accounting Period"},
		{"FINANCE", "Setup", "finance.accounting_period.update", "Update Accounting Period"},
		{"FINANCE", "Setup", "finance.accounting_period.close", "Close Accounting Period"},
		{"FINANCE", "Setup", "finance.account_classification.view", "View Account Classification"},
		{"FINANCE", "Setup", "finance.account_classification.create", "Create Account Classification"},
		{"FINANCE", "Setup", "finance.account_classification.update", "Update Account Classification"},
		{"FINANCE", "Setup", "finance.account_classification.delete", "Delete Account Classification"},
		{"FINANCE", "Chart of Accounts", "finance.chart_of_accounts.view", "View Chart of Accounts"},
		{"FINANCE", "Chart of Accounts", "finance.chart_of_accounts.create", "Create Chart of Accounts"},
		{"FINANCE", "Chart of Accounts", "finance.chart_of_accounts.update", "Update Chart of Accounts"},
		{"FINANCE", "Chart of Accounts", "finance.chart_of_accounts.delete", "Delete Chart of Accounts"},
		{"FINANCE", "Setup", "finance.opening_balance.view", "View Opening Balance"},
		{"FINANCE", "Setup", "finance.opening_balance.create", "Create Opening Balance"},
		{"FINANCE", "Setup", "finance.opening_balance.update", "Update Opening Balance"},
		{"FINANCE", "Setup", "finance.opening_balance.delete", "Delete Opening Balance"},
		{"FINANCE", "Journal", "finance.journal.view", "View Journal"},
		{"FINANCE", "Journal", "finance.journal.create", "Create Journal"},
		{"FINANCE", "Journal", "finance.journal.update", "Update Journal"},
		{"FINANCE", "Journal", "finance.journal.delete", "Delete Journal"},
		{"FINANCE", "Journal", "finance.journal.submit", "Submit Journal"},
		{"FINANCE", "Journal", "finance.journal.approve", "Approve Journal"},
		{"FINANCE", "Journal", "finance.journal.reject", "Reject Journal"},
		{"FINANCE", "Journal", "finance.journal.post", "Post Journal"},
		{"FINANCE", "Journal", "finance.journal.reverse", "Reverse Journal"},
		{"FINANCE", "Payment", "finance.payment.view", "View Payment"},
		{"FINANCE", "Payment", "finance.payment.create", "Create Payment"},
		{"FINANCE", "Payment", "finance.payment.update", "Update Payment"},
		{"FINANCE", "Payment", "finance.payment.delete", "Delete Payment"},
		{"FINANCE", "Payment", "finance.payment.submit", "Submit Payment"},
		{"FINANCE", "Payment", "finance.payment.approve", "Approve Payment"},
		{"FINANCE", "Payment", "finance.payment.reject", "Reject Payment"},
		{"FINANCE", "Payment", "finance.payment.post", "Post Payment"},
		{"FINANCE", "Receipt", "finance.receipt.view", "View Receipt"},
		{"FINANCE", "Receipt", "finance.receipt.create", "Create Receipt"},
		{"FINANCE", "Receipt", "finance.receipt.update", "Update Receipt"},
		{"FINANCE", "Receipt", "finance.receipt.delete", "Delete Receipt"},
		{"FINANCE", "Receipt", "finance.receipt.submit", "Submit Receipt"},
		{"FINANCE", "Receipt", "finance.receipt.approve", "Approve Receipt"},
		{"FINANCE", "Receipt", "finance.receipt.reject", "Reject Receipt"},
		{"FINANCE", "Receipt", "finance.receipt.post", "Post Receipt"},
		
		{"FINANCE", "Bank Account", "finance.bank_account.view", "View Bank Account"},
		{"FINANCE", "Bank Account", "finance.bank_account.create", "Create Bank Account"},
		{"FINANCE", "Bank Account", "finance.bank_account.update", "Update Bank Account"},
		{"FINANCE", "Bank Account", "finance.bank_account.delete", "Delete Bank Account"},
		
		{"FINANCE", "Cheque Book", "finance.cheque_book.view", "View Cheque Book"},
		{"FINANCE", "Cheque Book", "finance.cheque_book.create", "Create Cheque Book"},
		{"FINANCE", "Cheque Book", "finance.cheque_book.update", "Update Cheque Book"},
		{"FINANCE", "Cheque Book", "finance.cheque_book.delete", "Delete Cheque Book"},
		{"FINANCE", "Cheque Book", "finance.cheque_book.cancel_leaf", "Cancel Cheque Leaf"},
		
		{"FINANCE", "Bank Transaction", "finance.bank_transaction.view", "View Bank Transaction"},
		{"FINANCE", "Bank Transaction", "finance.bank_transaction.create", "Create Bank Transaction"},
		{"FINANCE", "Bank Transaction", "finance.bank_transaction.update", "Update Bank Transaction"},
		{"FINANCE", "Bank Transaction", "finance.bank_transaction.delete", "Delete Bank Transaction"},
		
		{"FINANCE", "Bank Reconciliation", "finance.bank_reconciliation.view", "View Bank Reconciliation"},
		{"FINANCE", "Bank Reconciliation", "finance.bank_reconciliation.create", "Create Bank Reconciliation"},
		{"FINANCE", "Bank Reconciliation", "finance.bank_reconciliation.update", "Update Bank Reconciliation"},
		{"FINANCE", "Bank Reconciliation", "finance.bank_reconciliation.delete", "Delete Bank Reconciliation"},
		{"FINANCE", "Bank Reconciliation", "finance.bank_reconciliation.complete", "Complete Bank Reconciliation"},
		{"FINANCE", "Bank Reconciliation", "finance.bank_reconciliation.cancel", "Cancel Bank Reconciliation"},
		
		{"FINANCE", "Report", "finance.report.view", "View Finance Report"},

		// INVENTORY
		{"INVENTORY", "Dashboard", "inventory.dashboard.view", "View Inventory Dashboard"},
		{"INVENTORY", "Product", "inventory.product.view", "View Product"},
		{"INVENTORY", "Product", "inventory.product.create", "Create Product"},
		{"INVENTORY", "Product", "inventory.product.update", "Update Product"},
		{"INVENTORY", "Warehouse", "inventory.warehouse.view", "View Warehouse"},
		{"INVENTORY", "GRN", "inventory.grn.view", "View GRN"},
		{"INVENTORY", "GRN", "inventory.grn.create", "Create GRN"},
		{"INVENTORY", "GRN", "inventory.grn.approve", "Approve GRN"},
		{"INVENTORY", "Stock Transfer", "inventory.stock_transfer.view", "View Stock Transfer"},
		{"INVENTORY", "Stock Transfer", "inventory.stock_transfer.create", "Create Stock Transfer"},
		{"INVENTORY", "Stock Transfer", "inventory.stock_transfer.approve", "Approve Stock Transfer"},
		{"INVENTORY", "Stock Adjustment", "inventory.stock_adjustment.view", "View Stock Adjustment"},
		{"INVENTORY", "Stock Adjustment", "inventory.stock_adjustment.create", "Create Stock Adjustment"},
		{"INVENTORY", "Stock Adjustment", "inventory.stock_adjustment.approve", "Approve Stock Adjustment"},
		{"INVENTORY", "Report", "inventory.report.view", "View Inventory Report"},

		// INVOICE CENTER
		{"INVOICE_CENTER", "Dashboard", "invoice.dashboard.view", "View Invoice Dashboard"},
		{"INVOICE_CENTER", "Customer", "invoice.customer.view", "View Customer"},
		{"INVOICE_CENTER", "Customer", "invoice.customer.create", "Create Customer"},
		{"INVOICE_CENTER", "Sales Order", "invoice.sales_order.view", "View Sales Order"},
		{"INVOICE_CENTER", "Sales Order", "invoice.sales_order.create", "Create Sales Order"},
		{"INVOICE_CENTER", "Invoice", "invoice.invoice.view", "View Invoice"},
		{"INVOICE_CENTER", "Invoice", "invoice.invoice.create", "Create Invoice"},
		{"INVOICE_CENTER", "Invoice", "invoice.invoice.approve", "Approve Invoice"},
		{"INVOICE_CENTER", "Credit Note", "invoice.credit_note.view", "View Credit Note"},
		{"INVOICE_CENTER", "Credit Note", "invoice.credit_note.create", "Create Credit Note"},
		{"INVOICE_CENTER", "Customer Receipt", "invoice.customer_receipt.view", "View Customer Receipt"},
		{"INVOICE_CENTER", "Customer Receipt", "invoice.customer_receipt.create", "Create Customer Receipt"},
		{"INVOICE_CENTER", "Report", "invoice.report.view", "View Invoice Report"},

		// COMPLIANCE CENTER
		{"COMPLIANCE_CENTER", "Dashboard", "compliance.dashboard.view", "View Compliance Dashboard"},
		{"COMPLIANCE_CENTER", "NMRA", "compliance.nmra.view", "View NMRA"},
		{"COMPLIANCE_CENTER", "NMRA", "compliance.nmra.create", "Create NMRA"},
		{"COMPLIANCE_CENTER", "Batch Hold", "compliance.batch_hold.view", "View Batch Hold"},
		{"COMPLIANCE_CENTER", "Batch Hold", "compliance.batch_hold.create", "Create Batch Hold"},
		{"COMPLIANCE_CENTER", "Batch Hold", "compliance.batch_hold.approve", "Approve Batch Hold"},
		{"COMPLIANCE_CENTER", "Batch Recall", "compliance.batch_recall.view", "View Batch Recall"},
		{"COMPLIANCE_CENTER", "Batch Recall", "compliance.batch_recall.create", "Create Batch Recall"},
		{"COMPLIANCE_CENTER", "Batch Recall", "compliance.batch_recall.approve", "Approve Batch Recall"},
		{"COMPLIANCE_CENTER", "Expiry Disposal", "compliance.expiry_disposal.view", "View Expiry Disposal"},
		{"COMPLIANCE_CENTER", "Expiry Disposal", "compliance.expiry_disposal.create", "Create Expiry Disposal"},
		{"COMPLIANCE_CENTER", "Expiry Disposal", "compliance.expiry_disposal.approve", "Approve Expiry Disposal"},
		{"COMPLIANCE_CENTER", "Report", "compliance.report.view", "View Compliance Report"},
	}

	for _, p := range permissions {
		swID, ok := moduleMap[p.SoftwareCode]
		if !ok {
			logger.Warn("Software module not found for permission, skipping", zap.String("module", p.SoftwareCode))
			continue
		}

		perm := models.Permission{
			SoftwareID:      swID,
			PermissionGroup: p.PermissionGroup,
			PermissionKey:   p.PermissionKey,
			PermissionName:  p.PermissionName,
			Status:          "active",
		}
		result := db.Where("permission_key = ?", p.PermissionKey).FirstOrCreate(&perm)
		if result.Error != nil {
			logger.Error("Failed to seed permission", zap.String("key", p.PermissionKey), zap.Error(result.Error))
		}
	}

	logger.Info("Permissions seeding completed")
	return nil
}
