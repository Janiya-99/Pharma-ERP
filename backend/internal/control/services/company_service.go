package services

import (
	"errors"

	"github.com/pixandco/erp-phrma/internal/company/models"
	"github.com/pixandco/erp-phrma/internal/control/dto"
	"github.com/pixandco/erp-phrma/internal/control/repositories"
)

type CompanyService struct {
	repo         *repositories.CompanyRepository
	auditService *AuditService
}

func NewCompanyService(repo *repositories.CompanyRepository, auditService *AuditService) *CompanyService {
	return &CompanyService{repo: repo, auditService: auditService}
}

func (s *CompanyService) GetCompanyProfile() (*models.Company, error) {
	return s.repo.GetFirst()
}

func (s *CompanyService) UpdateCompanyProfile(req dto.UpdateCompanyProfileRequest, activeUserID uint64, activeBranchID uint64, ipAddress, userAgent string) (*models.Company, error) {
	company, err := s.repo.GetFirst()
	if err != nil {
		return nil, errors.New("company not found")
	}

	oldValues := *company

	company.CompanyName = req.CompanyName
	company.RegistrationNumber = req.RegistrationNumber
	company.TaxNumber = req.TaxNumber
	company.Address = req.Address
	company.Phone = req.Phone
	company.Email = req.Email
	company.Website = req.Website
	company.LogoURL = req.LogoURL

	if err := s.repo.Update(company); err != nil {
		return nil, errors.New("failed to update company profile")
	}

	s.auditService.LogAction(
		company.ID,
		&activeBranchID,
		&activeUserID,
		"CONTROL_CENTER",
		"COMPANY_UPDATED",
		"company",
		&company.ID,
		oldValues,
		company,
		ipAddress,
		userAgent,
	)

	return company, nil
}
