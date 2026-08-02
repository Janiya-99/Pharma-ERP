package seeders

import (
	"time"

	"github.com/pixandco/erp-phrma/internal/company/models"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

func SeedSecurityPolicies(db *gorm.DB, companyID uint64, logger *zap.Logger) error {
	if companyID == 0 {
		return nil
	}

	logger.Info("Seeding default security policies for company...", zap.Uint64("company_id", companyID))

	var count int64
	db.Model(&models.SecurityPolicy{}).Where("company_id = ? AND branch_id IS NULL", companyID).Count(&count)
	if count == 0 {
		now := time.Now()
		pol := models.SecurityPolicy{
			CompanyID:                 companyID,
			BranchID:                  nil,
			MinPasswordLength:         8,
			RequireUppercase:          true,
			RequireLowercase:          true,
			RequireNumber:             true,
			RequireSpecialChar:        true,
			PasswordExpiryDays:        90,
			MaxFailedLoginAttempts:    5,
			LockoutDurationMinutes:    30,
			SessionIdleTimeoutMinutes: 60,
			MaxConcurrentSessions:     3,
			RequireMFA:                false,
			MFAPolicy:                 "optional",
			Status:                    "published",
			VersionNumber:             1,
			CreatedBy:                 1,
			UpdatedBy:                 1,
			PublishedBy:               func() *uint64 { id := uint64(1); return &id }(),
			PublishedAt:               &now,
			CreatedAt:                 now,
			UpdatedAt:                 now,
		}
		if err := db.Create(&pol).Error; err != nil {
			logger.Error("Failed to seed security policy", zap.Error(err))
		}
	}

	// Seed default trusted IP rule (Allow all internal / local networks)
	var ipCount int64
	db.Model(&models.TrustedIPRule{}).Where("company_id = ? AND rule_name = ?", companyID, "Default Corporate Network").Count(&ipCount)
	if ipCount == 0 {
		rule := models.TrustedIPRule{
			CompanyID:  companyID,
			RuleName:   "Default Corporate Network",
			IPRange:    "0.0.0.0/0", // Allow all by default until restricted by admin
			AccessType: "allow",
			IsActive:   true,
			CreatedAt:  time.Now(),
			UpdatedAt:  time.Now(),
		}
		db.Create(&rule)
	}

	return nil
}

func SeedBackupPolicies(db *gorm.DB, companyID uint64, logger *zap.Logger) error {
	if companyID == 0 {
		return nil
	}

	logger.Info("Seeding default backup policies for company...", zap.Uint64("company_id", companyID))

	var count int64
	db.Model(&models.BackupPolicy{}).Where("company_id = ?", companyID).Count(&count)
	if count == 0 {
		pol := models.BackupPolicy{
			CompanyID:          companyID,
			Frequency:          "daily",
			TimeOfDay:          "02:00",
			RetentionDays:      30,
			StorageDestination: "local",
			IsActive:           true,
			CreatedAt:          time.Now(),
			UpdatedAt:          time.Now(),
		}
		if err := db.Create(&pol).Error; err != nil {
			logger.Error("Failed to seed backup policy", zap.Error(err))
		}
	}

	return nil
}
