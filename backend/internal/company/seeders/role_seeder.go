package seeders

import (
	"github.com/pixandco/erp-phrma/internal/company/models"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

func SeedRoles(db *gorm.DB, logger *zap.Logger, isNewTenant bool) error {
	roles := []struct {
		RoleName string
		RoleCode string
	}{
		{"Super Admin", "SUPER_ADMIN"},
	}

	for _, r := range roles {
		role := models.Role{
			RoleName:     r.RoleName,
			RoleCode:     r.RoleCode,
			IsSystemRole: true,
			Status:       "active",
		}
		result := db.Where("role_code = ?", r.RoleCode).FirstOrCreate(&role)
		if result.Error != nil {
			logger.Error("Failed to seed role", zap.String("code", r.RoleCode), zap.Error(result.Error))
		}
	}

	logger.Info("Roles seeding completed")
	return nil
}
