package seeders

import (
	"github.com/pixandco/erp-phrma/internal/company/models"
	"github.com/pixandco/erp-phrma/internal/security"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// SeedAdminUser creates a default 'System Administrator' for the company if it doesn't exist,
// assigns the user to the main branch, and gives access to all software modules.
func SeedAdminUser(db *gorm.DB, logger *zap.Logger) error {
	// 1. Find company by company_code = OMACX
	var company models.Company
	if err := db.Where("company_code = ?", "OMACX").First(&company).Error; err != nil {
		logger.Warn("Company OMACX not found, skipping admin seeder", zap.Error(err))
		return nil // Not an error to fail migration, just skip if company isn't there
	}

	// 2. Find main branch where is_main_branch = true
	var mainBranch models.Branch
	if err := db.Where("company_id = ? AND is_main_branch = ?", company.ID, true).First(&mainBranch).Error; err != nil {
		logger.Warn("Main branch not found, skipping admin seeder", zap.Error(err))
		return nil
	}

	// 3. Find Administration department if available
	var dept models.Department
	db.Where("company_id = ? AND department_name = ?", company.ID, "Administration").First(&dept)

	// 4. Find System Administrator designation if available
	var desig models.Designation
	db.Where("company_id = ? AND designation_name = ?", company.ID, "System Administrator").First(&desig)

	// 5. Hash the password
	hash, err := security.HashPassword("Admin@12345")
	if err != nil {
		logger.Error("Failed to hash password", zap.Error(err))
		return err
	}

	// 6. Insert user only if email does not already exist
	userEmail := "admin@omacx.com"
	var user models.User
	result := db.Where("email = ?", userEmail).First(&user)
	if result.Error == gorm.ErrRecordNotFound {
		user = models.User{
			CompanyID:       company.ID,
			Name:            "System Administrator",
			Email:           userEmail,
			PasswordHash:    hash,
			UserType:        "super_admin",
			Status:          "active",
			DefaultBranchID: &mainBranch.ID,
		}

		if dept.ID != 0 {
			user.DepartmentID = &dept.ID
		}
		if desig.ID != 0 {
			user.DesignationID = &desig.ID
		}

		if err := db.Create(&user).Error; err != nil {
			logger.Error("Failed to create admin user", zap.Error(err))
			return err
		}
		logger.Info("Seeded admin user", zap.String("email", userEmail))
	} else if result.Error != nil {
		logger.Error("Error checking for admin user", zap.Error(result.Error))
		return result.Error
	} else {
		logger.Debug("Admin user already exists, skipping", zap.String("email", userEmail))
	}

	// 7. Assign the main branch in user_branch_access
	var uba models.UserBranchAccess
	ubaResult := db.Where("user_id = ? AND branch_id = ?", user.ID, mainBranch.ID).First(&uba)
	if ubaResult.Error == gorm.ErrRecordNotFound {
		uba = models.UserBranchAccess{
			UserID:    user.ID,
			BranchID:  mainBranch.ID,
			IsDefault: true,
			Status:    "active",
		}
		if err := db.Create(&uba).Error; err != nil {
			logger.Error("Failed to assign branch to admin user", zap.Error(err))
			return err
		}
		logger.Info("Assigned main branch to admin user")
	}

	// 8. Assign all software modules in user_software_access
	var modules []models.SoftwareModule
	if err := db.Find(&modules).Error; err == nil {
		for _, m := range modules {
			var usa models.UserSoftwareAccess
			usaResult := db.Where("user_id = ? AND software_id = ?", user.ID, m.ID).First(&usa)
			if usaResult.Error == gorm.ErrRecordNotFound {
				usa = models.UserSoftwareAccess{
					UserID:     user.ID,
					SoftwareID: m.ID,
					CanAccess:  true,
					Status:     "active",
				}
				if err := db.Create(&usa).Error; err != nil {
					logger.Error("Failed to assign software to admin user", zap.Error(err))
					continue
				}
				logger.Info("Assigned software to admin user", zap.String("software", m.SoftwareCode))
			}
		}
	}

	return nil
}
