package service

import (
	"github.com/pixandco/erp-phrma/internal/dto"
	"github.com/pixandco/erp-phrma/internal/dto/request"
	"github.com/pixandco/erp-phrma/internal/model"
	"github.com/pixandco/erp-phrma/internal/pkg/errs"
	"github.com/pixandco/erp-phrma/internal/repository"
	"go.uber.org/zap"
)

type CompanyService struct {
	repo   *repository.CompanyRepository
	logger *zap.Logger
}

func NewCompanyService(repo *repository.CompanyRepository, logger *zap.Logger) *CompanyService {
	return &CompanyService{repo: repo, logger: logger}
}

func (s *CompanyService) FindByID(id uint64) (*model.Company, error) {
	company, err := s.repo.FindByID(id)
	if err != nil {
		return nil, errs.ErrNotFound("Company")
	}
	return company, nil
}

func (s *CompanyService) List(req *dto.PaginationRequest) ([]model.Company, int64, error) {
	return s.repo.List(req)
}

func (s *CompanyService) Create(req *request.CreateCompanyRequest) (*model.Company, error) {
	company := &model.Company{
		Name:     req.Name,
		Code:     req.Code,
		TaxID:    req.TaxID,
		Address:  req.Address,
		Phone:    req.Phone,
		Email:    req.Email,
		IsActive: true,
	}
	err := s.repo.Create(nil, company)
	if err != nil {
		return nil, errs.ErrDatabase(err)
	}
	return company, nil
}

func (s *CompanyService) Update(id uint64, req *request.UpdateCompanyRequest) (*model.Company, error) {
	company, err := s.repo.FindByID(id)
	if err != nil {
		return nil, errs.ErrNotFound("Company")
	}

	if req.Name != "" {
		company.Name = req.Name
	}
	if req.Code != "" {
		company.Code = req.Code
	}
	if req.TaxID != "" {
		company.TaxID = req.TaxID
	}
	if req.Address != "" {
		company.Address = req.Address
	}
	if req.Phone != "" {
		company.Phone = req.Phone
	}
	if req.Email != "" {
		company.Email = req.Email
	}
	if req.IsActive != nil {
		company.IsActive = *req.IsActive
	}

	err = s.repo.Update(nil, company)
	if err != nil {
		return nil, errs.ErrDatabase(err)
	}
	return company, nil
}

func (s *CompanyService) Delete(id uint64) error {
	_, err := s.repo.FindByID(id)
	if err != nil {
		return errs.ErrNotFound("Company")
	}
	err = s.repo.Delete(id)
	if err != nil {
		return errs.ErrDatabase(err)
	}
	return nil
}
