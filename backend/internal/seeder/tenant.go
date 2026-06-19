package seeder

import (
	"log"

	"github.com/pixandco/erp-phrma/internal/model"
	"github.com/pixandco/erp-phrma/internal/pkg/crypto"
	"gorm.io/gorm"
)

// SeedTenant creates a default company, branch, super admin role, and admin user.
func SeedTenant(db *gorm.DB) error {
	// 1. Create Default Company
	company := model.Company{
		Name:     "Default Company",
		Code:     "DEFAULT",
		IsActive: true,
	}
	if err := db.Where("name = ?", company.Name).FirstOrCreate(&company).Error; err != nil {
		return err
	}

	// 2. Create Default Branch
	branch := model.Branch{
		CompanyScopedModel: model.CompanyScopedModel{CompanyID: company.ID},
		Name:               "Headquarters",
		Code:               "HQ",
		IsActive:           true,
	}
	if err := db.Where("code = ?", branch.Code).FirstOrCreate(&branch).Error; err != nil {
		return err
	}

	// 3. Create Super Admin Role
	role := model.Role{
		CompanyScopedModel: model.CompanyScopedModel{CompanyID: company.ID},
		Name:               "Super Admin",
		Slug:               "super-admin",
		Description:        "Has access to all features",
		IsSystem:           true,
	}
	if err := db.Where("slug = ? AND company_id = ?", role.Slug, role.CompanyID).FirstOrCreate(&role).Error; err != nil {
		return err
	}

	// 4. Attach all permissions to Super Admin role
	var allPerms []model.Permission
	if err := db.Find(&allPerms).Error; err != nil {
		return err
	}
	if err := db.Model(&role).Association("Permissions").Replace(allPerms); err != nil {
		return err
	}

	// 5. Create Default Admin User
	hash, _ := crypto.HashPassword("password123") // Default password
	user := model.User{
		TenantModel: model.TenantModel{
			CompanyID: company.ID,
			BranchID:  branch.ID,
		},
		Email:        "admin@example.com",
		PasswordHash: hash,
		FullName:     "System Admin",
		IsActive:     true,
	}
	if err := db.Where("email = ?", user.Email).FirstOrCreate(&user).Error; err != nil {
		return err
	}

	// 6. Assign Super Admin role to Admin User
	if err := db.Model(&user).Association("Roles").Replace([]model.Role{role}); err != nil {
		return err
	}

	log.Println("Default Tenant, Branch, Role, and Admin User seeded.")
	return nil
}
