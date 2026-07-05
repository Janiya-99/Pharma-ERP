package seeders

import (
	"strings"

	companyModels "github.com/pixandco/erp-phrma/internal/company/models"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/models"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// SeedInvoiceCenterPermissions seeds permissions, roles, and role mappings for Invoice Center.
func SeedInvoiceCenterPermissions(db *gorm.DB, logger *zap.Logger) error {
	var invoiceModule companyModels.SoftwareModule
	if err := db.Where("software_code = ?", "INVOICE_CENTER").First(&invoiceModule).Error; err != nil {
		logger.Warn("INVOICE_CENTER software module not found, skipping invoice center permissions")
		return nil
	}

	permissions := []struct {
		Group string
		Key   string
		Name  string
	}{
		{"Dashboard", "invoice_center.dashboard.view", "View Invoice Dashboard"},

		{"Customer Master", "invoice_center.customer.view", "View Customer"},
		{"Customer Master", "invoice_center.customer.create", "Create Customer"},
		{"Customer Master", "invoice_center.customer.update", "Update Customer"},
		{"Customer Master", "invoice_center.customer.delete", "Delete Customer"},

		{"Customer Category", "invoice_center.customer_category.view", "View Customer Category"},
		{"Customer Category", "invoice_center.customer_category.create", "Create Customer Category"},
		{"Customer Category", "invoice_center.customer_category.update", "Update Customer Category"},
		{"Customer Category", "invoice_center.customer_category.delete", "Delete Customer Category"},

		{"Sales Order", "invoice_center.sales_order.view", "View Sales Order"},
		{"Sales Order", "invoice_center.sales_order.create", "Create Sales Order"},
		{"Sales Order", "invoice_center.sales_order.update", "Update Sales Order"},
		{"Sales Order", "invoice_center.sales_order.delete", "Delete Sales Order"},
		{"Sales Order", "invoice_center.sales_order.submit", "Submit Sales Order"},
		{"Sales Order", "invoice_center.sales_order.approve", "Approve Sales Order"},
		{"Sales Order", "invoice_center.sales_order.reject", "Reject Sales Order"},
		{"Sales Order", "invoice_center.sales_order.close", "Close Sales Order"},
		{"Sales Order", "invoice_center.sales_order.cancel", "Cancel Sales Order"},

		{"Sales Invoice", "invoice_center.sales_invoice.view", "View Sales Invoice"},
		{"Sales Invoice", "invoice_center.sales_invoice.create", "Create Sales Invoice"},
		{"Sales Invoice", "invoice_center.sales_invoice.update", "Update Sales Invoice"},
		{"Sales Invoice", "invoice_center.sales_invoice.delete", "Delete Sales Invoice"},
		{"Sales Invoice", "invoice_center.sales_invoice.submit", "Submit Sales Invoice"},
		{"Sales Invoice", "invoice_center.sales_invoice.approve", "Approve Sales Invoice"},
		{"Sales Invoice", "invoice_center.sales_invoice.reject", "Reject Sales Invoice"},
		{"Sales Invoice", "invoice_center.sales_invoice.post", "Post Sales Invoice"},

		{"Credit Note", "invoice_center.credit_note.view", "View Credit Note"},
		{"Credit Note", "invoice_center.credit_note.create", "Create Credit Note"},
		{"Credit Note", "invoice_center.credit_note.update", "Update Credit Note"},
		{"Credit Note", "invoice_center.credit_note.delete", "Delete Credit Note"},
		{"Credit Note", "invoice_center.credit_note.submit", "Submit Credit Note"},
		{"Credit Note", "invoice_center.credit_note.approve", "Approve Credit Note"},
		{"Credit Note", "invoice_center.credit_note.reject", "Reject Credit Note"},
		{"Credit Note", "invoice_center.credit_note.post", "Post Credit Note"},

		{"Debit Note", "invoice_center.debit_note.view", "View Debit Note"},
		{"Debit Note", "invoice_center.debit_note.create", "Create Debit Note"},
		{"Debit Note", "invoice_center.debit_note.update", "Update Debit Note"},
		{"Debit Note", "invoice_center.debit_note.delete", "Delete Debit Note"},
		{"Debit Note", "invoice_center.debit_note.submit", "Submit Debit Note"},
		{"Debit Note", "invoice_center.debit_note.approve", "Approve Debit Note"},
		{"Debit Note", "invoice_center.debit_note.reject", "Reject Debit Note"},
		{"Debit Note", "invoice_center.debit_note.post", "Post Debit Note"},

		{"Customer Receipt", "invoice_center.customer_receipt.view", "View Customer Receipt"},
		{"Customer Receipt", "invoice_center.customer_receipt.create", "Create Customer Receipt"},
		{"Customer Receipt", "invoice_center.customer_receipt.update", "Update Customer Receipt"},
		{"Customer Receipt", "invoice_center.customer_receipt.delete", "Delete Customer Receipt"},
		{"Customer Receipt", "invoice_center.customer_receipt.submit", "Submit Customer Receipt"},
		{"Customer Receipt", "invoice_center.customer_receipt.approve", "Approve Customer Receipt"},
		{"Customer Receipt", "invoice_center.customer_receipt.reject", "Reject Customer Receipt"},
		{"Customer Receipt", "invoice_center.customer_receipt.post", "Post Customer Receipt"},

		{"Finance Posting", "invoice_center.finance_settings.view", "View Finance Settings"},
		{"Finance Posting", "invoice_center.finance_settings.update", "Update Finance Settings"},
		{"Finance Posting", "invoice_center.finance_posting.view", "View Finance Postings"},
		{"Finance Posting", "invoice_center.finance_posting.post", "Post to Finance"},

		{"Inventory Lookups", "invoice_center.lookup.inventory.view", "View Inventory Lookups"},

		{"Print Formats", "invoice_center.print_format.view", "View Print Formats"},
		{"Print Formats", "invoice_center.print_format.create", "Create Print Formats"},
		{"Print Formats", "invoice_center.print_format.update", "Update Print Formats"},
		{"Print Formats", "invoice_center.print_format.delete", "Delete Print Formats"},
		{"Print Formats", "invoice_center.print_format.set_default", "Set Default Print Format"},

		{"Reports", "invoice_center.report.customer_balance", "View Customer Balance Report"},
		{"Reports", "invoice_center.report.customer_statement", "View Customer Statement Report"},
		{"Reports", "invoice_center.report.customer_aging", "View Customer Aging Report"},
		{"Reports", "invoice_center.report.sales_order_register", "View Sales Order Register"},
		{"Reports", "invoice_center.report.sales_invoice_register", "View Sales Invoice Register"},
		{"Reports", "invoice_center.report.credit_note_register", "View Credit Note Register"},
		{"Reports", "invoice_center.report.debit_note_register", "View Debit Note Register"},
		{"Reports", "invoice_center.report.customer_receipt_register", "View Customer Receipt Register"},
		{"Reports", "invoice_center.report.outstanding_invoices", "View Outstanding Invoices"},
		{"Reports", "invoice_center.report.sales_by_customer", "View Sales by Customer"},
		{"Reports", "invoice_center.report.sales_by_product", "View Sales by Product"},
		{"Reports", "invoice_center.report.collection_summary", "View Collection Summary"},
		{"Reports", "invoice_center.report.finance_posting_status", "View Finance Posting Status"},
	}

	for _, p := range permissions {
		perm := companyModels.Permission{
			SoftwareID:      invoiceModule.ID,
			PermissionGroup: p.Group,
			PermissionKey:   p.Key,
			PermissionName:  p.Name,
			Status:          "active",
		}
		db.Where("permission_key = ?", p.Key).FirstOrCreate(&perm)
	}

	// Removed module-specific roles and mappings as roles are now global and SUPER_ADMIN handles all.

	// Fetch roles mapping
	var roles []companyModels.Role
	if err := db.Find(&roles).Error; err != nil {
		return err
	}
	roleMap := make(map[string]uint64)
	for _, r := range roles {
		roleMap[r.RoleCode] = r.ID
	}

	// Fetch permissions
	var allPerms []companyModels.Permission
	db.Find(&allPerms)

	assignPermission := func(roleCode string, permFilter func(key string) bool) {
		rID, ok := roleMap[roleCode]
		if !ok {
			return
		}
		for _, p := range allPerms {
			if permFilter(p.PermissionKey) {
				rp := companyModels.RolePermission{RoleID: rID, PermissionID: p.ID}
				db.Where("role_id = ? AND permission_id = ?", rID, p.ID).FirstOrCreate(&rp)
			}
		}
	}

	// Assign roles
	assignPermission("SUPER_ADMIN", func(k string) bool { return strings.HasPrefix(k, "invoice_center.") })

	logger.Info("Invoice Center Permissions and Roles seeding completed")
	return nil
}

// SeedInvoiceCenterMasterData seeds default customer categories and sample customer.
func SeedInvoiceCenterMasterData(db *gorm.DB, companyID uint64, logger *zap.Logger) error {
	categories := []struct {
		Code string
		Name string
	}{
		{"RETAIL", "Retail"},
		{"WHOLESALE", "Wholesale"},
		{"PHARMACY", "Pharmacy"},
		{"HOSPITAL", "Hospital"},
		{"CLINIC", "Clinic"},
		{"DISTRIBUTOR", "Distributor"},
	}

	var pharmCatID uint64
	for _, c := range categories {
		cat := models.CustomerCategory{
			CompanyID:    companyID,
			CategoryCode: c.Code,
			CategoryName: c.Name,
			Status:       "active",
		}
		var existing models.CustomerCategory
		if err := db.Where("company_id = ? AND category_code = ?", companyID, c.Code).First(&existing).Error; err != nil {
			if err := db.Create(&cat).Error; err != nil {
				logger.Error("Failed to seed customer category", zap.String("code", c.Code), zap.Error(err))
			} else if c.Code == "PHARMACY" {
				pharmCatID = cat.ID
			}
		} else if c.Code == "PHARMACY" {
			pharmCatID = existing.ID
		}
	}

	// Seed sample customer
	sampleCustomer := models.Customer{
		CompanyID:          companyID,
		CustomerCategoryID: &pharmCatID,
		CustomerCode:       "CUST-0001",
		CustomerName:       "ABC Pharmacy",
		CustomerType:       "pharmacy",
		CreditLimit:        100000,
		CreditDays:         30,
		Status:             "active",
	}
	var existingCust models.Customer
	if err := db.Where("company_id = ? AND customer_code = ?", companyID, "CUST-0001").First(&existingCust).Error; err != nil {
		if err := db.Create(&sampleCustomer).Error; err != nil {
			logger.Error("Failed to seed sample customer", zap.Error(err))
		} else {
			logger.Info("Seeded sample customer CUST-0001")
		}
	} else {
		logger.Debug("Sample customer CUST-0001 already exists")
	}

	return nil
}

// RunInvoiceCenterSeeders executes all Invoice Center seeders.
func RunInvoiceCenterSeeders(db *gorm.DB, companyID uint64, loggers ...*zap.Logger) error {
	var logger *zap.Logger
	if len(loggers) > 0 && loggers[0] != nil {
		logger = loggers[0]
	} else {
		logger = zap.NewNop()
	}

	if err := SeedInvoiceCenterPermissions(db, logger); err != nil {
		return err
	}
	if err := SeedInvoiceCenterMasterData(db, companyID, logger); err != nil {
		return err
	}
	return nil
}
