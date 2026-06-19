package service

import (
	"github.com/pixandco/erp-phrma/internal/dto"
	"github.com/pixandco/erp-phrma/internal/dto/request"
	"github.com/pixandco/erp-phrma/internal/model"
	"github.com/pixandco/erp-phrma/internal/pkg/errs"
	"github.com/pixandco/erp-phrma/internal/repository"
	"go.uber.org/zap"
)

type DesignationService struct {
	repo   *repository.DesignationRepository
	logger *zap.Logger
}

func NewDesignationService(repo *repository.DesignationRepository, logger *zap.Logger) *DesignationService {
	return &DesignationService{repo: repo, logger: logger}
}

func (s *DesignationService) FindByID(id uint64) (*model.Designation, error) {
	des, err := s.repo.FindByID(id)
	if err != nil {
		return nil, errs.ErrNotFound("Designation")
	}
	return des, nil
}

func (s *DesignationService) List(companyID uint64, req *dto.PaginationRequest) ([]model.Designation, int64, error) {
	return s.repo.List(companyID, req)
}

func (s *DesignationService) Create(companyID uint64, req *request.CreateDesignationRequest) (*model.Designation, error) {
	des := &model.Designation{
		CompanyScopedModel: model.CompanyScopedModel{CompanyID: companyID},
		Name:               req.Name,
		Description:        req.Description,
	}
	err := s.repo.Create(nil, des)
	if err != nil {
		return nil, errs.ErrDatabase(err)
	}
	return des, nil
}

func (s *DesignationService) Update(id uint64, req *request.UpdateDesignationRequest) (*model.Designation, error) {
	des, err := s.repo.FindByID(id)
	if err != nil {
		return nil, errs.ErrNotFound("Designation")
	}

	if req.Name != "" {
		des.Name = req.Name
	}
	des.Description = req.Description

	err = s.repo.Update(nil, des)
	if err != nil {
		return nil, errs.ErrDatabase(err)
	}
	return des, nil
}

func (s *DesignationService) Delete(id uint64) error {
	_, err := s.repo.FindByID(id)
	if err != nil {
		return errs.ErrNotFound("Designation")
	}
	err = s.repo.Delete(id)
	if err != nil {
		return errs.ErrDatabase(err)
	}
	return nil
}
