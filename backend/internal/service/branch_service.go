package service

import (
	"github.com/pixandco/erp-phrma/internal/dto"
	"github.com/pixandco/erp-phrma/internal/dto/request"
	"github.com/pixandco/erp-phrma/internal/model"
	"github.com/pixandco/erp-phrma/internal/pkg/errs"
	"github.com/pixandco/erp-phrma/internal/repository"
	"go.uber.org/zap"
)

type BranchService struct {
	repo   *repository.BranchRepository
	logger *zap.Logger
}

func NewBranchService(repo *repository.BranchRepository, logger *zap.Logger) *BranchService {
	return &BranchService{repo: repo, logger: logger}
}

func (s *BranchService) FindByID(id uint64) (*model.Branch, error) {
	branch, err := s.repo.FindByID(id)
	if err != nil {
		return nil, errs.ErrNotFound("Branch")
	}
	return branch, nil
}

func (s *BranchService) List(companyID uint64, req *dto.PaginationRequest) ([]model.Branch, int64, error) {
	return s.repo.List(companyID, req)
}

func (s *BranchService) Create(companyID uint64, req *request.CreateBranchRequest) (*model.Branch, error) {
	branch := &model.Branch{
		CompanyScopedModel: model.CompanyScopedModel{CompanyID: companyID},
		Name:               req.Name,
		Code:               req.Code,
		Address:            req.Address,
		Phone:              req.Phone,
		IsActive:           true,
	}
	err := s.repo.Create(nil, branch)
	if err != nil {
		return nil, errs.ErrDatabase(err)
	}
	return branch, nil
}

func (s *BranchService) Update(id uint64, req *request.UpdateBranchRequest) (*model.Branch, error) {
	branch, err := s.repo.FindByID(id)
	if err != nil {
		return nil, errs.ErrNotFound("Branch")
	}

	if req.Name != "" {
		branch.Name = req.Name
	}
	if req.Code != "" {
		branch.Code = req.Code
	}
	if req.Address != "" {
		branch.Address = req.Address
	}
	if req.Phone != "" {
		branch.Phone = req.Phone
	}
	if req.IsActive != nil {
		branch.IsActive = *req.IsActive
	}

	err = s.repo.Update(nil, branch)
	if err != nil {
		return nil, errs.ErrDatabase(err)
	}
	return branch, nil
}

func (s *BranchService) Delete(id uint64) error {
	_, err := s.repo.FindByID(id)
	if err != nil {
		return errs.ErrNotFound("Branch")
	}
	err = s.repo.Delete(id)
	if err != nil {
		return errs.ErrDatabase(err)
	}
	return nil
}
