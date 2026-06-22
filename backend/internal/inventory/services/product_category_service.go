package services

import (
	"errors"
	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/inventory/dto"
	"github.com/pixandco/erp-phrma/internal/inventory/models"
	"github.com/pixandco/erp-phrma/internal/inventory/repositories"
	"github.com/pixandco/erp-phrma/internal/service"
	"gorm.io/gorm"
)

type ProductCategoryService struct {
	repo         *repositories.ProductMasterRepository
	auditService *service.AuditService
}

func NewProductCategoryService(repo *repositories.ProductMasterRepository, auditService *service.AuditService) *ProductCategoryService {
	return &ProductCategoryService{repo: repo, auditService: auditService}
}
func (s *ProductCategoryService) List(db *gorm.DB, companyID uint64, filters map[string]interface{}, search string, page, limit int) ([]models.ProductCategory, int64, error) {
	return s.repo.ListCategories(db, companyID, filters, search, page, limit)
}
func (s *ProductCategoryService) GetByID(db *gorm.DB, companyID, id uint64) (*models.ProductCategory, error) {
	return s.repo.GetCategoryByID(db, companyID, id)
}
func (s *ProductCategoryService) Create(c *gin.Context, db *gorm.DB, companyID uint64, req dto.CreateProductCategoryRequest) (*models.ProductCategory, error) {
	existing, _ := s.repo.GetCategoryByCode(db, companyID, req.CategoryCode)
	if existing != nil {
		return nil, errors.New("category_code already exists")
	}
	if req.ParentID != nil && *req.ParentID > 0 {
		parent, err := s.repo.GetCategoryByID(db, companyID, *req.ParentID)
		if err != nil {
			return nil, errors.New("parent category not found")
		}
		if req.Level <= parent.Level {
			return nil, errors.New("invalid hierarchy level")
		}
	}
	m := &models.ProductCategory{
		CompanyID:    companyID,
		CategoryCode: req.CategoryCode,
		CategoryName: req.CategoryName,
		ParentID:     req.ParentID,
		Level:        req.Level,
		Description:  req.Description,
		Status:       req.Status,
	}
	err := db.Transaction(func(tx *gorm.DB) error {
		if err := s.repo.Create(tx, m); err != nil {
			return err
		}
		s.auditService.LogAction(c, tx, service.AuditParams{Module: "Inventory", Action: "PRODUCT_CATEGORY_CREATED", EntityType: "ProductCategory", EntityID: m.ID, NewValues: m})
		return nil
	})
	return m, err
}
func (s *ProductCategoryService) Update(c *gin.Context, db *gorm.DB, companyID, id uint64, req dto.UpdateProductCategoryRequest) (*models.ProductCategory, error) {
	m, err := s.repo.GetCategoryByID(db, companyID, id)
	if err != nil {
		return nil, err
	}
	if m.CategoryCode != req.CategoryCode {
		if existing, _ := s.repo.GetCategoryByCode(db, companyID, req.CategoryCode); existing != nil {
			return nil, errors.New("category_code exists")
		}
	}
	if req.ParentID != nil && *req.ParentID == id {
		return nil, errors.New("circular reference")
	}
	old := *m
	m.CategoryCode = req.CategoryCode
	m.CategoryName = req.CategoryName
	m.ParentID = req.ParentID
	m.Level = req.Level
	m.Description = req.Description
	m.Status = req.Status
	err = db.Transaction(func(tx *gorm.DB) error {
		if err := s.repo.Update(tx, m); err != nil {
			return err
		}
		s.auditService.LogAction(c, tx, service.AuditParams{Module: "Inventory", Action: "PRODUCT_CATEGORY_UPDATED", EntityType: "ProductCategory", EntityID: m.ID, OldValues: old, NewValues: m})
		return nil
	})
	return m, err
}
func (s *ProductCategoryService) Delete(c *gin.Context, db *gorm.DB, companyID, id uint64) error {
	m, err := s.repo.GetCategoryByID(db, companyID, id)
	if err != nil {
		return err
	}
	var childCount int64
	db.Model(&models.ProductCategory{}).Where("parent_id = ?", id).Count(&childCount)
	if childCount > 0 {
		return errors.New("cannot delete category with children")
	}
	var pCount int64
	db.Model(&models.Product{}).Where("product_category_id = ?", id).Count(&pCount)
	if pCount > 0 {
		return errors.New("cannot delete category used by products")
	}
	return db.Transaction(func(tx *gorm.DB) error {
		if err := s.repo.Delete(tx, m); err != nil {
			return err
		}
		s.auditService.LogAction(c, tx, service.AuditParams{Module: "Inventory", Action: "PRODUCT_CATEGORY_DELETED", EntityType: "ProductCategory", EntityID: id, OldValues: m})
		return nil
	})
}
