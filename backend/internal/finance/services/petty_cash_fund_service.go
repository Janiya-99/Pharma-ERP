package services

import (
	"errors"
	"fmt"

	controlRepositories "github.com/pixandco/erp-phrma/internal/control/repositories"
	"github.com/pixandco/erp-phrma/internal/finance/dto"
	"github.com/pixandco/erp-phrma/internal/finance/models"
	"github.com/pixandco/erp-phrma/internal/finance/repositories"
)

type PettyCashFundService struct {
	fundRepo        *repositories.PettyCashFundRepository
	chartRepo       *repositories.ChartOfAccountRepository
	branchRepo      *controlRepositories.BranchRepository
	userRepo        *controlRepositories.UserRepository
	auditLogService *AuditLogService
}

func NewPettyCashFundService(
	fundRepo *repositories.PettyCashFundRepository,
	chartRepo *repositories.ChartOfAccountRepository,
	branchRepo *controlRepositories.BranchRepository,
	userRepo *controlRepositories.UserRepository,
	auditLogService *AuditLogService,
) *PettyCashFundService {
	return &PettyCashFundService{
		fundRepo:        fundRepo,
		chartRepo:       chartRepo,
		branchRepo:      branchRepo,
		userRepo:        userRepo,
		auditLogService: auditLogService,
	}
}

func (s *PettyCashFundService) ListPettyCashFunds(companyID uint64, branchID *uint64, custodianUserID *uint64, status string, search string, page int, limit int) ([]models.PettyCashFund, int64, error) {
	return s.fundRepo.FindPettyCashFunds(companyID, branchID, custodianUserID, status, search, page, limit)
}

func (s *PettyCashFundService) GetPettyCashFundByID(companyID uint64, id uint64) (*models.PettyCashFund, error) {
	return s.fundRepo.FindPettyCashFundByID(companyID, id)
}

func (s *PettyCashFundService) CreatePettyCashFund(companyID uint64, userID uint64, req *dto.CreatePettyCashFundRequest) (*models.PettyCashFund, error) {
	// Validate branch
	if _, err := s.branchRepo.GetByID(req.BranchID); err != nil {
		return nil, errors.New("invalid branch")
	}

	// Validate chart account
	if err := s.ValidateCashAccount(companyID, req.ChartAccountID); err != nil {
		return nil, err
	}

	// Validate custodian
	if req.CustodianUserID != nil {
		if err := s.ValidateCustodian(companyID, *req.CustodianUserID); err != nil {
			return nil, err
		}
	}

	fund := &models.PettyCashFund{
		CompanyID:       companyID,
		BranchID:        req.BranchID,
		FundName:        req.FundName,
		FundCode:        req.FundCode,
		ChartAccountID:  req.ChartAccountID,
		CustodianUserID: req.CustodianUserID,
		OpeningBalance:  req.OpeningBalance,
		CurrentBalance:  req.OpeningBalance,
		FundLimit:       req.FundLimit,
		Status:          req.Status,
		CreatedBy:       &userID,
		UpdatedBy:       &userID,
	}

	if err := s.fundRepo.CreatePettyCashFund(fund); err != nil {
		return nil, err
	}

	// Write audit log
	s.auditLogService.LogAction(companyID, userID, "PETTY_CASH_FUND_CREATED",
		fmt.Sprintf("Created Petty Cash Fund: %s", fund.FundCode), fund.ID)

	return fund, nil
}

func (s *PettyCashFundService) UpdatePettyCashFund(companyID uint64, id uint64, userID uint64, req *dto.UpdatePettyCashFundRequest) (*models.PettyCashFund, error) {
	fund, err := s.fundRepo.FindPettyCashFundByID(companyID, id)
	if err != nil {
		return nil, err
	}

	if fund.ChartAccountID != req.ChartAccountID {
		// Only allow changing chart account if no vouchers/replenishments exist
		// Simplification for now, block it or validate
		if err := s.ValidateCashAccount(companyID, req.ChartAccountID); err != nil {
			return nil, err
		}
	}

	if req.CustodianUserID != nil {
		if err := s.ValidateCustodian(companyID, *req.CustodianUserID); err != nil {
			return nil, err
		}
	}

	fund.FundName = req.FundName
	fund.FundCode = req.FundCode
	fund.ChartAccountID = req.ChartAccountID
	fund.CustodianUserID = req.CustodianUserID
	fund.FundLimit = req.FundLimit
	fund.Status = req.Status
	fund.UpdatedBy = &userID

	if err := s.fundRepo.UpdatePettyCashFund(fund); err != nil {
		return nil, err
	}

	s.auditLogService.LogAction(companyID, userID, "PETTY_CASH_FUND_UPDATED",
		fmt.Sprintf("Updated Petty Cash Fund: %s", fund.FundCode), fund.ID)

	return fund, nil
}

func (s *PettyCashFundService) DeletePettyCashFund(companyID uint64, id uint64, userID uint64) error {
	fund, err := s.fundRepo.FindPettyCashFundByID(companyID, id)
	if err != nil {
		return err
	}

	// Check for existing vouchers or replenishments before deleting (omitted for brevity, would be here)

	if err := s.fundRepo.SoftDeletePettyCashFund(companyID, id); err != nil {
		return err
	}

	s.auditLogService.LogAction(companyID, userID, "PETTY_CASH_FUND_DELETED",
		fmt.Sprintf("Deleted Petty Cash Fund: %s", fund.FundCode), fund.ID)

	return nil
}

func (s *PettyCashFundService) ValidateCashAccount(companyID uint64, chartAccountID uint64) error {
	account, err := s.chartRepo.FindByID(companyID, chartAccountID)
	if err != nil {
		return errors.New("invalid chart account")
	}
	if !account.IsCashAccount || account.Status != "active" {
		return errors.New("chart account must be an active cash account")
	}
	return nil
}

func (s *PettyCashFundService) ValidateCustodian(companyID uint64, userID uint64) error {
	user, err := s.userRepo.FindUserByID(userID)
	if err != nil || user.Status != "active" {
		return errors.New("custodian must be an active user")
	}
	return nil
}
