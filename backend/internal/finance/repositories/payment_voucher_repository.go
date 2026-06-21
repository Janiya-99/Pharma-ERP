package repositories

import (
	"fmt"

	"github.com/pixandco/erp-phrma/internal/finance/models"
	"gorm.io/gorm"
)

type PaymentVoucherRepository interface {
	GetDB() *gorm.DB
	FindPaymentVouchers(companyID uint64, filters map[string]interface{}, page, limit int) ([]models.PaymentVoucher, int64, error)
	FindPaymentVoucherByID(companyID, voucherID uint64) (*models.PaymentVoucher, error)
	CreatePaymentVoucherWithLines(voucher *models.PaymentVoucher) error
	UpdatePaymentVoucherWithLines(voucher *models.PaymentVoucher) error
	SoftDeletePaymentVoucher(companyID, voucherID uint64) error
	UpdatePaymentVoucherStatus(voucherID uint64, updates map[string]interface{}) error
	CreatePaymentApprovalRecord(approval *models.PaymentVoucherApproval) error
	GetLastPaymentVoucherNumber(companyID uint64) (string, error)
	UpdateAccountBalance(tx *gorm.DB, accountID uint64, amount float64, isDebit bool) error
}

type paymentVoucherRepository struct {
	db *gorm.DB
}

func NewPaymentVoucherRepository(db *gorm.DB) PaymentVoucherRepository {
	return &paymentVoucherRepository{db: db}
}

func (r *paymentVoucherRepository) GetDB() *gorm.DB {
	return r.db
}

func (r *paymentVoucherRepository) FindPaymentVouchers(companyID uint64, filters map[string]interface{}, page, limit int) ([]models.PaymentVoucher, int64, error) {
	var vouchers []models.PaymentVoucher
	var total int64

	query := r.db.Model(&models.PaymentVoucher{}).Where("company_id = ?", companyID)

	if v, ok := filters["financial_year_id"]; ok && v != "" {
		query = query.Where("financial_year_id = ?", v)
	}
	if v, ok := filters["accounting_period_id"]; ok && v != "" {
		query = query.Where("accounting_period_id = ?", v)
	}
	if v, ok := filters["payment_type"]; ok && v != "" {
		query = query.Where("payment_type = ?", v)
	}
	if v, ok := filters["payment_method"]; ok && v != "" {
		query = query.Where("payment_method = ?", v)
	}
	if v, ok := filters["approval_status"]; ok && v != "" {
		query = query.Where("approval_status = ?", v)
	}
	if v, ok := filters["posted_status"]; ok && v != "" {
		query = query.Where("posted_status = ?", v)
	}
	if v, ok := filters["payment_date_from"]; ok && v != "" {
		query = query.Where("payment_date >= ?", v)
	}
	if v, ok := filters["payment_date_to"]; ok && v != "" {
		query = query.Where("payment_date <= ?", v)
	}
	if v, ok := filters["search"]; ok && v != "" {
		searchStr := fmt.Sprintf("%%%v%%", v)
		query = query.Where("voucher_number LIKE ? OR reference_number LIKE ? OR description LIKE ?", searchStr, searchStr, searchStr)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	if err := query.Preload("FinancialYear").
		Preload("AccountingPeriod").
		Preload("PaidFromAccount").
		Order("id DESC").
		Offset(offset).
		Limit(limit).
		Find(&vouchers).Error; err != nil {
		return nil, 0, err
	}

	return vouchers, total, nil
}

func (r *paymentVoucherRepository) FindPaymentVoucherByID(companyID, voucherID uint64) (*models.PaymentVoucher, error) {
	var voucher models.PaymentVoucher
	if err := r.db.Preload("FinancialYear").
		Preload("AccountingPeriod").
		Preload("PaidFromAccount").
		Preload("Lines").
		Preload("Lines.Account").
		Preload("Approvals").
		Where("company_id = ? AND id = ?", companyID, voucherID).
		First(&voucher).Error; err != nil {
		return nil, err
	}
	return &voucher, nil
}

func (r *paymentVoucherRepository) CreatePaymentVoucherWithLines(voucher *models.PaymentVoucher) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(voucher).Error; err != nil {
			return err
		}
		return nil
	})
}

func (r *paymentVoucherRepository) UpdatePaymentVoucherWithLines(voucher *models.PaymentVoucher) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Delete old lines
		if err := tx.Where("payment_voucher_id = ?", voucher.ID).Delete(&models.PaymentVoucherLine{}).Error; err != nil {
			return err
		}

		if err := tx.Save(voucher).Error; err != nil {
			return err
		}

		return nil
	})
}

func (r *paymentVoucherRepository) SoftDeletePaymentVoucher(companyID, voucherID uint64) error {
	return r.db.Where("company_id = ? AND id = ?", companyID, voucherID).Delete(&models.PaymentVoucher{}).Error
}

func (r *paymentVoucherRepository) UpdatePaymentVoucherStatus(voucherID uint64, updates map[string]interface{}) error {
	return r.db.Model(&models.PaymentVoucher{}).Where("id = ?", voucherID).Updates(updates).Error
}

func (r *paymentVoucherRepository) CreatePaymentApprovalRecord(approval *models.PaymentVoucherApproval) error {
	return r.db.Create(approval).Error
}

func (r *paymentVoucherRepository) GetLastPaymentVoucherNumber(companyID uint64) (string, error) {
	var voucher models.PaymentVoucher
	err := r.db.Where("company_id = ?", companyID).Order("id DESC").First(&voucher).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return "", nil
		}
		return "", err
	}
	return voucher.VoucherNumber, nil
}

func (r *paymentVoucherRepository) UpdateAccountBalance(tx *gorm.DB, accountID uint64, amount float64, isDebit bool) error {
	var account models.ChartOfAccount
	if err := tx.First(&account, accountID).Error; err != nil {
		return err
	}

	amountStr := fmt.Sprintf("%.2f", amount)

	if account.NormalBalance == "Debit" {
		if isDebit {
			return tx.Model(&account).UpdateColumn("current_balance", gorm.Expr("current_balance + ?", amountStr)).Error
		} else {
			return tx.Model(&account).UpdateColumn("current_balance", gorm.Expr("current_balance - ?", amountStr)).Error
		}
	} else {
		// Credit normal balance
		if isDebit {
			return tx.Model(&account).UpdateColumn("current_balance", gorm.Expr("current_balance - ?", amountStr)).Error
		} else {
			return tx.Model(&account).UpdateColumn("current_balance", gorm.Expr("current_balance + ?", amountStr)).Error
		}
	}
}
