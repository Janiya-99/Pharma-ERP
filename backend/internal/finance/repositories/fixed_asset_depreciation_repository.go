package repositories

import (
	"fmt"
	"time"

	"github.com/pixandco/erp-phrma/internal/finance/models"
	"gorm.io/gorm"
)

type FixedAssetDepreciationRepository struct {
	db *gorm.DB
}

func NewFixedAssetDepreciationRepository(db *gorm.DB) *FixedAssetDepreciationRepository {
	return &FixedAssetDepreciationRepository{db: db}
}

func (r *FixedAssetDepreciationRepository) FindDepreciationRuns(companyID uint64, branchAccess []uint64, filters map[string]interface{}, page, limit int) ([]models.FixedAssetDepreciationRun, int64, error) {
	var runs []models.FixedAssetDepreciationRun
	var total int64

	query := r.db.Model(&models.FixedAssetDepreciationRun{}).Where("company_id = ?", companyID)

	if branchID, ok := filters["branch_id"].(float64); ok && branchID > 0 {
		query = query.Where("branch_id = ?", uint64(branchID))
	}
	if financialYearID, ok := filters["financial_year_id"].(float64); ok && financialYearID > 0 {
		query = query.Where("financial_year_id = ?", uint64(financialYearID))
	}
	if accountingPeriodID, ok := filters["accounting_period_id"].(float64); ok && accountingPeriodID > 0 {
		query = query.Where("accounting_period_id = ?", uint64(accountingPeriodID))
	}
	if postedStatus, ok := filters["posted_status"].(string); ok && postedStatus != "" {
		query = query.Where("posted_status = ?", postedStatus)
	}
	if runDateFrom, ok := filters["run_date_from"].(string); ok && runDateFrom != "" {
		query = query.Where("run_date >= ?", runDateFrom)
	}
	if runDateTo, ok := filters["run_date_to"].(string); ok && runDateTo != "" {
		query = query.Where("run_date <= ?", runDateTo)
	}
	if search, ok := filters["search"].(string); ok && search != "" {
		query = query.Where("run_number LIKE ?", "%"+search+"%")
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	if err := query.
		Preload("FinancialYear").
		Preload("AccountingPeriod").
		Preload("Branch").
		Offset(offset).Limit(limit).Order("id DESC").Find(&runs).Error; err != nil {
		return nil, 0, err
	}

	return runs, total, nil
}

func (r *FixedAssetDepreciationRepository) FindDepreciationRunByID(id uint64, companyID uint64) (*models.FixedAssetDepreciationRun, error) {
	var run models.FixedAssetDepreciationRun
	if err := r.db.
		Preload("FinancialYear").
		Preload("AccountingPeriod").
		Preload("Branch").
		Preload("Lines").
		Preload("Lines.FixedAsset").
		Where("id = ? AND company_id = ?", id, companyID).First(&run).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("depreciation run not found")
		}
		return nil, err
	}
	return &run, nil
}

func (r *FixedAssetDepreciationRepository) CreateDepreciationRunWithLines(run *models.FixedAssetDepreciationRun) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(run).Error; err != nil {
			return err
		}
		return nil
	})
}

func (r *FixedAssetDepreciationRepository) UpdateDepreciationRunStatus(id uint64, companyID uint64, status string, userID uint64) error {
	now := time.Now()
	return r.db.Model(&models.FixedAssetDepreciationRun{}).
		Where("id = ? AND company_id = ?", id, companyID).
		Updates(map[string]interface{}{
			"posted_status": status,
			"posted_by":     userID,
			"posted_at":     now,
		}).Error
}

func (r *FixedAssetDepreciationRepository) SoftDeleteDepreciationRun(id uint64, companyID uint64) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// delete lines first
		if err := tx.Where("fixed_asset_depreciation_run_id = ?", id).Delete(&models.FixedAssetDepreciationLine{}).Error; err != nil {
			return err
		}

		result := tx.Where("id = ? AND company_id = ?", id, companyID).Delete(&models.FixedAssetDepreciationRun{})
		if result.Error != nil {
			return result.Error
		}
		if result.RowsAffected == 0 {
			return fmt.Errorf("depreciation run not found")
		}
		return nil
	})
}

func (r *FixedAssetDepreciationRepository) GetLastDepreciationRunNumber(companyID uint64) (string, error) {
	var lastRun models.FixedAssetDepreciationRun
	err := r.db.Where("company_id = ?", companyID).Order("id desc").First(&lastRun).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return "", nil
		}
		return "", err
	}
	return lastRun.RunNumber, nil
}

func (r *FixedAssetDepreciationRepository) GetAssetsEligibleForDepreciation(companyID uint64, branchID *uint64, depreciationToDate time.Time) ([]models.FixedAsset, error) {
	var assets []models.FixedAsset
	query := r.db.Where("company_id = ? AND asset_status = 'active' AND depreciation_start_date <= ?", companyID, depreciationToDate)
	if branchID != nil {
		query = query.Where("branch_id = ?", *branchID)
	}

	err := query.Find(&assets).Error
	return assets, err
}
