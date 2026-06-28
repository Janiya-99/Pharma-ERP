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

type DosageFormService struct {
	repo         *repositories.ProductMasterRepository
	auditService *service.AuditService
}

func NewDosageFormService(repo *repositories.ProductMasterRepository, auditService *service.AuditService) *DosageFormService {
	return &DosageFormService{repo: repo, auditService: auditService}
}
func (s *DosageFormService) List(db *gorm.DB, companyID uint64, search string, page, limit int) ([]models.DosageForm, int64, error) {
	return s.repo.ListDosageForms(db, companyID, search, page, limit)
}
func (s *DosageFormService) GetByID(db *gorm.DB, companyID, id uint64) (*models.DosageForm, error) {
	return s.repo.GetDosageFormByID(db, companyID, id)
}
func (s *DosageFormService) Create(c *gin.Context, db *gorm.DB, companyID uint64, req dto.CreateDosageFormRequest) (*models.DosageForm, error) {
	e, err := s.repo.GetDosageFormByCode(db, companyID, req.DosageFormCode)
	if err != nil {
		return nil, err
	}
	if e != nil {
		return nil, errors.New("dosage_form_code exists")
	}
	m := &models.DosageForm{CompanyID: companyID, DosageFormCode: req.DosageFormCode, DosageFormName: req.DosageFormName, Description: req.Description, Status: req.Status}
	err = db.Transaction(func(tx *gorm.DB) error {
		if err := s.repo.Create(tx, m); err != nil {
			return err
		}
		s.auditService.LogAction(c, tx, service.AuditParams{Module: "Inventory", Action: "DOSAGE_FORM_CREATED", EntityType: "DosageForm", EntityID: m.ID, NewValues: m})
		return nil
	})
	return m, err
}
func (s *DosageFormService) Update(c *gin.Context, db *gorm.DB, companyID, id uint64, req dto.UpdateDosageFormRequest) (*models.DosageForm, error) {
	m, err := s.repo.GetDosageFormByID(db, companyID, id)
	if err != nil {
		return nil, err
	}
	if m.DosageFormCode != req.DosageFormCode {
		e, err := s.repo.GetDosageFormByCode(db, companyID, req.DosageFormCode)
		if err != nil {
			return nil, err
		}
		if e != nil {
			return nil, errors.New("dosage_form_code exists")
		}
	}
	old := *m
	m.DosageFormCode = req.DosageFormCode
	m.DosageFormName = req.DosageFormName
	m.Description = req.Description
	m.Status = req.Status
	err = db.Transaction(func(tx *gorm.DB) error {
		if err := s.repo.Update(tx, m); err != nil {
			return err
		}
		s.auditService.LogAction(c, tx, service.AuditParams{Module: "Inventory", Action: "DOSAGE_FORM_UPDATED", EntityType: "DosageForm", EntityID: m.ID, OldValues: old, NewValues: m})
		return nil
	})
	return m, err
}
func (s *DosageFormService) Delete(c *gin.Context, db *gorm.DB, companyID, id uint64) error {
	m, err := s.repo.GetDosageFormByID(db, companyID, id)
	if err != nil {
		return err
	}
	var pCount int64
	db.Model(&models.Product{}).Where("dosage_form_id = ?", id).Count(&pCount)
	if pCount > 0 {
		return errors.New("cannot delete used by products")
	}
	return db.Transaction(func(tx *gorm.DB) error {
		if err := s.repo.Delete(tx, m); err != nil {
			return err
		}
		s.auditService.LogAction(c, tx, service.AuditParams{Module: "Inventory", Action: "DOSAGE_FORM_DELETED", EntityType: "DosageForm", EntityID: id, OldValues: m})
		return nil
	})
}
