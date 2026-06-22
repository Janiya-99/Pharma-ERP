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

type ManufacturerService struct {
	repo         *repositories.ProductMasterRepository
	auditService *service.AuditService
}

func NewManufacturerService(repo *repositories.ProductMasterRepository, auditService *service.AuditService) *ManufacturerService {
	return &ManufacturerService{repo: repo, auditService: auditService}
}
func (s *ManufacturerService) List(db *gorm.DB, companyID uint64, search string, page, limit int) ([]models.Manufacturer, int64, error) {
	return s.repo.ListManufacturers(db, companyID, search, page, limit)
}
func (s *ManufacturerService) GetByID(db *gorm.DB, companyID, id uint64) (*models.Manufacturer, error) {
	return s.repo.GetManufacturerByID(db, companyID, id)
}
func (s *ManufacturerService) Create(c *gin.Context, db *gorm.DB, companyID uint64, req dto.CreateManufacturerRequest) (*models.Manufacturer, error) {
	if e, _ := s.repo.GetManufacturerByCode(db, companyID, req.ManufacturerCode); e != nil {
		return nil, errors.New("code exists")
	}
	m := &models.Manufacturer{CompanyID: companyID, ManufacturerCode: req.ManufacturerCode, ManufacturerName: req.ManufacturerName, Country: req.Country, ContactPerson: req.ContactPerson, ContactNumber: req.ContactNumber, Email: req.Email, Address: req.Address, Status: req.Status}
	err := db.Transaction(func(tx *gorm.DB) error {
		if err := s.repo.Create(tx, m); err != nil {
			return err
		}
		s.auditService.LogAction(c, tx, service.AuditParams{Module: "Inventory", Action: "MANUFACTURER_CREATED", EntityType: "Manufacturer", EntityID: m.ID, NewValues: m})
		return nil
	})
	return m, err
}
func (s *ManufacturerService) Update(c *gin.Context, db *gorm.DB, companyID, id uint64, req dto.UpdateManufacturerRequest) (*models.Manufacturer, error) {
	m, err := s.repo.GetManufacturerByID(db, companyID, id)
	if err != nil {
		return nil, err
	}
	if m.ManufacturerCode != req.ManufacturerCode {
		if e, _ := s.repo.GetManufacturerByCode(db, companyID, req.ManufacturerCode); e != nil {
			return nil, errors.New("code exists")
		}
	}
	old := *m
	m.ManufacturerCode = req.ManufacturerCode
	m.ManufacturerName = req.ManufacturerName
	m.Country = req.Country
	m.ContactPerson = req.ContactPerson
	m.ContactNumber = req.ContactNumber
	m.Email = req.Email
	m.Address = req.Address
	m.Status = req.Status
	err = db.Transaction(func(tx *gorm.DB) error {
		if err := s.repo.Update(tx, m); err != nil {
			return err
		}
		s.auditService.LogAction(c, tx, service.AuditParams{Module: "Inventory", Action: "MANUFACTURER_UPDATED", EntityType: "Manufacturer", EntityID: m.ID, OldValues: old, NewValues: m})
		return nil
	})
	return m, err
}
func (s *ManufacturerService) Delete(c *gin.Context, db *gorm.DB, companyID, id uint64) error {
	m, err := s.repo.GetManufacturerByID(db, companyID, id)
	if err != nil {
		return err
	}
	var pCount, bCount int64
	db.Model(&models.Product{}).Where("manufacturer_id = ?", id).Count(&pCount)
	db.Model(&models.ProductBatch{}).Where("manufacturer_id = ?", id).Count(&bCount)
	if pCount > 0 || bCount > 0 {
		return errors.New("cannot delete used by products or batches")
	}
	return db.Transaction(func(tx *gorm.DB) error {
		if err := s.repo.Delete(tx, m); err != nil {
			return err
		}
		s.auditService.LogAction(c, tx, service.AuditParams{Module: "Inventory", Action: "MANUFACTURER_DELETED", EntityType: "Manufacturer", EntityID: id, OldValues: m})
		return nil
	})
}
