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

type OpeningBalanceService struct {
	repo         *repositories.OpeningBalanceRepository
	fyRepo       *repositories.FinancialYearRepository
	coaRepo      *repositories.ChartOfAccountRepository
	glService    *GeneralLedgerService
	auditService *services.AuditService
	logger       *zap.Logger
}

func NewOpeningBalanceService(repo *repositories.OpeningBalanceRepository, fyRepo *repositories.FinancialYearRepository, coaRepo *repositories.ChartOfAccountRepository, glService *GeneralLedgerService, auditService *services.AuditService, logger *zap.Logger) *OpeningBalanceService {
	return &OpeningBalanceService{
		repo:         repo,
		fyRepo:       fyRepo,
		coaRepo:      coaRepo,
		glService:    glService,
		auditService: auditService,
		logger:       logger,
	}
}

func (s *OpeningBalanceService) List(companyID uint64, filters map[string]interface{}, search string, page, limit int) ([]models.OpeningBalance, int64, error) {
	return s.repo.List(companyID, filters, search, page, limit)
}

func (s *OpeningBalanceService) Create(companyID, userID uint64, req *dto.CreateOpeningBalanceRequest) (*models.OpeningBalance, error) {
	if req.DebitAmount > 0 && req.CreditAmount > 0 {
		return nil, errors.New("debit_amount and credit_amount cannot both be greater than zero")
	}

	fy, err := s.fyRepo.FindByID(companyID, req.FinancialYearID)
	if err != nil {
		return nil, errors.New("financial year not found")
	}
	if fy.IsClosed {
		return nil, errors.New("cannot create opening balance for a closed financial year")
	}

	coa, err := s.coaRepo.FindByID(companyID, req.AccountID)
	if err != nil {
		return nil, errors.New("account not found")
	}
	if coa.Status != "active" {
		return nil, errors.New("account must be active")
	}

	existing, _ := s.repo.FindDuplicate(companyID, req.FinancialYearID, req.AccountID, req.BranchID)
	if existing != nil {
		return nil, errors.New("opening balance already exists for this account in the selected financial year")
	}

	ob := &models.OpeningBalance{
		CompanyID:       companyID,
		BranchID:        req.BranchID,
		FinancialYearID: req.FinancialYearID,
		AccountID:       req.AccountID,
		DebitAmount:     req.DebitAmount,
		CreditAmount:    req.CreditAmount,
		Remarks:         req.Remarks,
		Status:          req.Status,
		CreatedBy:       &userID,
	}

	if err := s.repo.Create(ob); err != nil {
		return nil, err
	}

	s.logAudit(companyID, userID, "OPENING_BALANCE_CREATED", "opening_balances", ob.ID, fmt.Sprintf("Created opening balance for account %s", coa.AccountCode))

	return ob, nil
}

func (s *OpeningBalanceService) Update(companyID, id, userID uint64, req *dto.UpdateOpeningBalanceRequest) (*models.OpeningBalance, error) {
	ob, err := s.repo.FindByID(companyID, id)
	if err != nil {
		return nil, errors.New("opening balance not found")
	}

	// Check if FY is closed
	fy, fyErr := s.fyRepo.FindByID(companyID, ob.FinancialYearID)
	if fyErr == nil && fy.IsClosed {
		return nil, errors.New("cannot update opening balance for a closed financial year")
	}

	if req.DebitAmount > 0 && req.CreditAmount > 0 {
		return nil, errors.New("debit_amount and credit_amount cannot both be greater than zero")
	}

	ob.DebitAmount = req.DebitAmount
	ob.CreditAmount = req.CreditAmount
	ob.Remarks = req.Remarks
	ob.Status = req.Status
	ob.UpdatedBy = &userID

	if err := s.repo.Update(ob); err != nil {
		return nil, err
	}

	s.logAudit(companyID, userID, "OPENING_BALANCE_UPDATED", "opening_balances", ob.ID, "Updated opening balance")

	return ob, nil
}

func (s *OpeningBalanceService) Delete(companyID, id, userID uint64) error {
	ob, err := s.repo.FindByID(companyID, id)
	if err != nil {
		return errors.New("opening balance not found")
	}

	// Check if FY is closed
	fy, fyErr := s.fyRepo.FindByID(companyID, ob.FinancialYearID)
	if fyErr == nil && fy.IsClosed {
		return errors.New("cannot delete opening balance for a closed financial year")
	}

	ob.UpdatedBy = &userID
	s.repo.Update(ob)

	if err := s.repo.Delete(ob); err != nil {
		return err
	}

	s.logAudit(companyID, userID, "OPENING_BALANCE_DELETED", "opening_balances", ob.ID, "Deleted opening balance")

	return nil
}

func (s *OpeningBalanceService) logAudit(companyID, userID uint64, action, entityName string, entityID uint64, description string) {
	s.auditService.LogAction(companyID, nil, &userID, "FINANCE", action, entityName, &entityID, nil, description, "", "")
}
