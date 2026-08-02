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

type DebitNoteService struct {
	repo     *repositories.DebitNoteRepository
	auditSvc *AuditLogService
	logger   *zap.Logger
}

func NewDebitNoteService(repo *repositories.DebitNoteRepository, auditSvc *AuditLogService, logger *zap.Logger) *DebitNoteService {
	return &DebitNoteService{
		repo:     repo,
		auditSvc: auditSvc,
		logger:   logger,
	}
}

func (s *DebitNoteService) ListDebitNotes(db *gorm.DB, companyID uint64, filters map[string]interface{}, search string, page, limit int) ([]models.DebitNote, int64, error) {
	return s.repo.FindDebitNotes(db, companyID, filters, search, page, limit)
}

func (s *DebitNoteService) GetDebitNoteByID(db *gorm.DB, companyID, id uint64) (*models.DebitNote, error) {
	return s.repo.FindDebitNoteByID(db, companyID, id)
}

func (s *DebitNoteService) CreateDebitNote(db *gorm.DB, companyID, userID uint64, req *dto.CreateDebitNoteReq) (*models.DebitNote, error) {
	dnDate, err := time.Parse("2006-01-02", req.DebitNoteDate)
	if err != nil {
		return nil, errors.New("invalid debit_note_date format")
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
	}

	noteNumber, err := s.repo.GetLastDebitNoteNumber(db, companyID)
	if err != nil {
		return nil, errors.New("failed to generate debit note number")
	}

	note := &models.DebitNote{
		CompanyID:          companyID,
		BranchID:           req.BranchID,
		CustomerID:         req.CustomerID,
		SalesInvoiceID:     req.SalesInvoiceID,
		FinancialYearID:    req.FinancialYearID,
		AccountingPeriodID: req.AccountingPeriodID,
		DebitNoteNumber:    noteNumber,
		DebitNoteDate:      dnDate,
		DebitNoteType:      req.DebitNoteType,
		ReferenceNumber:    req.ReferenceNumber,
		Reason:             req.Reason,
		Remarks:            req.Remarks,
		ApprovalStatus:     "draft",
		PostedStatus:       "unposted",
		Status:             "active",
		CreatedBy:          &userID,
		UpdatedBy:          &userID,
	}

	if err := s.ValidateDebitNoteLines(db, companyID, req.SalesInvoiceID, req.Lines, note); err != nil {
		return nil, err
	}

	s.CalculateDebitNoteHeaderTotals(note)

	if customer.CreditLimit > 0 {
		projectedBalance := customer.CurrentBalance + note.TotalAmount
		if projectedBalance > customer.CreditLimit {
			return nil, errors.New("debit note amount exceeds customer credit limit")
		}
	}

	if err := s.repo.CreateDebitNoteWithLines(db, note); err != nil {
		s.logger.Error("Failed to create debit note", zap.Error(err))
		return nil, errors.New("failed to create debit note")
	}

	s.auditSvc.LogAction(db, companyID, userID, "DEBIT_NOTE_CREATED", "Debit Note "+noteNumber+" created", note.ID)
	return note, nil
}

func (s *DebitNoteService) UpdateDebitNote(db *gorm.DB, companyID, id, userID uint64, req *dto.UpdateDebitNoteReq) (*models.DebitNote, error) {
	existing, err := s.repo.FindDebitNoteByID(db, companyID, id)
	if err != nil {
		return nil, errors.New("debit note not found")
	}

	if existing.ApprovalStatus != "draft" && existing.ApprovalStatus != "rejected" {
		return nil, errors.New("only draft or rejected debit notes can be updated")
	}

	dnDate, err := time.Parse("2006-01-02", req.DebitNoteDate)
	if err != nil {
		return nil, errors.New("invalid debit_note_date format")
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
	}

	existing.BranchID = req.BranchID
	existing.CustomerID = req.CustomerID
	existing.SalesInvoiceID = req.SalesInvoiceID
	existing.FinancialYearID = req.FinancialYearID
	existing.AccountingPeriodID = req.AccountingPeriodID
	existing.DebitNoteDate = dnDate
	existing.DebitNoteType = req.DebitNoteType
	existing.ReferenceNumber = req.ReferenceNumber
	existing.Reason = req.Reason
	existing.Remarks = req.Remarks
	existing.UpdatedBy = &userID
	existing.ApprovalStatus = "draft" // Reset to draft if it was rejected

	existing.Lines = nil // Will be replaced safely
	if err := s.ValidateDebitNoteLines(db, companyID, req.SalesInvoiceID, req.Lines, existing); err != nil {
		return nil, err
	}

	s.CalculateDebitNoteHeaderTotals(existing)

	if customer.CreditLimit > 0 {
		projectedBalance := customer.CurrentBalance + existing.TotalAmount
		if projectedBalance > customer.CreditLimit {
			return nil, errors.New("debit note amount exceeds customer credit limit")
		}
	}

	if err := s.repo.UpdateDebitNoteWithLines(db, existing); err != nil {
		s.logger.Error("Failed to update debit note", zap.Error(err))
		return nil, errors.New("failed to update debit note")
	}

	s.auditSvc.LogAction(db, companyID, userID, "DEBIT_NOTE_UPDATED", "Debit Note "+existing.DebitNoteNumber+" updated", id)
	return existing, nil
}

func (s *DebitNoteService) DeleteDebitNote(db *gorm.DB, companyID, id, userID uint64) error {
	existing, err := s.repo.FindDebitNoteByID(db, companyID, id)
	if err != nil {
		return errors.New("debit note not found")
	}

	if existing.ApprovalStatus != "draft" && existing.ApprovalStatus != "rejected" {
		return errors.New("only draft or rejected debit notes can be deleted")
	}

	if err := s.repo.SoftDeleteDebitNote(db, companyID, id); err != nil {
		s.logger.Error("Failed to delete debit note", zap.Error(err))
		return errors.New("failed to delete debit note")
	}

	s.auditSvc.LogAction(db, companyID, userID, "DEBIT_NOTE_DELETED", "Debit Note "+existing.DebitNoteNumber+" deleted", id)
	return nil
}

func (s *DebitNoteService) SubmitDebitNote(db *gorm.DB, companyID, id, userID uint64, remarks string) error {
	existing, err := s.repo.FindDebitNoteByID(db, companyID, id)
	if err != nil {
		return errors.New("debit note not found")
	}

	if existing.ApprovalStatus != "draft" && existing.ApprovalStatus != "rejected" {
		return errors.New("only draft or rejected debit notes can be submitted")
	}

	if len(existing.Lines) == 0 {
		return errors.New("debit note must have at least one line")
	}

	if existing.TotalAmount <= 0 {
		return errors.New("total_amount must be greater than 0")
	}

	customer, err := s.repo.ValidateCustomer(db, companyID, existing.CustomerID)
	if err != nil {
		return err
	}

	if existing.SalesInvoiceID != nil {
		_, err = s.repo.ValidateSalesInvoice(db, companyID, *existing.SalesInvoiceID)
		if err != nil {
			return err
		}
	}

	if customer.CreditLimit > 0 {
		projectedBalance := customer.CurrentBalance + existing.TotalAmount
		if projectedBalance > customer.CreditLimit {
			return errors.New("debit note amount exceeds customer credit limit")
		}
	}

	return db.Transaction(func(tx *gorm.DB) error {
		now := time.Now()
		if err := s.repo.UpdateDebitNoteApprovalStatus(tx, companyID, id, "pending", userID, now); err != nil {
			return err
		}

		approval := &models.DebitNoteApproval{
			DebitNoteID: id,
			Action:      "submitted",
			Remarks:     remarks,
			ActionBy:    userID,
			ActionAt:    now,
		}
		if err := s.repo.CreateDebitNoteApprovalRecord(tx, approval); err != nil {
			return err
		}

		s.auditSvc.LogAction(tx, companyID, userID, "DEBIT_NOTE_SUBMITTED", "Debit Note "+existing.DebitNoteNumber+" submitted", id)
		return nil
	})
}

func (s *DebitNoteService) ApproveDebitNote(db *gorm.DB, companyID, id, userID uint64, remarks string) error {
	existing, err := s.repo.FindDebitNoteByID(db, companyID, id)
	if err != nil {
		return errors.New("debit note not found")
	}

	if existing.ApprovalStatus != "pending" {
		return errors.New("only pending debit notes can be approved")
	}

	customer, err := s.repo.ValidateCustomer(db, companyID, existing.CustomerID)
	if err != nil {
		return err
	}

	if existing.SalesInvoiceID != nil {
		_, err = s.repo.ValidateSalesInvoice(db, companyID, *existing.SalesInvoiceID)
		if err != nil {
			return err
		}
	}

	if customer.CreditLimit > 0 {
		projectedBalance := customer.CurrentBalance + existing.TotalAmount
		if projectedBalance > customer.CreditLimit {
			return errors.New("debit note amount exceeds customer credit limit")
		}
	}

	return db.Transaction(func(tx *gorm.DB) error {
		now := time.Now()
		if err := s.repo.UpdateDebitNoteApprovalStatus(tx, companyID, id, "approved", userID, now); err != nil {
			return err
		}

		approval := &models.DebitNoteApproval{
			DebitNoteID: id,
			Action:      "approved",
			Remarks:     remarks,
			ActionBy:    userID,
			ActionAt:    now,
		}
		if err := s.repo.CreateDebitNoteApprovalRecord(tx, approval); err != nil {
			return err
		}

		s.auditSvc.LogAction(tx, companyID, userID, "DEBIT_NOTE_APPROVED", "Debit Note "+existing.DebitNoteNumber+" approved", id)
		return nil
	})
}

func (s *DebitNoteService) RejectDebitNote(db *gorm.DB, companyID, id, userID uint64, remarks string) error {
	existing, err := s.repo.FindDebitNoteByID(db, companyID, id)
	if err != nil {
		return errors.New("debit note not found")
	}

	if existing.ApprovalStatus != "pending" {
		return errors.New("only pending debit notes can be rejected")
	}

	if remarks == "" {
		return errors.New("remarks are required for rejection")
	}

	return db.Transaction(func(tx *gorm.DB) error {
		now := time.Now()
		if err := s.repo.UpdateDebitNoteApprovalStatus(tx, companyID, id, "rejected", userID, now); err != nil {
			return err
		}

		approval := &models.DebitNoteApproval{
			DebitNoteID: id,
			Action:      "rejected",
			Remarks:     remarks,
			ActionBy:    userID,
			ActionAt:    now,
		}
		if err := s.repo.CreateDebitNoteApprovalRecord(tx, approval); err != nil {
			return err
		}

		s.auditSvc.LogAction(tx, companyID, userID, "DEBIT_NOTE_REJECTED", "Debit Note "+existing.DebitNoteNumber+" rejected", id)
		return nil
	})
}

func (s *DebitNoteService) PostDebitNote(db *gorm.DB, companyID, id, userID uint64) error {
	existing, err := s.repo.FindDebitNoteByID(db, companyID, id)
	if err != nil {
		return errors.New("debit note not found")
	}

	if existing.ApprovalStatus != "approved" {
		return errors.New("only approved debit notes can be posted")
	}

	if existing.PostedStatus == "posted" {
		return errors.New("posted debit notes cannot be posted again")
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
	}

	if customer.CreditLimit > 0 {
		projectedBalance := customer.CurrentBalance + existing.TotalAmount
		if projectedBalance > customer.CreditLimit {
			return errors.New("debit note amount exceeds customer credit limit")
		}
	}

	return db.Transaction(func(tx *gorm.DB) error {
		now := time.Now()

		// 1. Update customer balance
		if err := s.repo.UpdateCustomerBalanceAfterDebitNote(tx, companyID, customer.ID, existing.TotalAmount); err != nil {
			return err
		}
		s.auditSvc.LogAction(tx, companyID, userID, "CUSTOMER_BALANCE_INCREASED_BY_DEBIT_NOTE", "Customer balance increased by debit note "+existing.DebitNoteNumber, customer.ID)

		// 2. Update linked invoice if applicable
		if invoice != nil {
			if err := s.repo.UpdateSalesInvoiceBalanceAfterDebitNote(tx, companyID, invoice.ID, existing.TotalAmount); err != nil {
				return err
			}
			s.auditSvc.LogAction(tx, companyID, userID, "SALES_INVOICE_BALANCE_INCREASED_BY_DEBIT_NOTE", "Sales invoice balance increased by debit note "+existing.DebitNoteNumber, invoice.ID)

			newBalance := invoice.BalanceAmount + existing.TotalAmount
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
				s.auditSvc.LogAction(tx, companyID, userID, "SALES_INVOICE_PAYMENT_STATUS_UPDATED_BY_DEBIT_NOTE", "Sales invoice payment status recalculated", invoice.ID)
			}
		}

		// 3. Update Debit Note
		if err := s.repo.UpdateDebitNotePostedStatus(tx, companyID, id, "posted", userID, now); err != nil {
			return err
		}

		approval := &models.DebitNoteApproval{
			DebitNoteID: id,
			Action:      "posted",
			Remarks:     "Posted successfully",
			ActionBy:    userID,
			ActionAt:    now,
		}
		if err := s.repo.CreateDebitNoteApprovalRecord(tx, approval); err != nil {
			return err
		}

		s.auditSvc.LogAction(tx, companyID, userID, "DEBIT_NOTE_POSTED", "Debit Note "+existing.DebitNoteNumber+" posted", id)
		return nil
	})
}

func (s *DebitNoteService) CancelDebitNote(db *gorm.DB, companyID, id, userID uint64, remarks string) error {
	existing, err := s.repo.FindDebitNoteByID(db, companyID, id)
	if err != nil {
		return errors.New("debit note not found")
	}

	if existing.PostedStatus == "posted" {
		return errors.New("posted debit notes cannot be cancelled in this step")
	}

	if remarks == "" {
		return errors.New("remarks are required for cancellation")
	}

	if existing.ApprovalStatus == "cancelled" {
		return errors.New("debit note is already cancelled")
	}

	return db.Transaction(func(tx *gorm.DB) error {
		now := time.Now()
		if err := s.repo.UpdateDebitNoteApprovalStatus(tx, companyID, id, "cancelled", userID, now); err != nil {
			return err
		}

		// Save cancel reason directly
		if err := tx.Model(&models.DebitNote{}).Where("id = ? AND company_id = ?", id, companyID).Update("cancel_reason", remarks).Error; err != nil {
			return err
		}

		approval := &models.DebitNoteApproval{
			DebitNoteID: id,
			Action:      "cancelled",
			Remarks:     remarks,
			ActionBy:    userID,
			ActionAt:    now,
		}
		if err := s.repo.CreateDebitNoteApprovalRecord(tx, approval); err != nil {
			return err
		}

		s.auditSvc.LogAction(tx, companyID, userID, "DEBIT_NOTE_CANCELLED", "Debit Note "+existing.DebitNoteNumber+" cancelled", id)
		return nil
	})
}

func (s *DebitNoteService) ValidateDebitNoteLines(db *gorm.DB, companyID uint64, salesInvoiceID *uint64, lineReqs []dto.DebitNoteLineReq, note *models.DebitNote) error {
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
		}

		lineTotal := (lReq.Quantity * lReq.UnitPrice) - lReq.DiscountAmount + lReq.TaxAmount

		line := models.DebitNoteLine{
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

func (s *DebitNoteService) CalculateDebitNoteHeaderTotals(note *models.DebitNote) {
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
