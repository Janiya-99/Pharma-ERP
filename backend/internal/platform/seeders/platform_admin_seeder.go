package seeders

import (
	"github.com/pixandco/erp-phrma/internal/platform/models"
	"github.com/pixandco/erp-phrma/internal/security"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

func SeedPlatformAdminData(db *gorm.DB, logger *zap.Logger) error {
	logger.Info("Seeding platform admin details...")

	// 1. Seed Platform Admin User
	var count int64
	db.Model(&models.PlatformAdminUser{}).Count(&count)
	if count == 0 {
		hash, err := security.HashPassword("Admin@12345")
		if err != nil {
			return err
		}
		admin := models.PlatformAdminUser{
			Username:     "admin",
			Email:        "admin@platform.com",
			PasswordHash: hash,
			Status:       "active",
		}
		if err := db.Create(&admin).Error; err != nil {
			logger.Error("Failed to seed platform admin user", zap.Error(err))
			return err
		}
		logger.Info("Platform admin user seeded (admin@platform.com / Admin@12345)")
	}

	// 2. Seed ERP Modules
	modules := []models.ErpModule{
		{ModuleCode: "CONTROL_CENTER", ModuleName: "Control Center", Description: "Core platform directory and user permissions matrix center.", Status: "active"},
		{ModuleCode: "FINANCE", ModuleName: "Finance & GL", Description: "General ledger, journal vouchers, fixed assets and cash registers.", Status: "active"},
		{ModuleCode: "INVENTORY", ModuleName: "Inventory", Description: "Products setup, warehouses, purchase returns, batch tracking and GRN.", Status: "active"},
		{ModuleCode: "INVOICE_CENTER", ModuleName: "Invoice Center", Description: "Sales invoicing, customer profiles, credit notes and receipts.", Status: "active"},
		{ModuleCode: "COMPLIANCE_CENTER", ModuleName: "Compliance Center", Description: "Regulatory standards auditing, checks, and drug reporting systems.", Status: "active"},
	}
	for _, m := range modules {
		var existing models.ErpModule
		if err := db.Where("module_code = ?", m.ModuleCode).First(&existing).Error; err != nil {
			if err := db.Create(&m).Error; err != nil {
				logger.Error("Failed to seed erp module", zap.String("code", m.ModuleCode), zap.Error(err))
			}
		}
	}

	// 3. Seed Subscription Plans
	plans := []models.SubscriptionPlan{
		{PlanName: "Trial Plan", PlanCode: "TRIAL", Description: "14-day trial plan with basic access.", BillingCycle: "monthly", MonthlyPrice: 0, AnnualPrice: 0, Currency: "LKR", MaxUsers: 5, MaxBranches: 1, MaxCompanies: 1, IsActive: true},
		{PlanName: "Standard Plan", PlanCode: "STANDARD", Description: "Standard subscription for small pharmacies.", BillingCycle: "monthly", MonthlyPrice: 5000, AnnualPrice: 50000, Currency: "LKR", MaxUsers: 25, MaxBranches: 3, MaxCompanies: 1, IsActive: true},
		{PlanName: "Premium Enterprise", PlanCode: "PREMIUM", Description: "Premium tier for multi-branch corporations.", BillingCycle: "annual", MonthlyPrice: 10000, AnnualPrice: 100000, Currency: "LKR", MaxUsers: 100, MaxBranches: 10, MaxCompanies: 3, IsActive: true},
	}
	for _, p := range plans {
		var existing models.SubscriptionPlan
		if err := db.Where("plan_code = ?", p.PlanCode).First(&existing).Error; err != nil {
			if err := db.Create(&p).Error; err != nil {
				logger.Error("Failed to seed subscription plan", zap.String("code", p.PlanCode), zap.Error(err))
			} else {
				// Seed module mappings
				for _, moduleCode := range []string{"CONTROL_CENTER", "FINANCE", "INVENTORY", "INVOICE_CENTER"} {
					db.Create(&models.SubscriptionPlanModule{
						SubscriptionPlanID: p.ID,
						ModuleCode:         moduleCode,
						ModuleName:         moduleCode,
						IsIncluded:         true,
					})
				}
			}
		}
	}

	// 4. Seed Settings if missing
	var emailCount int64
	db.Model(&models.SystemEmailSetting{}).Count(&emailCount)
	if emailCount == 0 {
		db.Create(&models.SystemEmailSetting{
			SmtpHost:     "smtp.mailtrap.io",
			SmtpPort:     2525,
			SmtpUsername: "platform-smtp",
			FromEmail:    "no-reply@pharmacyerp.com",
			FromName:     "Pharma ERP Cloud",
			IsActive:     true,
		})
	}

	var brandingCount int64
	db.Model(&models.SystemBrandingSetting{}).Count(&brandingCount)
	if brandingCount == 0 {
		db.Create(&models.SystemBrandingSetting{
			PortalName:   "Pharma ERP Platform Owner",
			PrimaryColor: "#0f172a",
			DarkMode:     true,
		})
	}

	var backupCount int64
	db.Model(&models.SystemBackupSetting{}).Count(&backupCount)
	if backupCount == 0 {
		db.Create(&models.SystemBackupSetting{
			BackupProvider:  "local",
			BackupFrequency: "daily",
			RetentionDays:   30,
			IsActive:        true,
		})
	}

	var gatewayCount int64
	db.Model(&models.SystemPaymentGatewaySetting{}).Count(&gatewayCount)
	if gatewayCount == 0 {
		db.Create(&models.SystemPaymentGatewaySetting{
			GatewayName: "Stripe",
			SandboxMode: true,
			IsActive:    true,
		})
	}

	return nil
}
