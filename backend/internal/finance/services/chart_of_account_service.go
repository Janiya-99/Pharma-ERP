package services

import (
	"errors"
	"fmt"

	"github.com/pixandco/erp-phrma/internal/control/services"
	"github.com/pixandco/erp-phrma/internal/finance/dto"
	"github.com/pixandco/erp-phrma/internal/finance/models"
	"github.com/pixandco/erp-phrma/internal/finance/repositories"
	"go.uber.org/zap"
)

type ChartOfAccountService struct {
	repo         *repositories.ChartOfAccountRepository
	classRepo    *repositories.AccountClassificationRepository
	auditService *services.AuditService
	logger       *zap.Logger
}

func NewChartOfAccountService(repo *repositories.ChartOfAccountRepository, classRepo *repositories.AccountClassificationRepository, auditService *services.AuditService, logger *zap.Logger) *ChartOfAccountService {
	return &ChartOfAccountService{repo: repo, classRepo: classRepo, auditService: auditService, logger: logger}
}

func (s *ChartOfAccountService) List(companyID uint64, filters map[string]interface{}, search string, page, limit int) ([]models.ChartOfAccount, int64, error) {
	return s.repo.List(companyID, filters, search, page, limit)
}

func (s *ChartOfAccountService) GetByID(companyID, id uint64) (*models.ChartOfAccount, error) {
	return s.repo.FindByID(companyID, id)
}

func (s *ChartOfAccountService) Create(companyID, userID uint64, req *dto.CreateChartOfAccountRequest) (*models.ChartOfAccount, error) {
	if req.NormalBalance != "Debit" && req.NormalBalance != "Credit" {
		return nil, errors.New("normal_balance must be Debit or Credit")
	}

	existing, _ := s.repo.FindByCode(companyID, req.AccountCode)
	if existing != nil {
		return nil, errors.New("account_code must be unique inside company")
	}

	class, err := s.classRepo.FindByID(companyID, req.AccountClassificationID)
	if err != nil {
		return nil, errors.New("account classification not found")
	}
	if class.Status != "active" {
		return nil, errors.New("account classification must be active")
	}

	if req.ParentAccountID != nil {
		_, err := s.repo.FindByID(companyID, *req.ParentAccountID)
		if err != nil {
			return nil, errors.New("parent account not found")
		}
	}

	coa := &models.ChartOfAccount{
		CompanyID:               companyID,
		BranchID:                req.BranchID,
		AccountCode:             req.AccountCode,
		AccountName:             req.AccountName,
		AccountClassificationID: req.AccountClassificationID,
		ParentAccountID:         req.ParentAccountID,
		AccountLevel:            req.AccountLevel,
		AccountType:             req.AccountType,
		NormalBalance:           req.NormalBalance,
		IsControlAccount:        req.IsControlAccount,
		IsBankAccount:           req.IsBankAccount,
		IsCashAccount:           req.IsCashAccount,
		OpeningBalance:          req.OpeningBalance,
		CurrentBalance:          req.OpeningBalance,
		Status:                  req.Status,
		CreatedBy:               &userID,
	}

	if err := s.repo.Create(coa); err != nil {
		return nil, err
	}

	s.logAudit(companyID, userID, "CHART_OF_ACCOUNT_CREATED", "chart_of_accounts", coa.ID, fmt.Sprintf("Created account %s - %s", coa.AccountCode, coa.AccountName))

	return coa, nil
}

func (s *ChartOfAccountService) Update(companyID, id, userID uint64, req *dto.UpdateChartOfAccountRequest) (*models.ChartOfAccount, error) {
	coa, err := s.repo.FindByID(companyID, id)
	if err != nil {
		return nil, errors.New("account not found")
	}

	if req.NormalBalance != "Debit" && req.NormalBalance != "Credit" {
		return nil, errors.New("normal_balance must be Debit or Credit")
	}

	if req.AccountCode != coa.AccountCode {
		existing, _ := s.repo.FindByCode(companyID, req.AccountCode)
		if existing != nil {
			return nil, errors.New("account_code must be unique inside company")
		}
	}

	if req.AccountClassificationID != coa.AccountClassificationID {
		class, err := s.classRepo.FindByID(companyID, req.AccountClassificationID)
		if err != nil || class.Status != "active" {
			return nil, errors.New("invalid or inactive account classification")
		}
	}

	if req.ParentAccountID != nil {
		if *req.ParentAccountID == coa.ID {
			return nil, errors.New("cannot set self as parent")
		}
		_, err := s.repo.FindByID(companyID, *req.ParentAccountID)
		if err != nil {
			return nil, errors.New("parent account not found")
		}
	}

	coa.BranchID = req.BranchID
	coa.AccountCode = req.AccountCode
	coa.AccountName = req.AccountName
	coa.AccountClassificationID = req.AccountClassificationID
	coa.ParentAccountID = req.ParentAccountID
	coa.AccountLevel = req.AccountLevel
	coa.AccountType = req.AccountType
	coa.NormalBalance = req.NormalBalance
	coa.IsControlAccount = req.IsControlAccount
	coa.IsBankAccount = req.IsBankAccount
	coa.IsCashAccount = req.IsCashAccount
	coa.Status = req.Status
	coa.UpdatedBy = &userID

	if err := s.repo.Update(coa); err != nil {
		return nil, err
	}

	s.logAudit(companyID, userID, "CHART_OF_ACCOUNT_UPDATED", "chart_of_accounts", coa.ID, fmt.Sprintf("Updated account %s", coa.AccountCode))

	return coa, nil
}

func (s *ChartOfAccountService) Delete(companyID, id, userID uint64) error {
	coa, err := s.repo.FindByID(companyID, id)
	if err != nil {
		return errors.New("account not found")
	}

	count, err := s.repo.CountChildren(companyID, id)
	if err != nil {
		return err
	}
	if count > 0 {
		return errors.New("cannot delete account with child accounts")
	}

	if coa.OpeningBalance != 0 {
		return errors.New("cannot delete account with non-zero opening balance")
	}

	coa.UpdatedBy = &userID
	s.repo.Update(coa)

	if err := s.repo.Delete(coa); err != nil {
		return err
	}

	s.logAudit(companyID, userID, "CHART_OF_ACCOUNT_DELETED", "chart_of_accounts", coa.ID, fmt.Sprintf("Deleted account %s", coa.AccountCode))

	return nil
}

func (s *ChartOfAccountService) logAudit(companyID, userID uint64, action, entityName string, entityID uint64, description string) {
	s.auditService.LogAction(companyID, nil, &userID, "FINANCE", action, entityName, &entityID, nil, description, "", "")
}
