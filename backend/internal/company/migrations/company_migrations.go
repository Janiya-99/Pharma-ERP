package migrations

import (
	"github.com/pixandco/erp-phrma/internal/company/models"
	"github.com/pixandco/erp-phrma/internal/company/seeders"
	financeMigrations "github.com/pixandco/erp-phrma/internal/finance/migrations"
	inventoryMigrations "github.com/pixandco/erp-phrma/internal/inventory/migrations"
	inventorySeeders "github.com/pixandco/erp-phrma/internal/inventory/seeders"
	invoiceCenterMigrations "github.com/pixandco/erp-phrma/internal/invoicecenter/migrations"
	invoiceCenterSeeders "github.com/pixandco/erp-phrma/internal/invoicecenter/seeders"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// RunCompanyMigrations runs AutoMigrate for the core company foundation models
// and seeds the software modules.
//
// This must be run on a company-specific database connection (e.g. erp_omacx),
// NEVER on the platform database.
func RunCompanyMigrations(db *gorm.DB, logger *zap.Logger, isNewTenantFlag ...bool) error {
	isNewTenant := false
	if len(isNewTenantFlag) > 0 && isNewTenantFlag[0] {
		isNewTenant = true
	}

	logger.Info("Running company database AutoMigrate...")

	// AutoMigrate company foundation tables
	err := db.AutoMigrate(
		&models.Company{},
		&models.Branch{},
		&models.Department{},
		&models.Designation{},
		&models.DesignationDepartment{},
		&models.DesignationDefaultRole{},
		&models.SoftwareModule{},
		&models.User{},
		&models.UserBranchAccess{},
		&models.UserSoftwareAccess{},
		&models.LoginLog{},
		&models.PasswordResetToken{},
		&models.Role{},
		&models.Permission{},
		&models.RolePermission{},
		&models.UserBranchRole{},
		&models.AuditLog{},
		&models.UserOrganizationAssignment{},
		&models.SystemSettingGroup{},
		&models.SystemSetting{},
		&models.SystemSettingVersion{},
		&models.BranchSettingOverride{},
		&models.ApprovalWorkflow{},
		&models.ApprovalWorkflowVersion{},
		&models.ApprovalWorkflowStage{},
		&models.ApprovalWorkflowStageApprover{},
		&models.ApprovalWorkflowEscalation{},
		&models.ApprovalWorkflowInstance{},
		&models.ApprovalWorkflowInstanceLog{},
		&models.DocumentNumberingRule{},
		&models.DocumentNumberSequence{},
		&models.NotificationRule{},
		&models.NotificationRecipient{},
		&models.NotificationLog{},
		&models.SecurityPolicy{},
		&models.TrustedIPRule{},
		&models.BackupPolicy{},
		&models.BackupExecutionLog{},
	)
	if err != nil {
		logger.Error("Company AutoMigrate failed", zap.Error(err))
		return err
	}

	logger.Info("Company AutoMigrate completed successfully")

	// Run seeders for company database
	logger.Info("Running company seeders...")
	if err := seeders.SeedSoftwareModules(db, logger); err != nil {
		logger.Error("Company software module seeder failed", zap.Error(err))
		return err
	}

	if err := seeders.SeedPermissions(db, logger); err != nil {
		logger.Error("Company permission seeder failed", zap.Error(err))
		return err
	}

	if err := seeders.SeedRoles(db, logger, isNewTenant); err != nil {
		logger.Error("Company role seeder failed", zap.Error(err))
		return err
	}

	if err := seeders.SeedRolePermissions(db, logger); err != nil {
		logger.Error("Company role permission seeder failed", zap.Error(err))
		return err
	}



	logger.Info("Running finance migrations and seeders...")
	if err := financeMigrations.RunFinanceMigrations(db, logger, isNewTenant); err != nil {
		logger.Error("Finance migrations failed", zap.Error(err))
		return err
	}

	logger.Info("Running inventory migrations and seeders...")
	if err := inventoryMigrations.RunInventoryMigrations(db, logger); err != nil {
		logger.Error("Inventory migrations failed", zap.Error(err))
		return err
	}

	// For company-specific seeders that need company ID, we can get the main company ID
	var mainCompany models.Company
	if err := db.First(&mainCompany).Error; err == nil {
		if err := inventorySeeders.SeedProductUnits(db, mainCompany.ID, logger); err != nil {
			logger.Error("Product unit seeder failed", zap.Error(err))
		}
		if err := inventorySeeders.SeedDosageForms(db, mainCompany.ID, logger); err != nil {
			logger.Error("Dosage form seeder failed", zap.Error(err))
		}
		if err := inventorySeeders.SeedProductCategories(db, mainCompany.ID, logger); err != nil {
			logger.Error("Product category seeder failed", zap.Error(err))
		}
		if err := inventorySeeders.SeedWarehouses(db, mainCompany.ID, logger); err != nil {
			logger.Error("Warehouse seeder failed", zap.Error(err))
		}
	} else {
		logger.Warn("Main company not found, skipping inventory structural seeders")
	}

	if err := inventorySeeders.SeedInventoryPermissions(db, logger); err != nil {
		logger.Error("Inventory permission seeder failed", zap.Error(err))
		return err
	}

	logger.Info("Running invoice center migrations and seeders...")
	if err := invoiceCenterMigrations.RunInvoiceCenterMigrations(db, logger); err != nil {
		logger.Error("Invoice Center migrations failed", zap.Error(err))
		return err
	}
	if mainCompany.ID != 0 {
		if !isNewTenant {
			if err := invoiceCenterSeeders.RunInvoiceCenterSeeders(db, mainCompany.ID, logger); err != nil {
				logger.Error("Invoice Center seeder failed", zap.Error(err))
				return err
			}
		}
	} else {
		logger.Warn("Main company not found, running invoice center permission seeder only")
		if err := invoiceCenterSeeders.SeedInvoiceCenterPermissions(db, logger); err != nil {
			logger.Error("Invoice Center permission seeder failed", zap.Error(err))
			return err
		}
	}

	if mainCompany.ID != 0 && !isNewTenant {
		logger.Info("Running Step 71 configuration seeders...")
		if err := seeders.SeedSystemSettings(db, mainCompany.ID, logger); err != nil {
			logger.Error("System settings seeder failed", zap.Error(err))
		}
		if err := seeders.SeedDocumentNumberingRules(db, mainCompany.ID, logger); err != nil {
			logger.Error("Document numbering seeder failed", zap.Error(err))
		}
		if err := seeders.SeedApprovalWorkflows(db, mainCompany.ID, logger); err != nil {
			logger.Error("Approval workflow seeder failed", zap.Error(err))
		}
		if err := seeders.SeedSecurityPolicies(db, mainCompany.ID, logger); err != nil {
			logger.Error("Security policy seeder failed", zap.Error(err))
		}
		if err := seeders.SeedBackupPolicies(db, mainCompany.ID, logger); err != nil {
			logger.Error("Backup policy seeder failed", zap.Error(err))
		}
	}

	logger.Info("Company migrations and seeding complete")
	return nil
}
