package repositories

import (
	"errors"
	"fmt"

	"github.com/pixandco/erp-phrma/internal/invoicecenter/models"
	"gorm.io/gorm"
)

type InvoiceCenterFinancePostingRepository struct{}

func NewInvoiceCenterFinancePostingRepository() *InvoiceCenterFinancePostingRepository {
	return &InvoiceCenterFinancePostingRepository{}
}

func (r *InvoiceCenterFinancePostingRepository) FindFinancePostingByDocument(db *gorm.DB, companyID uint64, documentType string, documentID uint64) (*models.InvoiceCenterFinancePosting, error) {
	var posting models.InvoiceCenterFinancePosting
	err := db.Where("company_id = ? AND document_type = ? AND document_id = ?", companyID, documentType, documentID).First(&posting).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &posting, nil
}

func (r *InvoiceCenterFinancePostingRepository) GenerateFinanceReferenceNumberTx(tx *gorm.DB, companyID uint64) (string, error) {
	var count int64
	err := tx.Model(&models.InvoiceCenterFinancePosting{}).Where("company_id = ?", companyID).Count(&count).Error
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("IC-FIN-%06d", count+1), nil
}

func (r *InvoiceCenterFinancePostingRepository) CreateFinancePostingRecordTx(tx *gorm.DB, posting *models.InvoiceCenterFinancePosting) error {
	return tx.Create(posting).Error
}

func (r *InvoiceCenterFinancePostingRepository) FindPendingFinancePostings(db *gorm.DB, companyID uint64, filters map[string]interface{}, page, limit int) ([]map[string]interface{}, int64, error) {
	var results []map[string]interface{}
	var total int64
	offset := (page - 1) * limit

	// A UNION query to fetch unposted documents across sales_invoices, credit_notes, debit_notes, customer_receipts
	query := `
		SELECT * FROM (
			SELECT 'sales_invoice' as document_type, id as document_id, invoice_number as document_number, invoice_date as document_date, branch_id, customer_id, total_amount, approval_status, posted_status as operational_posted_status, finance_post_status, created_by, created_at FROM sales_invoices WHERE company_id = ? AND posted_status = 'posted' AND finance_post_status = 'unposted' AND deleted_at IS NULL
			UNION ALL
			SELECT 'credit_note', id, credit_note_number, credit_note_date, branch_id, customer_id, total_amount, approval_status, posted_status, finance_post_status, created_by, created_at FROM credit_notes WHERE company_id = ? AND posted_status = 'posted' AND finance_post_status = 'unposted' AND deleted_at IS NULL
			UNION ALL
			SELECT 'debit_note', id, debit_note_number, debit_note_date, branch_id, customer_id, total_amount, approval_status, posted_status, finance_post_status, created_by, created_at FROM debit_notes WHERE company_id = ? AND posted_status = 'posted' AND finance_post_status = 'unposted' AND deleted_at IS NULL
			UNION ALL
			SELECT 'customer_receipt', id, receipt_number, receipt_date, branch_id, customer_id, receipt_amount, approval_status, posted_status, finance_post_status, created_by, created_at FROM customer_receipts WHERE company_id = ? AND posted_status = 'posted' AND finance_post_status = 'unposted' AND deleted_at IS NULL
		) as docs WHERE 1=1
	`
	args := []interface{}{companyID, companyID, companyID, companyID}

	if branchID, ok := filters["branch_id"]; ok {
		query += " AND branch_id = ?"
		args = append(args, branchID)
	}
	if docType, ok := filters["document_type"]; ok {
		query += " AND document_type = ?"
		args = append(args, docType)
	}
	if dateFrom, ok := filters["date_from"]; ok {
		query += " AND document_date >= ?"
		args = append(args, dateFrom)
	}
	if dateTo, ok := filters["date_to"]; ok {
		query += " AND document_date <= ?"
		args = append(args, dateTo)
	}

	err := db.Raw("SELECT count(*) FROM ("+query+") as sub", args...).Scan(&total).Error
	if err != nil {
		return nil, 0, err
	}

	query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
	args = append(args, limit, offset)

	err = db.Raw(query, args...).Scan(&results).Error
	if err != nil {
		return nil, 0, err
	}

	return results, total, nil
}

func (r *InvoiceCenterFinancePostingRepository) FindFinancePostingHistory(db *gorm.DB, companyID uint64, filters map[string]interface{}, page, limit int) ([]models.InvoiceCenterFinancePosting, int64, error) {
	var postings []models.InvoiceCenterFinancePosting
	var total int64
	offset := (page - 1) * limit

	query := db.Model(&models.InvoiceCenterFinancePosting{}).Where("company_id = ?", companyID)

	if branchID, ok := filters["branch_id"]; ok {
		query = query.Where("branch_id = ?", branchID)
	}
	if docType, ok := filters["document_type"]; ok {
		query = query.Where("document_type = ?", docType)
	}
	if docNum, ok := filters["document_number"]; ok {
		query = query.Where("document_number LIKE ?", "%"+docNum.(string)+"%")
	}
	if dateFrom, ok := filters["date_from"]; ok {
		query = query.Where("posted_at >= ?", dateFrom)
	}
	if dateTo, ok := filters["date_to"]; ok {
		query = query.Where("posted_at <= ?", dateTo)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := query.Order("posted_at DESC").Offset(offset).Limit(limit).Find(&postings).Error; err != nil {
		return nil, 0, err
	}

	return postings, total, nil
}
