package services

import (
	"errors"
	"math"

	"github.com/pixandco/erp-phrma/internal/company/models"
	"github.com/pixandco/erp-phrma/internal/control/dto"
	"github.com/pixandco/erp-phrma/internal/control/repositories"
	"gorm.io/gorm"
)

type DepartmentService struct {
	repo         *repositories.DepartmentRepository
	auditService *AuditService
}

func NewDepartmentService(repo *repositories.DepartmentRepository, auditService *AuditService) *DepartmentService {
	return &DepartmentService{repo: repo, auditService: auditService}
}

func (s *DepartmentService) List(status, search string, page, limit int) ([]models.Department, *dto.Pagination, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}
	offset := (page - 1) * limit

	depts, count, err := s.repo.List(status, search, offset, limit)
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

	return depts, pagination, nil
}

func (s *DepartmentService) GetByID(id uint64) (*models.Department, error) {
	return s.repo.GetByID(id)
}

func (s *DepartmentService) Create(req dto.CreateDepartmentRequest, companyID, userID, activeBranchID uint64, ipAddress, userAgent string) (*models.Department, error) {
	existing, _ := s.repo.GetByName(req.DepartmentName)
	if existing != nil {
		return nil, errors.New("Department name already exists")
	}

	dept := &models.Department{
		CompanyID:      companyID,
		DepartmentCode: req.DepartmentCode,
		DepartmentName: req.DepartmentName,
		Description:    req.Description,
		Status:         req.Status,
	}

	if err := s.repo.Create(dept); err != nil {
		return nil, errors.New("Failed to create department")
	}

	s.auditService.LogAction(
		companyID, &activeBranchID, &userID, "CONTROL_CENTER",
		"DEPARTMENT_CREATED", "department", &dept.ID, nil, dept, ipAddress, userAgent,
	)

	return dept, nil
}

func (s *DepartmentService) Update(id uint64, req dto.UpdateDepartmentRequest, companyID, userID, activeBranchID uint64, ipAddress, userAgent string) (*models.Department, error) {
	dept, err := s.repo.GetByID(id)
	if err != nil {
		return nil, errors.New("Department not found")
	}

	if req.DepartmentName != dept.DepartmentName {
		existing, _ := s.repo.GetByName(req.DepartmentName)
		if existing != nil && existing.ID != id {
			return nil, errors.New("Department name already exists")
		}
	}

	oldValues := *dept

	dept.DepartmentCode = req.DepartmentCode
	dept.DepartmentName = req.DepartmentName
	dept.Description = req.Description
	dept.Status = req.Status

	if err := s.repo.Update(dept); err != nil {
		return nil, errors.New("Failed to update department")
	}

	s.auditService.LogAction(
		companyID, &activeBranchID, &userID, "CONTROL_CENTER",
		"DEPARTMENT_UPDATED", "department", &dept.ID, oldValues, dept, ipAddress, userAgent,
	)

	return dept, nil
}

func (s *DepartmentService) Delete(id uint64, companyID, userID, activeBranchID uint64, ipAddress, userAgent string) error {
	dept, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("Department not found")
		}
		return err
	}

	hasUsers, _ := s.repo.HasActiveUsers(id)
	if hasUsers {
		return errors.New("Cannot delete department with active users")
	}

	if err := s.repo.SoftDelete(id); err != nil {
		return errors.New("Failed to delete department")
	}

	s.auditService.LogAction(
		companyID, &activeBranchID, &userID, "CONTROL_CENTER",
		"DEPARTMENT_DELETED", "department", &dept.ID, dept, nil, ipAddress, userAgent,
	)

	return nil
}
