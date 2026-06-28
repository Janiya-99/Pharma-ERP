package services

import (
	"errors"

	"github.com/pixandco/erp-phrma/internal/invoicecenter/dto"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/models"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/repositories"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type CustomerContactService struct {
	repo     *repositories.CustomerContactRepository
	auditSvc *AuditLogService
	logger   *zap.Logger
}

func NewCustomerContactService(repo *repositories.CustomerContactRepository, auditSvc *AuditLogService, logger *zap.Logger) *CustomerContactService {
	return &CustomerContactService{repo: repo, auditSvc: auditSvc, logger: logger}
}

func (s *CustomerContactService) mapToDTO(model *models.CustomerContact) *dto.CustomerContactResponse {
	return &dto.CustomerContactResponse{
		ID:            model.ID,
		CustomerID:    model.CustomerID,
		ContactName:   model.ContactName,
		Designation:   model.Designation,
		ContactNumber: model.ContactNumber,
		Email:         model.Email,
		IsPrimary:     model.IsPrimary,
		Status:        model.Status,
		CreatedAt:     model.CreatedAt,
		UpdatedAt:     model.UpdatedAt,
	}
}

func (s *CustomerContactService) ListByCustomer(db *gorm.DB, companyID, customerID uint64) ([]dto.CustomerContactResponse, error) {
	list, err := s.repo.ListByCustomer(db, companyID, customerID)
	if err != nil {
		return nil, err
	}
	res := make([]dto.CustomerContactResponse, len(list))
	for i, item := range list {
		res[i] = *s.mapToDTO(&item)
	}
	return res, nil
}

func (s *CustomerContactService) Create(db *gorm.DB, companyID, userID, customerID uint64, req *dto.CreateCustomerContactRequest) (*dto.CustomerContactResponse, error) {
	contact := &models.CustomerContact{
		CustomerID:    customerID,
		ContactName:   req.ContactName,
		Designation:   req.Designation,
		ContactNumber: req.ContactNumber,
		Email:         req.Email,
		IsPrimary:     req.IsPrimary,
		Status:        req.Status,
	}

	if err := s.repo.Create(db, contact); err != nil {
		return nil, err
	}

	s.auditSvc.LogAction(db, companyID, userID, "CUSTOMER_CONTACT_CREATED", "Created customer contact: "+contact.ContactName, contact.ID)
	if contact.IsPrimary {
		s.auditSvc.LogAction(db, companyID, userID, "CUSTOMER_PRIMARY_CONTACT_CHANGED", "Set primary customer contact: "+contact.ContactName, contact.ID)
	}
	return s.mapToDTO(contact), nil
}

func (s *CustomerContactService) Update(db *gorm.DB, companyID, userID, customerID, contactID uint64, req *dto.UpdateCustomerContactRequest) (*dto.CustomerContactResponse, error) {
	contact, err := s.repo.GetByID(db, companyID, customerID, contactID)
	if err != nil {
		return nil, errors.New("customer contact not found")
	}

	wasPrimary := contact.IsPrimary
	contact.ContactName = req.ContactName
	contact.Designation = req.Designation
	contact.ContactNumber = req.ContactNumber
	contact.Email = req.Email
	contact.IsPrimary = req.IsPrimary
	contact.Status = req.Status

	if err := s.repo.Update(db, contact); err != nil {
		return nil, err
	}

	s.auditSvc.LogAction(db, companyID, userID, "CUSTOMER_CONTACT_UPDATED", "Updated customer contact: "+contact.ContactName, contact.ID)
	if !wasPrimary && contact.IsPrimary {
		s.auditSvc.LogAction(db, companyID, userID, "CUSTOMER_PRIMARY_CONTACT_CHANGED", "Changed primary customer contact: "+contact.ContactName, contact.ID)
	}
	return s.mapToDTO(contact), nil
}

func (s *CustomerContactService) Delete(db *gorm.DB, companyID, userID, customerID, contactID uint64) error {
	contact, err := s.repo.GetByID(db, companyID, customerID, contactID)
	if err != nil {
		return errors.New("customer contact not found")
	}

	if err := s.repo.Delete(db, companyID, customerID, contactID); err != nil {
		return err
	}

	s.auditSvc.LogAction(db, companyID, userID, "CUSTOMER_CONTACT_DELETED", "Deleted customer contact: "+contact.ContactName, contact.ID)
	return nil
}
