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

type PettyCashReplenishmentService struct {
	replRepo        *repositories.PettyCashReplenishmentRepository
	fundRepo        *repositories.PettyCashFundRepository
	chartRepo       *repositories.ChartOfAccountRepository
	accountingRepo  *repositories.AccountingPeriodRepository
	auditLogService *AuditLogService
	glService       *GeneralLedgerService
}

func NewPettyCashReplenishmentService(
	replRepo *repositories.PettyCashReplenishmentRepository,
	fundRepo *repositories.PettyCashFundRepository,
	chartRepo *repositories.ChartOfAccountRepository,
	accountingRepo *repositories.AccountingPeriodRepository,
	auditLogService *AuditLogService,
	glService *GeneralLedgerService,
) *PettyCashReplenishmentService {
	return &PettyCashReplenishmentService{
		replRepo:        replRepo,
		fundRepo:        fundRepo,
		chartRepo:       chartRepo,
		accountingRepo:  accountingRepo,
		auditLogService: auditLogService,
		glService:       glService,
	}
}

func (s *PettyCashReplenishmentService) ListPettyCashReplenishments(companyID uint64, fundID *uint64, fyID *uint64, apID *uint64, appStatus string, postStatus string, dateFrom string, dateTo string, search string, page int, limit int) ([]models.PettyCashReplenishment, int64, error) {
	return s.replRepo.FindPettyCashReplenishments(companyID, fundID, fyID, apID, appStatus, postStatus, dateFrom, dateTo, search, page, limit)
}

func (s *PettyCashReplenishmentService) GetPettyCashReplenishmentByID(companyID uint64, id uint64) (*models.PettyCashReplenishment, error) {
	return s.replRepo.FindPettyCashReplenishmentByID(companyID, id)
}

func (s *PettyCashReplenishmentService) CreatePettyCashReplenishment(companyID uint64, userID uint64, req *dto.CreatePettyCashReplenishmentRequest) (*models.PettyCashReplenishment, error) {
	if err := s.ValidatePettyCashReplenishment(companyID, req.PettyCashFundID, req.PaidFromAccountID, req.FinancialYearID, req.AccountingPeriodID, req.ReplenishmentDate); err != nil {
		return nil, err
	}

	replNum, err := s.GeneratePettyCashReplenishmentNumber(companyID)
	if err != nil {
		return nil, err
	}

	repl := &models.PettyCashReplenishment{
		CompanyID:           companyID,
		BranchID:            req.BranchID,
		PettyCashFundID:     req.PettyCashFundID,
		FinancialYearID:     req.FinancialYearID,
		AccountingPeriodID:  req.AccountingPeriodID,
		ReplenishmentNumber: replNum,
		ReplenishmentDate:   req.ReplenishmentDate,
		PaidFromAccountID:   req.PaidFromAccountID,
		ReferenceNumber:     req.ReferenceNumber,
		Description:         req.Description,
		Amount:              req.Amount,
		ApprovalStatus:      "draft",
		PostedStatus:        "unposted",
		Status:              "active",
		CreatedBy:           &userID,
		UpdatedBy:           &userID,
	}

	err = s.replRepo.DB().Transaction(func(tx *gorm.DB) error {
		return s.replRepo.CreatePettyCashReplenishment(tx, repl)
	})

	if err != nil {
		return nil, err
	}

	s.auditLogService.LogAction(companyID, userID, "PETTY_CASH_REPLENISHMENT_CREATED",
		fmt.Sprintf("Created Petty Cash Replenishment: %s", repl.ReplenishmentNumber), repl.ID)

	return repl, nil
}

func (s *PettyCashReplenishmentService) UpdatePettyCashReplenishment(companyID uint64, id uint64, userID uint64, req *dto.UpdatePettyCashReplenishmentRequest) (*models.PettyCashReplenishment, error) {
	repl, err := s.replRepo.FindPettyCashReplenishmentByID(companyID, id)
	if err != nil {
		return nil, err
	}

	if repl.ApprovalStatus != "draft" && repl.ApprovalStatus != "rejected" {
		return nil, errors.New("only draft or rejected replenishments can be updated")
	}

	if err := s.ValidatePettyCashReplenishment(companyID, repl.PettyCashFundID, req.PaidFromAccountID, repl.FinancialYearID, repl.AccountingPeriodID, req.ReplenishmentDate); err != nil {
		return nil, err
	}

	repl.ReplenishmentDate = req.ReplenishmentDate
	repl.PaidFromAccountID = req.PaidFromAccountID
	repl.ReferenceNumber = req.ReferenceNumber
	repl.Description = req.Description
	repl.Amount = req.Amount
	repl.UpdatedBy = &userID

	err = s.replRepo.DB().Transaction(func(tx *gorm.DB) error {
		return s.replRepo.UpdatePettyCashReplenishment(tx, repl)
	})

	if err != nil {
		return nil, err
	}

	s.auditLogService.LogAction(companyID, userID, "PETTY_CASH_REPLENISHMENT_UPDATED",
		fmt.Sprintf("Updated Petty Cash Replenishment: %s", repl.ReplenishmentNumber), repl.ID)

	return repl, nil
}

func (s *PettyCashReplenishmentService) DeletePettyCashReplenishment(companyID uint64, id uint64, userID uint64) error {
	repl, err := s.replRepo.FindPettyCashReplenishmentByID(companyID, id)
	if err != nil {
		return err
	}

	if repl.PostedStatus == "posted" {
		return errors.New("posted replenishments cannot be deleted")
	}

	if repl.ApprovalStatus != "draft" && repl.ApprovalStatus != "rejected" {
		return errors.New("only draft or rejected replenishments can be deleted")
	}

	if err := s.replRepo.SoftDeletePettyCashReplenishment(companyID, id); err != nil {
		return err
	}

	s.auditLogService.LogAction(companyID, userID, "PETTY_CASH_REPLENISHMENT_DELETED",
		fmt.Sprintf("Deleted Petty Cash Replenishment: %s", repl.ReplenishmentNumber), repl.ID)

	return nil
}

func (s *PettyCashReplenishmentService) SubmitPettyCashReplenishment(companyID uint64, id uint64, userID uint64, req *dto.ActionPettyCashReplenishmentRequest) error {
	repl, err := s.replRepo.FindPettyCashReplenishmentByID(companyID, id)
	if err != nil {
		return err
	}

	if repl.ApprovalStatus != "draft" && repl.ApprovalStatus != "rejected" {
		return errors.New("only draft or rejected replenishments can be submitted")
	}

	return s.replRepo.DB().Transaction(func(tx *gorm.DB) error {
		if err := s.replRepo.UpdatePettyCashReplenishmentStatus(tx, companyID, id, map[string]interface{}{
			"approval_status": "pending",
		}); err != nil {
			return err
		}

		approval := &models.PettyCashReplenishmentApproval{
			PettyCashReplenishmentID: repl.ID,
			Action:                   "submitted",
			Remarks:                  req.Remarks,
			ActionBy:                 userID,
			ActionAt:                 time.Now(),
		}
		if err := s.replRepo.CreatePettyCashReplenishmentApprovalRecord(tx, approval); err != nil {
			return err
		}
		return nil
	})
}

func (s *PettyCashReplenishmentService) ApprovePettyCashReplenishment(companyID uint64, id uint64, userID uint64, req *dto.ActionPettyCashReplenishmentRequest) error {
	repl, err := s.replRepo.FindPettyCashReplenishmentByID(companyID, id)
	if err != nil {
		return err
	}

	if repl.ApprovalStatus != "pending" {
		return errors.New("only pending replenishments can be approved")
	}

	now := time.Now()
	return s.replRepo.DB().Transaction(func(tx *gorm.DB) error {
		if err := s.replRepo.UpdatePettyCashReplenishmentStatus(tx, companyID, id, map[string]interface{}{
			"approval_status": "approved",
			"approved_by":     userID,
			"approved_at":     now,
		}); err != nil {
			return err
		}

		approval := &models.PettyCashReplenishmentApproval{
			PettyCashReplenishmentID: repl.ID,
			Action:                   "approved",
			Remarks:                  req.Remarks,
			ActionBy:                 userID,
			ActionAt:                 now,
		}
		return s.replRepo.CreatePettyCashReplenishmentApprovalRecord(tx, approval)
	})
}

func (s *PettyCashReplenishmentService) RejectPettyCashReplenishment(companyID uint64, id uint64, userID uint64, req *dto.ActionPettyCashReplenishmentRequest) error {
	repl, err := s.replRepo.FindPettyCashReplenishmentByID(companyID, id)
	if err != nil {
		return err
	}

	if repl.ApprovalStatus != "pending" {
		return errors.New("only pending replenishments can be rejected")
	}

	if req.Remarks == "" {
		return errors.New("remarks are required for rejection")
	}

	now := time.Now()
	return s.replRepo.DB().Transaction(func(tx *gorm.DB) error {
		if err := s.replRepo.UpdatePettyCashReplenishmentStatus(tx, companyID, id, map[string]interface{}{
			"approval_status": "rejected",
		}); err != nil {
			return err
		}

		approval := &models.PettyCashReplenishmentApproval{
			PettyCashReplenishmentID: repl.ID,
			Action:                   "rejected",
			Remarks:                  req.Remarks,
			ActionBy:                 userID,
			ActionAt:                 now,
		}
		return s.replRepo.CreatePettyCashReplenishmentApprovalRecord(tx, approval)
	})
}

func (s *PettyCashReplenishmentService) PostPettyCashReplenishment(companyID uint64, id uint64, userID uint64) error {
	repl, err := s.replRepo.FindPettyCashReplenishmentByID(companyID, id)
	if err != nil {
		return err
	}

	if repl.ApprovalStatus != "approved" {
		return errors.New("only approved replenishments can be posted")
	}

	if repl.PostedStatus == "posted" {
		return errors.New("replenishment is already posted")
	}

	// Validate accounting period is open
	ap, err := s.accountingRepo.FindByID(companyID, repl.AccountingPeriodID)
	if err != nil || ap.Status != "open" {
		return errors.New("accounting period is not open")
	}

	now := time.Now()
	err = s.replRepo.DB().Transaction(func(tx *gorm.DB) error {
		if err := s.UpdatePettyCashBalanceOnReplenishmentPost(tx, repl); err != nil {
			return err
		}
		if err := s.UpdateAccountBalancesOnReplenishmentPost(tx, repl); err != nil {
			return err
		}

		if err := s.replRepo.UpdatePettyCashReplenishmentStatus(tx, companyID, id, map[string]interface{}{
			"posted_status": "posted",
			"posted_by":     userID,
			"posted_at":     now,
		}); err != nil {
			return err
		}

		approval := &models.PettyCashReplenishmentApproval{
			PettyCashReplenishmentID: repl.ID,
			Action:                   "posted",
			Remarks:                  "Posted to ledger",
			ActionBy:                 userID,
			ActionAt:                 now,
		}
		return s.replRepo.CreatePettyCashReplenishmentApprovalRecord(tx, approval)
	})

	if err != nil {
		return err
	}

	s.auditLogService.LogAction(companyID, userID, "PETTY_CASH_REPLENISHMENT_POSTED",
		fmt.Sprintf("Posted Petty Cash Replenishment: %s", repl.ReplenishmentNumber), repl.ID)

	return nil
}

func (s *PettyCashReplenishmentService) UpdatePettyCashBalanceOnReplenishmentPost(tx *gorm.DB, repl *models.PettyCashReplenishment) error {
	return s.fundRepo.UpdatePettyCashFundBalance(tx, repl.PettyCashFundID, repl.Amount, true) // Always increase
}

func (s *PettyCashReplenishmentService) UpdateAccountBalancesOnReplenishmentPost(tx *gorm.DB, repl *models.PettyCashReplenishment) error {
	// Debit petty cash fund account
	if err := s.replRepo.UpdateAccountBalance(tx, repl.PettyCashFund.ChartAccountID, repl.Amount, true); err != nil {
		return err
	}

	// Credit paid from account
	if err := s.replRepo.UpdateAccountBalance(tx, repl.PaidFromAccountID, repl.Amount, false); err != nil {
		return err
	}
	return nil
}

func (s *PettyCashReplenishmentService) ValidatePettyCashReplenishment(companyID uint64, fundID uint64, accountID uint64, fyID uint64, apID uint64, date string) error {
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

	acc, err := s.chartRepo.FindByID(companyID, accountID)
	if err != nil || acc.Status != "active" {
		return fmt.Errorf("invalid or inactive chart of account ID: %d", accountID)
	}

	return nil
}

func (s *PettyCashReplenishmentService) GeneratePettyCashReplenishmentNumber(companyID uint64) (string, error) {
	lastNum, err := s.replRepo.GetLastPettyCashReplenishmentNumber(companyID)
	if err != nil {
		return "", err
	}

	if lastNum == "" {
		return "PCR-000001", nil
	}

	parts := strings.Split(lastNum, "-")
	if len(parts) == 2 {
		num, err := strconv.Atoi(parts[1])
		if err == nil {
			return fmt.Sprintf("PCR-%06d", num+1), nil
		}
	}
	return "", errors.New("failed to generate petty cash replenishment number")
}
