package services

import (
	"errors"
	"math"

	"github.com/pixandco/erp-phrma/internal/company/models"
	"github.com/pixandco/erp-phrma/internal/control/dto"
	"github.com/pixandco/erp-phrma/internal/control/repositories"
	"gorm.io/gorm"
)

type DesignationService struct {
	repo         *repositories.DesignationRepository
	auditService *AuditService
}

func NewDesignationService(repo *repositories.DesignationRepository, auditService *AuditService) *DesignationService {
	return &DesignationService{repo: repo, auditService: auditService}
}

func (s *DesignationService) List(status, search string, page, limit int) ([]models.Designation, *dto.Pagination, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}
	offset := (page - 1) * limit

	desigs, count, err := s.repo.List(status, search, offset, limit)
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

	return desigs, pagination, nil
}

func (s *DesignationService) GetByID(id uint64) (*models.Designation, error) {
	return s.repo.GetByID(id)
}

func (s *DesignationService) Create(req dto.CreateDesignationRequest, companyID, userID, activeBranchID uint64, ipAddress, userAgent string) (*models.Designation, error) {
	existing, _ := s.repo.GetByName(req.DesignationName)
	if existing != nil {
		return nil, errors.New("Designation name already exists")
	}

	desig := &models.Designation{
		CompanyID:       companyID,
		DesignationName: req.DesignationName,
		Description:     req.Description,
		Status:          req.Status,
	}

	if err := s.repo.Create(desig); err != nil {
		return nil, errors.New("Failed to create designation")
	}

	s.auditService.LogAction(
		companyID, &activeBranchID, &userID, "CONTROL_CENTER",
		"DESIGNATION_CREATED", "designation", &desig.ID, nil, desig, ipAddress, userAgent,
	)

	return desig, nil
}

func (s *DesignationService) Update(id uint64, req dto.UpdateDesignationRequest, companyID, userID, activeBranchID uint64, ipAddress, userAgent string) (*models.Designation, error) {
	desig, err := s.repo.GetByID(id)
	if err != nil {
		return nil, errors.New("Designation not found")
	}

	if req.DesignationName != desig.DesignationName {
		existing, _ := s.repo.GetByName(req.DesignationName)
		if existing != nil && existing.ID != id {
			return nil, errors.New("Designation name already exists")
		}
	}

	oldValues := *desig

	desig.DesignationName = req.DesignationName
	desig.Description = req.Description
	desig.Status = req.Status

	if err := s.repo.Update(desig); err != nil {
		return nil, errors.New("Failed to update designation")
	}

	s.auditService.LogAction(
		companyID, &activeBranchID, &userID, "CONTROL_CENTER",
		"DESIGNATION_UPDATED", "designation", &desig.ID, oldValues, desig, ipAddress, userAgent,
	)

	return desig, nil
}

func (s *DesignationService) Delete(id uint64, companyID, userID, activeBranchID uint64, ipAddress, userAgent string) error {
	desig, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("Designation not found")
		}
		return err
	}

	hasUsers, _ := s.repo.HasActiveUsers(id)
	if hasUsers {
		return errors.New("Cannot delete designation with active users")
	}

	if err := s.repo.SoftDelete(id); err != nil {
		return errors.New("Failed to delete designation")
	}

	s.auditService.LogAction(
		companyID, &activeBranchID, &userID, "CONTROL_CENTER",
		"DESIGNATION_DELETED", "designation", &desig.ID, desig, nil, ipAddress, userAgent,
	)

	return nil
}
