package services

import (
	"errors"

	"github.com/pixandco/erp-phrma/internal/invoicecenter/dto"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/models"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/repositories"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type CustomerAddressService struct {
	repo     *repositories.CustomerAddressRepository
	auditSvc *AuditLogService
	logger   *zap.Logger
}

func NewCustomerAddressService(repo *repositories.CustomerAddressRepository, auditSvc *AuditLogService, logger *zap.Logger) *CustomerAddressService {
	return &CustomerAddressService{repo: repo, auditSvc: auditSvc, logger: logger}
}

func (s *CustomerAddressService) mapToDTO(model *models.CustomerAddress) *dto.CustomerAddressResponse {
	return &dto.CustomerAddressResponse{
		ID:           model.ID,
		CustomerID:   model.CustomerID,
		AddressType:  model.AddressType,
		AddressLine1: model.AddressLine1,
		AddressLine2: model.AddressLine2,
		City:         model.City,
		District:     model.District,
		Province:     model.Province,
		PostalCode:   model.PostalCode,
		Country:      model.Country,
		IsDefault:    model.IsDefault,
		Status:       model.Status,
		CreatedAt:    model.CreatedAt,
		UpdatedAt:    model.UpdatedAt,
	}
}

func (s *CustomerAddressService) ListByCustomer(db *gorm.DB, companyID, customerID uint64) ([]dto.CustomerAddressResponse, error) {
	list, err := s.repo.ListByCustomer(db, companyID, customerID)
	if err != nil {
		return nil, err
	}
	res := make([]dto.CustomerAddressResponse, len(list))
	for i, item := range list {
		res[i] = *s.mapToDTO(&item)
	}
	return res, nil
}

func (s *CustomerAddressService) Create(db *gorm.DB, companyID, userID, customerID uint64, req *dto.CreateCustomerAddressRequest) (*dto.CustomerAddressResponse, error) {
	country := req.Country
	if country == "" {
		country = "Sri Lanka"
	}
	addr := &models.CustomerAddress{
		CustomerID:   customerID,
		AddressType:  req.AddressType,
		AddressLine1: req.AddressLine1,
		AddressLine2: req.AddressLine2,
		City:         req.City,
		District:     req.District,
		Province:     req.Province,
		PostalCode:   req.PostalCode,
		Country:      country,
		IsDefault:    req.IsDefault,
		Status:       req.Status,
	}

	if err := s.repo.Create(db, addr); err != nil {
		return nil, err
	}

	s.auditSvc.LogAction(db, companyID, userID, "CUSTOMER_ADDRESS_CREATED", "Created customer address", addr.ID)
	if addr.IsDefault {
		s.auditSvc.LogAction(db, companyID, userID, "CUSTOMER_DEFAULT_ADDRESS_CHANGED", "Set default customer address", addr.ID)
	}
	return s.mapToDTO(addr), nil
}

func (s *CustomerAddressService) Update(db *gorm.DB, companyID, userID, customerID, addressID uint64, req *dto.UpdateCustomerAddressRequest) (*dto.CustomerAddressResponse, error) {
	addr, err := s.repo.GetByID(db, companyID, customerID, addressID)
	if err != nil {
		return nil, errors.New("customer address not found")
	}

	wasDefault := addr.IsDefault
	country := req.Country
	if country == "" {
		country = "Sri Lanka"
	}

	addr.AddressType = req.AddressType
	addr.AddressLine1 = req.AddressLine1
	addr.AddressLine2 = req.AddressLine2
	addr.City = req.City
	addr.District = req.District
	addr.Province = req.Province
	addr.PostalCode = req.PostalCode
	addr.Country = country
	addr.IsDefault = req.IsDefault
	addr.Status = req.Status

	if err := s.repo.Update(db, addr); err != nil {
		return nil, err
	}

	s.auditSvc.LogAction(db, companyID, userID, "CUSTOMER_ADDRESS_UPDATED", "Updated customer address", addr.ID)
	if !wasDefault && addr.IsDefault {
		s.auditSvc.LogAction(db, companyID, userID, "CUSTOMER_DEFAULT_ADDRESS_CHANGED", "Changed default customer address", addr.ID)
	}
	return s.mapToDTO(addr), nil
}

func (s *CustomerAddressService) Delete(db *gorm.DB, companyID, userID, customerID, addressID uint64) error {
	addr, err := s.repo.GetByID(db, companyID, customerID, addressID)
	if err != nil {
		return errors.New("customer address not found")
	}

	if err := s.repo.Delete(db, companyID, customerID, addressID); err != nil {
		return err
	}

	s.auditSvc.LogAction(db, companyID, userID, "CUSTOMER_ADDRESS_DELETED", "Deleted customer address", addr.ID)
	return nil
}
