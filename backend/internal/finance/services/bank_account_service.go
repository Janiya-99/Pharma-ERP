package services

import (
	"errors"

	"github.com/pixandco/erp-phrma/internal/finance/dto"
	"github.com/pixandco/erp-phrma/internal/finance/models"
	"github.com/pixandco/erp-phrma/internal/finance/repositories"
)

type BankAccountService struct {
	bankRepo *repositories.BankAccountRepository
	coaRepo  *repositories.ChartOfAccountRepository
	auditSvc *AuditLogService
}

func NewBankAccountService(bankRepo *repositories.BankAccountRepository, coaRepo *repositories.ChartOfAccountRepository, auditSvc *AuditLogService) *BankAccountService {
	return &BankAccountService{
		bankRepo: bankRepo,
		coaRepo:  coaRepo,
		auditSvc: auditSvc,
	}
}

func (s *BankAccountService) ListBankAccounts(companyID uint64, filters map[string]interface{}, page, limit int) ([]models.BankAccount, int64, error) {
	return s.bankRepo.FindBankAccounts(companyID, filters, page, limit)
}

func (s *BankAccountService) GetBankAccountByID(companyID, id uint64) (*models.BankAccount, error) {
	return s.bankRepo.FindBankAccountByID(companyID, id)
}

func (s *BankAccountService) CreateBankAccount(companyID, userID uint64, req dto.CreateBankAccountRequest) (*models.BankAccount, error) {
	coa, err := s.coaRepo.FindByID(companyID, req.ChartAccountID)
	if err != nil {
		return nil, errors.New("invalid chart account selected")
	}

	if !coa.IsBankAccount {
		return nil, errors.New("selected chart account is not a bank account")
	}

	account := &models.BankAccount{
		CompanyID:      companyID,
		BranchID:       req.BranchID,
		ChartAccountID: req.ChartAccountID,
		BankName:       req.BankName,
		BankBranchName: req.BankBranchName,
		AccountName:    req.AccountName,
		AccountNumber:  req.AccountNumber,
		SwiftCode:      req.SwiftCode,
		BankCode:       req.BankCode,
		BranchCode:     req.BranchCode,
		OpeningBalance: req.OpeningBalance,
		CurrentBalance: req.OpeningBalance,
		IsDefault:      req.IsDefault,
		Status:         req.Status,
		CreatedBy:      &userID,
		UpdatedBy:      &userID,
	}

	if account.Status == "" {
		account.Status = "active"
	}

	if err := s.bankRepo.CreateBankAccount(account); err != nil {
		return nil, err
	}

	if account.IsDefault {
		_ = s.bankRepo.UnsetOtherDefaultAccounts(companyID, account.ID)
	}

	s.auditSvc.LogAction(companyID, userID, "BANK_ACCOUNT_CREATED", "Bank account created", account.ID)

	return account, nil
}

func (s *BankAccountService) UpdateBankAccount(companyID, userID, id uint64, req dto.UpdateBankAccountRequest) (*models.BankAccount, error) {
	account, err := s.bankRepo.FindBankAccountByID(companyID, id)
	if err != nil {
		return nil, err
	}

	if account.ChartAccountID != req.ChartAccountID {
		coa, err := s.coaRepo.FindByID(companyID, req.ChartAccountID)
		if err != nil {
			return nil, errors.New("invalid chart account selected")
		}

		if !coa.IsBankAccount {
			return nil, errors.New("selected chart account is not a bank account")
		}
		account.ChartAccountID = req.ChartAccountID
	}

	account.BranchID = req.BranchID
	account.BankName = req.BankName
	account.BankBranchName = req.BankBranchName
	account.AccountName = req.AccountName
	account.AccountNumber = req.AccountNumber
	account.SwiftCode = req.SwiftCode
	account.BankCode = req.BankCode
	account.BranchCode = req.BranchCode
	account.IsDefault = req.IsDefault
	account.Status = req.Status
	account.UpdatedBy = &userID

	if err := s.bankRepo.UpdateBankAccount(account); err != nil {
		return nil, err
	}

	if account.IsDefault {
		_ = s.bankRepo.UnsetOtherDefaultAccounts(companyID, account.ID)
	}

	s.auditSvc.LogAction(companyID, userID, "BANK_ACCOUNT_UPDATED", "Bank account updated", account.ID)

	return account, nil
}

func (s *BankAccountService) DeleteBankAccount(companyID, userID, id uint64) error {
	account, err := s.bankRepo.FindBankAccountByID(companyID, id)
	if err != nil {
		return err
	}

	if account.CurrentBalance != account.OpeningBalance {
		return errors.New("cannot delete bank account with active transactions")
	}

	if err := s.bankRepo.SoftDeleteBankAccount(account); err != nil {
		return err
	}

	s.auditSvc.LogAction(companyID, userID, "BANK_ACCOUNT_DELETED", "Bank account deleted", account.ID)
	return nil
}

func (s *BankAccountService) ValidateChartAccountIsBankAccount(companyID, chartAccountID uint64) error {
	coa, err := s.coaRepo.FindByID(companyID, chartAccountID)
	if err != nil {
		return errors.New("invalid chart account")
	}
	if !coa.IsBankAccount {
		return errors.New("selected chart account is not a bank account")
	}
	return nil
}
