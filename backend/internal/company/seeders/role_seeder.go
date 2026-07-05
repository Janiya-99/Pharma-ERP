package seeders

import (
	"github.com/pixandco/erp-phrma/internal/company/models"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

func SeedRoles(db *gorm.DB, logger *zap.Logger, isNewTenant bool) error {
	var modules []models.SoftwareModule
	if err := db.Find(&modules).Error; err != nil {
		return err
	}

	moduleMap := make(map[string]uint64)
	for _, m := range modules {
		moduleMap[m.SoftwareCode] = m.ID
	}

	roles := []struct {
		SoftwareCode string
		RoleName     string
		RoleCode     string
	}{
		// ALL MODULES (GLOBAL)
		{"ALL_MODULES", "Global Super Admin", "GLOBAL_SUPER_ADMIN"},
		{"ALL_MODULES", "Global Viewer", "GLOBAL_VIEWER"},

		// CONTROL CENTER
		{"CONTROL_CENTER", "Super Admin", "SUPER_ADMIN"},
		{"CONTROL_CENTER", "Company Admin", "COMPANY_ADMIN"},
		{"CONTROL_CENTER", "User Manager", "USER_MANAGER"},
		{"CONTROL_CENTER", "Read Only Admin", "READ_ONLY_ADMIN"},

		// FINANCE
		{"FINANCE", "Finance Manager", "FINANCE_MANAGER"},
		{"FINANCE", "Finance Executive", "FINANCE_EXECUTIVE"},
		{"FINANCE", "Finance Viewer", "FINANCE_VIEWER"},
		{"FINANCE", "Finance Approver", "FINANCE_APPROVER"},

		// INVENTORY
		{"INVENTORY", "Warehouse Manager", "WAREHOUSE_MANAGER"},
		{"INVENTORY", "Stock Controller", "STOCK_CONTROLLER"},
		{"INVENTORY", "Inventory Viewer", "INVENTORY_VIEWER"},
		{"INVENTORY", "Inventory Approver", "INVENTORY_APPROVER"},

		// INVOICE CENTER
		{"INVOICE_CENTER", "Invoice Manager", "INVOICE_MANAGER"},
		{"INVOICE_CENTER", "Invoice Executive", "INVOICE_EXECUTIVE"},
		{"INVOICE_CENTER", "Invoice Approver", "INVOICE_APPROVER"},
		{"INVOICE_CENTER", "Invoice Viewer", "INVOICE_VIEWER"},

		// COMPLIANCE CENTER
		{"COMPLIANCE_CENTER", "Compliance Manager", "COMPLIANCE_MANAGER"},
		{"COMPLIANCE_CENTER", "Compliance Officer", "COMPLIANCE_OFFICER"},
		{"COMPLIANCE_CENTER", "Compliance Approver", "COMPLIANCE_APPROVER"},
		{"COMPLIANCE_CENTER", "Compliance Viewer", "COMPLIANCE_VIEWER"},
	}

	if isNewTenant {
		// Only keep Global Super Admin and Super Admin for new tenants
		var filteredRoles []struct {
			SoftwareCode string
			RoleName     string
			RoleCode     string
		}
		for _, r := range roles {
			if r.RoleCode == "GLOBAL_SUPER_ADMIN" || r.RoleCode == "SUPER_ADMIN" {
				filteredRoles = append(filteredRoles, r)
			}
		}
		roles = filteredRoles
	}

	for _, r := range roles {
		swID, ok := moduleMap[r.SoftwareCode]
		if !ok {
			logger.Warn("Software module not found for role, skipping", zap.String("module", r.SoftwareCode))
			continue
		}

		role := models.Role{
			SoftwareID:   swID,
			RoleName:     r.RoleName,
			RoleCode:     r.RoleCode,
			IsSystemRole: true,
			Status:       "active",
		}
		result := db.Where("software_id = ? AND role_code = ?", swID, r.RoleCode).FirstOrCreate(&role)
		if result.Error != nil {
			logger.Error("Failed to seed role", zap.String("code", r.RoleCode), zap.Error(result.Error))
		}
	}

	logger.Info("Roles seeding completed")
	return nil
}
