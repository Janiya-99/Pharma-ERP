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

type CustomerService struct {
	repo       *repositories.CustomerRepository
	catRepo    *repositories.CustomerCategoryRepository
	addrRepo   *repositories.CustomerAddressRepository
	contactRep *repositories.CustomerContactRepository
	auditSvc   *AuditLogService
	logger     *zap.Logger
}

func NewCustomerService(
	repo *repositories.CustomerRepository,
	catRepo *repositories.CustomerCategoryRepository,
	addrRepo *repositories.CustomerAddressRepository,
	contactRep *repositories.CustomerContactRepository,
	auditSvc *AuditLogService,
	logger *zap.Logger,
) *CustomerService {
	return &CustomerService{
		repo:       repo,
		catRepo:    catRepo,
		addrRepo:   addrRepo,
		contactRep: contactRep,
		auditSvc:   auditSvc,
		logger:     logger,
	}
}

func (s *CustomerService) mapToListDTO(model *models.Customer) *dto.CustomerListItemResponse {
	catName := ""
	if model.Category != nil {
		catName = model.Category.CategoryName
	}
	exceeded := model.CreditLimit > 0 && model.CurrentBalance > model.CreditLimit
	return &dto.CustomerListItemResponse{
		ID:                   model.ID,
		CompanyID:            model.CompanyID,
		CustomerCode:         model.CustomerCode,
		CustomerName:         model.CustomerName,
		CustomerCategoryID:   model.CustomerCategoryID,
		CustomerCategoryName: catName,
		CustomerType:         model.CustomerType,
		PrimaryContactPerson: model.PrimaryContactPerson,
		PrimaryContactNumber: model.PrimaryContactNumber,
		PrimaryEmail:         model.PrimaryEmail,
		CreditLimit:          model.CreditLimit,
		CreditDays:           model.CreditDays,
		CurrentBalance:       model.CurrentBalance,
		CreditLimitExceeded:  exceeded,
		Status:               model.Status,
		CreatedBy:            model.CreatedBy,
		CreatedAt:            model.CreatedAt,
	}
}

func (s *CustomerService) mapToDetailDTO(model *models.Customer) *dto.CustomerDetailResponse {
	var catRes *dto.CustomerCategoryResponse
	if model.Category != nil {
		catRes = &dto.CustomerCategoryResponse{
			ID:           model.Category.ID,
			CompanyID:    model.Category.CompanyID,
			CategoryCode: model.Category.CategoryCode,
			CategoryName: model.Category.CategoryName,
			Description:  model.Category.Description,
			CreditLimit:  model.Category.CreditLimit,
			CreditDays:   model.Category.CreditDays,
			Status:       model.Category.Status,
			CreatedBy:    model.Category.CreatedBy,
			CreatedAt:    model.Category.CreatedAt,
		}
	}

	addrs := make([]dto.CustomerAddressResponse, len(model.Addresses))
	for i, a := range model.Addresses {
		addrs[i] = dto.CustomerAddressResponse{
			ID:           a.ID,
			CustomerID:   a.CustomerID,
			AddressType:  a.AddressType,
			AddressLine1: a.AddressLine1,
			AddressLine2: a.AddressLine2,
			City:         a.City,
			District:     a.District,
			Province:     a.Province,
			PostalCode:   a.PostalCode,
			Country:      a.Country,
			IsDefault:    a.IsDefault,
			Status:       a.Status,
			CreatedAt:    a.CreatedAt,
			UpdatedAt:    a.UpdatedAt,
		}
	}

	contacts := make([]dto.CustomerContactResponse, len(model.Contacts))
	for i, c := range model.Contacts {
		contacts[i] = dto.CustomerContactResponse{
			ID:            c.ID,
			CustomerID:    c.CustomerID,
			ContactName:   c.ContactName,
			Designation:   c.Designation,
			ContactNumber: c.ContactNumber,
			Email:         c.Email,
			IsPrimary:     c.IsPrimary,
			Status:        c.Status,
			CreatedAt:     c.CreatedAt,
			UpdatedAt:     c.UpdatedAt,
		}
	}

	exceeded := model.CreditLimit > 0 && model.CurrentBalance > model.CreditLimit
	avail := model.CreditLimit - model.CurrentBalance
	if model.CreditLimit == 0 {
		avail = 0
	}

	return &dto.CustomerDetailResponse{
		ID:                         model.ID,
		CompanyID:                  model.CompanyID,
		CustomerCategoryID:         model.CustomerCategoryID,
		CustomerCategory:           catRes,
		CustomerCode:               model.CustomerCode,
		CustomerName:               model.CustomerName,
		CustomerType:               model.CustomerType,
		BusinessRegistrationNumber: model.BusinessRegistrationNumber,
		TaxRegistrationNumber:      model.TaxRegistrationNumber,
		PrimaryContactPerson:       model.PrimaryContactPerson,
		PrimaryContactNumber:       model.PrimaryContactNumber,
		PrimaryEmail:               model.PrimaryEmail,
		BillingAddress:             model.BillingAddress,
		ShippingAddress:            model.ShippingAddress,
		ReceivableAccountID:        model.ReceivableAccountID,
		Status:                     model.Status,
		CreatedBy:                  model.CreatedBy,
		UpdatedBy:                  model.UpdatedBy,
		CreatedAt:                  model.CreatedAt,
		UpdatedAt:                  model.UpdatedAt,
		Addresses:                  addrs,
		Contacts:                   contacts,
		CreditSummary: dto.CreditSummary{
			CreditLimit:         model.CreditLimit,
			CreditDays:          model.CreditDays,
			CurrentBalance:      model.CurrentBalance,
			AvailableCredit:     avail,
			CreditLimitExceeded: exceeded,
		},
		InvoiceSummary: dto.InvoiceSummaryPlaceholder{
			TotalInvoices:   0,
			UnpaidInvoices:  0,
			PaidInvoices:    0,
			LastInvoiceDate: nil,
		},
	}
}

func (s *CustomerService) List(db *gorm.DB, companyID uint64, filters map[string]interface{}, search string, page, limit int) ([]dto.CustomerListItemResponse, int64, error) {
	list, total, err := s.repo.List(db, companyID, filters, search, page, limit)
	if err != nil {
		return nil, 0, err
	}
	res := make([]dto.CustomerListItemResponse, len(list))
	for i, item := range list {
		res[i] = *s.mapToListDTO(&item)
	}
	return res, total, nil
}

func (s *CustomerService) GetByID(db *gorm.DB, companyID uint64, id uint64) (*dto.CustomerDetailResponse, error) {
	cust, err := s.repo.GetByID(db, companyID, id)
	if err != nil {
		return nil, errors.New("customer not found")
	}
	return s.mapToDetailDTO(cust), nil
}

func (s *CustomerService) Create(db *gorm.DB, companyID, userID uint64, req *dto.CreateCustomerRequest) (*dto.CustomerDetailResponse, error) {
	code := strings.TrimSpace(req.CustomerCode)
	if code == "" {
		generated, err := s.repo.GenerateCode(db, companyID)
		if err != nil {
			return nil, err
		}
		code = generated
	} else {
		existing, _ := s.repo.GetByCode(db, companyID, code)
		if existing != nil {
			return nil, errors.New("customer code already exists")
		}
	}

	if req.CustomerCategoryID != nil {
		_, _, err := s.catRepo.GetByID(db, companyID, *req.CustomerCategoryID)
		if err != nil {
			return nil, errors.New("customer category not found")
		}
	}

	cust := &models.Customer{
		CompanyID:                  companyID,
		CustomerCategoryID:         req.CustomerCategoryID,
		CustomerCode:               code,
		CustomerName:               strings.TrimSpace(req.CustomerName),
		CustomerType:               req.CustomerType,
		BusinessRegistrationNumber: req.BusinessRegistrationNumber,
		TaxRegistrationNumber:      req.TaxRegistrationNumber,
		PrimaryContactPerson:       req.PrimaryContactPerson,
		PrimaryContactNumber:       req.PrimaryContactNumber,
		PrimaryEmail:               req.PrimaryEmail,
		BillingAddress:             req.BillingAddress,
		ShippingAddress:            req.ShippingAddress,
		CreditLimit:                req.CreditLimit,
		CreditDays:                 req.CreditDays,
		ReceivableAccountID:        req.ReceivableAccountID,
		Status:                     req.Status,
		CreatedBy:                  &userID,
	}

	if err := s.repo.Create(db, cust); err != nil {
		return nil, err
	}

	for _, aReq := range req.Addresses {
		country := aReq.Country
		if country == "" {
			country = "Sri Lanka"
		}
		addr := models.CustomerAddress{
			CustomerID:   cust.ID,
			AddressType:  aReq.AddressType,
			AddressLine1: aReq.AddressLine1,
			AddressLine2: aReq.AddressLine2,
			City:         aReq.City,
			District:     aReq.District,
			Province:     aReq.Province,
			PostalCode:   aReq.PostalCode,
			Country:      country,
			IsDefault:    aReq.IsDefault,
			Status:       aReq.Status,
		}
		s.addrRepo.Create(db, &addr)
	}

	for _, cReq := range req.Contacts {
		cont := models.CustomerContact{
			CustomerID:    cust.ID,
			ContactName:   cReq.ContactName,
			Designation:   cReq.Designation,
			ContactNumber: cReq.ContactNumber,
			Email:         cReq.Email,
			IsPrimary:     cReq.IsPrimary,
			Status:        cReq.Status,
		}
		s.contactRep.Create(db, &cont)
	}

	s.auditSvc.LogAction(db, companyID, userID, "CUSTOMER_CREATED", "Created customer: "+cust.CustomerCode, cust.ID)
	return s.GetByID(db, companyID, cust.ID)
}

func (s *CustomerService) Update(db *gorm.DB, companyID, userID, id uint64, req *dto.UpdateCustomerRequest) (*dto.CustomerDetailResponse, error) {
	cust, err := s.repo.GetByID(db, companyID, id)
	if err != nil {
		return nil, errors.New("customer not found")
	}

	newCode := strings.TrimSpace(req.CustomerCode)
	if !strings.EqualFold(cust.CustomerCode, newCode) {
		existing, _ := s.repo.GetByCode(db, companyID, newCode)
		if existing != nil && existing.ID != id {
			return nil, errors.New("customer code already exists")
		}
	}

	if req.CustomerCategoryID != nil {
		_, _, err := s.catRepo.GetByID(db, companyID, *req.CustomerCategoryID)
		if err != nil {
			return nil, errors.New("customer category not found")
		}
	}

	cust.CustomerCategoryID = req.CustomerCategoryID
	cust.CustomerCode = newCode
	cust.CustomerName = strings.TrimSpace(req.CustomerName)
	cust.CustomerType = req.CustomerType
	cust.BusinessRegistrationNumber = req.BusinessRegistrationNumber
	cust.TaxRegistrationNumber = req.TaxRegistrationNumber
	cust.PrimaryContactPerson = req.PrimaryContactPerson
	cust.PrimaryContactNumber = req.PrimaryContactNumber
	cust.PrimaryEmail = req.PrimaryEmail
	cust.BillingAddress = req.BillingAddress
	cust.ShippingAddress = req.ShippingAddress
	cust.CreditLimit = req.CreditLimit
	cust.CreditDays = req.CreditDays
	cust.ReceivableAccountID = req.ReceivableAccountID
	cust.Status = req.Status
	cust.UpdatedBy = &userID

	if err := s.repo.Update(db, cust); err != nil {
		return nil, err
	}

	s.auditSvc.LogAction(db, companyID, userID, "CUSTOMER_UPDATED", "Updated customer: "+cust.CustomerCode, cust.ID)
	return s.GetByID(db, companyID, cust.ID)
}

func (s *CustomerService) ChangeStatus(db *gorm.DB, companyID, userID, id uint64, req *dto.ChangeCustomerStatusRequest) error {
	allowed := map[string]bool{"active": true, "inactive": true, "blocked": true, "on_hold": true}
	if !allowed[req.Status] {
		return errors.New("invalid status value")
	}

	cust, err := s.repo.GetByID(db, companyID, id)
	if err != nil {
		return errors.New("customer not found")
	}

	if err := s.repo.UpdateStatus(db, companyID, id, req.Status); err != nil {
		return err
	}

	desc := "Changed customer status to " + req.Status
	if req.Remarks != "" {
		desc += " (" + req.Remarks + ")"
	}
	s.auditSvc.LogAction(db, companyID, userID, "CUSTOMER_STATUS_CHANGED", desc, cust.ID)
	return nil
}

func (s *CustomerService) Delete(db *gorm.DB, companyID, userID, id uint64) error {
	cust, err := s.repo.GetByID(db, companyID, id)
	if err != nil {
		return errors.New("customer not found")
	}

	if err := s.repo.Delete(db, companyID, id); err != nil {
		return err
	}

	s.auditSvc.LogAction(db, companyID, userID, "CUSTOMER_DELETED", "Deleted customer: "+cust.CustomerCode, id)
	return nil
}
