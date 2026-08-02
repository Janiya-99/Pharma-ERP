package repositories

import (
	"fmt"

	"github.com/pixandco/erp-phrma/internal/finance/models"
	"gorm.io/gorm"
)

type ReceiptVoucherRepository interface {
	GetDB() *gorm.DB
	FindReceiptVouchers(companyID uint64, filters map[string]interface{}, page, limit int) ([]models.ReceiptVoucher, int64, error)
	FindReceiptVoucherByID(companyID, voucherID uint64) (*models.ReceiptVoucher, error)
	CreateReceiptVoucherWithLines(voucher *models.ReceiptVoucher) error
	UpdateReceiptVoucherWithLines(voucher *models.ReceiptVoucher) error
	SoftDeleteReceiptVoucher(companyID, voucherID uint64) error
	UpdateReceiptVoucherStatus(voucherID uint64, updates map[string]interface{}) error
	CreateReceiptApprovalRecord(approval *models.ReceiptVoucherApproval) error
	GetLastReceiptVoucherNumber(companyID uint64) (string, error)
	UpdateAccountBalance(tx *gorm.DB, accountID uint64, amount float64, isDebit bool) error
}

type receiptVoucherRepository struct {
	db *gorm.DB
	// Reuse PaymentVoucherRepository logic for account balance
	paymentRepo PaymentVoucherRepository
}

func NewReceiptVoucherRepository(db *gorm.DB, paymentRepo PaymentVoucherRepository) ReceiptVoucherRepository {
	return &receiptVoucherRepository{db: db, paymentRepo: paymentRepo}
}

func (r *receiptVoucherRepository) GetDB() *gorm.DB {
	return r.db
}

func (r *receiptVoucherRepository) FindReceiptVouchers(companyID uint64, filters map[string]interface{}, page, limit int) ([]models.ReceiptVoucher, int64, error) {
	var vouchers []models.ReceiptVoucher
	var total int64

	query := r.db.Model(&models.ReceiptVoucher{}).Where("company_id = ?", companyID)

	if v, ok := filters["financial_year_id"]; ok && v != "" {
		query = query.Where("financial_year_id = ?", v)
	}
	if v, ok := filters["accounting_period_id"]; ok && v != "" {
		query = query.Where("accounting_period_id = ?", v)
	}
	if v, ok := filters["receipt_type"]; ok && v != "" {
		query = query.Where("receipt_type = ?", v)
	}
	if v, ok := filters["receipt_method"]; ok && v != "" {
		query = query.Where("receipt_method = ?", v)
	}
	if v, ok := filters["approval_status"]; ok && v != "" {
		query = query.Where("approval_status = ?", v)
	}
	if v, ok := filters["posted_status"]; ok && v != "" {
		query = query.Where("posted_status = ?", v)
	}
	if v, ok := filters["receipt_date_from"]; ok && v != "" {
		query = query.Where("receipt_date >= ?", v)
	}
	if v, ok := filters["receipt_date_to"]; ok && v != "" {
		query = query.Where("receipt_date <= ?", v)
	}
	if v, ok := filters["search"]; ok && v != "" {
		searchStr := fmt.Sprintf("%%%v%%", v)
		query = query.Where("receipt_number LIKE ? OR reference_number LIKE ? OR description LIKE ?", searchStr, searchStr, searchStr)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	if err := query.Preload("FinancialYear").
		Preload("AccountingPeriod").
		Preload("ReceivedToAccount").
		Order("id DESC").
		Offset(offset).
		Limit(limit).
		Find(&vouchers).Error; err != nil {
		return nil, 0, err
	}

	return vouchers, total, nil
}

func (r *receiptVoucherRepository) FindReceiptVoucherByID(companyID, voucherID uint64) (*models.ReceiptVoucher, error) {
	var voucher models.ReceiptVoucher
	if err := r.db.Preload("FinancialYear").
		Preload("AccountingPeriod").
		Preload("ReceivedToAccount").
		Preload("Lines").
		Preload("Lines.Account").
		Preload("Approvals").
		Where("company_id = ? AND id = ?", companyID, voucherID).
		First(&voucher).Error; err != nil {
		return nil, err
	}
	return &voucher, nil
}

func (r *receiptVoucherRepository) CreateReceiptVoucherWithLines(voucher *models.ReceiptVoucher) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(voucher).Error; err != nil {
			return err
		}
		return nil
	})
}

func (r *receiptVoucherRepository) UpdateReceiptVoucherWithLines(voucher *models.ReceiptVoucher) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("receipt_voucher_id = ?", voucher.ID).Delete(&models.ReceiptVoucherLine{}).Error; err != nil {
			return err
		}
		if err := tx.Save(voucher).Error; err != nil {
			return err
		}
		return nil
	})
}

func (r *receiptVoucherRepository) SoftDeleteReceiptVoucher(companyID, voucherID uint64) error {
	return r.db.Where("company_id = ? AND id = ?", companyID, voucherID).Delete(&models.ReceiptVoucher{}).Error
}

func (r *receiptVoucherRepository) UpdateReceiptVoucherStatus(voucherID uint64, updates map[string]interface{}) error {
	return r.db.Model(&models.ReceiptVoucher{}).Where("id = ?", voucherID).Updates(updates).Error
}

func (r *receiptVoucherRepository) CreateReceiptApprovalRecord(approval *models.ReceiptVoucherApproval) error {
	return r.db.Create(approval).Error
}

func (r *receiptVoucherRepository) GetLastReceiptVoucherNumber(companyID uint64) (string, error) {
	var voucher models.ReceiptVoucher
	err := r.db.Where("company_id = ?", companyID).Order("id DESC").First(&voucher).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return "", nil
		}
		return "", err
	}
	return voucher.ReceiptNumber, nil
}

func (r *receiptVoucherRepository) UpdateAccountBalance(tx *gorm.DB, accountID uint64, amount float64, isDebit bool) error {
	return r.paymentRepo.UpdateAccountBalance(tx, accountID, amount, isDebit)
}
