package services

import (
	"errors"
	"fmt"
	"time"

	controlRepositories "github.com/pixandco/erp-phrma/internal/control/repositories"
	"github.com/pixandco/erp-phrma/internal/finance/dto"
	"github.com/pixandco/erp-phrma/internal/finance/models"
	"github.com/pixandco/erp-phrma/internal/finance/repositories"
)

type CashAccountService struct {
	cashRepo        *repositories.CashAccountRepository
	chartRepo       *repositories.ChartOfAccountRepository
	branchRepo      *controlRepositories.BranchRepository
	userRepo        *controlRepositories.UserRepository
	auditLogService *AuditLogService
}

func NewCashAccountService(
	cashRepo *repositories.CashAccountRepository,
	chartRepo *repositories.ChartOfAccountRepository,
	branchRepo *controlRepositories.BranchRepository,
	userRepo *controlRepositories.UserRepository,
	auditLogService *AuditLogService,
) *CashAccountService {
	return &CashAccountService{
		cashRepo:        cashRepo,
		chartRepo:       chartRepo,
		branchRepo:      branchRepo,
		userRepo:        userRepo,
		auditLogService: auditLogService,
	}
}

func (s *CashAccountService) ListCashAccounts(companyID uint64, filters map[string]interface{}, page, limit int) ([]models.CashAccount, int64, error) {
	return s.cashRepo.FindCashAccounts(companyID, filters, page, limit)
}

func (s *CashAccountService) GetCashAccountByID(companyID, id uint64) (*models.CashAccount, error) {
	return s.cashRepo.FindCashAccountByID(companyID, id)
}

func (s *CashAccountService) CreateCashAccount(companyID, userID uint64, req dto.CreateCashAccountRequest) (*models.CashAccount, error) {
	if _, err := s.branchRepo.GetByID(req.BranchID); err != nil {
		return nil, errors.New("invalid branch")
	}

	ledgerID, err := s.resolveLedgerAccount(companyID, req.LinkedLedgerAccountID, req.AutoCreateLedger)
	if err != nil {
		return nil, err
	}

	if err := s.validateResponsibleUser(req.ResponsibleUserID); err != nil {
		return nil, err
	}

	openingDate, err := parseOptionalFinanceDate(req.OpeningBalanceDate)
	if err != nil {
		return nil, err
	}

	account := &models.CashAccount{
		CompanyID:             companyID,
		BranchID:              req.BranchID,
		CashAccountName:       req.CashAccountName,
		ResponsibleUserID:     req.ResponsibleUserID,
		LinkedLedgerAccountID: ledgerID,
		AutoCreateLedger:      req.AutoCreateLedger,
		OpeningBalance:        req.OpeningBalance,
		CurrentBalance:        req.OpeningBalance,
		OpeningBalanceDate:    openingDate,
		Status:                req.Status,
		Description:           req.Description,
		CreatedBy:             &userID,
		UpdatedBy:             &userID,
	}
	if account.Status == "" {
		account.Status = "active"
	}

	if err := s.cashRepo.CreateCashAccount(account); err != nil {
		return nil, err
	}

	s.auditLogService.LogAction(companyID, userID, "CASH_ACCOUNT_CREATED",
		fmt.Sprintf("Created Cash Account: %s", account.CashAccountName), account.ID)

	return account, nil
}

func (s *CashAccountService) UpdateCashAccount(companyID, userID, id uint64, req dto.UpdateCashAccountRequest) (*models.CashAccount, error) {
	account, err := s.cashRepo.FindCashAccountByID(companyID, id)
	if err != nil {
		return nil, err
	}

	if _, err := s.branchRepo.GetByID(req.BranchID); err != nil {
		return nil, errors.New("invalid branch")
	}

	ledgerID, err := s.resolveLedgerAccount(companyID, req.LinkedLedgerAccountID, req.AutoCreateLedger)
	if err != nil {
		return nil, err
	}

	if err := s.validateResponsibleUser(req.ResponsibleUserID); err != nil {
		return nil, err
	}

	openingDate, err := parseOptionalFinanceDate(req.OpeningBalanceDate)
	if err != nil {
		return nil, err
	}

	account.BranchID = req.BranchID
	account.CashAccountName = req.CashAccountName
	account.ResponsibleUserID = req.ResponsibleUserID
	account.LinkedLedgerAccountID = ledgerID
	account.AutoCreateLedger = req.AutoCreateLedger
	account.OpeningBalanceDate = openingDate
	account.Status = req.Status
	account.Description = req.Description
	account.UpdatedBy = &userID

	if err := s.cashRepo.UpdateCashAccount(account); err != nil {
		return nil, err
	}

	s.auditLogService.LogAction(companyID, userID, "CASH_ACCOUNT_UPDATED",
		fmt.Sprintf("Updated Cash Account: %s", account.CashAccountName), account.ID)

	return account, nil
}

func (s *CashAccountService) DeactivateCashAccount(companyID, userID, id uint64) (*models.CashAccount, error) {
	account, err := s.cashRepo.FindCashAccountByID(companyID, id)
	if err != nil {
		return nil, err
	}

	account.Status = "inactive"
	account.UpdatedBy = &userID

	if err := s.cashRepo.UpdateCashAccount(account); err != nil {
		return nil, err
	}

	s.auditLogService.LogAction(companyID, userID, "CASH_ACCOUNT_DEACTIVATED",
		fmt.Sprintf("Deactivated Cash Account: %s", account.CashAccountName), account.ID)

	return account, nil
}

func (s *CashAccountService) resolveLedgerAccount(companyID uint64, linkedLedgerAccountID *uint64, autoCreateLedger bool) (uint64, error) {
	if linkedLedgerAccountID == nil || *linkedLedgerAccountID == 0 {
		if autoCreateLedger {
			return 0, errors.New("auto-create ledger is not available yet; select an active cash ledger account")
		}
		return 0, errors.New("linked ledger account is required")
	}

	account, err := s.chartRepo.FindByID(companyID, *linkedLedgerAccountID)
	if err != nil {
		return 0, errors.New("invalid linked ledger account")
	}
	if !account.IsCashAccount || account.Status != "active" {
		return 0, errors.New("linked ledger account must be an active cash account")
	}

	return *linkedLedgerAccountID, nil
}

func (s *CashAccountService) validateResponsibleUser(userID *uint64) error {
	if userID == nil {
		return nil
	}
	user, err := s.userRepo.FindUserByID(*userID)
	if err != nil || user.Status != "active" {
		return errors.New("responsible user must be an active user")
	}
	return nil
}

func parseOptionalFinanceDate(value string) (*time.Time, error) {
	if value == "" {
		return nil, nil
	}

	date, err := time.Parse("2006-01-02", value)
	if err == nil {
		return &date, nil
	}

	date, err = time.Parse(time.RFC3339, value)
	if err != nil {
		return nil, errors.New("invalid opening balance date")
	}
	return &date, nil
}
