package repositories

import (
	"encoding/json"
	"time"

	"github.com/pixandco/erp-phrma/internal/company/models"
	"gorm.io/gorm"
)

type SettingsRepository struct {
	db *gorm.DB
}

func NewSettingsRepository(db *gorm.DB) *SettingsRepository {
	return &SettingsRepository{db: db}
}

// GetDB returns the underlying GORM database
func (r *SettingsRepository) GetDB() *gorm.DB {
	return r.db
}

func (r *SettingsRepository) ListGroups(companyID uint64) ([]models.SystemSettingGroup, error) {
	var groups []models.SystemSettingGroup
	err := r.db.Where("company_id = ?", companyID).Find(&groups).Error
	return groups, err
}

func (r *SettingsRepository) ListSettings(companyID uint64, groupCode string, branchID *uint64) ([]models.SystemSetting, error) {
	query := r.db.Where("company_id = ?", companyID)
	if groupCode != "" {
		query = query.Where("setting_group = ?", groupCode)
	}
	if branchID != nil && *branchID != 0 {
		query = query.Where("(branch_id IS NULL OR branch_id = ?)", *branchID)
	} else {
		query = query.Where("branch_id IS NULL")
	}
	var settings []models.SystemSetting
	err := query.Find(&settings).Error
	return settings, err
}

func (r *SettingsRepository) GetSettingByKey(companyID uint64, key string, branchID *uint64) (*models.SystemSetting, error) {
	var setting models.SystemSetting
	query := r.db.Where("company_id = ? AND setting_key = ?", companyID, key)
	if branchID != nil && *branchID != 0 {
		query = query.Where("branch_id = ?", *branchID)
	} else {
		query = query.Where("branch_id IS NULL")
	}
	err := query.First(&setting).Error
	if err != nil {
		return nil, err
	}
	return &setting, nil
}

func (r *SettingsRepository) SaveSetting(setting *models.SystemSetting) error {
	return r.db.Save(setting).Error
}

func (r *SettingsRepository) CreateVersion(version *models.SystemSettingVersion) error {
	return r.db.Create(version).Error
}

func (r *SettingsRepository) ListVersions(settingID uint64) ([]models.SystemSettingVersion, error) {
	var versions []models.SystemSettingVersion
	err := r.db.Where("setting_id = ?", settingID).Order("version_number DESC").Find(&versions).Error
	return versions, err
}

func (r *SettingsRepository) GetBranchOverrides(companyID uint64, branchID uint64) ([]models.BranchSettingOverride, error) {
	var overrides []models.BranchSettingOverride
	err := r.db.Where("company_id = ? AND branch_id = ?", companyID, branchID).Find(&overrides).Error
	return overrides, err
}

func (r *SettingsRepository) SaveBranchOverride(companyID uint64, branchID uint64, key string, valueJSON json.RawMessage, userID uint64) error {
	var override models.BranchSettingOverride
	err := r.db.Where("company_id = ? AND branch_id = ? AND setting_key = ?", companyID, branchID, key).First(&override).Error
	if err == nil {
		override.SettingValueJSON = valueJSON
		override.VersionNumber++
		override.UpdatedBy = userID
		override.UpdatedAt = time.Now()
		return r.db.Save(&override).Error
	}
	override = models.BranchSettingOverride{
		CompanyID:        companyID,
		BranchID:         branchID,
		SettingKey:       key,
		SettingValueJSON: valueJSON,
		Status:           "published",
		VersionNumber:    1,
		UpdatedBy:        userID,
		CreatedAt:        time.Now(),
		UpdatedAt:        time.Now(),
	}
	return r.db.Create(&override).Error
}
