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

type GenericNameService struct {
	repo         *repositories.ProductMasterRepository
	auditService *service.AuditService
}

func NewGenericNameService(repo *repositories.ProductMasterRepository, auditService *service.AuditService) *GenericNameService {
	return &GenericNameService{repo: repo, auditService: auditService}
}
func (s *GenericNameService) List(db *gorm.DB, companyID uint64, search string, page, limit int) ([]models.GenericName, int64, error) {
	return s.repo.ListGenericNames(db, companyID, search, page, limit)
}
func (s *GenericNameService) GetByID(db *gorm.DB, companyID, id uint64) (*models.GenericName, error) {
	return s.repo.GetGenericNameByID(db, companyID, id)
}
func (s *GenericNameService) Create(c *gin.Context, db *gorm.DB, companyID uint64, req dto.CreateGenericNameRequest) (*models.GenericName, error) {
	if e, _ := s.repo.GetGenericNameByCode(db, companyID, req.GenericCode); e != nil {
		return nil, errors.New("generic_code exists")
	}
	m := &models.GenericName{CompanyID: companyID, GenericCode: req.GenericCode, GenericName: req.GenericName, Description: req.Description, Status: req.Status}
	err := db.Transaction(func(tx *gorm.DB) error {
		if err := s.repo.Create(tx, m); err != nil {
			return err
		}
		s.auditService.LogAction(c, tx, service.AuditParams{Module: "Inventory", Action: "GENERIC_NAME_CREATED", EntityType: "GenericName", EntityID: m.ID, NewValues: m})
		return nil
	})
	return m, err
}
func (s *GenericNameService) Update(c *gin.Context, db *gorm.DB, companyID, id uint64, req dto.UpdateGenericNameRequest) (*models.GenericName, error) {
	m, err := s.repo.GetGenericNameByID(db, companyID, id)
	if err != nil {
		return nil, err
	}
	if m.GenericCode != req.GenericCode {
		if e, _ := s.repo.GetGenericNameByCode(db, companyID, req.GenericCode); e != nil {
			return nil, errors.New("generic_code exists")
		}
	}
	old := *m
	m.GenericCode = req.GenericCode
	m.GenericName = req.GenericName
	m.Description = req.Description
	m.Status = req.Status
	err = db.Transaction(func(tx *gorm.DB) error {
		if err := s.repo.Update(tx, m); err != nil {
			return err
		}
		s.auditService.LogAction(c, tx, service.AuditParams{Module: "Inventory", Action: "GENERIC_NAME_UPDATED", EntityType: "GenericName", EntityID: m.ID, OldValues: old, NewValues: m})
		return nil
	})
	return m, err
}
func (s *GenericNameService) Delete(c *gin.Context, db *gorm.DB, companyID, id uint64) error {
	m, err := s.repo.GetGenericNameByID(db, companyID, id)
	if err != nil {
		return err
	}
	var pCount int64
	db.Model(&models.Product{}).Where("generic_name_id = ?", id).Count(&pCount)
	if pCount > 0 {
		return errors.New("cannot delete used by products")
	}
	return db.Transaction(func(tx *gorm.DB) error {
		if err := s.repo.Delete(tx, m); err != nil {
			return err
		}
		s.auditService.LogAction(c, tx, service.AuditParams{Module: "Inventory", Action: "GENERIC_NAME_DELETED", EntityType: "GenericName", EntityID: id, OldValues: m})
		return nil
	})
}
