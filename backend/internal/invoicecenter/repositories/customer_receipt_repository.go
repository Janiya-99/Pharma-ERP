package repositories

import (
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/pixandco/erp-phrma/internal/invoicecenter/models"
	"gorm.io/gorm"
)

type CustomerReceiptRepository struct{}

func NewCustomerReceiptRepository() *CustomerReceiptRepository {
	return &CustomerReceiptRepository{}
}

func (r *CustomerReceiptRepository) GetLastCustomerReceiptNumber(db *gorm.DB, companyID uint64) (string, error) {
	var numbers []string
	if err := db.Model(&models.CustomerReceipt{}).Unscoped().
		Where("company_id = ? AND receipt_number LIKE ?", companyID, "CR-%").
		Pluck("receipt_number", &numbers).Error; err != nil {
		return "", err
	}

	maxSeq := 0
	for _, n := range numbers {
		parts := strings.Split(n, "CR-")
		if len(parts) == 2 {
			if num, err := strconv.Atoi(parts[1]); err == nil && num > maxSeq {
				maxSeq = num
			}
		}
	}

	return fmt.Sprintf("CR-%06d", maxSeq+1), nil
}

func (r *CustomerReceiptRepository) FindCustomerReceipts(db *gorm.DB, companyID uint64, filters map[string]interface{}, search string, page, limit int) ([]models.CustomerReceipt, int64, error) {
	query := db.Model(&models.CustomerReceipt{}).Where("customer_receipts.company_id = ?", companyID)

	if v, ok := filters["branch_id"].(uint64); ok && v > 0 {
		query = query.Where("customer_receipts.branch_id = ?", v)
	}
	if v, ok := filters["customer_id"].(uint64); ok && v > 0 {
		query = query.Where("customer_receipts.customer_id = ?", v)
	}
	if v, ok := filters["payment_method"].(string); ok && v != "" {
		query = query.Where("customer_receipts.payment_method = ?", v)
	}
	if v, ok := filters["approval_status"].(string); ok && v != "" {
		query = query.Where("customer_receipts.approval_status = ?", v)
	}
	if v, ok := filters["posted_status"].(string); ok && v != "" {
		query = query.Where("customer_receipts.posted_status = ?", v)
	}
	if v, ok := filters["receipt_status"].(string); ok && v != "" {
		query = query.Where("customer_receipts.receipt_status = ?", v)
	}
	if v, ok := filters["receipt_date_from"].(string); ok && v != "" {
		query = query.Where("customer_receipts.receipt_date >= ?", v)
	}
	if v, ok := filters["receipt_date_to"].(string); ok && v != "" {
		query = query.Where("customer_receipts.receipt_date <= ?", v)
	}

	if search != "" {
		searchTerm := "%" + search + "%"
		query = query.Joins("LEFT JOIN customers ON customers.id = customer_receipts.customer_id").
			Where(
				"customer_receipts.receipt_number LIKE ? OR customer_receipts.reference_number LIKE ? OR customer_receipts.bank_reference_number LIKE ? OR customer_receipts.cheque_number LIKE ? OR customer_receipts.remarks LIKE ? OR customers.customer_code LIKE ? OR customers.customer_name LIKE ?",
				searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm,
			)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	var receipts []models.CustomerReceipt
	if err := query.Preload("Customer").
		Order("customer_receipts.receipt_date DESC, customer_receipts.id DESC").
		Offset(offset).Limit(limit).Find(&receipts).Error; err != nil {
		return nil, 0, err
	}

	return receipts, total, nil
}

func (r *CustomerReceiptRepository) FindCustomerReceiptByID(db *gorm.DB, companyID, id uint64) (*models.CustomerReceipt, error) {
	var receipt models.CustomerReceipt
	err := db.Preload("Customer").Preload("Allocations").Preload("Allocations.SalesInvoice").
		Where("id = ? AND company_id = ?", id, companyID).First(&receipt).Error
	if err != nil {
		return nil, err
	}
	return &receipt, nil
}

func (r *CustomerReceiptRepository) CreateCustomerReceiptWithAllocations(db *gorm.DB, receipt *models.CustomerReceipt) error {
	return db.Transaction(func(tx *gorm.DB) error {
		return tx.Create(receipt).Error
	})
}

func (r *CustomerReceiptRepository) UpdateCustomerReceiptWithAllocations(db *gorm.DB, receipt *models.CustomerReceipt) error {
	return db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("customer_receipt_id = ?", receipt.ID).Delete(&models.CustomerReceiptAllocation{}).Error; err != nil {
			return err
		}
		return tx.Save(receipt).Error
	})
}

func (r *CustomerReceiptRepository) SoftDeleteCustomerReceipt(db *gorm.DB, companyID, id uint64) error {
	return db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("customer_receipt_id = ?", id).Delete(&models.CustomerReceiptAllocation{}).Error; err != nil {
			return err
		}
		return tx.Where("id = ? AND company_id = ?", id, companyID).Delete(&models.CustomerReceipt{}).Error
	})
}

func (r *CustomerReceiptRepository) UpdateCustomerReceiptApprovalStatus(db *gorm.DB, companyID, id uint64, approvalStatus string, actionBy uint64, actionAt time.Time) error {
	updates := map[string]interface{}{
		"approval_status": approvalStatus,
		"updated_by":      actionBy,
		"updated_at":      actionAt,
	}
	if approvalStatus == "approved" {
		updates["approved_by"] = actionBy
		updates["approved_at"] = actionAt
	}
	return db.Model(&models.CustomerReceipt{}).Where("id = ? AND company_id = ?", id, companyID).Updates(updates).Error
}

func (r *CustomerReceiptRepository) UpdateCustomerReceiptPostedStatus(db *gorm.DB, companyID, id uint64, postedStatus string, actionBy uint64, actionAt time.Time) error {
	return db.Model(&models.CustomerReceipt{}).Where("id = ? AND company_id = ?", id, companyID).Updates(map[string]interface{}{
		"posted_status": postedStatus,
		"posted_by":     actionBy,
		"posted_at":     actionAt,
		"updated_by":    actionBy,
		"updated_at":    actionAt,
	}).Error
}

func (r *CustomerReceiptRepository) UpdateCustomerReceiptStatus(db *gorm.DB, companyID, id uint64, status string, receiptStatus string, cancelledBy uint64, cancelReason string, actionAt time.Time) error {
	return db.Model(&models.CustomerReceipt{}).Where("id = ? AND company_id = ?", id, companyID).Updates(map[string]interface{}{
		"status":          status,
		"receipt_status":  receiptStatus,
		"approval_status": "cancelled",
		"cancelled_by":    cancelledBy,
		"cancelled_at":    actionAt,
		"cancel_reason":   cancelReason,
		"updated_by":      cancelledBy,
		"updated_at":      actionAt,
	}).Error
}

func (r *CustomerReceiptRepository) CreateCustomerReceiptApprovalRecord(db *gorm.DB, approval *models.CustomerReceiptApproval) error {
	return db.Create(approval).Error
}

func (r *CustomerReceiptRepository) ValidateCustomer(db *gorm.DB, companyID, customerID uint64) (*models.Customer, error) {
	var customer models.Customer
	if err := db.Where("id = ? AND company_id = ?", customerID, companyID).First(&customer).Error; err != nil {
		return nil, errors.New("customer does not exist")
	}
	if customer.Status != "active" {
		return nil, errors.New("customer is not active")
	}
	return &customer, nil
}

func (r *CustomerReceiptRepository) ValidateSalesInvoiceForAllocation(db *gorm.DB, companyID, branchID, customerID, invoiceID uint64) (*models.SalesInvoice, error) {
	var invoice models.SalesInvoice
	if err := db.Where("id = ? AND company_id = ? AND branch_id = ? AND customer_id = ?", invoiceID, companyID, branchID, customerID).First(&invoice).Error; err != nil {
		return nil, errors.New("sales invoice does not exist or does not belong to the selected branch/customer")
	}
	if invoice.PostedStatus != "posted" {
		return nil, errors.New("sales invoice is not posted")
	}
	if invoice.PaymentStatus == "cancelled" {
		return nil, errors.New("sales invoice payment status is cancelled")
	}
	if invoice.BalanceAmount <= 0 {
		return nil, errors.New("sales invoice has no balance amount")
	}
	return &invoice, nil
}

func (r *CustomerReceiptRepository) CheckDuplicateInvoiceAllocation(db *gorm.DB, receiptID, invoiceID uint64) (bool, error) {
	var count int64
	err := db.Model(&models.CustomerReceiptAllocation{}).Where("customer_receipt_id = ? AND sales_invoice_id = ?", receiptID, invoiceID).Count(&count).Error
	return count > 0, err
}

func (r *CustomerReceiptRepository) UpdateSalesInvoiceAfterReceiptAllocation(db *gorm.DB, invoiceID uint64, allocatedAmount float64) error {
	return db.Model(&models.SalesInvoice{}).Where("id = ?", invoiceID).
		Updates(map[string]interface{}{
			"paid_amount":    gorm.Expr("paid_amount + ?", allocatedAmount),
			"balance_amount": gorm.Expr("balance_amount - ?", allocatedAmount),
			"updated_at":     time.Now(),
		}).Error
}

func (r *CustomerReceiptRepository) UpdateSalesInvoicePaymentStatus(db *gorm.DB, invoiceID uint64, paymentStatus string, actionBy uint64) error {
	return db.Model(&models.SalesInvoice{}).Where("id = ?", invoiceID).
		Updates(map[string]interface{}{
			"payment_status": paymentStatus,
			"updated_by":     actionBy,
			"updated_at":     time.Now(),
		}).Error
}

func (r *CustomerReceiptRepository) UpdateCustomerBalanceAfterReceipt(db *gorm.DB, companyID, customerID uint64, allocatedAmount float64) error {
	return db.Model(&models.Customer{}).Where("id = ? AND company_id = ?", customerID, companyID).
		Update("current_balance", gorm.Expr("current_balance - ?", allocatedAmount)).Error
}

func (r *CustomerReceiptRepository) CheckCustomerReceiptUsage(db *gorm.DB, receiptID uint64) (bool, error) {
	var count int64
	if err := db.Model(&models.CustomerReceiptAllocation{}).Where("customer_receipt_id = ? AND allocated_amount > 0", receiptID).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

func (r *CustomerReceiptRepository) GetCustomerReceiptApprovalHistory(db *gorm.DB, receiptID uint64) ([]models.CustomerReceiptApproval, error) {
	var history []models.CustomerReceiptApproval
	if err := db.Where("customer_receipt_id = ?", receiptID).Order("action_at ASC").Find(&history).Error; err != nil {
		return nil, err
	}
	return history, nil
}
