package repositories

import (
	"strings"

	"github.com/pixandco/erp-phrma/internal/finance/models"
	"gorm.io/gorm"
)

type PettyCashVoucherRepository struct {
	db *gorm.DB
}

func NewPettyCashVoucherRepository(db *gorm.DB) *PettyCashVoucherRepository {
	return &PettyCashVoucherRepository{db: db}
}

func (r *PettyCashVoucherRepository) DB() *gorm.DB {
	return r.db
}

func (r *PettyCashVoucherRepository) FindPettyCashVouchers(companyID uint64, pettyCashFundID *uint64, financialYearID *uint64, accountingPeriodID *uint64, voucherType string, approvalStatus string, postedStatus string, dateFrom string, dateTo string, search string, page int, limit int) ([]models.PettyCashVoucher, int64, error) {
	var vouchers []models.PettyCashVoucher
	var total int64

	query := r.db.Model(&models.PettyCashVoucher{}).Where("company_id = ?", companyID)

	if pettyCashFundID != nil {
		query = query.Where("petty_cash_fund_id = ?", *pettyCashFundID)
	}
	if financialYearID != nil {
		query = query.Where("financial_year_id = ?", *financialYearID)
	}
	if accountingPeriodID != nil {
		query = query.Where("accounting_period_id = ?", *accountingPeriodID)
	}
	if voucherType != "" {
		query = query.Where("voucher_type = ?", voucherType)
	}
	if approvalStatus != "" {
		query = query.Where("approval_status = ?", approvalStatus)
	}
	if postedStatus != "" {
		query = query.Where("posted_status = ?", postedStatus)
	}
	if dateFrom != "" {
		query = query.Where("voucher_date >= ?", dateFrom)
	}
	if dateTo != "" {
		query = query.Where("voucher_date <= ?", dateTo)
	}
	if search != "" {
		searchLike := "%" + search + "%"
		query = query.Where("(voucher_number LIKE ? OR payee_name LIKE ? OR reference_number LIKE ?)", searchLike, searchLike, searchLike)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	if err := query.Preload("PettyCashFund").Preload("FinancialYear").Preload("AccountingPeriod").Preload("Branch").
		Offset(offset).Limit(limit).Order("id DESC").Find(&vouchers).Error; err != nil {
		return nil, 0, err
	}

	return vouchers, total, nil
}

func (r *PettyCashVoucherRepository) FindPettyCashVoucherByID(companyID uint64, id uint64) (*models.PettyCashVoucher, error) {
	var voucher models.PettyCashVoucher
	if err := r.db.Preload("PettyCashFund").Preload("FinancialYear").Preload("AccountingPeriod").Preload("Branch").
		Preload("Lines").Preload("Lines.Account").
		Preload("Approvals").Preload("Approvals.ActionUser").
		Where("company_id = ? AND id = ?", companyID, id).First(&voucher).Error; err != nil {
		return nil, err
	}
	return &voucher, nil
}

func (r *PettyCashVoucherRepository) CreatePettyCashVoucherWithLines(tx *gorm.DB, voucher *models.PettyCashVoucher) error {
	db := tx
	if db == nil {
		db = r.db
	}
	return db.Create(voucher).Error
}

func (r *PettyCashVoucherRepository) UpdatePettyCashVoucherWithLines(tx *gorm.DB, voucher *models.PettyCashVoucher) error {
	db := tx
	if db == nil {
		db = r.db
	}

	if err := db.Where("petty_cash_voucher_id = ?", voucher.ID).Delete(&models.PettyCashVoucherLine{}).Error; err != nil {
		return err
	}

	return db.Save(voucher).Error
}

func (r *PettyCashVoucherRepository) SoftDeletePettyCashVoucher(companyID uint64, id uint64) error {
	return r.db.Where("company_id = ? AND id = ?", companyID, id).Delete(&models.PettyCashVoucher{}).Error
}

func (r *PettyCashVoucherRepository) UpdatePettyCashVoucherStatus(tx *gorm.DB, companyID uint64, id uint64, fields map[string]interface{}) error {
	db := tx
	if db == nil {
		db = r.db
	}
	return db.Model(&models.PettyCashVoucher{}).Where("company_id = ? AND id = ?", companyID, id).Updates(fields).Error
}

func (r *PettyCashVoucherRepository) CreatePettyCashVoucherApprovalRecord(tx *gorm.DB, approval *models.PettyCashVoucherApproval) error {
	db := tx
	if db == nil {
		db = r.db
	}
	return db.Create(approval).Error
}

func (r *PettyCashVoucherRepository) GetLastPettyCashVoucherNumber(companyID uint64) (string, error) {
	var lastVoucher models.PettyCashVoucher
	err := r.db.Where("company_id = ? AND voucher_number LIKE 'PCV-%'", companyID).
		Order("id DESC").First(&lastVoucher).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return "", nil
		}
		return "", err
	}
	return lastVoucher.VoucherNumber, nil
}

func (r *PettyCashVoucherRepository) UpdateAccountBalance(tx *gorm.DB, accountID uint64, amount float64, isDebit bool) error {
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
