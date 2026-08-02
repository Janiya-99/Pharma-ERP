package services

import (
	"errors"
	"strings"

	"github.com/pixandco/erp-phrma/internal/invoicecenter/dto"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/models"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/repositories"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type CustomerCategoryService struct {
	repo     *repositories.CustomerCategoryRepository
	auditSvc *AuditLogService
	logger   *zap.Logger
}

func NewCustomerCategoryService(repo *repositories.CustomerCategoryRepository, auditSvc *AuditLogService, logger *zap.Logger) *CustomerCategoryService {
	return &CustomerCategoryService{repo: repo, auditSvc: auditSvc, logger: logger}
}

func (s *CustomerCategoryService) mapToDTO(model *models.CustomerCategory, count int64) *dto.CustomerCategoryResponse {
	return &dto.CustomerCategoryResponse{
		ID:            model.ID,
		CompanyID:     model.CompanyID,
		CategoryCode:  model.CategoryCode,
		CategoryName:  model.CategoryName,
		Description:   model.Description,
		CreditLimit:   model.CreditLimit,
		CreditDays:    model.CreditDays,
		Status:        model.Status,
		CreatedBy:     model.CreatedBy,
		CreatedAt:     model.CreatedAt,
		CustomerCount: count,
	}
}

func (s *CustomerCategoryService) List(db *gorm.DB, companyID uint64, search string, page, limit int) ([]dto.CustomerCategoryResponse, int64, error) {
	list, total, err := s.repo.List(db, companyID, search, page, limit)
	if err != nil {
		return nil, 0, err
	}
	res := make([]dto.CustomerCategoryResponse, len(list))
	for i, item := range list {
		res[i] = *s.mapToDTO(&item, 0)
	}
	return res, total, nil
}

func (s *CustomerCategoryService) GetByID(db *gorm.DB, companyID uint64, id uint64) (*dto.CustomerCategoryResponse, error) {
	cat, count, err := s.repo.GetByID(db, companyID, id)
	if err != nil {
		return nil, errors.New("customer category not found")
	}
	return s.mapToDTO(cat, count), nil
}

func (s *CustomerCategoryService) Create(db *gorm.DB, companyID, userID uint64, req *dto.CreateCustomerCategoryRequest) (*dto.CustomerCategoryResponse, error) {
	existing, _ := s.repo.GetByCode(db, companyID, req.CategoryCode)
	if existing != nil {
		return nil, errors.New("customer category code already exists")
	}

	cat := &models.CustomerCategory{
		CompanyID:    companyID,
		CategoryCode: strings.ToUpper(strings.TrimSpace(req.CategoryCode)),
		CategoryName: strings.TrimSpace(req.CategoryName),
		Description:  req.Description,
		CreditLimit:  req.CreditLimit,
		CreditDays:   req.CreditDays,
		Status:       req.Status,
		CreatedBy:    &userID,
	}

	if err := s.repo.Create(db, cat); err != nil {
		return nil, err
	}

	s.auditSvc.LogAction(db, companyID, userID, "CUSTOMER_CATEGORY_CREATED", "Created customer category: "+cat.CategoryCode, cat.ID)
	return s.mapToDTO(cat, 0), nil
}

func (s *CustomerCategoryService) Update(db *gorm.DB, companyID, userID, id uint64, req *dto.UpdateCustomerCategoryRequest) (*dto.CustomerCategoryResponse, error) {
	cat, count, err := s.repo.GetByID(db, companyID, id)
	if err != nil {
		return nil, errors.New("customer category not found")
	}

	newCode := strings.ToUpper(strings.TrimSpace(req.CategoryCode))
	if !strings.EqualFold(cat.CategoryCode, newCode) {
		existing, _ := s.repo.GetByCode(db, companyID, newCode)
		if existing != nil && existing.ID != id {
			return nil, errors.New("customer category code already exists")
		}
	}

	cat.CategoryCode = newCode
	cat.CategoryName = strings.TrimSpace(req.CategoryName)
	cat.Description = req.Description
	cat.CreditLimit = req.CreditLimit
	cat.CreditDays = req.CreditDays
	cat.Status = req.Status
	cat.UpdatedBy = &userID

	if err := s.repo.Update(db, cat); err != nil {
		return nil, err
	}

	s.auditSvc.LogAction(db, companyID, userID, "CUSTOMER_CATEGORY_UPDATED", "Updated customer category: "+cat.CategoryCode, cat.ID)
	return s.mapToDTO(cat, count), nil
}

func (s *CustomerCategoryService) Delete(db *gorm.DB, companyID, userID, id uint64) error {
	cat, _, err := s.repo.GetByID(db, companyID, id)
	if err != nil {
		return errors.New("customer category not found")
	}

	if err := s.repo.Delete(db, companyID, id); err != nil {
		return err
	}

	s.auditSvc.LogAction(db, companyID, userID, "CUSTOMER_CATEGORY_DELETED", "Deleted customer category: "+cat.CategoryCode, id)
	return nil
}
