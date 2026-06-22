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

type PaymentVoucherService interface {
	ListPaymentVouchers(companyID uint64, filter map[string]interface{}, page, limit int) ([]models.PaymentVoucher, int64, error)
	GetPaymentVoucherByID(companyID, voucherID uint64) (*models.PaymentVoucher, error)
	CreatePaymentVoucher(companyID, branchID, userID uint64, req dto.CreatePaymentVoucherRequest, ip, userAgent string) (*models.PaymentVoucher, error)
	UpdatePaymentVoucher(companyID, branchID, voucherID, userID uint64, req dto.UpdatePaymentVoucherRequest, ip, userAgent string) (*models.PaymentVoucher, error)
	DeletePaymentVoucher(companyID, voucherID, userID uint64, ip, userAgent string) error
	SubmitPaymentVoucher(companyID, voucherID, userID uint64, req dto.PaymentActionRequest, ip, userAgent string) error
	ApprovePaymentVoucher(companyID, voucherID, userID uint64, req dto.PaymentActionRequest, ip, userAgent string) error
	RejectPaymentVoucher(companyID, voucherID, userID uint64, req dto.PaymentActionRequest, ip, userAgent string) error
	PostPaymentVoucher(companyID, voucherID, userID uint64, ip, userAgent string) error
}

type paymentVoucherService struct {
	repo         repositories.PaymentVoucherRepository
	fyRepo       *repositories.FinancialYearRepository
	apRepo       *repositories.AccountingPeriodRepository
	coaRepo      *repositories.ChartOfAccountRepository
	bankTxSvc    *BankTransactionService
	auditService *services.AuditService
	glService    *GeneralLedgerService
	logger       *zap.Logger
}

func NewPaymentVoucherService(
	repo repositories.PaymentVoucherRepository,
	fyRepo *repositories.FinancialYearRepository,
	apRepo *repositories.AccountingPeriodRepository,
	coaRepo *repositories.ChartOfAccountRepository,
	bankTxSvc *BankTransactionService,
	auditService *services.AuditService,
	glService *GeneralLedgerService,
	logger *zap.Logger,
) PaymentVoucherService {
	return &paymentVoucherService{
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

func (s *paymentVoucherService) ListPaymentVouchers(companyID uint64, filter map[string]interface{}, page, limit int) ([]models.PaymentVoucher, int64, error) {
	return s.repo.FindPaymentVouchers(companyID, filter, page, limit)
}

func (s *paymentVoucherService) GetPaymentVoucherByID(companyID, voucherID uint64) (*models.PaymentVoucher, error) {
	return s.repo.FindPaymentVoucherByID(companyID, voucherID)
}

func (s *paymentVoucherService) validateDatesAndAccounts(companyID, fyID, apID, paidFromAccountID uint64, paymentDate string, lines []dto.PaymentVoucherLineRequest) (float64, []models.PaymentVoucherLine, error) {
	fy, err := s.fyRepo.FindByID(companyID, fyID)
	if err != nil || fy.IsClosed {
		return 0, nil, errors.New("financial year is closed or invalid")
	}

	ap, err := s.apRepo.FindByID(companyID, apID)
	if err != nil || ap.IsClosed {
		return 0, nil, errors.New("accounting period is closed or invalid")
	}

	pDate, err := time.Parse("2006-01-02", paymentDate)
	if err != nil {
		return 0, nil, errors.New("invalid payment date format")
	}

	if pDate.Before(ap.StartDate) || pDate.After(ap.EndDate) {
		return 0, nil, errors.New("payment date must fall within the selected accounting period")
	}

	paidFromAcc, err := s.coaRepo.FindByID(companyID, paidFromAccountID)
	if err != nil || paidFromAcc.Status != "active" {
		return 0, nil, errors.New("invalid or inactive paid from account")
	}

	var totalAmount float64
	var voucherLines []models.PaymentVoucherLine

	for i, l := range lines {
		if l.Amount <= 0 {
			return 0, nil, errors.New("line amount must be greater than zero")
		}

		acc, err := s.coaRepo.FindByID(companyID, l.AccountID)
		if err != nil || acc.Status != "active" {
			return 0, nil, fmt.Errorf("invalid or inactive account at line %d", i+1)
		}

		totalAmount += l.Amount

		voucherLines = append(voucherLines, models.PaymentVoucherLine{
			AccountID:       l.AccountID,
			LineDescription: l.LineDescription,
			Amount:          l.Amount,
			LineOrder:       i + 1,
		})
	}

	return totalAmount, voucherLines, nil
}

func (s *paymentVoucherService) CreatePaymentVoucher(companyID, branchID, userID uint64, req dto.CreatePaymentVoucherRequest, ip, userAgent string) (*models.PaymentVoucher, error) {
	totalAmount, lines, err := s.validateDatesAndAccounts(companyID, req.FinancialYearID, req.AccountingPeriodID, req.PaidFromAccountID, req.PaymentDate, req.Lines)
	if err != nil {
		return nil, err
	}

	pDate, _ := time.Parse("2006-01-02", req.PaymentDate)

	var chequeDate *time.Time
	if req.PaymentMethod == "cheque" {
		if req.ChequeNumber == "" {
			return nil, errors.New("cheque number is required for cheque payments")
		}
		if req.ChequeDate == nil || *req.ChequeDate == "" {
			return nil, errors.New("cheque date is required for cheque payments")
		}
		cDate, err := time.Parse("2006-01-02", *req.ChequeDate)
		if err != nil {
			return nil, errors.New("invalid cheque date format")
		}
		chequeDate = &cDate
	}

	lastNum, err := s.repo.GetLastPaymentVoucherNumber(companyID)
	if err != nil {
		return nil, err
	}
	newNum := s.generateNextVoucherNumber(lastNum)

	voucher := models.PaymentVoucher{
		CompanyID:          companyID,
		BranchID:           branchID,
		FinancialYearID:    req.FinancialYearID,
		AccountingPeriodID: req.AccountingPeriodID,
		VoucherNumber:      newNum,
		PaymentDate:        pDate,
		PaymentType:        req.PaymentType,
		PaymentMethod:      req.PaymentMethod,
		SupplierID:         req.SupplierID,
		CustomerID:         req.CustomerID,
		PaidFromAccountID:  req.PaidFromAccountID,
		ChequeNumber:       req.ChequeNumber,
		ChequeDate:         chequeDate,
		ReferenceNumber:    req.ReferenceNumber,
		Description:        req.Description,
		TotalAmount:        totalAmount,
		ApprovalStatus:     "draft",
		PostedStatus:       "unposted",
		Status:             "active",
		CreatedBy:          &userID,
		Lines:              lines,
	}

	if err := s.repo.CreatePaymentVoucherWithLines(&voucher); err != nil {
		return nil, err
	}

	s.auditService.LogAction(companyID, &branchID, &userID, "FINANCE", "PAYMENT_VOUCHER_CREATED", "PaymentVoucher", &voucher.ID, nil, voucher, ip, userAgent)

	return &voucher, nil
}

func (s *paymentVoucherService) UpdatePaymentVoucher(companyID, branchID, voucherID, userID uint64, req dto.UpdatePaymentVoucherRequest, ip, userAgent string) (*models.PaymentVoucher, error) {
	voucher, err := s.repo.FindPaymentVoucherByID(companyID, voucherID)
	if err != nil {
		return nil, err
	}

	if voucher.ApprovalStatus != "draft" && voucher.ApprovalStatus != "rejected" {
		return nil, errors.New("only draft or rejected payment vouchers can be updated")
	}

	totalAmount, lines, err := s.validateDatesAndAccounts(companyID, req.FinancialYearID, req.AccountingPeriodID, req.PaidFromAccountID, req.PaymentDate, req.Lines)
	if err != nil {
		return nil, err
	}

	pDate, _ := time.Parse("2006-01-02", req.PaymentDate)

	var chequeDate *time.Time
	if req.PaymentMethod == "cheque" {
		if req.ChequeNumber == "" {
			return nil, errors.New("cheque number is required for cheque payments")
		}
		if req.ChequeDate == nil || *req.ChequeDate == "" {
			return nil, errors.New("cheque date is required for cheque payments")
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
	voucher.PaymentDate = pDate
	voucher.PaymentType = req.PaymentType
	voucher.PaymentMethod = req.PaymentMethod
	voucher.SupplierID = req.SupplierID
	voucher.CustomerID = req.CustomerID
	voucher.PaidFromAccountID = req.PaidFromAccountID
	voucher.ChequeNumber = req.ChequeNumber
	voucher.ChequeDate = chequeDate
	voucher.ReferenceNumber = req.ReferenceNumber
	voucher.Description = req.Description
	voucher.TotalAmount = totalAmount
	voucher.UpdatedBy = &userID
	voucher.Lines = lines

	if err := s.repo.UpdatePaymentVoucherWithLines(voucher); err != nil {
		return nil, err
	}

	s.auditService.LogAction(companyID, &branchID, &userID, "FINANCE", "PAYMENT_VOUCHER_UPDATED", "PaymentVoucher", &voucher.ID, oldVoucher, voucher, ip, userAgent)

	return voucher, nil
}

func (s *paymentVoucherService) DeletePaymentVoucher(companyID, voucherID, userID uint64, ip, userAgent string) error {
	voucher, err := s.repo.FindPaymentVoucherByID(companyID, voucherID)
	if err != nil {
		return err
	}

	if voucher.ApprovalStatus != "draft" && voucher.ApprovalStatus != "rejected" {
		return errors.New("only draft or rejected payment vouchers can be deleted")
	}

	if err := s.repo.SoftDeletePaymentVoucher(companyID, voucherID); err != nil {
		return err
	}

	s.auditService.LogAction(companyID, &voucher.BranchID, &userID, "FINANCE", "PAYMENT_VOUCHER_DELETED", "PaymentVoucher", &voucher.ID, voucher, nil, ip, userAgent)

	return nil
}

func (s *paymentVoucherService) SubmitPaymentVoucher(companyID, voucherID, userID uint64, req dto.PaymentActionRequest, ip, userAgent string) error {
	voucher, err := s.repo.FindPaymentVoucherByID(companyID, voucherID)
	if err != nil {
		return err
	}

	if voucher.ApprovalStatus != "draft" && voucher.ApprovalStatus != "rejected" {
		return errors.New("only draft or rejected payment vouchers can be submitted")
	}

	if len(voucher.Lines) == 0 {
		return errors.New("payment voucher must have at least one line item to be submitted")
	}

	if voucher.TotalAmount <= 0 {
		return errors.New("total amount must be greater than zero")
	}

	now := time.Now()
	approval := models.PaymentVoucherApproval{
		PaymentVoucherID: voucher.ID,
		Action:           "submitted",
		Remarks:          req.Remarks,
		ActionBy:         userID,
		ActionAt:         &now,
	}

	if err := s.repo.CreatePaymentApprovalRecord(&approval); err != nil {
		return err
	}

	if err := s.repo.UpdatePaymentVoucherStatus(voucher.ID, map[string]interface{}{"approval_status": "pending"}); err != nil {
		return err
	}

	s.auditService.LogAction(companyID, &voucher.BranchID, &userID, "FINANCE", "PAYMENT_VOUCHER_SUBMITTED", "PaymentVoucher", &voucher.ID, nil, nil, ip, userAgent)

	return nil
}

func (s *paymentVoucherService) ApprovePaymentVoucher(companyID, voucherID, userID uint64, req dto.PaymentActionRequest, ip, userAgent string) error {
	voucher, err := s.repo.FindPaymentVoucherByID(companyID, voucherID)
	if err != nil {
		return err
	}

	if voucher.ApprovalStatus != "pending" {
		return errors.New("only pending payment vouchers can be approved")
	}

	now := time.Now()
	approval := models.PaymentVoucherApproval{
		PaymentVoucherID: voucher.ID,
		Action:           "approved",
		Remarks:          req.Remarks,
		ActionBy:         userID,
		ActionAt:         &now,
	}

	if err := s.repo.CreatePaymentApprovalRecord(&approval); err != nil {
		return err
	}

	if err := s.repo.UpdatePaymentVoucherStatus(voucher.ID, map[string]interface{}{
		"approval_status": "approved",
		"approved_by":     userID,
		"approved_at":     now,
	}); err != nil {
		return err
	}

	s.auditService.LogAction(companyID, &voucher.BranchID, &userID, "FINANCE", "PAYMENT_VOUCHER_APPROVED", "PaymentVoucher", &voucher.ID, nil, nil, ip, userAgent)

	return nil
}

func (s *paymentVoucherService) RejectPaymentVoucher(companyID, voucherID, userID uint64, req dto.PaymentActionRequest, ip, userAgent string) error {
	if req.Remarks == "" {
		return errors.New("remarks are required when rejecting")
	}

	voucher, err := s.repo.FindPaymentVoucherByID(companyID, voucherID)
	if err != nil {
		return err
	}

	if voucher.ApprovalStatus != "pending" {
		return errors.New("only pending payment vouchers can be rejected")
	}

	now := time.Now()
	approval := models.PaymentVoucherApproval{
		PaymentVoucherID: voucher.ID,
		Action:           "rejected",
		Remarks:          req.Remarks,
		ActionBy:         userID,
		ActionAt:         &now,
	}

	if err := s.repo.CreatePaymentApprovalRecord(&approval); err != nil {
		return err
	}

	if err := s.repo.UpdatePaymentVoucherStatus(voucher.ID, map[string]interface{}{"approval_status": "rejected"}); err != nil {
		return err
	}

	s.auditService.LogAction(companyID, &voucher.BranchID, &userID, "FINANCE", "PAYMENT_VOUCHER_REJECTED", "PaymentVoucher", &voucher.ID, nil, nil, ip, userAgent)

	return nil
}

func (s *paymentVoucherService) PostPaymentVoucher(companyID, voucherID, userID uint64, ip, userAgent string) error {
	voucher, err := s.repo.FindPaymentVoucherByID(companyID, voucherID)
	if err != nil {
		return err
	}

	if voucher.ApprovalStatus != "approved" {
		return errors.New("only approved payment vouchers can be posted")
	}
	if voucher.PostedStatus != "unposted" {
		return errors.New("payment voucher is already posted")
	}

	ap, err := s.apRepo.FindByID(companyID, voucher.AccountingPeriodID)
	if err != nil || ap.IsClosed {
		return errors.New("accounting period is closed or invalid")
	}

	now := time.Now()

	err = s.repo.GetDB().Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&models.PaymentVoucher{}).Where("id = ?", voucher.ID).Updates(map[string]interface{}{
			"posted_status": "posted",
			"posted_by":     userID,
			"posted_at":     now,
		}).Error; err != nil {
			return err
		}

		// Payment posting accounting logic:
		// For each payment line: Debit line account by amount.
		// For paid_from_account_id: Credit paid_from_account by total_amount.
		for _, line := range voucher.Lines {
			if err := s.repo.UpdateAccountBalance(tx, line.AccountID, line.Amount, true); err != nil {
				return err
			}
		}

		if err := s.repo.UpdateAccountBalance(tx, voucher.PaidFromAccountID, voucher.TotalAmount, false); err != nil {
			return err
		}

		if s.bankTxSvc != nil {
			if err := s.bankTxSvc.CreateBankTransactionFromPayment(tx, companyID, userID, voucher); err != nil {
				return err
			}
		}

		// General Ledger Posting
		var glEntries []models.GeneralLedgerEntry
		for _, line := range voucher.Lines {
			glEntries = append(glEntries, models.GeneralLedgerEntry{
				CompanyID:          companyID,
				BranchID:           &voucher.BranchID,
				FinancialYearID:    &voucher.FinancialYearID,
				AccountingPeriodID: &voucher.AccountingPeriodID,
				TransactionDate:    voucher.PaymentDate,
				SourceType:         "payment_voucher",
				SourceID:           voucher.ID,
				SourceNumber:       voucher.VoucherNumber,
				AccountID:          line.AccountID,
				Description:        line.LineDescription,
				DebitAmount:        line.Amount,
				CreditAmount:       0,
				ReferenceNumber:    voucher.ReferenceNumber,
				PostedBy:           &userID,
				PostedAt:           &now,
				Status:             "posted",
			})
		}

		// Credit side
		glEntries = append(glEntries, models.GeneralLedgerEntry{
			CompanyID:          companyID,
			BranchID:           &voucher.BranchID,
			FinancialYearID:    &voucher.FinancialYearID,
			AccountingPeriodID: &voucher.AccountingPeriodID,
			TransactionDate:    voucher.PaymentDate,
			SourceType:         "payment_voucher",
			SourceID:           voucher.ID,
			SourceNumber:       voucher.VoucherNumber,
			AccountID:          voucher.PaidFromAccountID,
			Description:        "Payment Voucher Paid From: " + voucher.Description,
			DebitAmount:        0,
			CreditAmount:       voucher.TotalAmount,
			ReferenceNumber:    voucher.ReferenceNumber,
			PostedBy:           &userID,
			PostedAt:           &now,
			Status:             "posted",
		})

		if err := s.glService.PostLedgerEntries(tx, glEntries); err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return err
	}

	s.auditService.LogAction(companyID, &voucher.BranchID, &userID, "FINANCE", "PAYMENT_VOUCHER_POSTED", "PaymentVoucher", &voucher.ID, nil, nil, ip, userAgent)

	return nil
}

func (s *paymentVoucherService) generateNextVoucherNumber(lastNum string) string {
	if lastNum == "" {
		return "PV-000001"
	}
	var seq int
	fmt.Sscanf(lastNum, "PV-%06d", &seq)
	seq++
	return fmt.Sprintf("PV-%06d", seq)
}
