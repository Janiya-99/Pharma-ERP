package services

import (
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/pixandco/erp-phrma/internal/finance/dto"
	"github.com/pixandco/erp-phrma/internal/finance/models"
	"github.com/pixandco/erp-phrma/internal/finance/repositories"
	"gorm.io/gorm"
)

type PettyCashVoucherService struct {
	voucherRepo     *repositories.PettyCashVoucherRepository
	fundRepo        *repositories.PettyCashFundRepository
	chartRepo       *repositories.ChartOfAccountRepository
	accountingRepo  *repositories.AccountingPeriodRepository
	auditLogService *AuditLogService
	glService       *GeneralLedgerService
}

func NewPettyCashVoucherService(
	voucherRepo *repositories.PettyCashVoucherRepository,
	fundRepo *repositories.PettyCashFundRepository,
	chartRepo *repositories.ChartOfAccountRepository,
	accountingRepo *repositories.AccountingPeriodRepository,
	auditLogService *AuditLogService,
	glService *GeneralLedgerService,
) *PettyCashVoucherService {
	return &PettyCashVoucherService{
		voucherRepo:     voucherRepo,
		fundRepo:        fundRepo,
		chartRepo:       chartRepo,
		accountingRepo:  accountingRepo,
		auditLogService: auditLogService,
		glService:       glService,
	}
}

func (s *PettyCashVoucherService) ListPettyCashVouchers(companyID uint64, fundID *uint64, fyID *uint64, apID *uint64, vType string, appStatus string, postStatus string, dateFrom string, dateTo string, search string, page int, limit int) ([]models.PettyCashVoucher, int64, error) {
	return s.voucherRepo.FindPettyCashVouchers(companyID, fundID, fyID, apID, vType, appStatus, postStatus, dateFrom, dateTo, search, page, limit)
}

func (s *PettyCashVoucherService) GetPettyCashVoucherByID(companyID uint64, id uint64) (*models.PettyCashVoucher, error) {
	return s.voucherRepo.FindPettyCashVoucherByID(companyID, id)
}

func (s *PettyCashVoucherService) CreatePettyCashVoucher(companyID uint64, userID uint64, req *dto.CreatePettyCashVoucherRequest) (*models.PettyCashVoucher, error) {
	if err := s.ValidatePettyCashVoucher(companyID, req.PettyCashFundID, req.FinancialYearID, req.AccountingPeriodID, req.VoucherDate, req.Lines); err != nil {
		return nil, err
	}

	voucherNumber, err := s.GeneratePettyCashVoucherNumber(companyID)
	if err != nil {
		return nil, err
	}

	var totalAmount float64
	var lines []models.PettyCashVoucherLine
	for i, l := range req.Lines {
		totalAmount += l.Amount
		lines = append(lines, models.PettyCashVoucherLine{
			AccountID:       l.AccountID,
			LineDescription: l.LineDescription,
			Amount:          l.Amount,
			LineOrder:       i + 1,
		})
	}

	voucher := &models.PettyCashVoucher{
		CompanyID:          companyID,
		BranchID:           req.BranchID,
		PettyCashFundID:    req.PettyCashFundID,
		FinancialYearID:    req.FinancialYearID,
		AccountingPeriodID: req.AccountingPeriodID,
		VoucherNumber:      voucherNumber,
		VoucherDate:        req.VoucherDate,
		VoucherType:        req.VoucherType,
		PayeeName:          req.PayeeName,
		ReferenceNumber:    req.ReferenceNumber,
		Description:        req.Description,
		TotalAmount:        totalAmount,
		ApprovalStatus:     "draft",
		PostedStatus:       "unposted",
		Status:             "active",
		CreatedBy:          &userID,
		UpdatedBy:          &userID,
		Lines:              lines,
	}

	err = s.voucherRepo.DB().Transaction(func(tx *gorm.DB) error {
		return s.voucherRepo.CreatePettyCashVoucherWithLines(tx, voucher)
	})

	if err != nil {
		return nil, err
	}

	s.auditLogService.LogAction(companyID, userID, "PETTY_CASH_VOUCHER_CREATED",
		fmt.Sprintf("Created Petty Cash Voucher: %s", voucher.VoucherNumber), voucher.ID)

	return voucher, nil
}

func (s *PettyCashVoucherService) UpdatePettyCashVoucher(companyID uint64, id uint64, userID uint64, req *dto.UpdatePettyCashVoucherRequest) (*models.PettyCashVoucher, error) {
	voucher, err := s.voucherRepo.FindPettyCashVoucherByID(companyID, id)
	if err != nil {
		return nil, err
	}

	if voucher.ApprovalStatus != "draft" && voucher.ApprovalStatus != "rejected" {
		return nil, errors.New("only draft or rejected vouchers can be updated")
	}

	if err := s.ValidatePettyCashVoucher(companyID, voucher.PettyCashFundID, voucher.FinancialYearID, voucher.AccountingPeriodID, req.VoucherDate, req.Lines); err != nil {
		return nil, err
	}

	var totalAmount float64
	var lines []models.PettyCashVoucherLine
	for i, l := range req.Lines {
		totalAmount += l.Amount
		lines = append(lines, models.PettyCashVoucherLine{
			PettyCashVoucherID: voucher.ID,
			AccountID:          l.AccountID,
			LineDescription:    l.LineDescription,
			Amount:             l.Amount,
			LineOrder:          i + 1,
		})
	}

	voucher.VoucherDate = req.VoucherDate
	voucher.VoucherType = req.VoucherType
	voucher.PayeeName = req.PayeeName
	voucher.ReferenceNumber = req.ReferenceNumber
	voucher.Description = req.Description
	voucher.TotalAmount = totalAmount
	voucher.UpdatedBy = &userID
	voucher.Lines = lines

	err = s.voucherRepo.DB().Transaction(func(tx *gorm.DB) error {
		return s.voucherRepo.UpdatePettyCashVoucherWithLines(tx, voucher)
	})

	if err != nil {
		return nil, err
	}

	s.auditLogService.LogAction(companyID, userID, "PETTY_CASH_VOUCHER_UPDATED",
		fmt.Sprintf("Updated Petty Cash Voucher: %s", voucher.VoucherNumber), voucher.ID)

	return voucher, nil
}

func (s *PettyCashVoucherService) DeletePettyCashVoucher(companyID uint64, id uint64, userID uint64) error {
	voucher, err := s.voucherRepo.FindPettyCashVoucherByID(companyID, id)
	if err != nil {
		return err
	}

	if voucher.PostedStatus == "posted" {
		return errors.New("posted vouchers cannot be deleted")
	}

	if voucher.ApprovalStatus != "draft" && voucher.ApprovalStatus != "rejected" {
		return errors.New("only draft or rejected vouchers can be deleted")
	}

	if err := s.voucherRepo.SoftDeletePettyCashVoucher(companyID, id); err != nil {
		return err
	}

	s.auditLogService.LogAction(companyID, userID, "PETTY_CASH_VOUCHER_DELETED",
		fmt.Sprintf("Deleted Petty Cash Voucher: %s", voucher.VoucherNumber), voucher.ID)

	return nil
}

func (s *PettyCashVoucherService) SubmitPettyCashVoucher(companyID uint64, id uint64, userID uint64, req *dto.ActionPettyCashVoucherRequest) error {
	voucher, err := s.voucherRepo.FindPettyCashVoucherByID(companyID, id)
	if err != nil {
		return err
	}

	if voucher.ApprovalStatus != "draft" && voucher.ApprovalStatus != "rejected" {
		return errors.New("only draft or rejected vouchers can be submitted")
	}

	if len(voucher.Lines) == 0 || voucher.TotalAmount <= 0 {
		return errors.New("voucher must have at least one line with amount greater than zero")
	}

	return s.voucherRepo.DB().Transaction(func(tx *gorm.DB) error {
		if err := s.voucherRepo.UpdatePettyCashVoucherStatus(tx, companyID, id, map[string]interface{}{
			"approval_status": "pending",
		}); err != nil {
			return err
		}

		approval := &models.PettyCashVoucherApproval{
			PettyCashVoucherID: voucher.ID,
			Action:             "submitted",
			Remarks:            req.Remarks,
			ActionBy:           userID,
			ActionAt:           time.Now(),
		}
		if err := s.voucherRepo.CreatePettyCashVoucherApprovalRecord(tx, approval); err != nil {
			return err
		}
		return nil
	})
}

func (s *PettyCashVoucherService) ApprovePettyCashVoucher(companyID uint64, id uint64, userID uint64, req *dto.ActionPettyCashVoucherRequest) error {
	voucher, err := s.voucherRepo.FindPettyCashVoucherByID(companyID, id)
	if err != nil {
		return err
	}

	if voucher.ApprovalStatus != "pending" {
		return errors.New("only pending vouchers can be approved")
	}

	now := time.Now()
	return s.voucherRepo.DB().Transaction(func(tx *gorm.DB) error {
		if err := s.voucherRepo.UpdatePettyCashVoucherStatus(tx, companyID, id, map[string]interface{}{
			"approval_status": "approved",
			"approved_by":     userID,
			"approved_at":     now,
		}); err != nil {
			return err
		}

		approval := &models.PettyCashVoucherApproval{
			PettyCashVoucherID: voucher.ID,
			Action:             "approved",
			Remarks:            req.Remarks,
			ActionBy:           userID,
			ActionAt:           now,
		}
		return s.voucherRepo.CreatePettyCashVoucherApprovalRecord(tx, approval)
	})
}

func (s *PettyCashVoucherService) RejectPettyCashVoucher(companyID uint64, id uint64, userID uint64, req *dto.ActionPettyCashVoucherRequest) error {
	voucher, err := s.voucherRepo.FindPettyCashVoucherByID(companyID, id)
	if err != nil {
		return err
	}

	if voucher.ApprovalStatus != "pending" {
		return errors.New("only pending vouchers can be rejected")
	}

	if req.Remarks == "" {
		return errors.New("remarks are required for rejection")
	}

	now := time.Now()
	return s.voucherRepo.DB().Transaction(func(tx *gorm.DB) error {
		if err := s.voucherRepo.UpdatePettyCashVoucherStatus(tx, companyID, id, map[string]interface{}{
			"approval_status": "rejected",
		}); err != nil {
			return err
		}

		approval := &models.PettyCashVoucherApproval{
			PettyCashVoucherID: voucher.ID,
			Action:             "rejected",
			Remarks:            req.Remarks,
			ActionBy:           userID,
			ActionAt:           now,
		}
		return s.voucherRepo.CreatePettyCashVoucherApprovalRecord(tx, approval)
	})
}

func (s *PettyCashVoucherService) PostPettyCashVoucher(companyID uint64, id uint64, userID uint64) error {
	voucher, err := s.voucherRepo.FindPettyCashVoucherByID(companyID, id)
	if err != nil {
		return err
	}

	if voucher.ApprovalStatus != "approved" {
		return errors.New("only approved vouchers can be posted")
	}

	if voucher.PostedStatus == "posted" {
		return errors.New("voucher is already posted")
	}

	// Validate accounting period is open
	ap, err := s.accountingRepo.FindByID(companyID, voucher.AccountingPeriodID)
	if err != nil || ap.Status != "open" {
		return errors.New("accounting period is not open")
	}

	now := time.Now()
	err = s.voucherRepo.DB().Transaction(func(tx *gorm.DB) error {
		if err := s.UpdatePettyCashBalanceOnVoucherPost(tx, voucher); err != nil {
			return err
		}
		if err := s.UpdateAccountBalancesOnPettyCashVoucherPost(tx, voucher); err != nil {
			return err
		}

		if err := s.voucherRepo.UpdatePettyCashVoucherStatus(tx, companyID, id, map[string]interface{}{
			"posted_status": "posted",
			"posted_by":     userID,
			"posted_at":     now,
		}); err != nil {
			return err
		}

		approval := &models.PettyCashVoucherApproval{
			PettyCashVoucherID: voucher.ID,
			Action:             "posted",
			Remarks:            "Posted to ledger",
			ActionBy:           userID,
			ActionAt:           now,
		}
		if err := s.voucherRepo.CreatePettyCashVoucherApprovalRecord(tx, approval); err != nil {
			return err
		}

		// General Ledger Posting
		var glEntries []models.GeneralLedgerEntry
		isDebitLines := true
		if voucher.VoucherType == "refund" {
			isDebitLines = false
		}

		for _, line := range voucher.Lines {
			debit := line.Amount
			credit := 0.0
			if !isDebitLines {
				debit = 0.0
				credit = line.Amount
			}
			glEntries = append(glEntries, models.GeneralLedgerEntry{
				CompanyID:          companyID,
				BranchID:           &voucher.BranchID,
				FinancialYearID:    &voucher.FinancialYearID,
				AccountingPeriodID: &voucher.AccountingPeriodID,
				TransactionDate:    func() time.Time { t, _ := time.Parse("2006-01-02", voucher.VoucherDate); return t }(),
				SourceType:         "petty_cash_voucher",
				SourceID:           voucher.ID,
				SourceNumber:       voucher.VoucherNumber,
				AccountID:          line.AccountID,
				Description:        line.LineDescription,
				DebitAmount:        debit,
				CreditAmount:       credit,
				ReferenceNumber:    voucher.ReferenceNumber,
				PostedBy:           &userID,
				PostedAt:           &now,
				Status:             "posted",
			})
		}

		fundDebit := 0.0
		fundCredit := voucher.TotalAmount
		if voucher.VoucherType == "refund" {
			fundDebit = voucher.TotalAmount
			fundCredit = 0.0
		}
		glEntries = append(glEntries, models.GeneralLedgerEntry{
			CompanyID:          companyID,
			BranchID:           &voucher.BranchID,
			FinancialYearID:    &voucher.FinancialYearID,
			AccountingPeriodID: &voucher.AccountingPeriodID,
			TransactionDate:    func() time.Time { t, _ := time.Parse("2006-01-02", voucher.VoucherDate); return t }(),
			SourceType:         "petty_cash_voucher",
			SourceID:           voucher.ID,
			SourceNumber:       voucher.VoucherNumber,
			AccountID:          voucher.PettyCashFund.ChartAccountID,
			Description:        "Petty Cash Voucher: " + voucher.Description,
			DebitAmount:        fundDebit,
			CreditAmount:       fundCredit,
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

	s.auditLogService.LogAction(companyID, userID, "PETTY_CASH_VOUCHER_POSTED",
		fmt.Sprintf("Posted Petty Cash Voucher: %s", voucher.VoucherNumber), voucher.ID)

	return nil
}

func (s *PettyCashVoucherService) UpdatePettyCashBalanceOnVoucherPost(tx *gorm.DB, voucher *models.PettyCashVoucher) error {
	isIncrease := false
	if voucher.VoucherType == "refund" {
		isIncrease = true
	}
	return s.fundRepo.UpdatePettyCashFundBalance(tx, voucher.PettyCashFundID, voucher.TotalAmount, isIncrease)
}

func (s *PettyCashVoucherService) UpdateAccountBalancesOnPettyCashVoucherPost(tx *gorm.DB, voucher *models.PettyCashVoucher) error {
	isDebitLines := true
	if voucher.VoucherType == "refund" {
		isDebitLines = false
	}

	// Update chart account associated with petty cash fund
	if err := s.voucherRepo.UpdateAccountBalance(tx, voucher.PettyCashFund.ChartAccountID, voucher.TotalAmount, !isDebitLines); err != nil {
		return err
	}

	// Update individual line accounts
	for _, line := range voucher.Lines {
		if err := s.voucherRepo.UpdateAccountBalance(tx, line.AccountID, line.Amount, isDebitLines); err != nil {
			return err
		}
	}
	return nil
}

func (s *PettyCashVoucherService) ValidatePettyCashVoucher(companyID uint64, fundID uint64, fyID uint64, apID uint64, date string, lines []dto.PettyCashVoucherLineDTO) error {
	fund, err := s.fundRepo.FindPettyCashFundByID(companyID, fundID)
	if err != nil || fund.Status != "active" {
		return errors.New("invalid or inactive petty cash fund")
	}

	ap, err := s.accountingRepo.FindByID(companyID, apID)
	if err != nil || ap.Status != "open" {
		return errors.New("accounting period is not open")
	}
	if ap.FinancialYearID != fyID {
		return errors.New("accounting period does not belong to the selected financial year")
	}

	for _, l := range lines {
		acc, err := s.chartRepo.FindByID(companyID, l.AccountID)
		if err != nil || acc.Status != "active" {
			return fmt.Errorf("invalid or inactive chart of account ID: %d", l.AccountID)
		}
	}

	return nil
}

func (s *PettyCashVoucherService) GeneratePettyCashVoucherNumber(companyID uint64) (string, error) {
	lastNum, err := s.voucherRepo.GetLastPettyCashVoucherNumber(companyID)
	if err != nil {
		return "", err
	}

	if lastNum == "" {
		return "PCV-000001", nil
	}

	parts := strings.Split(lastNum, "-")
	if len(parts) == 2 {
		num, err := strconv.Atoi(parts[1])
		if err == nil {
			return fmt.Sprintf("PCV-%06d", num+1), nil
		}
	}
	return "", errors.New("failed to generate petty cash voucher number")
}
