package repositories

import (
	"fmt"
	"time"

	"github.com/pixandco/erp-phrma/internal/finance/models"
	"gorm.io/gorm"
)

type FixedAssetDisposalRepository struct {
	db *gorm.DB
}

func NewFixedAssetDisposalRepository(db *gorm.DB) *FixedAssetDisposalRepository {
	return &FixedAssetDisposalRepository{db: db}
}

func (r *FixedAssetDisposalRepository) FindFixedAssetDisposals(companyID uint64, branchAccess []uint64, filters map[string]interface{}, page, limit int) ([]models.FixedAssetDisposal, int64, error) {
	var disposals []models.FixedAssetDisposal
	var total int64

	query := r.db.Model(&models.FixedAssetDisposal{}).Where("company_id = ?", companyID)

	if len(branchAccess) > 0 {
		query = query.Where("branch_id IN ?", branchAccess)
	}

	if branchID, ok := filters["branch_id"].(float64); ok && branchID > 0 {
		query = query.Where("branch_id = ?", uint64(branchID))
	}
	if fixedAssetID, ok := filters["fixed_asset_id"].(float64); ok && fixedAssetID > 0 {
		query = query.Where("fixed_asset_id = ?", uint64(fixedAssetID))
	}
	if disposalType, ok := filters["disposal_type"].(string); ok && disposalType != "" {
		query = query.Where("disposal_type = ?", disposalType)
	}
	if approvalStatus, ok := filters["approval_status"].(string); ok && approvalStatus != "" {
		query = query.Where("approval_status = ?", approvalStatus)
	}
	if postedStatus, ok := filters["posted_status"].(string); ok && postedStatus != "" {
		query = query.Where("posted_status = ?", postedStatus)
	}
	if disposalDateFrom, ok := filters["disposal_date_from"].(string); ok && disposalDateFrom != "" {
		query = query.Where("disposal_date >= ?", disposalDateFrom)
	}
	if disposalDateTo, ok := filters["disposal_date_to"].(string); ok && disposalDateTo != "" {
		query = query.Where("disposal_date <= ?", disposalDateTo)
	}
	if search, ok := filters["search"].(string); ok && search != "" {
		query = query.Where("disposal_number LIKE ?", "%"+search+"%")
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	if err := query.
		Preload("FixedAsset").
		Preload("Branch").
		Preload("FinancialYear").
		Preload("AccountingPeriod").
		Offset(offset).Limit(limit).Order("id DESC").Find(&disposals).Error; err != nil {
		return nil, 0, err
	}

	return disposals, total, nil
}

func (r *FixedAssetDisposalRepository) FindFixedAssetDisposalByID(id uint64, companyID uint64) (*models.FixedAssetDisposal, error) {
	var disposal models.FixedAssetDisposal
	if err := r.db.
		Preload("FixedAsset").
		Preload("Branch").
		Preload("FinancialYear").
		Preload("AccountingPeriod").
		Preload("ReceivedToAccount").
		Preload("GainOnDisposalAccount").
		Preload("LossOnDisposalAccount").
		Preload("Approvals").
		Preload("Approvals.ActionByUser").
		Where("id = ? AND company_id = ?", id, companyID).First(&disposal).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("disposal not found")
		}
		return nil, err
	}
	return &disposal, nil
}

func (r *FixedAssetDisposalRepository) CreateFixedAssetDisposal(disposal *models.FixedAssetDisposal) error {
	return r.db.Create(disposal).Error
}

func (r *FixedAssetDisposalRepository) UpdateFixedAssetDisposal(disposal *models.FixedAssetDisposal) error {
	return r.db.Save(disposal).Error
}

func (r *FixedAssetDisposalRepository) SoftDeleteFixedAssetDisposal(id uint64, companyID uint64) error {
	result := r.db.Where("id = ? AND company_id = ?", id, companyID).Delete(&models.FixedAssetDisposal{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("disposal not found")
	}
	return nil
}

func (r *FixedAssetDisposalRepository) UpdateFixedAssetDisposalStatus(id uint64, companyID uint64, statusField string, status string, userID uint64) error {
	updates := map[string]interface{}{
		statusField: status,
	}

	if statusField == "approval_status" && status == "approved" {
		now := time.Now()
		updates["approved_by"] = userID
		updates["approved_at"] = now
	} else if statusField == "posted_status" && status == "posted" {
		now := time.Now()
		updates["posted_by"] = userID
		updates["posted_at"] = now
	}

	return r.db.Model(&models.FixedAssetDisposal{}).
		Where("id = ? AND company_id = ?", id, companyID).
		Updates(updates).Error
}

func (r *FixedAssetDisposalRepository) CreateFixedAssetDisposalApprovalRecord(approval *models.FixedAssetDisposalApproval) error {
	return r.db.Create(approval).Error
}

func (r *FixedAssetDisposalRepository) GetLastDisposalNumber(companyID uint64) (string, error) {
	var lastDisposal models.FixedAssetDisposal
	err := r.db.Where("company_id = ?", companyID).Order("id desc").First(&lastDisposal).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return "", nil
		}
		return "", err
	}
	return lastDisposal.DisposalNumber, nil
}
