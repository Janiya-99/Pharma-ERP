package repositories

import (
	"errors"

	"github.com/pixandco/erp-phrma/internal/invoicecenter/models"
	"gorm.io/gorm"
)

type InvoiceCenterFinanceSettingRepository struct{}

func NewInvoiceCenterFinanceSettingRepository() *InvoiceCenterFinanceSettingRepository {
	return &InvoiceCenterFinanceSettingRepository{}
}

func (r *InvoiceCenterFinanceSettingRepository) FindFinanceSettingsForBranch(db *gorm.DB, companyID uint64, branchID *uint64) (*models.InvoiceCenterFinanceSetting, error) {
	var setting models.InvoiceCenterFinanceSetting
	query := db.Where("company_id = ? AND is_active = ?", companyID, true)
	if branchID != nil {
		query = query.Where("branch_id = ?", *branchID)
	} else {
		query = query.Where("branch_id IS NULL")
	}

	err := query.First(&setting).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &setting, nil
}

func (r *InvoiceCenterFinanceSettingRepository) DeactivatePreviousFinanceSettingsTx(tx *gorm.DB, companyID uint64, branchID *uint64) error {
	query := tx.Model(&models.InvoiceCenterFinanceSetting{}).Where("company_id = ? AND is_active = ?", companyID, true)
	if branchID != nil {
		query = query.Where("branch_id = ?", *branchID)
	} else {
		query = query.Where("branch_id IS NULL")
	}

	return query.Update("is_active", false).Error
}

func (r *InvoiceCenterFinanceSettingRepository) CreateFinanceSettingsTx(tx *gorm.DB, setting *models.InvoiceCenterFinanceSetting) error {
	return tx.Create(setting).Error
}

func (r *InvoiceCenterFinanceSettingRepository) ValidateChartOfAccount(db *gorm.DB, companyID, accountID uint64) (bool, error) {
	var count int64
	err := db.Table("chart_of_accounts").Where("id = ? AND company_id = ? AND status = ?", accountID, companyID, "active").Count(&count).Error
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

