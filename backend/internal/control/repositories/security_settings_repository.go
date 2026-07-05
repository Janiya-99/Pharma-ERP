package repositories

import (
	"github.com/pixandco/erp-phrma/internal/company/models"
	"gorm.io/gorm"
)

type SecuritySettingsRepository struct {
	db *gorm.DB
}

func NewSecuritySettingsRepository(db *gorm.DB) *SecuritySettingsRepository {
	return &SecuritySettingsRepository{db: db}
}

// GetDB returns the underlying GORM database
func (r *SecuritySettingsRepository) GetDB() *gorm.DB {
	return r.db
}

func (r *SecuritySettingsRepository) GetSecurityPolicy(companyID uint64, branchID *uint64) (*models.SecurityPolicy, error) {
	var pol models.SecurityPolicy
	query := r.db.Where("company_id = ? AND status = ?", companyID, "published")
	if branchID != nil && *branchID != 0 {
		err := query.Session(&gorm.Session{}).Where("branch_id = ?", *branchID).First(&pol).Error
		if err == nil {
			return &pol, nil
		}
	}
	err := query.Where("branch_id IS NULL").First(&pol).Error
	if err != nil {
		return nil, err
	}
	return &pol, nil
}

func (r *SecuritySettingsRepository) SaveSecurityPolicy(pol *models.SecurityPolicy) error {
	return r.db.Save(pol).Error
}

func (r *SecuritySettingsRepository) ListTrustedIPRules(companyID uint64) ([]models.TrustedIPRule, error) {
	var rules []models.TrustedIPRule
	err := r.db.Where("company_id = ?", companyID).Order("id ASC").Find(&rules).Error
	return rules, err
}

func (r *SecuritySettingsRepository) SaveTrustedIPRule(rule *models.TrustedIPRule) error {
	return r.db.Save(rule).Error
}

func (r *SecuritySettingsRepository) DeleteTrustedIPRule(id uint64) error {
	return r.db.Delete(&models.TrustedIPRule{}, id).Error
}

func (r *SecuritySettingsRepository) ListBackupPolicies(companyID uint64) ([]models.BackupPolicy, error) {
	var policies []models.BackupPolicy
	err := r.db.Where("company_id = ?", companyID).Find(&policies).Error
	return policies, err
}

func (r *SecuritySettingsRepository) SaveBackupPolicy(pol *models.BackupPolicy) error {
	return r.db.Save(pol).Error
}

func (r *SecuritySettingsRepository) ListBackupLogs(companyID uint64, limit int) ([]models.BackupExecutionLog, error) {
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	var logs []models.BackupExecutionLog
	err := r.db.Where("company_id = ?", companyID).Order("started_at DESC").Limit(limit).Find(&logs).Error
	return logs, err
}
