package services

import (
	"errors"
	"fmt"
	"time"

	financeModels "github.com/pixandco/erp-phrma/internal/finance/models"
	financerepositories "github.com/pixandco/erp-phrma/internal/finance/repositories"
	financeServices "github.com/pixandco/erp-phrma/internal/finance/services"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/dto"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/models"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/repositories"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type InvoiceCenterFinancePostingService struct {
	repo           *repositories.InvoiceCenterFinancePostingRepository
	settingsRepo   *repositories.InvoiceCenterFinanceSettingRepository
	salesRepo      *repositories.SalesInvoiceRepository
	creditNoteRepo *repositories.CreditNoteRepository
	debitNoteRepo  *repositories.DebitNoteRepository
	receiptRepo    *repositories.CustomerReceiptRepository
	auditService   *AuditLogService
	logger         *zap.Logger
}

func NewInvoiceCenterFinancePostingService(
	repo *repositories.InvoiceCenterFinancePostingRepository,
	settingsRepo *repositories.InvoiceCenterFinanceSettingRepository,
	salesRepo *repositories.SalesInvoiceRepository,
	creditNoteRepo *repositories.CreditNoteRepository,
	debitNoteRepo *repositories.DebitNoteRepository,
	receiptRepo *repositories.CustomerReceiptRepository,
	auditService *AuditLogService,
	logger *zap.Logger,
) *InvoiceCenterFinancePostingService {
	return &InvoiceCenterFinancePostingService{
		repo:           repo,
		settingsRepo:   settingsRepo,
		salesRepo:      salesRepo,
		creditNoteRepo: creditNoteRepo,
		debitNoteRepo:  debitNoteRepo,
		receiptRepo:    receiptRepo,
		auditService:   auditService,
		logger:         logger,
	}
}

func (s *InvoiceCenterFinancePostingService) GetPendingFinancePostings(db *gorm.DB, companyID uint64, req dto.GetPendingFinancePostingsRequest) ([]dto.PendingFinancePostingResponse, int64, error) {
	filters := make(map[string]interface{})
	if req.BranchID != nil {
		filters["branch_id"] = *req.BranchID
	}
	if req.DocumentType != nil {
		filters["document_type"] = *req.DocumentType
	}
	if req.DateFrom != nil {
		filters["date_from"] = *req.DateFrom
	}
	if req.DateTo != nil {
		filters["date_to"] = *req.DateTo
	}

	page := req.Page
	if page < 1 {
		page = 1
	}
	limit := req.Limit
	if limit < 1 {
		limit = 10
	}

	results, total, err := s.repo.FindPendingFinancePostings(db, companyID, filters, page, limit)
	if err != nil {
		return nil, 0, err
	}

	var response []dto.PendingFinancePostingResponse
	for _, row := range results {
		var docDate time.Time
		if v, ok := row["document_date"].(time.Time); ok {
			docDate = v
		}

		response = append(response, dto.PendingFinancePostingResponse{
			DocumentType:      row["document_type"].(string),
			DocumentID:        uint64(row["document_id"].(int64)),
			DocumentNumber:    row["document_number"].(string),
			DocumentDate:      docDate.Format("2006-01-02"),
			BranchID:          uint64(row["branch_id"].(int64)),
			CustomerID:        uint64(row["customer_id"].(int64)),
			TotalAmount:       row["total_amount"].(float64),
			ApprovalStatus:    row["approval_status"].(string),
			OperationalStatus: row["operational_posted_status"].(string),
			FinancePostStatus: row["finance_post_status"].(string),
		})
	}

	return response, total, nil
}

func (s *InvoiceCenterFinancePostingService) GetFinancePostingHistory(db *gorm.DB, companyID uint64, req dto.GetFinancePostingHistoryRequest) ([]dto.FinancePostingHistoryResponse, int64, error) {
	filters := make(map[string]interface{})
	if req.BranchID != nil {
		filters["branch_id"] = *req.BranchID
	}
	if req.DocumentType != nil {
		filters["document_type"] = *req.DocumentType
	}
	if req.DocumentNumber != nil {
		filters["document_number"] = *req.DocumentNumber
	}
	if req.DateFrom != nil {
		filters["date_from"] = *req.DateFrom
	}
	if req.DateTo != nil {
		filters["date_to"] = *req.DateTo
	}

	page := req.Page
	if page < 1 {
		page = 1
	}
	limit := req.Limit
	if limit < 1 {
		limit = 10
	}

	history, total, err := s.repo.FindFinancePostingHistory(db, companyID, filters, page, limit)
	if err != nil {
		return nil, 0, err
	}

	var response []dto.FinancePostingHistoryResponse
	for _, item := range history {
		response = append(response, dto.FinancePostingHistoryResponse{
			ID:                     item.ID,
			DocumentType:           item.DocumentType,
			DocumentNumber:         item.DocumentNumber,
			FinanceReferenceNumber: item.FinanceReferenceNumber,
			DebitTotal:             item.DebitTotal,
			CreditTotal:            item.CreditTotal,
			PostedBy:               item.PostedBy,
			PostedAt:               item.PostedAt,
			Remarks:                item.Remarks,
		})
	}

	return response, total, nil
}

func (s *InvoiceCenterFinancePostingService) checkDuplicate(db *gorm.DB, companyID uint64, docType string, docID uint64) error {
	existing, err := s.repo.FindFinancePostingByDocument(db, companyID, docType, docID)
	if err != nil {
		return err
	}
	if existing != nil {
		return errors.New(docType + " is already posted to Finance")
	}
	return nil
}

func (s *InvoiceCenterFinancePostingService) getSettings(db *gorm.DB, companyID uint64, branchID *uint64) (*models.InvoiceCenterFinanceSetting, error) {
	setting, err := s.settingsRepo.FindFinanceSettingsForBranch(db, companyID, branchID)
	if err != nil {
		return nil, err
	}
	if setting == nil && branchID != nil {
		setting, err = s.settingsRepo.FindFinanceSettingsForBranch(db, companyID, nil)
		if err != nil {
			return nil, err
		}
	}
	if setting == nil {
		return nil, errors.New("finance settings not configured for this branch or company")
	}
	return setting, nil
}

func (s *InvoiceCenterFinancePostingService) PostSalesInvoiceToFinance(db *gorm.DB, companyID, invoiceID, userID uint64) (*dto.PostToFinanceResponse, error) {
	invoice, err := s.salesRepo.FindSalesInvoiceByID(db, companyID, invoiceID)
	if err != nil {
		return nil, err
	}
	if invoice.PostedStatus != "posted" || invoice.ApprovalStatus != "approved" {
		return nil, errors.New("sales invoice must be operationally posted and approved")
	}
	if invoice.FinancePostStatus == "posted" {
		return nil, errors.New("sales invoice is already posted to Finance")
	}
	if err := s.checkDuplicate(db, companyID, "sales_invoice", invoiceID); err != nil {
		return nil, err
	}

	settings, err := s.getSettings(db, companyID, &invoice.BranchID)
	if err != nil {
		return nil, err
	}

	// Validate required accounts for Sales Invoice
	if settings.AccountsReceivableAccountID == 0 || settings.SalesRevenueAccountID == 0 {
		return nil, errors.New("Accounts Receivable and Sales Revenue accounts must be configured")
	}
	if invoice.DiscountAmount > 0 && (settings.SalesDiscountAccountID == nil || *settings.SalesDiscountAccountID == 0) {
		return nil, errors.New("Sales Discount account must be configured for invoices with discount")
	}
	if invoice.TaxAmount > 0 && (settings.OutputTaxAccountID == nil || *settings.OutputTaxAccountID == 0) {
		return nil, errors.New("Output Tax account must be configured for invoices with tax")
	}

	// Build GL Entries
	var entries []financeModels.GeneralLedgerEntry
	var debitTotal, creditTotal float64

	// Dr Accounts Receivable
	entries = append(entries, financeModels.GeneralLedgerEntry{
		CompanyID:       companyID,
		BranchID:        &invoice.BranchID,
		FinancialYearID: invoice.FinancialYearID,
		TransactionDate: invoice.InvoiceDate,
		SourceType:      "sales_invoice",
		SourceID:        invoice.ID,
		SourceNumber:    invoice.InvoiceNumber,
		AccountID:       settings.AccountsReceivableAccountID,
		Description:     "Sales invoice " + invoice.InvoiceNumber + " posted from Invoice Center",
		DebitAmount:     invoice.TotalAmount,
	})
	debitTotal += invoice.TotalAmount

	// Dr Sales Discount (if applicable)
	if invoice.DiscountAmount > 0 {
		entries = append(entries, financeModels.GeneralLedgerEntry{
			CompanyID:       companyID,
			BranchID:        &invoice.BranchID,
			FinancialYearID: invoice.FinancialYearID,
			TransactionDate: invoice.InvoiceDate,
			SourceType:      "sales_invoice",
			SourceID:        invoice.ID,
			SourceNumber:    invoice.InvoiceNumber,
			AccountID:       *settings.SalesDiscountAccountID,
			Description:     "Sales invoice " + invoice.InvoiceNumber + " discount",
			DebitAmount:     invoice.DiscountAmount,
		})
		debitTotal += invoice.DiscountAmount
	}

	// Cr Sales Revenue
	entries = append(entries, financeModels.GeneralLedgerEntry{
		CompanyID:       companyID,
		BranchID:        &invoice.BranchID,
		FinancialYearID: invoice.FinancialYearID,
		TransactionDate: invoice.InvoiceDate,
		SourceType:      "sales_invoice",
		SourceID:        invoice.ID,
		SourceNumber:    invoice.InvoiceNumber,
		AccountID:       settings.SalesRevenueAccountID,
		Description:     "Sales invoice " + invoice.InvoiceNumber + " revenue",
		CreditAmount:    invoice.SubtotalAmount,
	})
	creditTotal += invoice.SubtotalAmount

	// Cr Output Tax (if applicable)
	if invoice.TaxAmount > 0 {
		entries = append(entries, financeModels.GeneralLedgerEntry{
			CompanyID:       companyID,
			BranchID:        &invoice.BranchID,
			FinancialYearID: invoice.FinancialYearID,
			TransactionDate: invoice.InvoiceDate,
			SourceType:      "sales_invoice",
			SourceID:        invoice.ID,
			SourceNumber:    invoice.InvoiceNumber,
			AccountID:       *settings.OutputTaxAccountID,
			Description:     "Sales invoice " + invoice.InvoiceNumber + " tax",
			CreditAmount:    invoice.TaxAmount,
		})
		creditTotal += invoice.TaxAmount
	}

	if fmt.Sprintf("%.2f", debitTotal) != fmt.Sprintf("%.2f", creditTotal) {
		return nil, errors.New("generated GL entries are not balanced")
	}

	return s.executeFinancePosting(db, companyID, userID, "sales_invoice", invoice.ID, invoice.InvoiceNumber, debitTotal, creditTotal, entries, func(tx *gorm.DB, refNum string, t time.Time) error {
		invoice.FinancePostStatus = "posted"
		invoice.FinanceReferenceNumber = &refNum
		invoice.FinancePostedBy = &userID
		invoice.FinancePostedAt = &t
		return tx.Save(invoice).Error
	})
}

func (s *InvoiceCenterFinancePostingService) PostCreditNoteToFinance(db *gorm.DB, companyID, noteID, userID uint64) (*dto.PostToFinanceResponse, error) {
	note, err := s.creditNoteRepo.FindCreditNoteByID(db, companyID, noteID)
	if err != nil {
		return nil, err
	}
	if note.PostedStatus != "posted" || note.ApprovalStatus != "approved" {
		return nil, errors.New("credit note must be operationally posted and approved")
	}
	if note.FinancePostStatus == "posted" {
		return nil, errors.New("credit note is already posted to Finance")
	}
	if err := s.checkDuplicate(db, companyID, "credit_note", noteID); err != nil {
		return nil, err
	}

	settings, err := s.getSettings(db, companyID, &note.BranchID)
	if err != nil {
		return nil, err
	}

	if settings.CreditNoteAdjustmentAccountID == 0 || settings.AccountsReceivableAccountID == 0 {
		return nil, errors.New("Credit Note Adjustment and Accounts Receivable accounts must be configured")
	}
	if note.TaxAmount > 0 && (settings.OutputTaxAccountID == nil || *settings.OutputTaxAccountID == 0) {
		return nil, errors.New("Output Tax account must be configured for credit notes with tax")
	}

	var entries []financeModels.GeneralLedgerEntry
	var debitTotal, creditTotal float64
	netAdjustment := note.SubtotalAmount - note.DiscountAmount

	// Dr Credit Note Adjustment
	entries = append(entries, financeModels.GeneralLedgerEntry{
		CompanyID:       companyID,
		BranchID:        &note.BranchID,
		FinancialYearID: note.FinancialYearID,
		TransactionDate: note.CreditNoteDate,
		SourceType:      "credit_note",
		SourceID:        note.ID,
		SourceNumber:    note.CreditNoteNumber,
		AccountID:       settings.CreditNoteAdjustmentAccountID,
		Description:     "Credit note " + note.CreditNoteNumber + " posted from Invoice Center",
		DebitAmount:     netAdjustment,
	})
	debitTotal += netAdjustment

	// Dr Output Tax
	if note.TaxAmount > 0 {
		entries = append(entries, financeModels.GeneralLedgerEntry{
			CompanyID:       companyID,
			BranchID:        &note.BranchID,
			FinancialYearID: note.FinancialYearID,
			TransactionDate: note.CreditNoteDate,
			SourceType:      "credit_note",
			SourceID:        note.ID,
			SourceNumber:    note.CreditNoteNumber,
			AccountID:       *settings.OutputTaxAccountID,
			Description:     "Credit note " + note.CreditNoteNumber + " tax",
			DebitAmount:     note.TaxAmount,
		})
		debitTotal += note.TaxAmount
	}

	// Cr Accounts Receivable
	entries = append(entries, financeModels.GeneralLedgerEntry{
		CompanyID:       companyID,
		BranchID:        &note.BranchID,
		FinancialYearID: note.FinancialYearID,
		TransactionDate: note.CreditNoteDate,
		SourceType:      "credit_note",
		SourceID:        note.ID,
		SourceNumber:    note.CreditNoteNumber,
		AccountID:       settings.AccountsReceivableAccountID,
		Description:     "Credit note " + note.CreditNoteNumber,
		CreditAmount:    note.TotalAmount,
	})
	creditTotal += note.TotalAmount

	if fmt.Sprintf("%.2f", debitTotal) != fmt.Sprintf("%.2f", creditTotal) {
		return nil, errors.New("generated GL entries are not balanced")
	}

	return s.executeFinancePosting(db, companyID, userID, "credit_note", note.ID, note.CreditNoteNumber, debitTotal, creditTotal, entries, func(tx *gorm.DB, refNum string, t time.Time) error {
		note.FinancePostStatus = "posted"
		note.FinanceReferenceNumber = &refNum
		note.FinancePostedBy = &userID
		note.FinancePostedAt = &t
		return tx.Save(note).Error
	})
}

func (s *InvoiceCenterFinancePostingService) PostDebitNoteToFinance(db *gorm.DB, companyID, noteID, userID uint64) (*dto.PostToFinanceResponse, error) {
	note, err := s.debitNoteRepo.FindDebitNoteByID(db, companyID, noteID)
	if err != nil {
		return nil, err
	}
	if note.PostedStatus != "posted" || note.ApprovalStatus != "approved" {
		return nil, errors.New("debit note must be operationally posted and approved")
	}
	if note.FinancePostStatus == "posted" {
		return nil, errors.New("debit note is already posted to Finance")
	}
	if err := s.checkDuplicate(db, companyID, "debit_note", noteID); err != nil {
		return nil, err
	}

	settings, err := s.getSettings(db, companyID, &note.BranchID)
	if err != nil {
		return nil, err
	}

	if settings.AccountsReceivableAccountID == 0 || settings.DebitNoteIncomeAccountID == 0 {
		return nil, errors.New("Accounts Receivable and Debit Note Income accounts must be configured")
	}
	if note.TaxAmount > 0 && (settings.OutputTaxAccountID == nil || *settings.OutputTaxAccountID == 0) {
		return nil, errors.New("Output Tax account must be configured for debit notes with tax")
	}

	var entries []financeModels.GeneralLedgerEntry
	var debitTotal, creditTotal float64
	netIncome := note.SubtotalAmount - note.DiscountAmount

	// Dr Accounts Receivable
	entries = append(entries, financeModels.GeneralLedgerEntry{
		CompanyID:       companyID,
		BranchID:        &note.BranchID,
		FinancialYearID: note.FinancialYearID,
		TransactionDate: note.DebitNoteDate,
		SourceType:      "debit_note",
		SourceID:        note.ID,
		SourceNumber:    note.DebitNoteNumber,
		AccountID:       settings.AccountsReceivableAccountID,
		Description:     "Debit note " + note.DebitNoteNumber + " posted from Invoice Center",
		DebitAmount:     note.TotalAmount,
	})
	debitTotal += note.TotalAmount

	// Cr Debit Note Income
	entries = append(entries, financeModels.GeneralLedgerEntry{
		CompanyID:       companyID,
		BranchID:        &note.BranchID,
		FinancialYearID: note.FinancialYearID,
		TransactionDate: note.DebitNoteDate,
		SourceType:      "debit_note",
		SourceID:        note.ID,
		SourceNumber:    note.DebitNoteNumber,
		AccountID:       settings.DebitNoteIncomeAccountID,
		Description:     "Debit note " + note.DebitNoteNumber + " income",
		CreditAmount:    netIncome,
	})
	creditTotal += netIncome

	// Cr Output Tax
	if note.TaxAmount > 0 {
		entries = append(entries, financeModels.GeneralLedgerEntry{
			CompanyID:       companyID,
			BranchID:        &note.BranchID,
			FinancialYearID: note.FinancialYearID,
			TransactionDate: note.DebitNoteDate,
			SourceType:      "debit_note",
			SourceID:        note.ID,
			SourceNumber:    note.DebitNoteNumber,
			AccountID:       *settings.OutputTaxAccountID,
			Description:     "Debit note " + note.DebitNoteNumber + " tax",
			CreditAmount:    note.TaxAmount,
		})
		creditTotal += note.TaxAmount
	}

	if fmt.Sprintf("%.2f", debitTotal) != fmt.Sprintf("%.2f", creditTotal) {
		return nil, errors.New("generated GL entries are not balanced")
	}

	return s.executeFinancePosting(db, companyID, userID, "debit_note", note.ID, note.DebitNoteNumber, debitTotal, creditTotal, entries, func(tx *gorm.DB, refNum string, t time.Time) error {
		note.FinancePostStatus = "posted"
		note.FinanceReferenceNumber = &refNum
		note.FinancePostedBy = &userID
		note.FinancePostedAt = &t
		return tx.Save(note).Error
	})
}

func (s *InvoiceCenterFinancePostingService) PostCustomerReceiptToFinance(db *gorm.DB, companyID, receiptID, userID uint64) (*dto.PostToFinanceResponse, error) {
	receipt, err := s.receiptRepo.FindCustomerReceiptByID(db, companyID, receiptID)
	if err != nil {
		return nil, err
	}
	if receipt.PostedStatus != "posted" || receipt.ApprovalStatus != "approved" {
		return nil, errors.New("customer receipt must be operationally posted and approved")
	}
	if receipt.FinancePostStatus == "posted" {
		return nil, errors.New("customer receipt is already posted to Finance")
	}
	if err := s.checkDuplicate(db, companyID, "customer_receipt", receiptID); err != nil {
		return nil, err
	}

	settings, err := s.getSettings(db, companyID, &receipt.BranchID)
	if err != nil {
		return nil, err
	}

	var paymentAccountID *uint64
	switch receipt.PaymentMethod {
	case "cash":
		paymentAccountID = settings.CashAccountID
	case "bank_transfer":
		paymentAccountID = settings.BankTransferAccountID
	case "cheque":
		paymentAccountID = settings.ChequeClearingAccountID
	case "card":
		paymentAccountID = settings.CardClearingAccountID
	case "online":
		paymentAccountID = settings.OnlinePaymentAccountID
	case "other":
		paymentAccountID = settings.OtherReceiptAccountID
	}

	if paymentAccountID == nil || *paymentAccountID == 0 {
		return nil, errors.New("payment method account is not configured in finance settings")
	}
	if receipt.AllocatedAmount > 0 && settings.AccountsReceivableAccountID == 0 {
		return nil, errors.New("Accounts Receivable account must be configured")
	}
	if receipt.UnallocatedAmount > 0 && (settings.CustomerAdvanceAccountID == nil || *settings.CustomerAdvanceAccountID == 0) {
		return nil, errors.New("Customer Advance account must be configured for receipts with unallocated amount")
	}

	var entries []financeModels.GeneralLedgerEntry
	var debitTotal, creditTotal float64

	// Dr Payment Method Account
	entries = append(entries, financeModels.GeneralLedgerEntry{
		CompanyID:       companyID,
		BranchID:        &receipt.BranchID,
		FinancialYearID: receipt.FinancialYearID,
		TransactionDate: receipt.ReceiptDate,
		SourceType:      "customer_receipt",
		SourceID:        receipt.ID,
		SourceNumber:    receipt.ReceiptNumber,
		AccountID:       *paymentAccountID,
		Description:     "Customer receipt " + receipt.ReceiptNumber + " posted from Invoice Center",
		DebitAmount:     receipt.ReceivedAmount,
	})
	debitTotal += receipt.ReceivedAmount

	// Cr Accounts Receivable (Allocated)
	if receipt.AllocatedAmount > 0 {
		entries = append(entries, financeModels.GeneralLedgerEntry{
			CompanyID:       companyID,
			BranchID:        &receipt.BranchID,
			FinancialYearID: receipt.FinancialYearID,
			TransactionDate: receipt.ReceiptDate,
			SourceType:      "customer_receipt",
			SourceID:        receipt.ID,
			SourceNumber:    receipt.ReceiptNumber,
			AccountID:       settings.AccountsReceivableAccountID,
			Description:     "Customer receipt " + receipt.ReceiptNumber + " allocation",
			CreditAmount:    receipt.AllocatedAmount,
		})
		creditTotal += receipt.AllocatedAmount
	}

	// Cr Customer Advance (Unallocated)
	if receipt.UnallocatedAmount > 0 {
		entries = append(entries, financeModels.GeneralLedgerEntry{
			CompanyID:       companyID,
			BranchID:        &receipt.BranchID,
			FinancialYearID: receipt.FinancialYearID,
			TransactionDate: receipt.ReceiptDate,
			SourceType:      "customer_receipt",
			SourceID:        receipt.ID,
			SourceNumber:    receipt.ReceiptNumber,
			AccountID:       *settings.CustomerAdvanceAccountID,
			Description:     "Customer receipt " + receipt.ReceiptNumber + " unallocated",
			CreditAmount:    receipt.UnallocatedAmount,
		})
		creditTotal += receipt.UnallocatedAmount
	}

	if fmt.Sprintf("%.2f", debitTotal) != fmt.Sprintf("%.2f", creditTotal) {
		return nil, errors.New("generated GL entries are not balanced")
	}

	return s.executeFinancePosting(db, companyID, userID, "customer_receipt", receipt.ID, receipt.ReceiptNumber, debitTotal, creditTotal, entries, func(tx *gorm.DB, refNum string, t time.Time) error {
		receipt.FinancePostStatus = "posted"
		receipt.FinanceReferenceNumber = &refNum
		receipt.FinancePostedBy = &userID
		receipt.FinancePostedAt = &t
		return tx.Save(receipt).Error
	})
}

// executeFinancePosting is a helper function to handle the transaction block for creating GL entries, posting tracker, and updating source document
func (s *InvoiceCenterFinancePostingService) executeFinancePosting(
	db *gorm.DB,
	companyID, userID uint64,
	docType string, docID uint64, docNum string,
	debitTotal, creditTotal float64,
	entries []financeModels.GeneralLedgerEntry,
	updateDocumentFn func(tx *gorm.DB, refNum string, t time.Time) error,
) (*dto.PostToFinanceResponse, error) {
	var financeRef string
	now := time.Now()

	err := db.Transaction(func(tx *gorm.DB) error {
		// Create GL Entries
		glRepo := financerepositories.NewGeneralLedgerRepository(tx)
		coaRepo := financerepositories.NewChartOfAccountRepository(tx)
		fyRepo := financerepositories.NewFinancialYearRepository(tx)
		financeAudit := financeServices.NewAuditLogService(tx, s.logger)
		glService := financeServices.NewGeneralLedgerService(glRepo, coaRepo, fyRepo, financeAudit, s.logger)

		if err := glService.PostLedgerEntries(tx, entries); err != nil {
			return err
		}

		// Generate Ref Num
		refNum, err := s.repo.GenerateFinanceReferenceNumberTx(tx, companyID)
		if err != nil {
			return err
		}
		financeRef = refNum

		// Create Tracker
		posting := models.InvoiceCenterFinancePosting{
			CompanyID:              companyID,
			BranchID:               *entries[0].BranchID, // BranchID from entries[0]
			DocumentType:           docType,
			DocumentID:             docID,
			DocumentNumber:         docNum,
			FinanceReferenceNumber: financeRef,
			DebitTotal:             debitTotal,
			CreditTotal:            creditTotal,
			PostingStatus:          "posted",
			PostedBy:               userID,
			PostedAt:               now,
		}
		if err := s.repo.CreateFinancePostingRecordTx(tx, &posting); err != nil {
			return err
		}

		// Update Source Document
		if err := updateDocumentFn(tx, financeRef, now); err != nil {
			return err
		}

		// Audit Log
		auditAction := ""
		switch docType {
		case "sales_invoice":
			auditAction = "SALES_INVOICE_FINANCE_POSTED"
		case "credit_note":
			auditAction = "CREDIT_NOTE_FINANCE_POSTED"
		case "debit_note":
			auditAction = "DEBIT_NOTE_FINANCE_POSTED"
		case "customer_receipt":
			auditAction = "CUSTOMER_RECEIPT_FINANCE_POSTED"
		}
		s.auditService.LogAction(tx, companyID, userID, auditAction, docType+" "+docNum+" posted to Finance", docID)
		s.auditService.LogAction(tx, companyID, userID, "INVOICE_CENTER_FINANCE_POSTING_RECORD_CREATED", "Finance posting record created for "+docNum, posting.ID)
		s.auditService.LogAction(tx, companyID, userID, "INVOICE_CENTER_GL_ENTRY_CREATED", "GL entries created for "+docNum, posting.ID)

		return nil
	})

	if err != nil {
		return nil, err
	}

	return &dto.PostToFinanceResponse{
		FinanceReferenceNumber: financeRef,
		DebitTotal:             debitTotal,
		CreditTotal:            creditTotal,
	}, nil
}
