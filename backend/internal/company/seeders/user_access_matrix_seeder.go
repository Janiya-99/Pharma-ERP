package seeders

import (
	"github.com/pixandco/erp-phrma/internal/company/models"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

func SeedUserAccessMatrix(db *gorm.DB, logger *zap.Logger) error {
	// 1. Find admin user by email
	var admin models.User
	if err := db.Where("email = ?", "admin@omacx.com").First(&admin).Error; err != nil {
		logger.Warn("Admin user not found, skipping access matrix seeder", zap.Error(err))
		return nil
	}

	// 2. Find main branch where is_main_branch = true
	var mainBranch models.Branch
	if err := db.Where("company_id = ? AND is_main_branch = ?", admin.CompanyID, true).First(&mainBranch).Error; err != nil {
		logger.Warn("Main branch not found, skipping access matrix seeder", zap.Error(err))
		return nil
	}

	// Helper function to assign a role to the admin user for a specific software
	assignAdminRole := func(softwareCode, roleCode string) {
		var software models.SoftwareModule
		if err := db.Where("software_code = ?", softwareCode).First(&software).Error; err != nil {
			logger.Warn("Software not found", zap.String("software", softwareCode))
			return
		}

		var role models.Role
		if err := db.Where("software_id = ? AND role_code = ?", software.ID, roleCode).First(&role).Error; err != nil {
			logger.Warn("Role not found", zap.String("role", roleCode), zap.String("software", softwareCode))
			return
		}

		matrix := models.UserBranchSoftwareRole{
			UserID:     admin.ID,
			BranchID:   mainBranch.ID,
			SoftwareID: software.ID,
			RoleID:     role.ID,
			Status:     "active",
		}

		result := db.Where(
			"user_id = ? AND branch_id = ? AND software_id = ? AND role_id = ?",
			admin.ID, mainBranch.ID, software.ID, role.ID,
		).FirstOrCreate(&matrix)

		if result.Error != nil {
			logger.Error("Failed to seed user access matrix", zap.Error(result.Error))
		} else {
			logger.Info("Assigned admin role in matrix", zap.String("software", softwareCode), zap.String("role", roleCode))
		}
	}

	// 3-17. Assign roles across modules
	assignAdminRole("CONTROL_CENTER", "SUPER_ADMIN")
	assignAdminRole("FINANCE", "FINANCE_MANAGER")
	assignAdminRole("INVENTORY", "WAREHOUSE_MANAGER")
	assignAdminRole("INVOICE_CENTER", "INVOICE_MANAGER")
	assignAdminRole("COMPLIANCE_CENTER", "COMPLIANCE_MANAGER")

	logger.Info("User Access Matrix seeding completed")
	return nil
}
