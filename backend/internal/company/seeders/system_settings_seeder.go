package seeders

import (
	"encoding/json"
	"time"

	"github.com/pixandco/erp-phrma/internal/company/models"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

func SeedSystemSettings(db *gorm.DB, companyID uint64, logger *zap.Logger) error {
	if companyID == 0 {
		return nil
	}

	logger.Info("Seeding default system settings and localization for company...", zap.Uint64("company_id", companyID))

	// 1. Seed Groups
	groups := []models.SystemSettingGroup{
		{CompanyID: companyID, GroupCode: "GENERAL", GroupName: "General Settings", Description: "Company profile and system defaults"},
		{CompanyID: companyID, GroupCode: "LOCALIZATION", GroupName: "Localization & Currency", Description: "Sri Lanka regional settings, currency, and date formats"},
		{CompanyID: companyID, GroupCode: "FISCAL", GroupName: "Fiscal & Accounting", Description: "Financial year and tax compliance settings"},
		{CompanyID: companyID, GroupCode: "NOTIFICATIONS", GroupName: "Notification Preferences", Description: "Email, SMS, and in-app alert defaults"},
	}

	for _, g := range groups {
		var count int64
		db.Model(&models.SystemSettingGroup{}).Where("company_id = ? AND group_code = ?", companyID, g.GroupCode).Count(&count)
		if count == 0 {
			g.CreatedAt = time.Now()
			g.UpdatedAt = time.Now()
			if err := db.Create(&g).Error; err != nil {
				logger.Error("Failed to seed setting group", zap.Error(err), zap.String("group", g.GroupCode))
			}
		}
	}

	// 2. Seed Settings
	type settingSeed struct {
		Group string
		Key   string
		Value interface{}
	}

	defaultSettings := []settingSeed{
		// LOCALIZATION
		{"LOCALIZATION", "currency.default", "LKR"},
		{"LOCALIZATION", "currency.symbol", "Rs."},
		{"LOCALIZATION", "currency.decimal_places", 2},
		{"LOCALIZATION", "quantity.decimal_places", 4},
		{"LOCALIZATION", "timezone.default", "Asia/Colombo"},
		{"LOCALIZATION", "locale.default", "en-LK"},
		{"LOCALIZATION", "locale.supported", []string{"en-LK", "si-LK", "ta-LK"}},
		{"LOCALIZATION", "format.date", "YYYY-MM-DD"},
		{"LOCALIZATION", "format.time", "24h"},
		{"LOCALIZATION", "format.number_thousand_sep", ","},
		{"LOCALIZATION", "format.number_decimal_sep", "."},
		{"LOCALIZATION", "region.country", "Sri Lanka"},
		{"LOCALIZATION", "region.provinces", []string{"Western", "Central", "Southern", "Northern", "Eastern", "North Western", "North Central", "Uva", "Sabaragamuwa"}},
		// FISCAL & TAX
		{"FISCAL", "fiscal_year.start_month", 4}, // April
		{"FISCAL", "fiscal_year.end_month", 3},   // March
		{"FISCAL", "tax.tin_enabled", true},
		{"FISCAL", "tax.vat_enabled", true},
		{"FISCAL", "tax.svat_enabled", true},
		{"FISCAL", "tax.default_vat_rate", 18.0},
		// GENERAL
		{"GENERAL", "company.name", "OMACX Pharmaceuticals (Pvt) Ltd"},
		{"GENERAL", "company.registration_number", "PV-1029384"},
		{"GENERAL", "company.address", "No. 125, Galle Road, Colombo 03, Sri Lanka"},
		{"GENERAL", "company.phone", "+94 11 234 5678"},
		{"GENERAL", "company.email", "info@omacx.com"},
	}

	now := time.Now()
	for _, s := range defaultSettings {
		var count int64
		db.Model(&models.SystemSetting{}).Where("company_id = ? AND branch_id IS NULL AND setting_key = ?", companyID, s.Key).Count(&count)
		if count == 0 {
			valBytes, _ := json.Marshal(s.Value)
			setting := models.SystemSetting{
				CompanyID:        companyID,
				BranchID:         nil,
				SettingGroup:     s.Group,
				SettingKey:       s.Key,
				SettingValueJSON: valBytes,
				Status:           "published",
				VersionNumber:    1,
				EffectiveFrom:    &now,
				IsSystemDefault:  true,
				CreatedBy:        1,
				UpdatedBy:        1,
				PublishedBy:      func() *uint64 { id := uint64(1); return &id }(),
				PublishedAt:      &now,
				CreatedAt:        now,
				UpdatedAt:        now,
			}
			if err := db.Create(&setting).Error; err != nil {
				logger.Error("Failed to seed system setting", zap.Error(err), zap.String("key", s.Key))
			} else {
				// Also create version snapshot
				ver := models.SystemSettingVersion{
					SettingID:        setting.ID,
					CompanyID:        companyID,
					BranchID:         nil,
					SettingGroup:     s.Group,
					SettingKey:       s.Key,
					SettingValueJSON: valBytes,
					VersionNumber:    1,
					EffectiveFrom:    &now,
					PublishedBy:      setting.PublishedBy,
					PublishedAt:      &now,
					CreatedAt:        now,
				}
				db.Create(&ver)
			}
		}
	}

	logger.Info("System settings seeding completed successfully")
	return nil
}
