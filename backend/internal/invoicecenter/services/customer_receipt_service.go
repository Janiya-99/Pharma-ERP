package services

import (
	"errors"
	"fmt"
	"time"

	"github.com/pixandco/erp-phrma/internal/invoicecenter/dto"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/models"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/repositories"
	"gorm.io/gorm"
)

type CustomerReceiptService struct {
	customerReceiptRepo *repositories.CustomerReceiptRepository
	salesInvoiceRepo    *repositories.SalesInvoiceRepository
	auditService        *AuditLogService
}

func NewCustomerReceiptService(
	customerReceiptRepo *repositories.CustomerReceiptRepository,
	salesInvoiceRepo *repositories.SalesInvoiceRepository,
	auditService *AuditLogService,
) *CustomerReceiptService {
	return &CustomerReceiptService{
		customerReceiptRepo: customerReceiptRepo,
		salesInvoiceRepo:    salesInvoiceRepo,
		auditService:        auditService,
	}
}

func (s *CustomerReceiptService) GenerateCustomerReceiptNumber(db *gorm.DB, companyID uint64) (string, error) {
	return s.customerReceiptRepo.GetLastCustomerReceiptNumber(db, companyID)
}

func (s *CustomerReceiptService) ListCustomerReceipts(db *gorm.DB, companyID uint64, filters map[string]interface{}, search string, page, limit int) ([]models.CustomerReceipt, int64, error) {
	return s.customerReceiptRepo.FindCustomerReceipts(db, companyID, filters, search, page, limit)
}

func (s *CustomerReceiptService) GetCustomerReceiptByID(db *gorm.DB, companyID, id uint64) (*models.CustomerReceipt, error) {
	return s.customerReceiptRepo.FindCustomerReceiptByID(db, companyID, id)
}

func (s *CustomerReceiptService) ValidatePaymentMethodFields(paymentMethod, referenceNumber, bankReferenceNumber, chequeNumber string, chequeDate *string) error {
	if paymentMethod == "cheque" {
		if chequeNumber == "" {
			return errors.New("cheque number is required for cheque payment method")
		}
		if chequeDate == nil || *chequeDate == "" {
			return errors.New("cheque date is required for cheque payment method")
		}
	} else if paymentMethod == "bank_transfer" {
		if bankReferenceNumber == "" {
			return errors.New("bank reference number is required for bank transfer payment method")
		}
	} else if paymentMethod == "card" || paymentMethod == "online" {
		if referenceNumber == "" && bankReferenceNumber == "" {
			return errors.New("reference number or bank reference number is required for card/online payment method")
		}
	}
	return nil
}

func (s *CustomerReceiptService) CreateCustomerReceipt(db *gorm.DB, companyID, branchID, userID uint64, req dto.CreateCustomerReceiptRequest, ipAddress, userAgent string) (*models.CustomerReceipt, error) {
	if err := s.ValidatePaymentMethodFields(req.PaymentMethod, req.ReferenceNumber, req.BankReferenceNumber, req.ChequeNumber, req.ChequeDate); err != nil {
		return nil, err
	}

	customer, err := s.customerReceiptRepo.ValidateCustomer(db, companyID, req.CustomerID)
	if err != nil {
		return nil, err
	}

	receiptNumber, err := s.GenerateCustomerReceiptNumber(db, companyID)
	if err != nil {
		return nil, fmt.Errorf("failed to generate receipt number: %w", err)
	}

	receiptDate, err := time.Parse("2006-01-02", req.ReceiptDate)
	if err != nil {
		return nil, errors.New("invalid receipt date format")
	}

	var parsedChequeDate *time.Time
	if req.ChequeDate != nil && *req.ChequeDate != "" {
		cd, err := time.Parse("2006-01-02", *req.ChequeDate)
		if err != nil {
			return nil, errors.New("invalid cheque date format")
		}
		parsedChequeDate = &cd
	}

	receipt := &models.CustomerReceipt{
		CompanyID:           companyID,
		BranchID:            branchID,
		CustomerID:          req.CustomerID,
		FinancialYearID:     req.FinancialYearID,
		AccountingPeriodID:  req.AccountingPeriodID,
		ReceiptNumber:       receiptNumber,
		ReceiptDate:         receiptDate,
		PaymentMethod:       req.PaymentMethod,
		ReferenceNumber:     req.ReferenceNumber,
		BankReferenceNumber: req.BankReferenceNumber,
		ChequeNumber:        req.ChequeNumber,
		ChequeDate:          parsedChequeDate,
		ReceivedAmount:      req.ReceiptAmount,
		Remarks:             req.Remarks,
		ApprovalStatus:      "draft",
		PostedStatus:        "unposted",
		ReceiptStatus:       "active",
		Status:              "active",
		CreatedBy:           &userID,
		UpdatedBy:           &userID,
	}

	var allocations []models.CustomerReceiptAllocation
	var totalAllocated float64 = 0
	invoiceIDs := make(map[uint64]bool)

	for _, allocReq := range req.Allocations {
		if invoiceIDs[allocReq.SalesInvoiceID] {
			return nil, errors.New("duplicate sales invoice allocation")
		}
		invoiceIDs[allocReq.SalesInvoiceID] = true

		invoice, err := s.customerReceiptRepo.ValidateSalesInvoiceForAllocation(db, companyID, branchID, req.CustomerID, allocReq.SalesInvoiceID)
		if err != nil {
			return nil, fmt.Errorf("invalid sales invoice allocation: %w", err)
		}

		if allocReq.AllocatedAmount > invoice.BalanceAmount {
			return nil, errors.New("allocated amount cannot exceed invoice balance amount")
		}

		allocations = append(allocations, models.CustomerReceiptAllocation{
			AllocationType:  "sales_invoice",
			SalesInvoiceID:  &allocReq.SalesInvoiceID,
			AllocatedAmount: allocReq.AllocatedAmount,
			Remarks:         allocReq.Remarks,
		})
		totalAllocated += allocReq.AllocatedAmount
	}

	if totalAllocated > req.ReceiptAmount {
		return nil, errors.New("total allocated amount cannot exceed receipt amount")
	}

	receipt.AllocatedAmount = totalAllocated
	receipt.UnallocatedAmount = req.ReceiptAmount - totalAllocated
	receipt.Allocations = allocations

	if err := s.customerReceiptRepo.CreateCustomerReceiptWithAllocations(db, receipt); err != nil {
		return nil, err
	}

	receipt.Customer = *customer

	s.auditService.LogAction(db, companyID, userID, "CUSTOMER_RECEIPT_CREATED", "Customer Receipt "+receipt.ReceiptNumber+" created", receipt.ID)

	if receipt.UnallocatedAmount > 0 {
		s.auditService.LogAction(db, companyID, userID, "CUSTOMER_RECEIPT_UNALLOCATED_AMOUNT_STORED", fmt.Sprintf("Unallocated Amount: %.2f stored for %s", receipt.UnallocatedAmount, receipt.ReceiptNumber), receipt.ID)
	}

	return receipt, nil
}

func (s *CustomerReceiptService) UpdateCustomerReceipt(db *gorm.DB, companyID, receiptID, userID uint64, req dto.UpdateCustomerReceiptRequest, ipAddress, userAgent string) (*models.CustomerReceipt, error) {
	receipt, err := s.customerReceiptRepo.FindCustomerReceiptByID(db, companyID, receiptID)
	if err != nil {
		return nil, errors.New("customer receipt not found")
	}

	if receipt.ApprovalStatus != "draft" && receipt.ApprovalStatus != "rejected" {
		return nil, errors.New("only draft or rejected customer receipts can be updated")
	}

	if receipt.PostedStatus == "posted" {
		return nil, errors.New("posted customer receipts cannot be updated")
	}

	if err := s.ValidatePaymentMethodFields(req.PaymentMethod, req.ReferenceNumber, req.BankReferenceNumber, req.ChequeNumber, req.ChequeDate); err != nil {
		return nil, err
	}

	_, err = s.customerReceiptRepo.ValidateCustomer(db, companyID, receipt.CustomerID)
	if err != nil {
		return nil, err
	}

	receiptDate, err := time.Parse("2006-01-02", req.ReceiptDate)
	if err != nil {
		return nil, errors.New("invalid receipt date format")
	}

	var parsedChequeDate *time.Time
	if req.ChequeDate != nil && *req.ChequeDate != "" {
		cd, err := time.Parse("2006-01-02", *req.ChequeDate)
		if err != nil {
			return nil, errors.New("invalid cheque date format")
		}
		parsedChequeDate = &cd
	}

	receipt.ReceiptDate = receiptDate
	receipt.PaymentMethod = req.PaymentMethod
	receipt.ReferenceNumber = req.ReferenceNumber
	receipt.BankReferenceNumber = req.BankReferenceNumber
	receipt.ChequeNumber = req.ChequeNumber
	receipt.ChequeDate = parsedChequeDate
	receipt.ReceivedAmount = req.ReceiptAmount
	receipt.Remarks = req.Remarks
	receipt.UpdatedBy = &userID
	receipt.UpdatedAt = time.Now()

	if receipt.ApprovalStatus == "rejected" {
		receipt.ApprovalStatus = "draft"
	}

	var allocations []models.CustomerReceiptAllocation
	var totalAllocated float64 = 0
	invoiceIDs := make(map[uint64]bool)

	for _, allocReq := range req.Allocations {
		if invoiceIDs[allocReq.SalesInvoiceID] {
			return nil, errors.New("duplicate sales invoice allocation")
		}
		invoiceIDs[allocReq.SalesInvoiceID] = true

		invoice, err := s.customerReceiptRepo.ValidateSalesInvoiceForAllocation(db, companyID, receipt.BranchID, receipt.CustomerID, allocReq.SalesInvoiceID)
		if err != nil {
			return nil, fmt.Errorf("invalid sales invoice allocation: %w", err)
		}

		if allocReq.AllocatedAmount > invoice.BalanceAmount {
			return nil, errors.New("allocated amount cannot exceed invoice balance amount")
		}

		allocations = append(allocations, models.CustomerReceiptAllocation{
			CustomerReceiptID: receipt.ID,
			AllocationType:    "sales_invoice",
			SalesInvoiceID:    &allocReq.SalesInvoiceID,
			AllocatedAmount:   allocReq.AllocatedAmount,
			Remarks:           allocReq.Remarks,
		})
		totalAllocated += allocReq.AllocatedAmount
	}

	if totalAllocated > req.ReceiptAmount {
		return nil, errors.New("total allocated amount cannot exceed receipt amount")
	}

	receipt.AllocatedAmount = totalAllocated
	receipt.UnallocatedAmount = req.ReceiptAmount - totalAllocated
	receipt.Allocations = allocations

	if err := s.customerReceiptRepo.UpdateCustomerReceiptWithAllocations(db, receipt); err != nil {
		return nil, err
	}

	s.auditService.LogAction(db, companyID, userID, "CUSTOMER_RECEIPT_UPDATED", "Customer Receipt "+receipt.ReceiptNumber+" updated", receipt.ID)

	return receipt, nil
}

func (s *CustomerReceiptService) DeleteCustomerReceipt(db *gorm.DB, companyID, receiptID, userID uint64, ipAddress, userAgent string) error {
	receipt, err := s.customerReceiptRepo.FindCustomerReceiptByID(db, companyID, receiptID)
	if err != nil {
		return errors.New("customer receipt not found")
	}

	if receipt.ApprovalStatus != "draft" && receipt.ApprovalStatus != "rejected" {
		return errors.New("only draft or rejected customer receipts can be deleted")
	}

	if receipt.PostedStatus == "posted" || receipt.ApprovalStatus == "cancelled" {
		return errors.New("customer receipt cannot be deleted")
	}

	if err := s.customerReceiptRepo.SoftDeleteCustomerReceipt(db, companyID, receiptID); err != nil {
		return err
	}

	s.auditService.LogAction(db, companyID, userID, "CUSTOMER_RECEIPT_DELETED", "Customer Receipt "+receipt.ReceiptNumber+" deleted", receiptID)
	return nil
}

func (s *CustomerReceiptService) SubmitCustomerReceipt(db *gorm.DB, companyID, receiptID, userID uint64, remarks, ipAddress, userAgent string) error {
	receipt, err := s.customerReceiptRepo.FindCustomerReceiptByID(db, companyID, receiptID)
	if err != nil {
		return errors.New("customer receipt not found")
	}

	if receipt.ApprovalStatus != "draft" && receipt.ApprovalStatus != "rejected" {
		return errors.New("only draft or rejected customer receipts can be submitted")
	}

	if receipt.ReceivedAmount <= 0 {
		return errors.New("receipt amount must be greater than 0")
	}

	if receipt.AllocatedAmount > receipt.ReceivedAmount {
		return errors.New("allocated amount cannot exceed receipt amount")
	}

	_, err = s.customerReceiptRepo.ValidateCustomer(db, companyID, receipt.CustomerID)
	if err != nil {
		return err
	}

	for _, alloc := range receipt.Allocations {
		if alloc.SalesInvoiceID != nil {
			_, err = s.customerReceiptRepo.ValidateSalesInvoiceForAllocation(db, companyID, receipt.BranchID, receipt.CustomerID, *alloc.SalesInvoiceID)
			if err != nil {
				return fmt.Errorf("invalid sales invoice allocation: %w", err)
			}
		}
	}

	now := time.Now()
	err = db.Transaction(func(tx *gorm.DB) error {
		if err := s.customerReceiptRepo.UpdateCustomerReceiptApprovalStatus(tx, companyID, receiptID, "pending", userID, now); err != nil {
			return err
		}
		approval := &models.CustomerReceiptApproval{
			CustomerReceiptID: receiptID,
			Action:            "submitted",
			Remarks:           remarks,
			ActionBy:          userID,
			ActionAt:          now,
		}
		return s.customerReceiptRepo.CreateCustomerReceiptApprovalRecord(tx, approval)
	})
	if err != nil {
		return err
	}

	s.auditService.LogAction(db, companyID, userID, "CUSTOMER_RECEIPT_SUBMITTED", "Customer Receipt "+receipt.ReceiptNumber+" submitted", receiptID)
	return nil
}

func (s *CustomerReceiptService) ApproveCustomerReceipt(db *gorm.DB, companyID, receiptID, userID uint64, remarks, ipAddress, userAgent string) error {
	receipt, err := s.customerReceiptRepo.FindCustomerReceiptByID(db, companyID, receiptID)
	if err != nil {
		return errors.New("customer receipt not found")
	}

	if receipt.ApprovalStatus != "pending" {
		return errors.New("only pending customer receipts can be approved")
	}

	_, err = s.customerReceiptRepo.ValidateCustomer(db, companyID, receipt.CustomerID)
	if err != nil {
		return err
	}

	for _, alloc := range receipt.Allocations {
		if alloc.SalesInvoiceID != nil {
			_, err = s.customerReceiptRepo.ValidateSalesInvoiceForAllocation(db, companyID, receipt.BranchID, receipt.CustomerID, *alloc.SalesInvoiceID)
			if err != nil {
				return fmt.Errorf("invalid sales invoice allocation: %w", err)
			}
		}
	}

	now := time.Now()
	err = db.Transaction(func(tx *gorm.DB) error {
		if err := s.customerReceiptRepo.UpdateCustomerReceiptApprovalStatus(tx, companyID, receiptID, "approved", userID, now); err != nil {
			return err
		}
		approval := &models.CustomerReceiptApproval{
			CustomerReceiptID: receiptID,
			Action:            "approved",
			Remarks:           remarks,
			ActionBy:          userID,
			ActionAt:          now,
		}
		return s.customerReceiptRepo.CreateCustomerReceiptApprovalRecord(tx, approval)
	})
	if err != nil {
		return err
	}

	s.auditService.LogAction(db, companyID, userID, "CUSTOMER_RECEIPT_APPROVED", "Customer Receipt "+receipt.ReceiptNumber+" approved", receiptID)
	return nil
}

func (s *CustomerReceiptService) RejectCustomerReceipt(db *gorm.DB, companyID, receiptID, userID uint64, remarks, ipAddress, userAgent string) error {
	if remarks == "" {
		return errors.New("remarks are required for rejection")
	}

	receipt, err := s.customerReceiptRepo.FindCustomerReceiptByID(db, companyID, receiptID)
	if err != nil {
		return errors.New("customer receipt not found")
	}

	if receipt.ApprovalStatus != "pending" {
		return errors.New("only pending customer receipts can be rejected")
	}

	now := time.Now()
	err = db.Transaction(func(tx *gorm.DB) error {
		if err := s.customerReceiptRepo.UpdateCustomerReceiptApprovalStatus(tx, companyID, receiptID, "rejected", userID, now); err != nil {
			return err
		}
		approval := &models.CustomerReceiptApproval{
			CustomerReceiptID: receiptID,
			Action:            "rejected",
			Remarks:           remarks,
			ActionBy:          userID,
			ActionAt:          now,
		}
		return s.customerReceiptRepo.CreateCustomerReceiptApprovalRecord(tx, approval)
	})
	if err != nil {
		return err
	}

	s.auditService.LogAction(db, companyID, userID, "CUSTOMER_RECEIPT_REJECTED", "Customer Receipt "+receipt.ReceiptNumber+" rejected", receiptID)
	return nil
}

func (s *CustomerReceiptService) CancelCustomerReceipt(db *gorm.DB, companyID, receiptID, userID uint64, remarks, ipAddress, userAgent string) error {
	if remarks == "" {
		return errors.New("remarks are required for cancellation")
	}

	receipt, err := s.customerReceiptRepo.FindCustomerReceiptByID(db, companyID, receiptID)
	if err != nil {
		return errors.New("customer receipt not found")
	}

	if receipt.PostedStatus == "posted" {
		return errors.New("posted customer receipts cannot be cancelled in this step")
	}
	if receipt.ApprovalStatus == "cancelled" || receipt.ReceiptStatus == "cancelled" {
		return errors.New("customer receipt is already cancelled")
	}

	now := time.Now()
	err = db.Transaction(func(tx *gorm.DB) error {
		if err := s.customerReceiptRepo.UpdateCustomerReceiptStatus(tx, companyID, receiptID, "inactive", "cancelled", userID, remarks, now); err != nil {
			return err
		}
		approval := &models.CustomerReceiptApproval{
			CustomerReceiptID: receiptID,
			Action:            "cancelled",
			Remarks:           remarks,
			ActionBy:          userID,
			ActionAt:          now,
		}
		return s.customerReceiptRepo.CreateCustomerReceiptApprovalRecord(tx, approval)
	})
	if err != nil {
		return err
	}

	s.auditService.LogAction(db, companyID, userID, "CUSTOMER_RECEIPT_CANCELLED", "Customer Receipt "+receipt.ReceiptNumber+" cancelled", receiptID)
	return nil
}

func (s *CustomerReceiptService) PostCustomerReceipt(db *gorm.DB, companyID, receiptID, userID uint64, ipAddress, userAgent string) error {
	receipt, err := s.customerReceiptRepo.FindCustomerReceiptByID(db, companyID, receiptID)
	if err != nil {
		return errors.New("customer receipt not found")
	}

	if receipt.ApprovalStatus != "approved" {
		return errors.New("only approved customer receipts can be posted")
	}
	if receipt.PostedStatus == "posted" {
		return errors.New("customer receipt is already posted")
	}

	_, err = s.customerReceiptRepo.ValidateCustomer(db, companyID, receipt.CustomerID)
	if err != nil {
		return err
	}

	now := time.Now()
	err = db.Transaction(func(tx *gorm.DB) error {
		for _, alloc := range receipt.Allocations {
			if alloc.SalesInvoiceID != nil {
				invoice, err := s.customerReceiptRepo.ValidateSalesInvoiceForAllocation(tx, companyID, receipt.BranchID, receipt.CustomerID, *alloc.SalesInvoiceID)
				if err != nil {
					return fmt.Errorf("invalid sales invoice allocation: %w", err)
				}
				if alloc.AllocatedAmount > invoice.BalanceAmount {
					return errors.New("allocated amount cannot exceed invoice balance amount")
				}

				if err := s.customerReceiptRepo.UpdateSalesInvoiceAfterReceiptAllocation(tx, *alloc.SalesInvoiceID, alloc.AllocatedAmount); err != nil {
					return err
				}

				newBalance := invoice.BalanceAmount - alloc.AllocatedAmount
				newPaid := invoice.PaidAmount + alloc.AllocatedAmount
				newPaymentStatus := "unpaid"
				if newBalance <= 0 {
					newPaymentStatus = "paid"
				} else if newPaid > 0 && newBalance > 0 {
					newPaymentStatus = "partially_paid"
				}

				if err := s.customerReceiptRepo.UpdateSalesInvoicePaymentStatus(tx, *alloc.SalesInvoiceID, newPaymentStatus, userID); err != nil {
					return err
				}

				s.auditService.LogAction(tx, companyID, userID, "SALES_INVOICE_PAID_AMOUNT_UPDATED_BY_RECEIPT", fmt.Sprintf("Added: %.2f", alloc.AllocatedAmount), *alloc.SalesInvoiceID)
				s.auditService.LogAction(tx, companyID, userID, "SALES_INVOICE_BALANCE_REDUCED_BY_RECEIPT", fmt.Sprintf("Reduced: %.2f", alloc.AllocatedAmount), *alloc.SalesInvoiceID)
				s.auditService.LogAction(tx, companyID, userID, "SALES_INVOICE_PAYMENT_STATUS_UPDATED_BY_RECEIPT", newPaymentStatus, *alloc.SalesInvoiceID)
			}
		}

		if receipt.AllocatedAmount > 0 {
			if err := s.customerReceiptRepo.UpdateCustomerBalanceAfterReceipt(tx, companyID, receipt.CustomerID, receipt.AllocatedAmount); err != nil {
				return err
			}
			s.auditService.LogAction(tx, companyID, userID, "CUSTOMER_BALANCE_REDUCED_BY_RECEIPT", fmt.Sprintf("Reduced: %.2f", receipt.AllocatedAmount), receipt.CustomerID)
		}

		if err := s.customerReceiptRepo.UpdateCustomerReceiptPostedStatus(tx, companyID, receiptID, "posted", userID, now); err != nil {
			return err
		}

		approval := &models.CustomerReceiptApproval{
			CustomerReceiptID: receiptID,
			Action:            "posted",
			Remarks:           "Receipt posted successfully",
			ActionBy:          userID,
			ActionAt:          now,
		}
		return s.customerReceiptRepo.CreateCustomerReceiptApprovalRecord(tx, approval)
	})
	if err != nil {
		return err
	}

	s.auditService.LogAction(db, companyID, userID, "CUSTOMER_RECEIPT_POSTED", "Customer Receipt "+receipt.ReceiptNumber+" posted", receiptID)
	return nil
}
