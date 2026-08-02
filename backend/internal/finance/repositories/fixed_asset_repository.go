package repositories

import (
	"fmt"

	"github.com/pixandco/erp-phrma/internal/finance/models"
	"gorm.io/gorm"
)

type FixedAssetRepository struct {
	db *gorm.DB
}

func NewFixedAssetRepository(db *gorm.DB) *FixedAssetRepository {
	return &FixedAssetRepository{db: db}
}

func (r *FixedAssetRepository) FindFixedAssets(companyID uint64, branchAccess []uint64, filters map[string]interface{}, page, limit int) ([]models.FixedAsset, int64, error) {
	var assets []models.FixedAsset
	var total int64

	query := r.db.Model(&models.FixedAsset{}).Where("company_id = ?", companyID)

	if len(branchAccess) > 0 {
		query = query.Where("branch_id IN ?", branchAccess)
	}

	if branchID, ok := filters["branch_id"].(float64); ok && branchID > 0 {
		query = query.Where("branch_id = ?", uint64(branchID))
	}
	if categoryID, ok := filters["fixed_asset_category_id"].(float64); ok && categoryID > 0 {
		query = query.Where("fixed_asset_category_id = ?", uint64(categoryID))
	}
	if status, ok := filters["asset_status"].(string); ok && status != "" {
		query = query.Where("asset_status = ?", status)
	}
	if purchaseDateFrom, ok := filters["purchase_date_from"].(string); ok && purchaseDateFrom != "" {
		query = query.Where("purchase_date >= ?", purchaseDateFrom)
	}
	if purchaseDateTo, ok := filters["purchase_date_to"].(string); ok && purchaseDateTo != "" {
		query = query.Where("purchase_date <= ?", purchaseDateTo)
	}
	if search, ok := filters["search"].(string); ok && search != "" {
		query = query.Where("asset_code LIKE ? OR asset_name LIKE ?", "%"+search+"%", "%"+search+"%")
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	if err := query.
		Preload("FixedAssetCategory").
		Preload("Branch").
		Offset(offset).Limit(limit).Order("id DESC").Find(&assets).Error; err != nil {
		return nil, 0, err
	}

	return assets, total, nil
}

func (r *FixedAssetRepository) FindFixedAssetByID(id uint64, companyID uint64) (*models.FixedAsset, error) {
	var asset models.FixedAsset
	if err := r.db.
		Preload("FixedAssetCategory").
		Preload("Branch").
		Preload("AssetAccount").
		Preload("AccumulatedDepreciationAccount").
		Preload("DepreciationExpenseAccount").
		Preload("GainOnDisposalAccount").
		Preload("LossOnDisposalAccount").
		Where("id = ? AND company_id = ?", id, companyID).First(&asset).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("fixed asset not found")
		}
		return nil, err
	}
	return &asset, nil
}

func (r *FixedAssetRepository) CreateFixedAsset(asset *models.FixedAsset) error {
	return r.db.Create(asset).Error
}

func (r *FixedAssetRepository) UpdateFixedAsset(asset *models.FixedAsset) error {
	return r.db.Save(asset).Error
}

func (r *FixedAssetRepository) SoftDeleteFixedAsset(id uint64, companyID uint64) error {
	result := r.db.Where("id = ? AND company_id = ?", id, companyID).Delete(&models.FixedAsset{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("fixed asset not found")
	}
	return nil
}
