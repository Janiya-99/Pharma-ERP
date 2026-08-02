package repositories

import (
	"strings"

	"github.com/pixandco/erp-phrma/internal/finance/models"
	"gorm.io/gorm"
)

type PettyCashReplenishmentRepository struct {
	db *gorm.DB
}

func NewPettyCashReplenishmentRepository(db *gorm.DB) *PettyCashReplenishmentRepository {
	return &PettyCashReplenishmentRepository{db: db}
}

func (r *PettyCashReplenishmentRepository) DB() *gorm.DB {
	return r.db
}

func (r *PettyCashReplenishmentRepository) FindPettyCashReplenishments(companyID uint64, pettyCashFundID *uint64, financialYearID *uint64, accountingPeriodID *uint64, approvalStatus string, postedStatus string, dateFrom string, dateTo string, search string, page int, limit int) ([]models.PettyCashReplenishment, int64, error) {
	var replenishments []models.PettyCashReplenishment
	var total int64

	query := r.db.Model(&models.PettyCashReplenishment{}).Where("company_id = ?", companyID)

	if pettyCashFundID != nil {
		query = query.Where("petty_cash_fund_id = ?", *pettyCashFundID)
	}
	if financialYearID != nil {
		query = query.Where("financial_year_id = ?", *financialYearID)
	}
	if accountingPeriodID != nil {
		query = query.Where("accounting_period_id = ?", *accountingPeriodID)
	}
	if approvalStatus != "" {
		query = query.Where("approval_status = ?", approvalStatus)
	}
	if postedStatus != "" {
		query = query.Where("posted_status = ?", postedStatus)
	}
	if dateFrom != "" {
		query = query.Where("replenishment_date >= ?", dateFrom)
	}
	if dateTo != "" {
		query = query.Where("replenishment_date <= ?", dateTo)
	}
	if search != "" {
		searchLike := "%" + search + "%"
		query = query.Where("(replenishment_number LIKE ? OR reference_number LIKE ?)", searchLike, searchLike)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	if err := query.Preload("PettyCashFund").Preload("FinancialYear").Preload("AccountingPeriod").Preload("Branch").Preload("PaidFromAccount").
		Offset(offset).Limit(limit).Order("id DESC").Find(&replenishments).Error; err != nil {
		return nil, 0, err
	}

	return replenishments, total, nil
}

func (r *PettyCashReplenishmentRepository) FindPettyCashReplenishmentByID(companyID uint64, id uint64) (*models.PettyCashReplenishment, error) {
	var replenishment models.PettyCashReplenishment
	if err := r.db.Preload("PettyCashFund").Preload("FinancialYear").Preload("AccountingPeriod").Preload("Branch").Preload("PaidFromAccount").
		Preload("Approvals").Preload("Approvals.ActionUser").
		Where("company_id = ? AND id = ?", companyID, id).First(&replenishment).Error; err != nil {
		return nil, err
	}
	return &replenishment, nil
}

func (r *PettyCashReplenishmentRepository) CreatePettyCashReplenishment(tx *gorm.DB, replenishment *models.PettyCashReplenishment) error {
	db := tx
	if db == nil {
		db = r.db
	}
	return db.Create(replenishment).Error
}

func (r *PettyCashReplenishmentRepository) UpdatePettyCashReplenishment(tx *gorm.DB, replenishment *models.PettyCashReplenishment) error {
	db := tx
	if db == nil {
		db = r.db
	}
	return db.Save(replenishment).Error
}

func (r *PettyCashReplenishmentRepository) SoftDeletePettyCashReplenishment(companyID uint64, id uint64) error {
	return r.db.Where("company_id = ? AND id = ?", companyID, id).Delete(&models.PettyCashReplenishment{}).Error
}

func (r *PettyCashReplenishmentRepository) UpdatePettyCashReplenishmentStatus(tx *gorm.DB, companyID uint64, id uint64, fields map[string]interface{}) error {
	db := tx
	if db == nil {
		db = r.db
	}
	return db.Model(&models.PettyCashReplenishment{}).Where("company_id = ? AND id = ?", companyID, id).Updates(fields).Error
}

func (r *PettyCashReplenishmentRepository) CreatePettyCashReplenishmentApprovalRecord(tx *gorm.DB, approval *models.PettyCashReplenishmentApproval) error {
	db := tx
	if db == nil {
		db = r.db
	}
	return db.Create(approval).Error
}

func (r *PettyCashReplenishmentRepository) GetLastPettyCashReplenishmentNumber(companyID uint64) (string, error) {
	var lastRepl models.PettyCashReplenishment
	err := r.db.Where("company_id = ? AND replenishment_number LIKE 'PCR-%'", companyID).
		Order("id DESC").First(&lastRepl).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return "", nil
		}
		return "", err
	}
	return lastRepl.ReplenishmentNumber, nil
}

func (r *PettyCashReplenishmentRepository) UpdateAccountBalance(tx *gorm.DB, accountID uint64, amount float64, isDebit bool) error {
	db := tx
	if db == nil {
		db = r.db
	}

	var account models.ChartOfAccount
	if err := db.Where("id = ?", accountID).First(&account).Error; err != nil {
		return err
	}

	if isDebit {
		if strings.ToLower(account.AccountType) == "asset" || strings.ToLower(account.AccountType) == "expense" {
			account.CurrentBalance += amount
		} else {
			account.CurrentBalance -= amount
		}
	} else {
		if strings.ToLower(account.AccountType) == "liability" || strings.ToLower(account.AccountType) == "equity" || strings.ToLower(account.AccountType) == "revenue" {
			account.CurrentBalance += amount
		} else {
			account.CurrentBalance -= amount
		}
	}

	return db.Model(&account).Update("current_balance", account.CurrentBalance).Error
}
