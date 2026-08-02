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

type FinancialYearService struct {
	repo         *repositories.FinancialYearRepository
	auditService *services.AuditService
	logger       *zap.Logger
}

func NewFinancialYearService(repo *repositories.FinancialYearRepository, auditService *services.AuditService, logger *zap.Logger) *FinancialYearService {
	return &FinancialYearService{repo: repo, auditService: auditService, logger: logger}
}

func (s *FinancialYearService) List(companyID uint64, status, search string, page, limit int) ([]models.FinancialYear, int64, error) {
	return s.repo.List(companyID, status, search, page, limit)
}

func (s *FinancialYearService) GetByID(companyID, id uint64) (*models.FinancialYear, error) {
	return s.repo.FindByID(companyID, id)
}

func (s *FinancialYearService) Create(companyID, userID uint64, req *dto.CreateFinancialYearRequest) (*models.FinancialYear, error) {
	startDate, err := time.Parse("2006-01-02", req.StartDate)
	if err != nil {
		return nil, errors.New("invalid start_date format, expected YYYY-MM-DD")
	}

	endDate, err := time.Parse("2006-01-02", req.EndDate)
	if err != nil {
		return nil, errors.New("invalid end_date format, expected YYYY-MM-DD")
	}

	if !startDate.Before(endDate) {
		return nil, errors.New("start_date must be before end_date")
	}

	if *req.IsActive {
		s.repo.DeactivateAll(companyID)
	}

	fy := &models.FinancialYear{
		CompanyID: companyID,
		YearName:  req.YearName,
		StartDate: startDate,
		EndDate:   endDate,
		IsActive:  *req.IsActive,
		Status:    req.Status,
		CreatedBy: &userID,
	}

	if err := s.repo.Create(fy); err != nil {
		return nil, err
	}

	s.logAudit(companyID, userID, "FINANCIAL_YEAR_CREATED", "financial_years", fy.ID, fmt.Sprintf("Created financial year %s", fy.YearName))

	return fy, nil
}

func (s *FinancialYearService) Update(companyID, id, userID uint64, req *dto.UpdateFinancialYearRequest) (*models.FinancialYear, error) {
	fy, err := s.repo.FindByID(companyID, id)
	if err != nil {
		return nil, errors.New("financial year not found")
	}

	if fy.IsClosed {
		return nil, errors.New("cannot update a closed financial year")
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

	if *req.IsActive && !fy.IsActive {
		s.repo.DeactivateAll(companyID)
	}

	fy.YearName = req.YearName
	fy.StartDate = startDate
	fy.EndDate = endDate
	fy.IsActive = *req.IsActive
	fy.Status = req.Status
	fy.UpdatedBy = &userID

	if err := s.repo.Update(fy); err != nil {
		return nil, err
	}

	s.logAudit(companyID, userID, "FINANCIAL_YEAR_UPDATED", "financial_years", fy.ID, fmt.Sprintf("Updated financial year %s", fy.YearName))

	return fy, nil
}

func (s *FinancialYearService) Close(companyID, id, userID uint64) error {
	fy, err := s.repo.FindByID(companyID, id)
	if err != nil {
		return errors.New("financial year not found")
	}

	if fy.IsClosed {
		return errors.New("financial year is already closed")
	}

	fy.IsClosed = true
	fy.IsActive = false
	fy.UpdatedBy = &userID

	if err := s.repo.Update(fy); err != nil {
		return err
	}

	s.logAudit(companyID, userID, "FINANCIAL_YEAR_CLOSED", "financial_years", fy.ID, fmt.Sprintf("Closed financial year %s", fy.YearName))

	return nil
}

func (s *FinancialYearService) logAudit(companyID, userID uint64, action, entityName string, entityID uint64, description string) {
	s.auditService.LogAction(companyID, nil, &userID, "FINANCE", action, entityName, &entityID, nil, description, "", "")
}
