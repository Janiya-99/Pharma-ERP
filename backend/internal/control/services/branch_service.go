package services

import (
	"errors"
	"math"

	"github.com/pixandco/erp-phrma/internal/company/models"
	"github.com/pixandco/erp-phrma/internal/control/dto"
	"github.com/pixandco/erp-phrma/internal/control/repositories"
	"gorm.io/gorm"
)

type BranchService struct {
	repo         *repositories.BranchRepository
	auditService *AuditService
}

func NewBranchService(repo *repositories.BranchRepository, auditService *AuditService) *BranchService {
	return &BranchService{repo: repo, auditService: auditService}
}

func (s *BranchService) List(status, branchType, search string, page, limit int) ([]models.Branch, *dto.Pagination, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}
	offset := (page - 1) * limit

	branches, count, err := s.repo.List(status, branchType, search, offset, limit)
	if err != nil {
		return nil, nil, err
	}

	totalPages := int(math.Ceil(float64(count) / float64(limit)))

	pagination := &dto.Pagination{
		Page:       page,
		Limit:      limit,
		Total:      count,
		TotalPages: totalPages,
	}

	return branches, pagination, nil
}

func (s *BranchService) GetByID(id uint64) (*models.Branch, error) {
	return s.repo.GetByID(id)
}

func (s *BranchService) Create(req dto.CreateBranchRequest, companyID, userID, activeBranchID uint64, ipAddress, userAgent string) (*models.Branch, error) {
	existing, _ := s.repo.GetByCode(req.BranchCode)
	if existing != nil {
		return nil, errors.New("Branch code already exists")
	}

	if req.IsMainBranch {
		s.repo.UnsetMainBranches(0)
	}

	branch := &models.Branch{
		CompanyID:    companyID,
		BranchCode:   req.BranchCode,
		BranchName:   req.BranchName,
		BranchType:   req.BranchType,
		Address:      req.Address,
		Phone:        req.Phone,
		Email:        req.Email,
		IsMainBranch: req.IsMainBranch,
		Status:       req.Status,
	}

	if err := s.repo.Create(branch); err != nil {
		return nil, errors.New("Failed to create branch")
	}

	s.auditService.LogAction(
		companyID, &activeBranchID, &userID, "CONTROL_CENTER",
		"BRANCH_CREATED", "branch", &branch.ID, nil, branch, ipAddress, userAgent,
	)

	return branch, nil
}

func (s *BranchService) Update(id uint64, req dto.UpdateBranchRequest, companyID, userID, activeBranchID uint64, ipAddress, userAgent string) (*models.Branch, error) {
	branch, err := s.repo.GetByID(id)
	if err != nil {
		return nil, errors.New("Branch not found")
	}

	if req.BranchCode != branch.BranchCode {
		existing, _ := s.repo.GetByCode(req.BranchCode)
		if existing != nil && existing.ID != id {
			return nil, errors.New("Branch code already exists")
		}
	}

	if req.IsMainBranch && !branch.IsMainBranch {
		s.repo.UnsetMainBranches(branch.ID)
	}

	oldValues := *branch

	branch.BranchCode = req.BranchCode
	branch.BranchName = req.BranchName
	branch.BranchType = req.BranchType
	branch.Address = req.Address
	branch.Phone = req.Phone
	branch.Email = req.Email
	branch.IsMainBranch = req.IsMainBranch
	branch.Status = req.Status

	if err := s.repo.Update(branch); err != nil {
		return nil, errors.New("Failed to update branch")
	}

	s.auditService.LogAction(
		companyID, &activeBranchID, &userID, "CONTROL_CENTER",
		"BRANCH_UPDATED", "branch", &branch.ID, oldValues, branch, ipAddress, userAgent,
	)

	return branch, nil
}

func (s *BranchService) Delete(id uint64, companyID, userID, activeBranchID uint64, ipAddress, userAgent string) error {
	branch, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("Branch not found")
		}
		return err
	}

	hasUsers, _ := s.repo.HasActiveUsers(id)
	if hasUsers {
		return errors.New("Cannot delete branch with active users")
	}

	if branch.Status == "active" {
		activeCount, _ := s.repo.CountActiveBranches()
		if activeCount <= 1 {
			return errors.New("Cannot delete the only active branch")
		}
	}

	if err := s.repo.SoftDelete(id); err != nil {
		return errors.New("Failed to delete branch")
	}

	s.auditService.LogAction(
		companyID, &activeBranchID, &userID, "CONTROL_CENTER",
		"BRANCH_DELETED", "branch", &branch.ID, branch, nil, ipAddress, userAgent,
	)

	return nil
}
