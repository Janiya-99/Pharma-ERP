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

type SupplierService struct {
	repo         *repositories.ProductMasterRepository
	auditService *service.AuditService
}

func NewSupplierService(repo *repositories.ProductMasterRepository, auditService *service.AuditService) *SupplierService {
	return &SupplierService{repo: repo, auditService: auditService}
}
func (s *SupplierService) List(db *gorm.DB, companyID uint64, search string, page, limit int) ([]models.Supplier, int64, error) {
	return s.repo.ListSuppliers(db, companyID, search, page, limit)
}
func (s *SupplierService) GetByID(db *gorm.DB, companyID, id uint64) (*models.Supplier, error) {
	return s.repo.GetSupplierByID(db, companyID, id)
}
func (s *SupplierService) Create(c *gin.Context, db *gorm.DB, companyID uint64, req dto.CreateSupplierRequest) (*models.Supplier, error) {
	if e, _ := s.repo.GetSupplierByCode(db, companyID, req.SupplierCode); e != nil {
		return nil, errors.New("code exists")
	}
	m := &models.Supplier{CompanyID: companyID, SupplierCode: req.SupplierCode, SupplierName: req.SupplierName, ContactPerson: req.ContactPerson, ContactNumber: req.ContactNumber, Email: req.Email, Address: req.Address, TaxRegistrationNumber: req.TaxRegistrationNumber, PaymentTermsDays: req.PaymentTermsDays, PayableAccountID: req.PayableAccountID, Status: req.Status}
	err := db.Transaction(func(tx *gorm.DB) error {
		if err := s.repo.Create(tx, m); err != nil {
			return err
		}
		s.auditService.LogAction(c, tx, service.AuditParams{Module: "Inventory", Action: "SUPPLIER_CREATED", EntityType: "Supplier", EntityID: m.ID, NewValues: m})
		return nil
	})
	return m, err
}
func (s *SupplierService) Update(c *gin.Context, db *gorm.DB, companyID, id uint64, req dto.UpdateSupplierRequest) (*models.Supplier, error) {
	m, err := s.repo.GetSupplierByID(db, companyID, id)
	if err != nil {
		return nil, err
	}
	if m.SupplierCode != req.SupplierCode {
		if e, _ := s.repo.GetSupplierByCode(db, companyID, req.SupplierCode); e != nil {
			return nil, errors.New("code exists")
		}
	}
	old := *m
	m.SupplierCode = req.SupplierCode
	m.SupplierName = req.SupplierName
	m.ContactPerson = req.ContactPerson
	m.ContactNumber = req.ContactNumber
	m.Email = req.Email
	m.Address = req.Address
	m.TaxRegistrationNumber = req.TaxRegistrationNumber
	m.PaymentTermsDays = req.PaymentTermsDays
	m.PayableAccountID = req.PayableAccountID
	m.Status = req.Status
	err = db.Transaction(func(tx *gorm.DB) error {
		if err := s.repo.Update(tx, m); err != nil {
			return err
		}
		s.auditService.LogAction(c, tx, service.AuditParams{Module: "Inventory", Action: "SUPPLIER_UPDATED", EntityType: "Supplier", EntityID: m.ID, OldValues: old, NewValues: m})
		return nil
	})
	return m, err
}
func (s *SupplierService) Delete(c *gin.Context, db *gorm.DB, companyID, id uint64) error {
	m, err := s.repo.GetSupplierByID(db, companyID, id)
	if err != nil {
		return err
	}
	var bCount int64
	db.Model(&models.ProductBatch{}).Where("supplier_id = ?", id).Count(&bCount)
	if bCount > 0 {
		return errors.New("cannot delete used by batches")
	}
	return db.Transaction(func(tx *gorm.DB) error {
		if err := s.repo.Delete(tx, m); err != nil {
			return err
		}
		s.auditService.LogAction(c, tx, service.AuditParams{Module: "Inventory", Action: "SUPPLIER_DELETED", EntityType: "Supplier", EntityID: id, OldValues: m})
		return nil
	})
}
