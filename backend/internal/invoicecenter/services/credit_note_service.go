package services

import (
	"errors"
	"time"

	"github.com/pixandco/erp-phrma/internal/invoicecenter/dto"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/models"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/repositories"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type CreditNoteService struct {
	repo     *repositories.CreditNoteRepository
	auditSvc *AuditLogService
	logger   *zap.Logger
}

func NewCreditNoteService(repo *repositories.CreditNoteRepository, auditSvc *AuditLogService, logger *zap.Logger) *CreditNoteService {
	return &CreditNoteService{
		repo:     repo,
		auditSvc: auditSvc,
		logger:   logger,
	}
}

func (s *CreditNoteService) ListCreditNotes(db *gorm.DB, companyID uint64, filters map[string]interface{}, search string, page, limit int) ([]models.CreditNote, int64, error) {
	return s.repo.FindCreditNotes(db, companyID, filters, search, page, limit)
}

func (s *CreditNoteService) GetCreditNoteByID(db *gorm.DB, companyID, id uint64) (*models.CreditNote, error) {
	return s.repo.FindCreditNoteByID(db, companyID, id)
}

func (s *CreditNoteService) CreateCreditNote(db *gorm.DB, companyID, userID uint64, req *dto.CreateCreditNoteReq) (*models.CreditNote, error) {
	cnDate, err := time.Parse("2006-01-02", req.CreditNoteDate)
	if err != nil {
		return nil, errors.New("invalid credit_note_date format")
	}

	customer, err := s.repo.ValidateCustomer(db, companyID, req.CustomerID)
	if err != nil {
		return nil, err
	}

	var invoice *models.SalesInvoice
	if req.SalesInvoiceID != nil {
		invoice, err = s.repo.ValidateSalesInvoice(db, companyID, *req.SalesInvoiceID)
		if err != nil {
			return nil, err
		}
		if invoice.CustomerID != req.CustomerID {
			return nil, errors.New("sales invoice does not belong to the selected customer")
		}
		if invoice.BranchID != req.BranchID {
			return nil, errors.New("sales invoice does not belong to the selected branch")
		}
		if invoice.BalanceAmount <= 0 {
			return nil, errors.New("sales invoice has no balance amount to credit")
		}
	}

	noteNumber, err := s.repo.GetLastCreditNoteNumber(db, companyID)
	if err != nil {
		return nil, errors.New("failed to generate credit note number")
	}

	note := &models.CreditNote{
		CompanyID:          companyID,
		BranchID:           req.BranchID,
		CustomerID:         req.CustomerID,
		SalesInvoiceID:     req.SalesInvoiceID,
		FinancialYearID:    req.FinancialYearID,
		AccountingPeriodID: req.AccountingPeriodID,
		CreditNoteNumber:   noteNumber,
		CreditNoteDate:     cnDate,
		CreditNoteType:     req.CreditNoteType,
		ReferenceNumber:    req.ReferenceNumber,
		Reason:             req.Reason,
		Remarks:            req.Remarks,
		ApprovalStatus:     "draft",
		PostedStatus:       "unposted",
		Status:             "active",
		CreatedBy:          &userID,
		UpdatedBy:          &userID,
	}

	if err := s.ValidateCreditNoteLines(db, companyID, req.SalesInvoiceID, req.Lines, note); err != nil {
		return nil, err
	}

	s.CalculateCreditNoteHeaderTotals(note)

	// In Step 54, direct credit notes shouldn't exceed current balance when posting, but we can also block creation here.
	if req.SalesInvoiceID == nil {
		if note.TotalAmount > customer.CurrentBalance {
			return nil, errors.New("Credit note amount cannot exceed customer current balance")
		}
	} else {
		if note.TotalAmount > invoice.BalanceAmount {
			return nil, errors.New("credit note amount cannot exceed invoice balance amount")
		}
	}

	if err := s.repo.CreateCreditNoteWithLines(db, note); err != nil {
		s.logger.Error("Failed to create credit note", zap.Error(err))
		return nil, errors.New("failed to create credit note")
	}

	s.auditSvc.LogAction(db, companyID, userID, "CREDIT_NOTE_CREATED", "Credit Note "+noteNumber+" created", note.ID)
	return note, nil
}

func (s *CreditNoteService) UpdateCreditNote(db *gorm.DB, companyID, id, userID uint64, req *dto.UpdateCreditNoteReq) (*models.CreditNote, error) {
	existing, err := s.repo.FindCreditNoteByID(db, companyID, id)
	if err != nil {
		return nil, errors.New("credit note not found")
	}

	if existing.ApprovalStatus != "draft" && existing.ApprovalStatus != "rejected" {
		return nil, errors.New("only draft or rejected credit notes can be updated")
	}

	cnDate, err := time.Parse("2006-01-02", req.CreditNoteDate)
	if err != nil {
		return nil, errors.New("invalid credit_note_date format")
	}

	customer, err := s.repo.ValidateCustomer(db, companyID, req.CustomerID)
	if err != nil {
		return nil, err
	}

	var invoice *models.SalesInvoice
	if req.SalesInvoiceID != nil {
		invoice, err = s.repo.ValidateSalesInvoice(db, companyID, *req.SalesInvoiceID)
		if err != nil {
			return nil, err
		}
		if invoice.CustomerID != req.CustomerID {
			return nil, errors.New("sales invoice does not belong to the selected customer")
		}
		if invoice.BranchID != req.BranchID {
			return nil, errors.New("sales invoice does not belong to the selected branch")
		}
		if invoice.BalanceAmount <= 0 {
			return nil, errors.New("sales invoice has no balance amount to credit")
		}
	}

	existing.BranchID = req.BranchID
	existing.CustomerID = req.CustomerID
	existing.SalesInvoiceID = req.SalesInvoiceID
	existing.FinancialYearID = req.FinancialYearID
	existing.AccountingPeriodID = req.AccountingPeriodID
	existing.CreditNoteDate = cnDate
	existing.CreditNoteType = req.CreditNoteType
	existing.ReferenceNumber = req.ReferenceNumber
	existing.Reason = req.Reason
	existing.Remarks = req.Remarks
	existing.UpdatedBy = &userID
	existing.ApprovalStatus = "draft" // Reset to draft if it was rejected

	existing.Lines = nil // Will be replaced safely
	if err := s.ValidateCreditNoteLines(db, companyID, req.SalesInvoiceID, req.Lines, existing); err != nil {
		return nil, err
	}

	s.CalculateCreditNoteHeaderTotals(existing)

	if req.SalesInvoiceID == nil {
		if existing.TotalAmount > customer.CurrentBalance {
			return nil, errors.New("Credit note amount cannot exceed customer current balance")
		}
	} else {
		if existing.TotalAmount > invoice.BalanceAmount {
			return nil, errors.New("credit note amount cannot exceed invoice balance amount")
		}
	}

	if err := s.repo.UpdateCreditNoteWithLines(db, existing); err != nil {
		s.logger.Error("Failed to update credit note", zap.Error(err))
		return nil, errors.New("failed to update credit note")
	}

	s.auditSvc.LogAction(db, companyID, userID, "CREDIT_NOTE_UPDATED", "Credit Note "+existing.CreditNoteNumber+" updated", id)
	return existing, nil
}

func (s *CreditNoteService) DeleteCreditNote(db *gorm.DB, companyID, id, userID uint64) error {
	existing, err := s.repo.FindCreditNoteByID(db, companyID, id)
	if err != nil {
		return errors.New("credit note not found")
	}

	if existing.ApprovalStatus != "draft" && existing.ApprovalStatus != "rejected" {
		return errors.New("only draft or rejected credit notes can be deleted")
	}

	if err := s.repo.SoftDeleteCreditNote(db, companyID, id); err != nil {
		s.logger.Error("Failed to delete credit note", zap.Error(err))
		return errors.New("failed to delete credit note")
	}

	s.auditSvc.LogAction(db, companyID, userID, "CREDIT_NOTE_DELETED", "Credit Note "+existing.CreditNoteNumber+" deleted", id)
	return nil
}

func (s *CreditNoteService) SubmitCreditNote(db *gorm.DB, companyID, id, userID uint64, remarks string) error {
	existing, err := s.repo.FindCreditNoteByID(db, companyID, id)
	if err != nil {
		return errors.New("credit note not found")
	}

	if existing.ApprovalStatus != "draft" && existing.ApprovalStatus != "rejected" {
		return errors.New("only draft or rejected credit notes can be submitted")
	}

	if len(existing.Lines) == 0 {
		return errors.New("credit note must have at least one line")
	}

	if existing.TotalAmount <= 0 {
		return errors.New("total_amount must be greater than 0")
	}

	_, err = s.repo.ValidateCustomer(db, companyID, existing.CustomerID)
	if err != nil {
		return err
	}

	if existing.SalesInvoiceID != nil {
		_, err = s.repo.ValidateSalesInvoice(db, companyID, *existing.SalesInvoiceID)
		if err != nil {
			return err
		}
	}

	return db.Transaction(func(tx *gorm.DB) error {
		now := time.Now()
		if err := s.repo.UpdateCreditNoteApprovalStatus(tx, companyID, id, "pending", userID, now); err != nil {
			return err
		}

		approval := &models.CreditNoteApproval{
			CreditNoteID: id,
			Action:       "submitted",
			Remarks:      remarks,
			ActionBy:     userID,
			ActionAt:     now,
		}
		if err := s.repo.CreateCreditNoteApprovalRecord(tx, approval); err != nil {
			return err
		}

		s.auditSvc.LogAction(tx, companyID, userID, "CREDIT_NOTE_SUBMITTED", "Credit Note "+existing.CreditNoteNumber+" submitted", id)
		return nil
	})
}

func (s *CreditNoteService) ApproveCreditNote(db *gorm.DB, companyID, id, userID uint64, remarks string) error {
	existing, err := s.repo.FindCreditNoteByID(db, companyID, id)
	if err != nil {
		return errors.New("credit note not found")
	}

	if existing.ApprovalStatus != "pending" {
		return errors.New("only pending credit notes can be approved")
	}

	customer, err := s.repo.ValidateCustomer(db, companyID, existing.CustomerID)
	if err != nil {
		return err
	}

	if existing.SalesInvoiceID != nil {
		invoice, err := s.repo.ValidateSalesInvoice(db, companyID, *existing.SalesInvoiceID)
		if err != nil {
			return err
		}
		if existing.TotalAmount > invoice.BalanceAmount {
			return errors.New("credit note amount cannot exceed invoice balance amount")
		}
	} else {
		if existing.TotalAmount > customer.CurrentBalance {
			return errors.New("Credit note amount cannot exceed customer current balance")
		}
	}

	return db.Transaction(func(tx *gorm.DB) error {
		now := time.Now()
		if err := s.repo.UpdateCreditNoteApprovalStatus(tx, companyID, id, "approved", userID, now); err != nil {
			return err
		}

		approval := &models.CreditNoteApproval{
			CreditNoteID: id,
			Action:       "approved",
			Remarks:      remarks,
			ActionBy:     userID,
			ActionAt:     now,
		}
		if err := s.repo.CreateCreditNoteApprovalRecord(tx, approval); err != nil {
			return err
		}

		s.auditSvc.LogAction(tx, companyID, userID, "CREDIT_NOTE_APPROVED", "Credit Note "+existing.CreditNoteNumber+" approved", id)
		return nil
	})
}

func (s *CreditNoteService) RejectCreditNote(db *gorm.DB, companyID, id, userID uint64, remarks string) error {
	existing, err := s.repo.FindCreditNoteByID(db, companyID, id)
	if err != nil {
		return errors.New("credit note not found")
	}

	if existing.ApprovalStatus != "pending" {
		return errors.New("only pending credit notes can be rejected")
	}

	if remarks == "" {
		return errors.New("remarks are required for rejection")
	}

	return db.Transaction(func(tx *gorm.DB) error {
		now := time.Now()
		if err := s.repo.UpdateCreditNoteApprovalStatus(tx, companyID, id, "rejected", userID, now); err != nil {
			return err
		}

		approval := &models.CreditNoteApproval{
			CreditNoteID: id,
			Action:       "rejected",
			Remarks:      remarks,
			ActionBy:     userID,
			ActionAt:     now,
		}
		if err := s.repo.CreateCreditNoteApprovalRecord(tx, approval); err != nil {
			return err
		}

		s.auditSvc.LogAction(tx, companyID, userID, "CREDIT_NOTE_REJECTED", "Credit Note "+existing.CreditNoteNumber+" rejected", id)
		return nil
	})
}

func (s *CreditNoteService) PostCreditNote(db *gorm.DB, companyID, id, userID uint64) error {
	existing, err := s.repo.FindCreditNoteByID(db, companyID, id)
	if err != nil {
		return errors.New("credit note not found")
	}

	if existing.ApprovalStatus != "approved" {
		return errors.New("only approved credit notes can be posted")
	}

	if existing.PostedStatus == "posted" {
		return errors.New("posted credit notes cannot be posted again")
	}

	customer, err := s.repo.ValidateCustomer(db, companyID, existing.CustomerID)
	if err != nil {
		return err
	}

	var invoice *models.SalesInvoice
	if existing.SalesInvoiceID != nil {
		invoice, err = s.repo.ValidateSalesInvoice(db, companyID, *existing.SalesInvoiceID)
		if err != nil {
			return err
		}
		if existing.TotalAmount > invoice.BalanceAmount {
			return errors.New("credit note amount cannot exceed invoice balance amount")
		}
	} else {
		if existing.TotalAmount > customer.CurrentBalance {
			return errors.New("Credit note amount cannot exceed customer current balance")
		}
	}

	return db.Transaction(func(tx *gorm.DB) error {
		now := time.Now()

		// 1. Update customer balance
		if err := s.repo.UpdateCustomerBalanceAfterCreditNote(tx, companyID, customer.ID, existing.TotalAmount); err != nil {
			return err
		}
		s.auditSvc.LogAction(tx, companyID, userID, "CUSTOMER_BALANCE_REDUCED_BY_CREDIT_NOTE", "Customer balance reduced by credit note "+existing.CreditNoteNumber, customer.ID)

		// 2. Update linked invoice if applicable
		if invoice != nil {
			if err := s.repo.UpdateSalesInvoiceBalanceAfterCreditNote(tx, companyID, invoice.ID, existing.TotalAmount); err != nil {
				return err
			}
			s.auditSvc.LogAction(tx, companyID, userID, "SALES_INVOICE_BALANCE_REDUCED_BY_CREDIT_NOTE", "Sales invoice balance reduced by credit note "+existing.CreditNoteNumber, invoice.ID)

			newBalance := invoice.BalanceAmount - existing.TotalAmount
			newPaymentStatus := invoice.PaymentStatus

			if newBalance <= 0 {
				newPaymentStatus = "paid"
			} else if invoice.PaidAmount > 0 && newBalance > 0 {
				newPaymentStatus = "partially_paid"
			} else if invoice.PaidAmount == 0 && newBalance > 0 {
				newPaymentStatus = "unpaid"
			}

			if newPaymentStatus != invoice.PaymentStatus {
				if err := s.repo.UpdateSalesInvoicePaymentStatus(tx, companyID, invoice.ID, newPaymentStatus, userID); err != nil {
					return err
				}
				s.auditSvc.LogAction(tx, companyID, userID, "SALES_INVOICE_PAYMENT_STATUS_UPDATED_BY_CREDIT_NOTE", "Sales invoice payment status recalculated", invoice.ID)
			}
		}

		// 3. Update Credit Note
		if err := s.repo.UpdateCreditNotePostedStatus(tx, companyID, id, "posted", userID, now); err != nil {
			return err
		}

		approval := &models.CreditNoteApproval{
			CreditNoteID: id,
			Action:       "posted",
			Remarks:      "Posted successfully",
			ActionBy:     userID,
			ActionAt:     now,
		}
		if err := s.repo.CreateCreditNoteApprovalRecord(tx, approval); err != nil {
			return err
		}

		s.auditSvc.LogAction(tx, companyID, userID, "CREDIT_NOTE_POSTED", "Credit Note "+existing.CreditNoteNumber+" posted", id)
		return nil
	})
}

func (s *CreditNoteService) CancelCreditNote(db *gorm.DB, companyID, id, userID uint64, remarks string) error {
	existing, err := s.repo.FindCreditNoteByID(db, companyID, id)
	if err != nil {
		return errors.New("credit note not found")
	}

	if existing.PostedStatus == "posted" {
		return errors.New("posted credit notes cannot be cancelled in this step")
	}

	if remarks == "" {
		return errors.New("remarks are required for cancellation")
	}

	if existing.ApprovalStatus == "cancelled" {
		return errors.New("credit note is already cancelled")
	}

	return db.Transaction(func(tx *gorm.DB) error {
		now := time.Now()
		if err := s.repo.UpdateCreditNoteApprovalStatus(tx, companyID, id, "cancelled", userID, now); err != nil {
			return err
		}

		// Save cancel reason directly
		if err := tx.Model(&models.CreditNote{}).Where("id = ? AND company_id = ?", id, companyID).Update("cancel_reason", remarks).Error; err != nil {
			return err
		}

		approval := &models.CreditNoteApproval{
			CreditNoteID: id,
			Action:       "cancelled",
			Remarks:      remarks,
			ActionBy:     userID,
			ActionAt:     now,
		}
		if err := s.repo.CreateCreditNoteApprovalRecord(tx, approval); err != nil {
			return err
		}

		s.auditSvc.LogAction(tx, companyID, userID, "CREDIT_NOTE_CANCELLED", "Credit Note "+existing.CreditNoteNumber+" cancelled", id)
		return nil
	})
}

func (s *CreditNoteService) ValidateCreditNoteLines(db *gorm.DB, companyID uint64, salesInvoiceID *uint64, lineReqs []dto.CreditNoteLineReq, note *models.CreditNote) error {
	for i, lReq := range lineReqs {
		if lReq.Quantity < 0 {
			return errors.New("quantity cannot be negative")
		}
		if lReq.UnitPrice < 0 {
			return errors.New("unit_price cannot be negative")
		}
		if lReq.DiscountAmount < 0 {
			return errors.New("discount_amount cannot be negative")
		}
		if lReq.TaxAmount < 0 {
			return errors.New("tax_amount cannot be negative")
		}

		if lReq.Description == "" && lReq.ProductID == nil {
			return errors.New("each line must have description or product_id")
		}

		if lReq.ProductID != nil {
			_, err := s.repo.ValidateProduct(db, companyID, *lReq.ProductID)
			if err != nil {
				return err
			}
		}

		if lReq.SalesInvoiceLineID != nil {
			if salesInvoiceID == nil {
				return errors.New("sales_invoice_line_id provided but no sales_invoice_id provided")
			}
			invLine, err := s.repo.ValidateSalesInvoiceLine(db, *salesInvoiceID, *lReq.SalesInvoiceLineID)
			if err != nil {
				return err
			}
			if lReq.ProductID != nil && *lReq.ProductID != invLine.ProductID {
				return errors.New("product_id does not match linked sales invoice line")
			}
			if lReq.Quantity > invLine.Quantity {
				return errors.New("credit note quantity cannot exceed original invoice line quantity")
			}
		}

		lineTotal := (lReq.Quantity * lReq.UnitPrice) - lReq.DiscountAmount + lReq.TaxAmount

		line := models.CreditNoteLine{
			SalesInvoiceLineID: lReq.SalesInvoiceLineID,
			ProductID:          lReq.ProductID,
			Description:        lReq.Description,
			Quantity:           lReq.Quantity,
			UnitPrice:          lReq.UnitPrice,
			DiscountAmount:     lReq.DiscountAmount,
			TaxAmount:          lReq.TaxAmount,
			LineTotal:          lineTotal,
			LineOrder:          i + 1,
		}

		note.Lines = append(note.Lines, line)
	}

	return nil
}

func (s *CreditNoteService) CalculateCreditNoteHeaderTotals(note *models.CreditNote) {
	subtotal := 0.0
	discount := 0.0
	tax := 0.0
	total := 0.0

	for _, l := range note.Lines {
		subtotal += (l.Quantity * l.UnitPrice)
		discount += l.DiscountAmount
		tax += l.TaxAmount
		total += l.LineTotal
	}

	note.SubtotalAmount = subtotal
	note.DiscountAmount = discount
	note.TaxAmount = tax
	note.TotalAmount = total
}
