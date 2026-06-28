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

	// Seed Invoice Center roles
	icRoles := []struct {
		RoleName string
		RoleCode string
	}{
		{"Invoice Manager", "INVOICE_MANAGER"},
		{"Invoice Executive", "INVOICE_EXECUTIVE"},
		{"Invoice Approver", "INVOICE_APPROVER"},
		{"Invoice Viewer", "INVOICE_VIEWER"},
	}

	for _, r := range icRoles {
		role := companyModels.Role{
			SoftwareID:   invoiceModule.ID,
			RoleName:     r.RoleName,
			RoleCode:     r.RoleCode,
			IsSystemRole: true,
			Status:       "active",
		}
		db.Where("software_id = ? AND role_code = ?", invoiceModule.ID, r.RoleCode).FirstOrCreate(&role)
	}

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
	assignPermission("COMPANY_ADMIN", func(k string) bool { return strings.HasPrefix(k, "invoice_center.") })
	assignPermission("INVOICE_MANAGER", func(k string) bool { return strings.HasPrefix(k, "invoice_center.") })

	assignPermission("INVOICE_EXECUTIVE", func(k string) bool {
		return k == "invoice_center.dashboard.view" ||
			k == "invoice_center.customer.view" ||
			k == "invoice_center.customer.create" ||
			k == "invoice_center.customer.update" ||
			k == "invoice_center.customer_category.view" ||
			k == "invoice_center.sales_order.view" ||
			k == "invoice_center.sales_order.create" ||
			k == "invoice_center.sales_order.update" ||
			k == "invoice_center.sales_order.submit" ||
			k == "invoice_center.sales_invoice.view" ||
			k == "invoice_center.sales_invoice.create" ||
			k == "invoice_center.sales_invoice.update" ||
			k == "invoice_center.sales_invoice.submit" ||
			k == "invoice_center.credit_note.view" ||
			k == "invoice_center.credit_note.create" ||
			k == "invoice_center.credit_note.update" ||
			k == "invoice_center.credit_note.submit" ||
			k == "invoice_center.debit_note.view" ||
			k == "invoice_center.debit_note.create" ||
			k == "invoice_center.debit_note.update" ||
			k == "invoice_center.debit_note.submit" ||
			k == "invoice_center.customer_receipt.view" ||
			k == "invoice_center.customer_receipt.create" ||
			k == "invoice_center.customer_receipt.update" ||
			k == "invoice_center.customer_receipt.submit"
	})

	assignPermission("INVOICE_APPROVER", func(k string) bool {
		return k == "invoice_center.dashboard.view" ||
			k == "invoice_center.customer.view" ||
			k == "invoice_center.customer_category.view" ||
			k == "invoice_center.sales_order.view" ||
			k == "invoice_center.sales_order.approve" ||
			k == "invoice_center.sales_order.reject" ||
			k == "invoice_center.sales_order.close" ||
			k == "invoice_center.sales_invoice.view" ||
			k == "invoice_center.sales_invoice.approve" ||
			k == "invoice_center.sales_invoice.reject" ||
			k == "invoice_center.sales_invoice.post" ||
			k == "invoice_center.credit_note.view" ||
			k == "invoice_center.credit_note.approve" ||
			k == "invoice_center.credit_note.reject" ||
			k == "invoice_center.credit_note.post" ||
			k == "invoice_center.debit_note.view" ||
			k == "invoice_center.debit_note.approve" ||
			k == "invoice_center.debit_note.reject" ||
			k == "invoice_center.debit_note.post" ||
			k == "invoice_center.customer_receipt.view" ||
			k == "invoice_center.customer_receipt.approve" ||
			k == "invoice_center.customer_receipt.reject" ||
			k == "invoice_center.customer_receipt.post"
	})

	assignPermission("INVOICE_VIEWER", func(k string) bool {
		return k == "invoice_center.dashboard.view" ||
			k == "invoice_center.customer.view" ||
			k == "invoice_center.customer_category.view" ||
			k == "invoice_center.sales_order.view" ||
			k == "invoice_center.sales_invoice.view" ||
			k == "invoice_center.credit_note.view" ||
			k == "invoice_center.debit_note.view" ||
			k == "invoice_center.customer_receipt.view"
	})

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
