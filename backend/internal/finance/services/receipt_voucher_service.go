package services

import (
	"errors"
	"fmt"
	"time"

	"github.com/pixandco/erp-phrma/internal/control/services"
	"github.com/pixandco/erp-phrma/internal/finance/dto"
	"github.com/pixandco/erp-phrma/internal/finance/models"
	"github.com/pixandco/erp-phrma/internal/finance/repositories"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type ReceiptVoucherService interface {
	ListReceiptVouchers(companyID uint64, filter map[string]interface{}, page, limit int) ([]models.ReceiptVoucher, int64, error)
	GetReceiptVoucherByID(companyID, voucherID uint64) (*models.ReceiptVoucher, error)
	CreateReceiptVoucher(companyID, branchID, userID uint64, req dto.CreateReceiptVoucherRequest, ip, userAgent string) (*models.ReceiptVoucher, error)
	UpdateReceiptVoucher(companyID, branchID, voucherID, userID uint64, req dto.UpdateReceiptVoucherRequest, ip, userAgent string) (*models.ReceiptVoucher, error)
	DeleteReceiptVoucher(companyID, voucherID, userID uint64, ip, userAgent string) error
	SubmitReceiptVoucher(companyID, voucherID, userID uint64, req dto.ReceiptActionRequest, ip, userAgent string) error
	ApproveReceiptVoucher(companyID, voucherID, userID uint64, req dto.ReceiptActionRequest, ip, userAgent string) error
	RejectReceiptVoucher(companyID, voucherID, userID uint64, req dto.ReceiptActionRequest, ip, userAgent string) error
	PostReceiptVoucher(companyID, voucherID, userID uint64, ip, userAgent string) error
}

type receiptVoucherService struct {
	repo         repositories.ReceiptVoucherRepository
	fyRepo       *repositories.FinancialYearRepository
	apRepo       *repositories.AccountingPeriodRepository
	coaRepo      *repositories.ChartOfAccountRepository
	bankTxSvc    *BankTransactionService
	auditService *services.AuditService
	glService    *GeneralLedgerService
	logger       *zap.Logger
}

func NewReceiptVoucherService(
	repo repositories.ReceiptVoucherRepository,
	fyRepo *repositories.FinancialYearRepository,
	apRepo *repositories.AccountingPeriodRepository,
	coaRepo *repositories.ChartOfAccountRepository,
	bankTxSvc *BankTransactionService,
	auditService *services.AuditService,
	glService *GeneralLedgerService,
	logger *zap.Logger,
) ReceiptVoucherService {
	return &receiptVoucherService{
		repo:         repo,
		fyRepo:       fyRepo,
		apRepo:       apRepo,
		coaRepo:      coaRepo,
		bankTxSvc:    bankTxSvc,
		auditService: auditService,
		glService:    glService,
		logger:       logger,
	}
}

func (s *receiptVoucherService) ListReceiptVouchers(companyID uint64, filter map[string]interface{}, page, limit int) ([]models.ReceiptVoucher, int64, error) {
	return s.repo.FindReceiptVouchers(companyID, filter, page, limit)
}

func (s *receiptVoucherService) GetReceiptVoucherByID(companyID, voucherID uint64) (*models.ReceiptVoucher, error) {
	return s.repo.FindReceiptVoucherByID(companyID, voucherID)
}

func (s *receiptVoucherService) validateDatesAndAccounts(companyID, fyID, apID, receivedToAccountID uint64, receiptDate string, lines []dto.ReceiptVoucherLineRequest) (float64, []models.ReceiptVoucherLine, error) {
	fy, err := s.fyRepo.FindByID(companyID, fyID)
	if err != nil || fy.IsClosed {
		return 0, nil, errors.New("financial year is closed or invalid")
	}

	ap, err := s.apRepo.FindByID(companyID, apID)
	if err != nil || ap.IsClosed {
		return 0, nil, errors.New("accounting period is closed or invalid")
	}

	rDate, err := time.Parse("2006-01-02", receiptDate)
	if err != nil {
		return 0, nil, errors.New("invalid receipt date format")
	}

	if rDate.Before(ap.StartDate) || rDate.After(ap.EndDate) {
		return 0, nil, errors.New("receipt date must fall within the selected accounting period")
	}

	receivedToAcc, err := s.coaRepo.FindByID(companyID, receivedToAccountID)
	if err != nil || receivedToAcc.Status != "active" {
		return 0, nil, errors.New("invalid or inactive received to account")
	}

	var totalAmount float64
	var voucherLines []models.ReceiptVoucherLine

	for i, l := range lines {
		if l.Amount <= 0 {
			return 0, nil, errors.New("line amount must be greater than zero")
		}

		acc, err := s.coaRepo.FindByID(companyID, l.AccountID)
		if err != nil || acc.Status != "active" {
			return 0, nil, fmt.Errorf("invalid or inactive account at line %d", i+1)
		}

		totalAmount += l.Amount

		voucherLines = append(voucherLines, models.ReceiptVoucherLine{
			AccountID:       l.AccountID,
			LineDescription: l.LineDescription,
			Amount:          l.Amount,
			LineOrder:       i + 1,
		})
	}

	return totalAmount, voucherLines, nil
}

func (s *receiptVoucherService) CreateReceiptVoucher(companyID, branchID, userID uint64, req dto.CreateReceiptVoucherRequest, ip, userAgent string) (*models.ReceiptVoucher, error) {
	totalAmount, lines, err := s.validateDatesAndAccounts(companyID, req.FinancialYearID, req.AccountingPeriodID, req.ReceivedToAccountID, req.ReceiptDate, req.Lines)
	if err != nil {
		return nil, err
	}

	rDate, _ := time.Parse("2006-01-02", req.ReceiptDate)

	var chequeDate *time.Time
	if req.ReceiptMethod == "cheque" {
		if req.ChequeNumber == "" {
			return nil, errors.New("cheque number is required for cheque receipts")
		}
		if req.ChequeDate == nil || *req.ChequeDate == "" {
			return nil, errors.New("cheque date is required for cheque receipts")
		}
		cDate, err := time.Parse("2006-01-02", *req.ChequeDate)
		if err != nil {
			return nil, errors.New("invalid cheque date format")
		}
		chequeDate = &cDate
	}

	lastNum, err := s.repo.GetLastReceiptVoucherNumber(companyID)
	if err != nil {
		return nil, err
	}
	newNum := s.generateNextVoucherNumber(lastNum)

	voucher := models.ReceiptVoucher{
		CompanyID:           companyID,
		BranchID:            branchID,
		FinancialYearID:     req.FinancialYearID,
		AccountingPeriodID:  req.AccountingPeriodID,
		ReceiptNumber:       newNum,
		ReceiptDate:         rDate,
		ReceiptType:         req.ReceiptType,
		ReceiptMethod:       req.ReceiptMethod,
		CustomerID:          req.CustomerID,
		SupplierID:          req.SupplierID,
		ReceivedToAccountID: req.ReceivedToAccountID,
		ChequeNumber:        req.ChequeNumber,
		ChequeDate:          chequeDate,
		ReferenceNumber:     req.ReferenceNumber,
		Description:         req.Description,
		TotalAmount:         totalAmount,
		ApprovalStatus:      "draft",
		PostedStatus:        "unposted",
		Status:              "active",
		CreatedBy:           &userID,
		Lines:               lines,
	}

	if err := s.repo.CreateReceiptVoucherWithLines(&voucher); err != nil {
		return nil, err
	}

	s.auditService.LogAction(companyID, &branchID, &userID, "FINANCE", "RECEIPT_VOUCHER_CREATED", "ReceiptVoucher", &voucher.ID, nil, voucher, ip, userAgent)

	return &voucher, nil
}

func (s *receiptVoucherService) UpdateReceiptVoucher(companyID, branchID, voucherID, userID uint64, req dto.UpdateReceiptVoucherRequest, ip, userAgent string) (*models.ReceiptVoucher, error) {
	voucher, err := s.repo.FindReceiptVoucherByID(companyID, voucherID)
	if err != nil {
		return nil, err
	}

	if voucher.ApprovalStatus != "draft" && voucher.ApprovalStatus != "rejected" {
		return nil, errors.New("only draft or rejected receipt vouchers can be updated")
	}

	totalAmount, lines, err := s.validateDatesAndAccounts(companyID, req.FinancialYearID, req.AccountingPeriodID, req.ReceivedToAccountID, req.ReceiptDate, req.Lines)
	if err != nil {
		return nil, err
	}

	rDate, _ := time.Parse("2006-01-02", req.ReceiptDate)

	var chequeDate *time.Time
	if req.ReceiptMethod == "cheque" {
		if req.ChequeNumber == "" {
			return nil, errors.New("cheque number is required for cheque receipts")
		}
		if req.ChequeDate == nil || *req.ChequeDate == "" {
			return nil, errors.New("cheque date is required for cheque receipts")
		}
		cDate, err := time.Parse("2006-01-02", *req.ChequeDate)
		if err != nil {
			return nil, errors.New("invalid cheque date format")
		}
		chequeDate = &cDate
	}

	oldVoucher := *voucher

	voucher.BranchID = branchID
	voucher.FinancialYearID = req.FinancialYearID
	voucher.AccountingPeriodID = req.AccountingPeriodID
	voucher.ReceiptDate = rDate
	voucher.ReceiptType = req.ReceiptType
	voucher.ReceiptMethod = req.ReceiptMethod
	voucher.CustomerID = req.CustomerID
	voucher.SupplierID = req.SupplierID
	voucher.ReceivedToAccountID = req.ReceivedToAccountID
	voucher.ChequeNumber = req.ChequeNumber
	voucher.ChequeDate = chequeDate
	voucher.ReferenceNumber = req.ReferenceNumber
	voucher.Description = req.Description
	voucher.TotalAmount = totalAmount
	voucher.UpdatedBy = &userID
	voucher.Lines = lines

	if err := s.repo.UpdateReceiptVoucherWithLines(voucher); err != nil {
		return nil, err
	}

	s.auditService.LogAction(companyID, &branchID, &userID, "FINANCE", "RECEIPT_VOUCHER_UPDATED", "ReceiptVoucher", &voucher.ID, oldVoucher, voucher, ip, userAgent)

	return voucher, nil
}

func (s *receiptVoucherService) DeleteReceiptVoucher(companyID, voucherID, userID uint64, ip, userAgent string) error {
	voucher, err := s.repo.FindReceiptVoucherByID(companyID, voucherID)
	if err != nil {
		return err
	}

	if voucher.ApprovalStatus != "draft" && voucher.ApprovalStatus != "rejected" {
		return errors.New("only draft or rejected receipt vouchers can be deleted")
	}

	if err := s.repo.SoftDeleteReceiptVoucher(companyID, voucherID); err != nil {
		return err
	}

	s.auditService.LogAction(companyID, &voucher.BranchID, &userID, "FINANCE", "RECEIPT_VOUCHER_DELETED", "ReceiptVoucher", &voucher.ID, voucher, nil, ip, userAgent)

	return nil
}

func (s *receiptVoucherService) SubmitReceiptVoucher(companyID, voucherID, userID uint64, req dto.ReceiptActionRequest, ip, userAgent string) error {
	voucher, err := s.repo.FindReceiptVoucherByID(companyID, voucherID)
	if err != nil {
		return err
	}

	if voucher.ApprovalStatus != "draft" && voucher.ApprovalStatus != "rejected" {
		return errors.New("only draft or rejected receipt vouchers can be submitted")
	}

	if len(voucher.Lines) == 0 {
		return errors.New("receipt voucher must have at least one line item to be submitted")
	}

	if voucher.TotalAmount <= 0 {
		return errors.New("total amount must be greater than zero")
	}

	now := time.Now()
	approval := models.ReceiptVoucherApproval{
		ReceiptVoucherID: voucher.ID,
		Action:           "submitted",
		Remarks:          req.Remarks,
		ActionBy:         userID,
		ActionAt:         &now,
	}

	if err := s.repo.CreateReceiptApprovalRecord(&approval); err != nil {
		return err
	}

	if err := s.repo.UpdateReceiptVoucherStatus(voucher.ID, map[string]interface{}{"approval_status": "pending"}); err != nil {
		return err
	}

	s.auditService.LogAction(companyID, &voucher.BranchID, &userID, "FINANCE", "RECEIPT_VOUCHER_SUBMITTED", "ReceiptVoucher", &voucher.ID, nil, nil, ip, userAgent)

	return nil
}

func (s *receiptVoucherService) ApproveReceiptVoucher(companyID, voucherID, userID uint64, req dto.ReceiptActionRequest, ip, userAgent string) error {
	voucher, err := s.repo.FindReceiptVoucherByID(companyID, voucherID)
	if err != nil {
		return err
	}

	if voucher.ApprovalStatus != "pending" {
		return errors.New("only pending receipt vouchers can be approved")
	}

	now := time.Now()
	approval := models.ReceiptVoucherApproval{
		ReceiptVoucherID: voucher.ID,
		Action:           "approved",
		Remarks:          req.Remarks,
		ActionBy:         userID,
		ActionAt:         &now,
	}

	if err := s.repo.CreateReceiptApprovalRecord(&approval); err != nil {
		return err
	}

	if err := s.repo.UpdateReceiptVoucherStatus(voucher.ID, map[string]interface{}{
		"approval_status": "approved",
		"approved_by":     userID,
		"approved_at":     now,
	}); err != nil {
		return err
	}

	s.auditService.LogAction(companyID, &voucher.BranchID, &userID, "FINANCE", "RECEIPT_VOUCHER_APPROVED", "ReceiptVoucher", &voucher.ID, nil, nil, ip, userAgent)

	return nil
}

func (s *receiptVoucherService) RejectReceiptVoucher(companyID, voucherID, userID uint64, req dto.ReceiptActionRequest, ip, userAgent string) error {
	if req.Remarks == "" {
		return errors.New("remarks are required when rejecting")
	}

	voucher, err := s.repo.FindReceiptVoucherByID(companyID, voucherID)
	if err != nil {
		return err
	}

	if voucher.ApprovalStatus != "pending" {
		return errors.New("only pending receipt vouchers can be rejected")
	}

	now := time.Now()
	approval := models.ReceiptVoucherApproval{
		ReceiptVoucherID: voucher.ID,
		Action:           "rejected",
		Remarks:          req.Remarks,
		ActionBy:         userID,
		ActionAt:         &now,
	}

	if err := s.repo.CreateReceiptApprovalRecord(&approval); err != nil {
		return err
	}

	if err := s.repo.UpdateReceiptVoucherStatus(voucher.ID, map[string]interface{}{"approval_status": "rejected"}); err != nil {
		return err
	}

	s.auditService.LogAction(companyID, &voucher.BranchID, &userID, "FINANCE", "RECEIPT_VOUCHER_REJECTED", "ReceiptVoucher", &voucher.ID, nil, nil, ip, userAgent)

	return nil
}

func (s *receiptVoucherService) PostReceiptVoucher(companyID, voucherID, userID uint64, ip, userAgent string) error {
	voucher, err := s.repo.FindReceiptVoucherByID(companyID, voucherID)
	if err != nil {
		return err
	}

	if voucher.ApprovalStatus != "approved" {
		return errors.New("only approved receipt vouchers can be posted")
	}
	if voucher.PostedStatus != "unposted" {
		return errors.New("receipt voucher is already posted")
	}

	ap, err := s.apRepo.FindByID(companyID, voucher.AccountingPeriodID)
	if err != nil || ap.IsClosed {
		return errors.New("accounting period is closed or invalid")
	}

	now := time.Now()

	err = s.repo.GetDB().Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&models.ReceiptVoucher{}).Where("id = ?", voucher.ID).Updates(map[string]interface{}{
			"posted_status": "posted",
			"posted_by":     userID,
			"posted_at":     now,
		}).Error; err != nil {
			return err
		}

		// Receipt posting accounting logic:
		// For received_to_account_id: Debit received_to_account by total_amount.
		// For each receipt line: Credit line account by amount.
		if err := s.repo.UpdateAccountBalance(tx, voucher.ReceivedToAccountID, voucher.TotalAmount, true); err != nil {
			return err
		}

		for _, line := range voucher.Lines {
			if err := s.repo.UpdateAccountBalance(tx, line.AccountID, line.Amount, false); err != nil {
				return err
			}
		}

		if s.bankTxSvc != nil {
			if err := s.bankTxSvc.CreateBankTransactionFromReceipt(tx, companyID, userID, voucher); err != nil {
				return err
			}
		}

		// General Ledger Posting
		var glEntries []models.GeneralLedgerEntry
		// Debit side (received to account)
		glEntries = append(glEntries, models.GeneralLedgerEntry{
			CompanyID:          companyID,
			BranchID:           &voucher.BranchID,
			FinancialYearID:    &voucher.FinancialYearID,
			AccountingPeriodID: &voucher.AccountingPeriodID,
			TransactionDate:    voucher.ReceiptDate,
			SourceType:         "receipt_voucher",
			SourceID:           voucher.ID,
			SourceNumber:       voucher.ReceiptNumber,
			AccountID:          voucher.ReceivedToAccountID,
			Description:        "Receipt Voucher Received To: " + voucher.Description,
			DebitAmount:        voucher.TotalAmount,
			CreditAmount:       0,
			ReferenceNumber:    voucher.ReferenceNumber,
			PostedBy:           &userID,
			PostedAt:           &now,
			Status:             "posted",
		})

		// Credit side (each line)
		for _, line := range voucher.Lines {
			glEntries = append(glEntries, models.GeneralLedgerEntry{
				CompanyID:          companyID,
				BranchID:           &voucher.BranchID,
				FinancialYearID:    &voucher.FinancialYearID,
				AccountingPeriodID: &voucher.AccountingPeriodID,
				TransactionDate:    voucher.ReceiptDate,
				SourceType:         "receipt_voucher",
				SourceID:           voucher.ID,
				SourceNumber:       voucher.ReceiptNumber,
				AccountID:          line.AccountID,
				Description:        line.LineDescription,
				DebitAmount:        0,
				CreditAmount:       line.Amount,
				ReferenceNumber:    voucher.ReferenceNumber,
				PostedBy:           &userID,
				PostedAt:           &now,
				Status:             "posted",
			})
		}

		if err := s.glService.PostLedgerEntries(tx, glEntries); err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return err
	}

	s.auditService.LogAction(companyID, &voucher.BranchID, &userID, "FINANCE", "RECEIPT_VOUCHER_POSTED", "ReceiptVoucher", &voucher.ID, nil, nil, ip, userAgent)

	return nil
}

func (s *receiptVoucherService) generateNextVoucherNumber(lastNum string) string {
	if lastNum == "" {
		return "RV-000001"
	}
	var seq int
	fmt.Sscanf(lastNum, "RV-%06d", &seq)
	seq++
	return fmt.Sprintf("RV-%06d", seq)
}
