package repositories

import (
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"

	invmodels "github.com/pixandco/erp-phrma/internal/inventory/models"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/models"
	"gorm.io/gorm"
)

type CreditNoteRepository struct{}

func NewCreditNoteRepository() *CreditNoteRepository {
	return &CreditNoteRepository{}
}

func (r *CreditNoteRepository) GetLastCreditNoteNumber(db *gorm.DB, companyID uint64) (string, error) {
	var numbers []string
	if err := db.Model(&models.CreditNote{}).Unscoped().
		Where("company_id = ? AND credit_note_number LIKE ?", companyID, "CN-%").
		Pluck("credit_note_number", &numbers).Error; err != nil {
		return "", err
	}

	maxSeq := 0
	for _, n := range numbers {
		parts := strings.Split(n, "CN-")
		if len(parts) == 2 {
			if num, err := strconv.Atoi(parts[1]); err == nil && num > maxSeq {
				maxSeq = num
			}
		}
	}

	return fmt.Sprintf("CN-%06d", maxSeq+1), nil
}

func (r *CreditNoteRepository) FindCreditNotes(db *gorm.DB, companyID uint64, filters map[string]interface{}, search string, page, limit int) ([]models.CreditNote, int64, error) {
	query := db.Model(&models.CreditNote{}).Where("credit_notes.company_id = ?", companyID)

	if v, ok := filters["branch_id"].(uint64); ok && v > 0 {
		query = query.Where("credit_notes.branch_id = ?", v)
	}
	if v, ok := filters["customer_id"].(uint64); ok && v > 0 {
		query = query.Where("credit_notes.customer_id = ?", v)
	}
	if v, ok := filters["sales_invoice_id"].(uint64); ok && v > 0 {
		query = query.Where("credit_notes.sales_invoice_id = ?", v)
	}
	if v, ok := filters["financial_year_id"].(uint64); ok && v > 0 {
		query = query.Where("credit_notes.financial_year_id = ?", v)
	}
	if v, ok := filters["accounting_period_id"].(uint64); ok && v > 0 {
		query = query.Where("credit_notes.accounting_period_id = ?", v)
	}
	if v, ok := filters["credit_note_type"].(string); ok && v != "" {
		query = query.Where("credit_notes.credit_note_type = ?", v)
	}
	if v, ok := filters["approval_status"].(string); ok && v != "" {
		query = query.Where("credit_notes.approval_status = ?", v)
	}
	if v, ok := filters["posted_status"].(string); ok && v != "" {
		query = query.Where("credit_notes.posted_status = ?", v)
	}
	if v, ok := filters["credit_note_date_from"].(string); ok && v != "" {
		query = query.Where("credit_notes.credit_note_date >= ?", v)
	}
	if v, ok := filters["credit_note_date_to"].(string); ok && v != "" {
		query = query.Where("credit_notes.credit_note_date <= ?", v)
	}

	if search != "" {
		searchTerm := "%" + search + "%"
		query = query.Joins("LEFT JOIN customers ON customers.id = credit_notes.customer_id").
			Joins("LEFT JOIN sales_invoices ON sales_invoices.id = credit_notes.sales_invoice_id").
			Where(
				"credit_notes.credit_note_number LIKE ? OR credit_notes.reference_number LIKE ? OR credit_notes.reason LIKE ? OR credit_notes.remarks LIKE ? OR customers.customer_code LIKE ? OR customers.customer_name LIKE ? OR sales_invoices.invoice_number LIKE ?",
				searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm,
			)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	var notes []models.CreditNote
	if err := query.Preload("Customer").Preload("SalesInvoice").
		Order("credit_notes.credit_note_date DESC, credit_notes.id DESC").
		Offset(offset).Limit(limit).Find(&notes).Error; err != nil {
		return nil, 0, err
	}

	return notes, total, nil
}

func (r *CreditNoteRepository) FindCreditNoteByID(db *gorm.DB, companyID, id uint64) (*models.CreditNote, error) {
	var note models.CreditNote
	err := db.Preload("Customer").Preload("SalesInvoice").Preload("Lines").Preload("Approvals").
		Where("id = ? AND company_id = ?", id, companyID).First(&note).Error
	if err != nil {
		return nil, err
	}
	return &note, nil
}

func (r *CreditNoteRepository) CreateCreditNoteWithLines(db *gorm.DB, note *models.CreditNote) error {
	return db.Transaction(func(tx *gorm.DB) error {
		return tx.Create(note).Error
	})
}

func (r *CreditNoteRepository) UpdateCreditNoteWithLines(db *gorm.DB, note *models.CreditNote) error {
	return db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("credit_note_id = ?", note.ID).Delete(&models.CreditNoteLine{}).Error; err != nil {
			return err
		}
		return tx.Save(note).Error
	})
}

func (r *CreditNoteRepository) SoftDeleteCreditNote(db *gorm.DB, companyID, id uint64) error {
	return db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("credit_note_id = ?", id).Delete(&models.CreditNoteLine{}).Error; err != nil {
			return err
		}
		return tx.Where("id = ? AND company_id = ?", id, companyID).Delete(&models.CreditNote{}).Error
	})
}

func (r *CreditNoteRepository) UpdateCreditNoteApprovalStatus(db *gorm.DB, companyID, id uint64, approvalStatus string, actionBy uint64, actionAt time.Time) error {
	updates := map[string]interface{}{
		"approval_status": approvalStatus,
		"updated_by":      actionBy,
		"updated_at":      actionAt,
	}
	if approvalStatus == "approved" {
		updates["approved_by"] = actionBy
		updates["approved_at"] = actionAt
	} else if approvalStatus == "cancelled" {
		updates["cancelled_by"] = actionBy
		updates["cancelled_at"] = actionAt
	}
	return db.Model(&models.CreditNote{}).Where("id = ? AND company_id = ?", id, companyID).Updates(updates).Error
}

func (r *CreditNoteRepository) UpdateCreditNotePostedStatus(db *gorm.DB, companyID, id uint64, postedStatus string, actionBy uint64, actionAt time.Time) error {
	return db.Model(&models.CreditNote{}).Where("id = ? AND company_id = ?", id, companyID).Updates(map[string]interface{}{
		"posted_status": postedStatus,
		"posted_by":     actionBy,
		"posted_at":     actionAt,
		"updated_by":    actionBy,
		"updated_at":    actionAt,
	}).Error
}

func (r *CreditNoteRepository) CreateCreditNoteApprovalRecord(db *gorm.DB, approval *models.CreditNoteApproval) error {
	return db.Create(approval).Error
}

func (r *CreditNoteRepository) ValidateCustomer(db *gorm.DB, companyID, customerID uint64) (*models.Customer, error) {
	var customer models.Customer
	if err := db.Where("id = ? AND company_id = ?", customerID, companyID).First(&customer).Error; err != nil {
		return nil, errors.New("customer does not exist")
	}
	if customer.Status != "active" {
		return nil, errors.New("customer is not active")
	}
	return &customer, nil
}

func (r *CreditNoteRepository) ValidateSalesInvoice(db *gorm.DB, companyID, invoiceID uint64) (*models.SalesInvoice, error) {
	var invoice models.SalesInvoice
	if err := db.Where("id = ? AND company_id = ?", invoiceID, companyID).First(&invoice).Error; err != nil {
		return nil, errors.New("sales invoice does not exist")
	}
	if invoice.Status != "active" {
		return nil, errors.New("sales invoice is not active")
	}
	if invoice.PostedStatus != "posted" {
		return nil, errors.New("sales invoice is not posted")
	}
	if invoice.ApprovalStatus == "cancelled" {
		return nil, errors.New("sales invoice is cancelled")
	}
	return &invoice, nil
}

func (r *CreditNoteRepository) ValidateSalesInvoiceLine(db *gorm.DB, invoiceID, invoiceLineID uint64) (*models.SalesInvoiceLine, error) {
	var line models.SalesInvoiceLine
	if err := db.Where("id = ? AND sales_invoice_id = ?", invoiceLineID, invoiceID).First(&line).Error; err != nil {
		return nil, errors.New("sales invoice line does not exist or does not belong to selected sales invoice")
	}
	return &line, nil
}

func (r *CreditNoteRepository) ValidateProduct(db *gorm.DB, companyID, productID uint64) (*invmodels.Product, error) {
	var product invmodels.Product
	if err := db.Where("id = ? AND company_id = ?", productID, companyID).First(&product).Error; err != nil {
		return nil, errors.New("product does not exist")
	}
	if product.Status != "active" {
		return nil, errors.New("product is not active")
	}
	return &product, nil
}

func (r *CreditNoteRepository) UpdateCustomerBalanceAfterCreditNote(db *gorm.DB, companyID, customerID uint64, creditAmount float64) error {
	// Credit note reduces customer balance. If customer balance is 1000, and credit note is 200, balance becomes 800.
	// We do a direct subtract. Note: user said "Do not reduce customer.current_balance below zero in Step 54."
	// That constraint will be checked in the service before calling this.
	return db.Model(&models.Customer{}).Where("id = ? AND company_id = ?", customerID, companyID).
		Update("current_balance", gorm.Expr("current_balance - ?", creditAmount)).Error
}

func (r *CreditNoteRepository) UpdateSalesInvoiceBalanceAfterCreditNote(db *gorm.DB, companyID, invoiceID uint64, creditAmount float64) error {
	return db.Model(&models.SalesInvoice{}).Where("id = ? AND company_id = ?", invoiceID, companyID).
		Update("balance_amount", gorm.Expr("balance_amount - ?", creditAmount)).Error
}

func (r *CreditNoteRepository) UpdateSalesInvoicePaymentStatus(db *gorm.DB, companyID, invoiceID uint64, paymentStatus string, actionBy uint64) error {
	return db.Model(&models.SalesInvoice{}).Where("id = ? AND company_id = ?", invoiceID, companyID).Updates(map[string]interface{}{
		"payment_status": paymentStatus,
		"updated_by":     actionBy,
		"updated_at":     time.Now(),
	}).Error
}

func (r *CreditNoteRepository) CheckCreditNoteUsage(db *gorm.DB, creditNoteID uint64) (bool, error) {
	// Not implemented yet, as no debit note or receipt allocations exist for credit notes in step 54.
	return false, nil
}
