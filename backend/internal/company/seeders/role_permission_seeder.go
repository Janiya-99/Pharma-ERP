package seeders

import (
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

	logger.Info("Role Permissions seeding completed")
	return nil
}
