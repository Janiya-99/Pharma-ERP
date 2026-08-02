package services

import (
	"errors"
	"fmt"
	"strings"
	"time"

	companyMigrations "github.com/pixandco/erp-phrma/internal/company/migrations"
	companyModels "github.com/pixandco/erp-phrma/internal/company/models"
	"github.com/pixandco/erp-phrma/internal/platform/models"
	"github.com/pixandco/erp-phrma/internal/security"
	"go.uber.org/zap"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

type CompanyCreationRequest struct {
	CompanyCode        string                `json:"company_code"`
	CompanyName        string                `json:"company_name"`
	LegalName          string                `json:"legal_name"`
	RegistrationNumber string                `json:"registration_number"`
	TaxNumber          string                `json:"tax_number"`
	Industry           string                `json:"industry"`
	CompanyEmail       string                `json:"company_email"`
	CompanyPhone       string                `json:"company_phone"`
	Country            string                `json:"country"`
	Timezone           string                `json:"timezone"`
	SubscriptionPlanID uint                  `json:"subscription_plan_id"`
	Modules            []string              `json:"modules"`
	FirstUser          FirstUserRequest      `json:"first_user"`
	BillingProfile     BillingProfileRequest `json:"billing_profile"`
}

type FirstUserRequest struct {
	Name              string `json:"name"`
	Email             string `json:"email"`
	Phone             string `json:"phone"`
	TemporaryPassword string `json:"temporary_password"`
}

type BillingProfileRequest struct {
	BillingName    string `json:"billing_name"`
	BillingEmail   string `json:"billing_email"`
	BillingPhone   string `json:"billing_phone"`
	BillingAddress string `json:"billing_address"`
	BillingCity    string `json:"billing_city"`
	BillingCountry string `json:"billing_country"`
	TaxNumber      string `json:"tax_number"`
	PaymentTerms   string `json:"payment_terms"`
	Currency       string `json:"currency"`
}

// CreateTenantCompany handles the entire transactional workflow of provisioning a new tenant.
func CreateTenantCompany(platformDB *gorm.DB, req CompanyCreationRequest, logger *zap.Logger, adminUserID uint) (*models.TenantCompany, error) {
	// 1. Validate inputs
	if req.CompanyCode == "" || req.CompanyName == "" || req.CompanyEmail == "" {
		return nil, errors.New("Company Code, Name, and Email are required")
	}
	if req.FirstUser.Name == "" || req.FirstUser.Email == "" || req.FirstUser.TemporaryPassword == "" {
		return nil, errors.New("First Admin details (Name, Email, Password) are required")
	}
	if len(req.Modules) == 0 {
		return nil, errors.New("at least one module must be selected")
	}

	// Clean code format
	req.CompanyCode = strings.ToUpper(strings.TrimSpace(req.CompanyCode))

	// Check if company code already exists in platform DB
	var count int64
	platformDB.Model(&models.TenantCompany{}).Where("company_code = ?", req.CompanyCode).Count(&count)
	if count > 0 {
		return nil, fmt.Errorf("company code %s is already registered", req.CompanyCode)
	}

	// Check if company name already exists in platform DB
	var nameCount int64
	platformDB.Model(&models.TenantCompany{}).Where("company_name = ?", req.CompanyName).Count(&nameCount)
	if nameCount > 0 {
		return nil, fmt.Errorf("company name %s is already registered", req.CompanyName)
	}

	// Check if company email already exists in platform DB
	var emailCount int64
	platformDB.Model(&models.TenantCompany{}).Where("company_email = ?", req.CompanyEmail).Count(&emailCount)
	if emailCount > 0 {
		return nil, fmt.Errorf("company email %s is already registered", req.CompanyEmail)
	}

	dbName := "erp_" + strings.ToLower(req.CompanyCode)

	// Fetch subscription plan
	var plan models.SubscriptionPlan
	if err := platformDB.First(&plan, req.SubscriptionPlanID).Error; err != nil {
		return nil, errors.New("selected subscription plan not found")
	}

	// Begin platform DB transaction
	tx := platformDB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// 2. Encrypt database password (we store a dummy key or actual local root credentials encrypted)
	encryptedDbPwd, err := security.Encrypt("root")
	if err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to encrypt database credentials: %w", err)
	}

	// 3. Save Tenant Company
	now := time.Now()
	expiryDate := now.AddDate(1, 0, 0) // default 1 year license
	if plan.BillingCycle == "monthly" {
		expiryDate = now.AddDate(0, 1, 0)
	}

	tenantCompany := models.TenantCompany{
		CompanyCode:         req.CompanyCode,
		CompanyName:         req.CompanyName,
		LegalName:           req.LegalName,
		RegistrationNumber:  req.RegistrationNumber,
		TaxNumber:           req.TaxNumber,
		Industry:            req.Industry,
		CompanyEmail:        req.CompanyEmail,
		CompanyPhone:        req.CompanyPhone,
		Country:             req.Country,
		Timezone:            req.Timezone,
		DatabaseName:        dbName,
		DatabaseHost:        "127.0.0.1",
		DatabasePort:        3306,
		DatabaseUser:        "root",
		DatabasePasswordKey: encryptedDbPwd,
		Status:              "active",
		SubscriptionStatus:  "active",
		LicenseStartDate:    &now,
		LicenseEndDate:      &expiryDate,
		CreatedBy:           adminUserID,
		UpdatedBy:           adminUserID,
	}

	if err := tx.Create(&tenantCompany).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to save tenant company profile: %w", err)
	}

	// 4. Save Billing Profile
	billingProfile := models.TenantCompanyBillingProfile{
		TenantCompanyID: tenantCompany.ID,
		BillingName:     req.BillingProfile.BillingName,
		BillingEmail:    req.BillingProfile.BillingEmail,
		BillingPhone:    req.BillingProfile.BillingPhone,
		BillingAddress:  req.BillingProfile.BillingAddress,
		BillingCity:     req.BillingProfile.BillingCity,
		BillingCountry:  req.BillingProfile.BillingCountry,
		TaxNumber:       req.BillingProfile.TaxNumber,
		PaymentTerms:    req.BillingProfile.PaymentTerms,
		Currency:        req.BillingProfile.Currency,
	}
	if billingProfile.BillingName == "" {
		billingProfile.BillingName = req.CompanyName
	}
	if billingProfile.BillingEmail == "" {
		billingProfile.BillingEmail = req.CompanyEmail
	}
	if billingProfile.Currency == "" {
		billingProfile.Currency = "LKR"
	}

	if err := tx.Create(&billingProfile).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to save billing profile: %w", err)
	}

	// 5. Save Subscription Record
	subPrice := plan.MonthlyPrice
	if plan.BillingCycle == "annual" {
		subPrice = plan.AnnualPrice
	}
	subNo := fmt.Sprintf("SUB-%s-%d", req.CompanyCode, time.Now().Unix())
	subscription := models.TenantCompanySubscription{
		TenantCompanyID:    tenantCompany.ID,
		SubscriptionPlanID: plan.ID,
		SubscriptionNumber: subNo,
		StartDate:          now,
		EndDate:            expiryDate,
		BillingCycle:       plan.BillingCycle,
		Price:              subPrice,
		Currency:           plan.Currency,
		Status:             "active",
		AutoRenew:          true,
	}
	if err := tx.Create(&subscription).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to save subscription log: %w", err)
	}

	// 6. Save Enabled Modules
	for _, code := range req.Modules {
		m := models.TenantCompanyModule{
			TenantCompanyID: tenantCompany.ID,
			ModuleCode:      code,
			ModuleName:      code,
			IsEnabled:       true,
			EnabledAt:       &now,
		}
		if err := tx.Create(&m).Error; err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("failed to enable module mapping: %w", err)
		}
	}

	// 7. Save Tenant Database Catalog Entry
	tenantDBMeta := models.TenantCompanyDatabase{
		TenantCompanyID:           tenantCompany.ID,
		DatabaseName:              dbName,
		DatabaseHost:              "127.0.0.1",
		DatabaseUsername:          "root",
		DatabasePasswordEncrypted: encryptedDbPwd,
		DatabaseStatus:            "created",
		MigrationStatus:           "migration_completed",
		LastMigratedAt:            &now,
	}
	if err := tx.Create(&tenantDBMeta).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to save database catalog: %w", err)
	}

	// 8. Provision Tenant Database SQL
	rawDsn := "root:root@tcp(127.0.0.1:3306)/?charset=utf8mb4&parseTime=True&loc=Local"
	rawDB, err := gorm.Open(mysql.Open(rawDsn), &gorm.Config{})
	if err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to connect to local MySQL server: %w", err)
	}
	sqlRaw, _ := rawDB.DB()
	defer sqlRaw.Close()

	createSQL := fmt.Sprintf("CREATE DATABASE IF NOT EXISTS `%s` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;", dbName)
	if err := rawDB.Exec(createSQL).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to execute CREATE DATABASE: %w", err)
	}

	// Connect to the new database
	companyDsn := fmt.Sprintf("root:root@tcp(127.0.0.1:3306)/%s?charset=utf8mb4&parseTime=True&loc=Local", dbName)
	companyDB, err := gorm.Open(mysql.Open(companyDsn), &gorm.Config{})
	if err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to connect to newly created company DB: %w", err)
	}
	sqlComp, _ := companyDB.DB()
	defer sqlComp.Close()

	// 9. Run Migrations & Seeding in Company Database context
	// We pass 'true' to skipAdminSeeder so it doesn't seed the default 'OMACX' company and user.
	if err := companyMigrations.RunCompanyMigrations(companyDB, logger, true); err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to run company migrations: %w", err)
	}

	// 10. Seed this company's custom organization profile inside the tenant DB
	var tenantCo companyModels.Company
	if err := companyDB.Where("company_code = ?", req.CompanyCode).First(&tenantCo).Error; err != nil {
		tenantCo = companyModels.Company{
			CompanyCode:        req.CompanyCode,
			CompanyName:        req.CompanyName,
			RegistrationNumber: req.RegistrationNumber,
			TaxNumber:          req.TaxNumber,
			Email:              req.CompanyEmail,
			Phone:              req.CompanyPhone,
			Address:            req.BillingProfile.BillingAddress,
			Status:             "active",
		}
		if err := companyDB.Create(&tenantCo).Error; err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("failed to create tenant profile inside tenant DB: %w", err)
		}
	} else {
		// Update existing
		tenantCo.CompanyName = req.CompanyName
		tenantCo.RegistrationNumber = req.RegistrationNumber
		tenantCo.TaxNumber = req.TaxNumber
		tenantCo.Email = req.CompanyEmail
		tenantCo.Phone = req.CompanyPhone
		companyDB.Save(&tenantCo)
	}

	// Remove structural inventory and invoice center data seeders for new company as requested

	// Seed branch
	var tenantBranch companyModels.Branch
	if err := companyDB.Where("company_id = ? AND is_main_branch = ?", tenantCo.ID, true).First(&tenantBranch).Error; err != nil {
		tenantBranch = companyModels.Branch{
			CompanyID:    tenantCo.ID,
			BranchCode:   "MAIN",
			BranchName:   "Main Branch",
			BranchType:   "Headquarters",
			IsMainBranch: true,
			Status:       "active",
		}
		if err := companyDB.Create(&tenantBranch).Error; err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("failed to create headquarters branch in tenant DB: %w", err)
		}
	}

	// 11. Hash temporary password & insert first Admin User in company DB
	pwdHash, err := security.HashPassword(req.FirstUser.TemporaryPassword)
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	// Seed Department
	var defaultDept companyModels.Department
	if err := companyDB.Where("company_id = ? AND department_code = ?", tenantCo.ID, "ADMIN").First(&defaultDept).Error; err != nil {
		defaultDept = companyModels.Department{
			CompanyID:      tenantCo.ID,
			DepartmentCode: "ADMIN",
			DepartmentName: "Administration",
			Status:         "active",
		}
		companyDB.Create(&defaultDept)
	}

	// Seed Designation
	var defaultDesig companyModels.Designation
	if err := companyDB.Where("company_id = ? AND designation_name = ?", tenantCo.ID, "Director").First(&defaultDesig).Error; err != nil {
		defaultDesig = companyModels.Designation{
			CompanyID:       tenantCo.ID,
			DesignationName: "Director",
			Status:          "active",
		}
		companyDB.Create(&defaultDesig)
	}

	// Create user
	var companyUser companyModels.User
	if err := companyDB.Where("email = ?", req.FirstUser.Email).First(&companyUser).Error; err != nil {
		companyUser = companyModels.User{
			CompanyID:       tenantCo.ID,
			Name:            req.FirstUser.Name,
			Email:           req.FirstUser.Email,
			PasswordHash:    pwdHash,
			Phone:           req.FirstUser.Phone,
			UserType:        "super_admin",
			Status:          "active",
			DefaultBranchID: &tenantBranch.ID,
			DepartmentID:    &defaultDept.ID,
			DesignationID:   &defaultDesig.ID,
		}
		if err := companyDB.Create(&companyUser).Error; err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("failed to seed first admin user in tenant DB: %w", err)
		}
	}

	// Seed User Branch Access
	var uba companyModels.UserBranchAccess
	if err := companyDB.Where("user_id = ? AND branch_id = ?", companyUser.ID, tenantBranch.ID).First(&uba).Error; err != nil {
		companyDB.Create(&companyModels.UserBranchAccess{
			UserID:    companyUser.ID,
			BranchID:  tenantBranch.ID,
			IsDefault: true,
			Status:    "active",
		})
	}

	// Seed User Software Module access
	var companyModules []companyModels.SoftwareModule
	if err := companyDB.Find(&companyModules).Error; err == nil {
		for _, m := range companyModules {
			// check if this module is in the enabled list
			isEnabled := false
			for _, reqMod := range req.Modules {
				if reqMod == m.SoftwareCode {
					isEnabled = true
					break
				}
			}

			if isEnabled {
				var usa companyModels.UserSoftwareAccess
				if err := companyDB.Where("user_id = ? AND software_id = ?", companyUser.ID, m.ID).First(&usa).Error; err != nil {
					companyDB.Create(&companyModels.UserSoftwareAccess{
						UserID:     companyUser.ID,
						SoftwareID: m.ID,
						CanAccess:  true,
						Status:     "active",
					})
				}
			}
		}
	}

	var role companyModels.Role
	if err := companyDB.Where("role_code = ?", "SUPER_ADMIN").First(&role).Error; err == nil {
		matrix := companyModels.UserBranchRole{
			UserID:   companyUser.ID,
			BranchID: tenantBranch.ID,
			RoleID:   role.ID,
			Status:   "active",
		}
		companyDB.Where("user_id = ? AND branch_id = ? AND role_id = ?",
			companyUser.ID, tenantBranch.ID, role.ID).FirstOrCreate(&matrix)
	}

	// 12. Save First User Details Log in Platform DB
	platformFirstUser := models.TenantCompanyFirstUser{
		TenantCompanyID:         tenantCompany.ID,
		CompanyDatabaseName:     dbName,
		FirstUserName:           req.FirstUser.Name,
		FirstUserEmail:          req.FirstUser.Email,
		FirstUserPhone:          req.FirstUser.Phone,
		TemporaryPasswordHash:   pwdHash,
		IsCreatedInTenantDB:     true,
		CreatedUserIDInTenantDB: companyUser.ID,
	}
	if err := tx.Create(&platformFirstUser).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to save first user platform record: %w", err)
	}

	// 13. Write Platform Audit Log
	tx.Create(&models.PlatformAuditLog{
		UserID:     adminUserID,
		Action:     "company.create",
		TargetType: "tenant_companies",
		TargetID:   fmt.Sprintf("%d", tenantCompany.ID),
		Details:    fmt.Sprintf("Created company %s with database %s and plan %s", req.CompanyName, dbName, plan.PlanName),
		CreatedAt:  time.Now(),
	})

	// Commit Transaction
	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return &tenantCompany, nil
}
