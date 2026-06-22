package repositories

import (
	"fmt"

	"github.com/pixandco/erp-phrma/internal/finance/models"
	"gorm.io/gorm"
)

type PettyCashFundRepository struct {
	db *gorm.DB
}

func NewPettyCashFundRepository(db *gorm.DB) *PettyCashFundRepository {
	return &PettyCashFundRepository{db: db}
}

func (r *PettyCashFundRepository) FindPettyCashFunds(companyID uint64, branchID *uint64, custodianUserID *uint64, status string, search string, page int, limit int) ([]models.PettyCashFund, int64, error) {
	var funds []models.PettyCashFund
	var total int64

	query := r.db.Model(&models.PettyCashFund{}).Where("company_id = ?", companyID)

	if branchID != nil {
		query = query.Where("branch_id = ?", *branchID)
	}
	if custodianUserID != nil {
		query = query.Where("custodian_user_id = ?", *custodianUserID)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if search != "" {
		searchLike := "%" + search + "%"
		query = query.Where("(fund_name LIKE ? OR fund_code LIKE ?)", searchLike, searchLike)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	if err := query.Preload("ChartOfAccount").Preload("CustodianUser").Preload("Branch").
		Offset(offset).Limit(limit).Order("id DESC").Find(&funds).Error; err != nil {
		return nil, 0, err
	}

	return funds, total, nil
}

func (r *PettyCashFundRepository) FindPettyCashFundByID(companyID uint64, id uint64) (*models.PettyCashFund, error) {
	var fund models.PettyCashFund
	if err := r.db.Preload("ChartOfAccount").Preload("CustodianUser").Preload("Branch").
		Where("company_id = ? AND id = ?", companyID, id).First(&fund).Error; err != nil {
		return nil, err
	}
	return &fund, nil
}

func (r *PettyCashFundRepository) CreatePettyCashFund(fund *models.PettyCashFund) error {
	return r.db.Create(fund).Error
}

func (r *PettyCashFundRepository) UpdatePettyCashFund(fund *models.PettyCashFund) error {
	return r.db.Save(fund).Error
}

func (r *PettyCashFundRepository) SoftDeletePettyCashFund(companyID uint64, id uint64) error {
	return r.db.Where("company_id = ? AND id = ?", companyID, id).Delete(&models.PettyCashFund{}).Error
}

func (r *PettyCashFundRepository) UpdatePettyCashFundBalance(tx *gorm.DB, fundID uint64, amount float64, increase bool) error {
	db := tx
	if db == nil {
		db = r.db
	}

	var fund models.PettyCashFund
	if err := db.Where("id = ?", fundID).First(&fund).Error; err != nil {
		return err
	}

	if increase {
		fund.CurrentBalance += amount
	} else {
		fund.CurrentBalance -= amount
	}

	if fund.CurrentBalance < 0 {
		return fmt.Errorf("insufficient petty cash fund balance")
	}

	return db.Model(&fund).Update("current_balance", fund.CurrentBalance).Error
}
