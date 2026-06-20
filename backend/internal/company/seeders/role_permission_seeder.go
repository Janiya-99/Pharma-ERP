package seeders

import (
	"strings"

	"github.com/pixandco/erp-phrma/internal/company/models"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

func SeedRolePermissions(db *gorm.DB, logger *zap.Logger) error {
	var roles []models.Role
	if err := db.Find(&roles).Error; err != nil {
		return err
	}

	var permissions []models.Permission
	if err := db.Find(&permissions).Error; err != nil {
		return err
	}

	roleMap := make(map[string]uint64)
	for _, r := range roles {
		roleMap[r.RoleCode] = r.ID
	}

	permMap := make(map[string]uint64)
	for _, p := range permissions {
		permMap[p.PermissionKey] = p.ID
	}

	assignPermission := func(roleCode string, permFilter func(key string) bool) {
		rID, ok := roleMap[roleCode]
		if !ok {
			return
		}

		for _, p := range permissions {
			if permFilter(p.PermissionKey) {
				rp := models.RolePermission{
					RoleID:       rID,
					PermissionID: p.ID,
				}
				db.Where("role_id = ? AND permission_id = ?", rID, p.ID).FirstOrCreate(&rp)
			}
		}
	}

	// Super Admin: all permissions
	assignPermission("SUPER_ADMIN", func(k string) bool { return true })

	// Company Admin: all Control Center
	assignPermission("COMPANY_ADMIN", func(k string) bool { return strings.HasPrefix(k, "control.") })

	// User Manager: user, branch access, software access, access matrix
	assignPermission("USER_MANAGER", func(k string) bool {
		return strings.HasPrefix(k, "control.user.") ||
			strings.HasPrefix(k, "control.access.") ||
			strings.HasPrefix(k, "control.access_matrix.")
	})

	// Read Only Admin: only view permissions in Control Center
	assignPermission("READ_ONLY_ADMIN", func(k string) bool {
		return strings.HasPrefix(k, "control.") && strings.HasSuffix(k, ".view")
	})

	// Finance Manager: all Finance
	assignPermission("FINANCE_MANAGER", func(k string) bool { return strings.HasPrefix(k, "finance.") })
	// Finance Viewer
	assignPermission("FINANCE_VIEWER", func(k string) bool {
		return strings.HasPrefix(k, "finance.") && strings.HasSuffix(k, ".view")
	})

	// Warehouse Manager: all Inventory
	assignPermission("WAREHOUSE_MANAGER", func(k string) bool { return strings.HasPrefix(k, "inventory.") })
	// Inventory Viewer
	assignPermission("INVENTORY_VIEWER", func(k string) bool {
		return strings.HasPrefix(k, "inventory.") && strings.HasSuffix(k, ".view")
	})

	// Invoice Manager: all Invoice Center
	assignPermission("INVOICE_MANAGER", func(k string) bool { return strings.HasPrefix(k, "invoice.") })
	// Invoice Viewer
	assignPermission("INVOICE_VIEWER", func(k string) bool {
		return strings.HasPrefix(k, "invoice.") && strings.HasSuffix(k, ".view")
	})

	// Compliance Manager: all Compliance Center
	assignPermission("COMPLIANCE_MANAGER", func(k string) bool { return strings.HasPrefix(k, "compliance.") })
	// Compliance Viewer
	assignPermission("COMPLIANCE_VIEWER", func(k string) bool {
		return strings.HasPrefix(k, "compliance.") && strings.HasSuffix(k, ".view")
	})

	logger.Info("Role Permissions seeding completed")
	return nil
}
