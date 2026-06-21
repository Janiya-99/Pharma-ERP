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
)

type AccountingPeriodService struct {
	repo         *repositories.AccountingPeriodRepository
	fyRepo       *repositories.FinancialYearRepository
	auditService *services.AuditService
	logger       *zap.Logger
}

func NewAccountingPeriodService(repo *repositories.AccountingPeriodRepository, fyRepo *repositories.FinancialYearRepository, auditService *services.AuditService, logger *zap.Logger) *AccountingPeriodService {
	return &AccountingPeriodService{repo: repo, fyRepo: fyRepo, auditService: auditService, logger: logger}
}

func (s *AccountingPeriodService) List(companyID, financialYearID uint64, status, search string, page, limit int) ([]models.AccountingPeriod, int64, error) {
	return s.repo.List(companyID, financialYearID, status, search, page, limit)
}

func (s *AccountingPeriodService) Create(companyID, userID uint64, req *dto.CreateAccountingPeriodRequest) (*models.AccountingPeriod, error) {
	startDate, err := time.Parse("2006-01-02", req.StartDate)
	if err != nil {
		return nil, errors.New("invalid start_date format")
	}
	endDate, err := time.Parse("2006-01-02", req.EndDate)
	if err != nil {
		return nil, errors.New("invalid end_date format")
	}
	if !startDate.Before(endDate) {
		return nil, errors.New("start_date must be before end_date")
	}

	fy, err := s.fyRepo.FindByID(companyID, req.FinancialYearID)
	if err != nil {
		return nil, errors.New("financial year not found")
	}
	if fy.IsClosed {
		return nil, errors.New("cannot add periods to a closed financial year")
	}
	if startDate.Before(fy.StartDate) || endDate.After(fy.EndDate) {
		return nil, errors.New("period dates must be within the financial year dates")
	}

	ap := &models.AccountingPeriod{
		CompanyID:       companyID,
		FinancialYearID: req.FinancialYearID,
		PeriodName:      req.PeriodName,
		StartDate:       startDate,
		EndDate:         endDate,
		Status:          req.Status,
		CreatedBy:       &userID,
	}

	if err := s.repo.Create(ap); err != nil {
		return nil, err
	}

	s.logAudit(companyID, userID, "ACCOUNTING_PERIOD_CREATED", "accounting_periods", ap.ID, fmt.Sprintf("Created accounting period %s", ap.PeriodName))

	return ap, nil
}

func (s *AccountingPeriodService) Update(companyID, id, userID uint64, req *dto.UpdateAccountingPeriodRequest) (*models.AccountingPeriod, error) {
	ap, err := s.repo.FindByID(companyID, id)
	if err != nil {
		return nil, errors.New("accounting period not found")
	}
	if ap.IsClosed {
		return nil, errors.New("cannot update a closed accounting period")
	}

	startDate, err := time.Parse("2006-01-02", req.StartDate)
	if err != nil {
		return nil, errors.New("invalid start_date format")
	}
	endDate, err := time.Parse("2006-01-02", req.EndDate)
	if err != nil {
		return nil, errors.New("invalid end_date format")
	}
	if !startDate.Before(endDate) {
		return nil, errors.New("start_date must be before end_date")
	}

	fy, err := s.fyRepo.FindByID(companyID, ap.FinancialYearID)
	if err == nil {
		if startDate.Before(fy.StartDate) || endDate.After(fy.EndDate) {
			return nil, errors.New("period dates must be within the financial year dates")
		}
	}

	ap.PeriodName = req.PeriodName
	ap.StartDate = startDate
	ap.EndDate = endDate
	ap.Status = req.Status
	ap.UpdatedBy = &userID

	if err := s.repo.Update(ap); err != nil {
		return nil, err
	}

	s.logAudit(companyID, userID, "ACCOUNTING_PERIOD_UPDATED", "accounting_periods", ap.ID, fmt.Sprintf("Updated accounting period %s", ap.PeriodName))

	return ap, nil
}

func (s *AccountingPeriodService) Close(companyID, id, userID uint64) error {
	ap, err := s.repo.FindByID(companyID, id)
	if err != nil {
		return errors.New("accounting period not found")
	}
	if ap.IsClosed {
		return errors.New("accounting period is already closed")
	}

	ap.IsClosed = true
	ap.UpdatedBy = &userID

	if err := s.repo.Update(ap); err != nil {
		return err
	}

	s.logAudit(companyID, userID, "ACCOUNTING_PERIOD_CLOSED", "accounting_periods", ap.ID, fmt.Sprintf("Closed accounting period %s", ap.PeriodName))

	return nil
}

func (s *AccountingPeriodService) logAudit(companyID, userID uint64, action, entityName string, entityID uint64, description string) {
	s.auditService.LogAction(companyID, nil, &userID, "FINANCE", action, entityName, &entityID, nil, description, "", "")
}
