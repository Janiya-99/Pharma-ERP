package services

import (
	"errors"
	"strings"
	"time"

	invdto "github.com/pixandco/erp-phrma/internal/inventory/dto"
	invmodels "github.com/pixandco/erp-phrma/internal/inventory/models"
	invservices "github.com/pixandco/erp-phrma/internal/inventory/services"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/dto"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/models"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/repositories"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type SalesInvoiceService struct {
	repo         *repositories.SalesInvoiceRepository
	stockSvc     invservices.InventoryStockMovementService
	auditSvc     *AuditLogService
	logger       *zap.Logger
	activeBranch uint64
}

func NewSalesInvoiceService(repo *repositories.SalesInvoiceRepository, stockSvc invservices.InventoryStockMovementService, auditSvc *AuditLogService, logger *zap.Logger) *SalesInvoiceService {
	return &SalesInvoiceService{
		repo:     repo,
		stockSvc: stockSvc,
		auditSvc: auditSvc,
		logger:   logger,
	}
}

func (s *SalesInvoiceService) GenerateSalesInvoiceNumber(db *gorm.DB, companyID uint64) (string, error) {
	return s.repo.GetLastSalesInvoiceNumber(db, companyID)
}

func (s *SalesInvoiceService) CalculateDueDate(invoiceDate time.Time, customer *models.Customer, dueDateString string) (*time.Time, error) {
	if dueDateString != "" {
		dueDate, err := time.Parse("2006-01-02", dueDateString)
		if err != nil {
			return nil, errors.New("invalid due date format")
		}
		if dueDate.Before(invoiceDate) {
			return nil, errors.New("due date cannot be before invoice date")
		}
		return &dueDate, nil
	}
	if customer.CreditDays > 0 {
		dueDate := invoiceDate.AddDate(0, 0, customer.CreditDays)
		return &dueDate, nil
	}
	return nil, nil
}

func (s *SalesInvoiceService) CalculateSalesInvoiceLineTotals(qty, unitPrice, discount, tax float64) float64 {
	return qty*unitPrice - discount + tax
}

func (s *SalesInvoiceService) CalculateSalesInvoiceHeaderTotals(lines []models.SalesInvoiceLine) (float64, float64, float64, float64) {
	var subtotal, discount, tax, total float64
	for _, line := range lines {
		subtotal += line.Quantity * line.UnitPrice
		discount += line.DiscountAmount
		tax += line.TaxAmount
		total += line.LineTotal
	}
	return subtotal, discount, tax, total
}

func (s *SalesInvoiceService) ValidateCustomerForInvoice(db *gorm.DB, companyID, customerID uint64) (*models.Customer, error) {
	customer, err := s.repo.ValidateCustomer(db, companyID, customerID)
	if err != nil {
		return nil, err
	}
	if customer.Status == "blocked" || customer.Status == "inactive" || customer.Status == "on_hold" {
		return nil, errors.New("customer status is not allowed for sales invoices")
	}
	return customer, nil
}

func (s *SalesInvoiceService) ValidateCustomerCreditLimit(customer *models.Customer, invoiceTotal float64) error {
	projectedBalance := customer.CurrentBalance + invoiceTotal
	if customer.CreditLimit > 0 && projectedBalance > customer.CreditLimit {
		return errors.New("Customer credit limit will be exceeded by this invoice")
	}
	return nil
}

func (s *SalesInvoiceService) ValidateWarehouseForInvoice(db *gorm.DB, companyID, branchID, warehouseID uint64) (*invmodels.Warehouse, error) {
	return s.repo.ValidateWarehouse(db, companyID, branchID, warehouseID)
}

func (s *SalesInvoiceService) ValidateProductForInvoice(db *gorm.DB, companyID uint64, line dto.CreateSalesInvoiceLineRequest) (*invmodels.Product, *invmodels.ProductBatch, error) {
	product, err := s.repo.ValidateProduct(db, companyID, line.ProductID)
	if err != nil {
		return nil, nil, err
	}

	var batch *invmodels.ProductBatch
	if product.RequiresBatchTracking && line.ProductBatchID == nil {
		return nil, nil, errors.New("product batch is required for batch-tracked product")
	}
	if line.ProductBatchID != nil && *line.ProductBatchID > 0 {
		batch, err = s.repo.ValidateProductBatch(db, companyID, line.ProductID, *line.ProductBatchID)
		if err != nil {
			return nil, nil, err
		}
	}
	return product, batch, nil
}

func (s *SalesInvoiceService) ValidateSalesOrderForInvoice(db *gorm.DB, companyID uint64, req dto.CreateSalesInvoiceRequest) (*models.SalesOrder, error) {
	if req.SalesOrderID == nil {
		return nil, nil
	}
	order, err := s.repo.ValidateSalesOrder(db, companyID, *req.SalesOrderID)
	if err != nil {
		return nil, err
	}
	if order.BranchID != req.BranchID {
		return nil, errors.New("sales order branch does not match invoice branch")
	}
	if order.CustomerID != req.CustomerID {
		return nil, errors.New("sales order customer does not match invoice customer")
	}
	if order.ApprovalStatus != "approved" {
		return nil, errors.New("sales order must be approved before invoicing")
	}
	if order.OrderStatus != "open" && order.OrderStatus != "partially_invoiced" {
		return nil, errors.New("sales order cannot be invoiced in its current status")
	}
	return order, nil
}

func (s *SalesInvoiceService) ValidateSalesOrderLineForInvoice(db *gorm.DB, salesOrderID uint64, reqLine dto.CreateSalesInvoiceLineRequest) error {
	if reqLine.SalesOrderLineID == nil {
		return nil
	}
	orderLine, err := s.repo.ValidateSalesOrderLine(db, salesOrderID, *reqLine.SalesOrderLineID)
	if err != nil {
		return err
	}
	if orderLine.ProductID != reqLine.ProductID {
		return errors.New("sales order line product does not match invoice line product")
	}
	if orderLine.ProductBatchID != nil {
		if reqLine.ProductBatchID == nil || *orderLine.ProductBatchID != *reqLine.ProductBatchID {
			return errors.New("sales order line batch does not match invoice line batch")
		}
	}
	if reqLine.Quantity > orderLine.PendingQuantity {
		return errors.New("invoice quantity cannot exceed sales order line pending quantity")
	}
	return nil
}

func (s *SalesInvoiceService) ValidateStockAvailabilityForInvoice(db *gorm.DB, companyID uint64, req dto.CreateSalesInvoiceRequest) error {
	for _, line := range req.Lines {
		if _, err := s.repo.ValidateStockAvailability(db, companyID, req.WarehouseID, line.WarehouseLocationID, line.ProductID, line.ProductBatchID, line.Quantity); err != nil {
			return err
		}
	}
	return nil
}

func (s *SalesInvoiceService) ValidateSalesInvoiceLines(db *gorm.DB, companyID uint64, order *models.SalesOrder, req dto.CreateSalesInvoiceRequest) ([]models.SalesInvoiceLine, error) {
	if len(req.Lines) == 0 {
		return nil, errors.New("at least one line is required")
	}

	lines := make([]models.SalesInvoiceLine, 0, len(req.Lines))
	for idx, line := range req.Lines {
		if line.Quantity <= 0 {
			return nil, errors.New("quantity must be greater than zero")
		}
		if line.UnitPrice < 0 || line.DiscountAmount < 0 || line.TaxAmount < 0 {
			return nil, errors.New("unit price, discount, and tax amounts cannot be negative")
		}
		if line.WarehouseLocationID != nil {
			if _, err := s.repo.ValidateWarehouseLocation(db, companyID, req.WarehouseID, *line.WarehouseLocationID); err != nil {
				return nil, err
			}
		}
		if _, _, err := s.ValidateProductForInvoice(db, companyID, line); err != nil {
			return nil, err
		}
		if order != nil {
			if line.SalesOrderLineID == nil {
				return nil, errors.New("sales order line is required when invoicing from a sales order")
			}
			if err := s.ValidateSalesOrderLineForInvoice(db, order.ID, line); err != nil {
				return nil, err
			}
		} else if line.SalesOrderLineID != nil {
			return nil, errors.New("sales order line cannot be provided without sales_order_id")
		}
		if _, err := s.repo.ValidateStockAvailability(db, companyID, req.WarehouseID, line.WarehouseLocationID, line.ProductID, line.ProductBatchID, line.Quantity); err != nil {
			return nil, err
		}

		lines = append(lines, models.SalesInvoiceLine{
			SalesOrderLineID:    line.SalesOrderLineID,
			WarehouseLocationID: line.WarehouseLocationID,
			ProductID:           line.ProductID,
			ProductBatchID:      line.ProductBatchID,
			Quantity:            line.Quantity,
			UnitPrice:           line.UnitPrice,
			DiscountAmount:      line.DiscountAmount,
			TaxAmount:           line.TaxAmount,
			LineTotal:           s.CalculateSalesInvoiceLineTotals(line.Quantity, line.UnitPrice, line.DiscountAmount, line.TaxAmount),
			LineRemarks:         line.LineRemarks,
			LineOrder:           idx + 1,
		})
	}
	return lines, nil
}

func (s *SalesInvoiceService) ValidateSalesInvoice(db *gorm.DB, companyID, activeBranchID uint64, req dto.CreateSalesInvoiceRequest) (*models.Customer, *models.SalesOrder, []models.SalesInvoiceLine, time.Time, *time.Time, error) {
	if req.BranchID != activeBranchID {
		return nil, nil, nil, time.Time{}, nil, errors.New("branch_id must match active branch")
	}
	customer, err := s.ValidateCustomerForInvoice(db, companyID, req.CustomerID)
	if err != nil {
		return nil, nil, nil, time.Time{}, nil, err
	}
	if _, err := s.ValidateWarehouseForInvoice(db, companyID, req.BranchID, req.WarehouseID); err != nil {
		return nil, nil, nil, time.Time{}, nil, err
	}
	invoiceDate, err := time.Parse("2006-01-02", req.InvoiceDate)
	if err != nil {
		return nil, nil, nil, time.Time{}, nil, errors.New("invalid invoice date format")
	}
	dueDate, err := s.CalculateDueDate(invoiceDate, customer, req.DueDate)
	if err != nil {
		return nil, nil, nil, time.Time{}, nil, err
	}
	order, err := s.ValidateSalesOrderForInvoice(db, companyID, req)
	if err != nil {
		return nil, nil, nil, time.Time{}, nil, err
	}
	lines, err := s.ValidateSalesInvoiceLines(db, companyID, order, req)
	if err != nil {
		return nil, nil, nil, time.Time{}, nil, err
	}
	_, _, _, total := s.CalculateSalesInvoiceHeaderTotals(lines)
	if err := s.ValidateCustomerCreditLimit(customer, total); err != nil {
		return nil, nil, nil, time.Time{}, nil, err
	}
	return customer, order, lines, invoiceDate, dueDate, nil
}

func (s *SalesInvoiceService) getActionsMetadata(invoice *models.SalesInvoice) map[string]bool {
	isDraftOrRejected := invoice.ApprovalStatus == "draft" || invoice.ApprovalStatus == "rejected"
	isPending := invoice.ApprovalStatus == "pending"
	isApproved := invoice.ApprovalStatus == "approved"
	isPosted := invoice.PostedStatus == "posted"
	isPaid := invoice.PaidAmount > 0

	return map[string]bool{
		"can_edit":    isDraftOrRejected && !isPosted,
		"can_delete":  isDraftOrRejected && !isPosted && !isPaid,
		"can_submit":  isDraftOrRejected && !isPosted,
		"can_approve": isPending,
		"can_reject":  isPending,
		"can_post":    isApproved && !isPosted,
		"can_cancel":  (isDraftOrRejected || isPending || isApproved) && !isPosted && !isPaid,
	}
}

func (s *SalesInvoiceService) ListSalesInvoices(db *gorm.DB, companyID uint64, filters map[string]interface{}, search string, page, limit int) ([]dto.SalesInvoiceListItemResponse, int64, error) {
	invoices, total, err := s.repo.FindSalesInvoices(db, companyID, filters, search, page, limit)
	if err != nil {
		return nil, 0, err
	}

	var responses []dto.SalesInvoiceListItemResponse
	for _, invoice := range invoices {
		var dueDate *string
		if invoice.DueDate != nil {
			formatted := invoice.DueDate.Format("2006-01-02")
			dueDate = &formatted
		}
		branch := s.branchMap(db, companyID, invoice.BranchID)
		warehouse := s.warehouseMap(db, companyID, invoice.WarehouseID)
		var salesOrder map[string]interface{}
		if invoice.SalesOrder != nil {
			salesOrder = map[string]interface{}{
				"id":                 invoice.SalesOrder.ID,
				"sales_order_number": invoice.SalesOrder.SalesOrderNumber,
			}
		}
		responses = append(responses, dto.SalesInvoiceListItemResponse{
			ID:                      invoice.ID,
			InvoiceNumber:           invoice.InvoiceNumber,
			InvoiceDate:             invoice.InvoiceDate.Format("2006-01-02"),
			DueDate:                 dueDate,
			Branch:                  branch,
			CustomerCode:            invoice.Customer.CustomerCode,
			CustomerName:            invoice.Customer.CustomerName,
			SalesOrder:              salesOrder,
			Warehouse:               warehouse,
			CustomerReferenceNumber: invoice.CustomerReferenceNumber,
			SubtotalAmount:          invoice.SubtotalAmount,
			DiscountAmount:          invoice.DiscountAmount,
			TaxAmount:               invoice.TaxAmount,
			TotalAmount:             invoice.TotalAmount,
			PaidAmount:              invoice.PaidAmount,
			BalanceAmount:           invoice.BalanceAmount,
			ApprovalStatus:          invoice.ApprovalStatus,
			PostedStatus:            invoice.PostedStatus,
			PaymentStatus:           invoice.PaymentStatus,
			CreatedBy:               invoice.CreatedBy,
			CreatedAt:               invoice.CreatedAt,
			ActionsMetadata:         s.getActionsMetadata(&invoice),
		})
	}
	return responses, total, nil
}

func (s *SalesInvoiceService) GetSalesInvoiceByID(db *gorm.DB, companyID, id uint64) (*dto.SalesInvoiceDetailResponse, error) {
	invoice, err := s.repo.FindSalesInvoiceByID(db, companyID, id)
	if err != nil {
		return nil, err
	}

	var dueDate *string
	if invoice.DueDate != nil {
		formatted := invoice.DueDate.Format("2006-01-02")
		dueDate = &formatted
	}

	productIDs, batchIDs, locationIDs := collectInvoiceLineIDs(invoice.Lines)
	productMap, _ := s.repo.GetProductMap(db, companyID, productIDs)
	batchMap, _ := s.repo.GetBatchMap(db, companyID, batchIDs)
	locationMap, _ := s.repo.GetWarehouseLocationMap(db, companyID, locationIDs)

	lineResponses := make([]dto.SalesInvoiceLineResponse, 0, len(invoice.Lines))
	for _, line := range invoice.Lines {
		lineResponses = append(lineResponses, s.lineResponse(line, productMap, batchMap, locationMap))
	}

	approvalResponses := make([]dto.SalesInvoiceApprovalResponse, 0, len(invoice.Approvals))
	for _, approval := range invoice.Approvals {
		approvalResponses = append(approvalResponses, dto.SalesInvoiceApprovalResponse{
			ID:       approval.ID,
			Action:   approval.Action,
			Remarks:  approval.Remarks,
			ActionBy: approval.ActionBy,
			ActionAt: approval.ActionAt,
		})
	}

	var salesOrder map[string]interface{}
	if invoice.SalesOrder != nil {
		salesOrder = map[string]interface{}{
			"id":                 invoice.SalesOrder.ID,
			"sales_order_number": invoice.SalesOrder.SalesOrderNumber,
			"order_status":       invoice.SalesOrder.OrderStatus,
		}
	}

	return &dto.SalesInvoiceDetailResponse{
		ID:                      invoice.ID,
		CompanyID:               invoice.CompanyID,
		BranchID:                invoice.BranchID,
		Branch:                  s.branchMap(db, companyID, invoice.BranchID),
		CustomerID:              invoice.CustomerID,
		Customer:                s.customerMap(invoice.Customer),
		SalesOrderID:            invoice.SalesOrderID,
		SalesOrder:              salesOrder,
		WarehouseID:             invoice.WarehouseID,
		Warehouse:               s.warehouseMap(db, companyID, invoice.WarehouseID),
		FinancialYearID:         invoice.FinancialYearID,
		AccountingPeriodID:      invoice.AccountingPeriodID,
		InvoiceNumber:           invoice.InvoiceNumber,
		InvoiceDate:             invoice.InvoiceDate.Format("2006-01-02"),
		DueDate:                 dueDate,
		CustomerReferenceNumber: invoice.CustomerReferenceNumber,
		Remarks:                 invoice.Remarks,
		SubtotalAmount:          invoice.SubtotalAmount,
		DiscountAmount:          invoice.DiscountAmount,
		TaxAmount:               invoice.TaxAmount,
		TotalAmount:             invoice.TotalAmount,
		PaidAmount:              invoice.PaidAmount,
		BalanceAmount:           invoice.BalanceAmount,
		ApprovalStatus:          invoice.ApprovalStatus,
		PostedStatus:            invoice.PostedStatus,
		PaymentStatus:           invoice.PaymentStatus,
		Status:                  invoice.Status,
		ApprovedBy:              invoice.ApprovedBy,
		ApprovedAt:              invoice.ApprovedAt,
		PostedBy:                invoice.PostedBy,
		PostedAt:                invoice.PostedAt,
		CancelledBy:             invoice.CancelledBy,
		CancelledAt:             invoice.CancelledAt,
		CancelReason:            invoice.CancelReason,
		CreatedBy:               invoice.CreatedBy,
		UpdatedBy:               invoice.UpdatedBy,
		CreatedAt:               invoice.CreatedAt,
		UpdatedAt:               invoice.UpdatedAt,
		Lines:                   lineResponses,
		Approvals:               approvalResponses,
		StockPostingSummary: map[string]interface{}{
			"posted_status": invoice.PostedStatus,
			"posted_by":     invoice.PostedBy,
			"posted_at":     invoice.PostedAt,
		},
		PaymentSummary: map[string]interface{}{
			"paid_amount":    invoice.PaidAmount,
			"balance_amount": invoice.BalanceAmount,
			"payment_status": invoice.PaymentStatus,
		},
		ActionsMetadata: s.getActionsMetadata(invoice),
	}, nil
}

func (s *SalesInvoiceService) CreateSalesInvoice(db *gorm.DB, companyID, userID, activeBranchID uint64, req dto.CreateSalesInvoiceRequest) (*models.SalesInvoice, error) {
	_, _, lines, invoiceDate, dueDate, err := s.ValidateSalesInvoice(db, companyID, activeBranchID, req)
	if err != nil {
		return nil, err
	}
	invoiceNumber, err := s.GenerateSalesInvoiceNumber(db, companyID)
	if err != nil {
		return nil, err
	}
	subtotal, discount, tax, total := s.CalculateSalesInvoiceHeaderTotals(lines)
	invoice := &models.SalesInvoice{
		CompanyID:               companyID,
		BranchID:                req.BranchID,
		CustomerID:              req.CustomerID,
		SalesOrderID:            req.SalesOrderID,
		WarehouseID:             req.WarehouseID,
		FinancialYearID:         req.FinancialYearID,
		AccountingPeriodID:      req.AccountingPeriodID,
		InvoiceNumber:           invoiceNumber,
		InvoiceDate:             invoiceDate,
		DueDate:                 dueDate,
		CustomerReferenceNumber: req.CustomerReferenceNumber,
		Remarks:                 req.Remarks,
		SubtotalAmount:          subtotal,
		DiscountAmount:          discount,
		TaxAmount:               tax,
		TotalAmount:             total,
		PaidAmount:              0,
		BalanceAmount:           total,
		ApprovalStatus:          "draft",
		PostedStatus:            "unposted",
		PaymentStatus:           "unpaid",
		Status:                  "active",
		CreatedBy:               &userID,
		UpdatedBy:               &userID,
		Lines:                   lines,
	}
	if err := s.repo.CreateSalesInvoiceWithLines(db, invoice); err != nil {
		return nil, err
	}
	s.auditSvc.LogAction(db, companyID, userID, "SALES_INVOICE_CREATED", "Sales Invoice "+invoiceNumber+" created", invoice.ID)
	return invoice, nil
}

func (s *SalesInvoiceService) UpdateSalesInvoice(db *gorm.DB, companyID, userID, activeBranchID, id uint64, req dto.CreateSalesInvoiceRequest) (*models.SalesInvoice, error) {
	existing, err := s.repo.FindSalesInvoiceByID(db, companyID, id)
	if err != nil {
		return nil, err
	}
	if existing.ApprovalStatus != "draft" && existing.ApprovalStatus != "rejected" {
		return nil, errors.New("only draft or rejected sales invoices can be updated")
	}
	if existing.PostedStatus == "posted" {
		return nil, errors.New("posted sales invoices cannot be updated")
	}
	_, _, lines, invoiceDate, dueDate, err := s.ValidateSalesInvoice(db, companyID, activeBranchID, req)
	if err != nil {
		return nil, err
	}
	subtotal, discount, tax, total := s.CalculateSalesInvoiceHeaderTotals(lines)

	existing.BranchID = req.BranchID
	existing.CustomerID = req.CustomerID
	existing.SalesOrderID = req.SalesOrderID
	existing.WarehouseID = req.WarehouseID
	existing.FinancialYearID = req.FinancialYearID
	existing.AccountingPeriodID = req.AccountingPeriodID
	existing.InvoiceDate = invoiceDate
	existing.DueDate = dueDate
	existing.CustomerReferenceNumber = req.CustomerReferenceNumber
	existing.Remarks = req.Remarks
	existing.SubtotalAmount = subtotal
	existing.DiscountAmount = discount
	existing.TaxAmount = tax
	existing.TotalAmount = total
	existing.BalanceAmount = total - existing.PaidAmount
	existing.UpdatedBy = &userID
	existing.Lines = lines
	if existing.ApprovalStatus == "rejected" {
		existing.ApprovalStatus = "draft"
	}
	if err := s.repo.UpdateSalesInvoiceWithLines(db, existing); err != nil {
		return nil, err
	}
	s.auditSvc.LogAction(db, companyID, userID, "SALES_INVOICE_UPDATED", "Sales Invoice "+existing.InvoiceNumber+" updated", id)
	return existing, nil
}

func (s *SalesInvoiceService) DeleteSalesInvoice(db *gorm.DB, companyID, userID, id uint64) error {
	existing, err := s.repo.FindSalesInvoiceByID(db, companyID, id)
	if err != nil {
		return err
	}
	if existing.ApprovalStatus != "draft" && existing.ApprovalStatus != "rejected" {
		return errors.New("only draft or rejected sales invoices can be deleted")
	}
	if existing.PostedStatus == "posted" {
		return errors.New("posted sales invoices cannot be deleted")
	}
	if existing.PaidAmount > 0 {
		return errors.New("paid sales invoices cannot be deleted")
	}
	inUse, err := s.repo.CheckInvoicePaymentUsage(db, id)
	if err != nil {
		return err
	}
	if inUse {
		return errors.New("sales invoice has payment allocations")
	}
	if err := s.repo.SoftDeleteSalesInvoice(db, companyID, id); err != nil {
		return err
	}
	s.auditSvc.LogAction(db, companyID, userID, "SALES_INVOICE_DELETED", "Sales Invoice "+existing.InvoiceNumber+" deleted", id)
	return nil
}

func (s *SalesInvoiceService) SubmitSalesInvoice(db *gorm.DB, companyID, userID, id uint64, remarks string) error {
	existing, err := s.repo.FindSalesInvoiceByID(db, companyID, id)
	if err != nil {
		return err
	}
	if existing.ApprovalStatus != "draft" && existing.ApprovalStatus != "rejected" {
		return errors.New("only draft or rejected sales invoices can be submitted")
	}
	if len(existing.Lines) == 0 {
		return errors.New("sales invoice must have at least one line")
	}
	if existing.TotalAmount < 0 {
		return errors.New("total amount cannot be negative")
	}
	if err := s.revalidateExistingInvoice(db, companyID, existing, true); err != nil {
		return err
	}
	now := time.Now()
	err = db.Transaction(func(tx *gorm.DB) error {
		if err := s.repo.UpdateSalesInvoiceApprovalStatus(tx, companyID, id, "pending", userID, now); err != nil {
			return err
		}
		return s.repo.CreateSalesInvoiceApprovalRecord(tx, &models.SalesInvoiceApproval{SalesInvoiceID: id, Action: "submitted", Remarks: remarks, ActionBy: userID, ActionAt: now})
	})
	if err != nil {
		return err
	}
	s.auditSvc.LogAction(db, companyID, userID, "SALES_INVOICE_SUBMITTED", "Sales Invoice "+existing.InvoiceNumber+" submitted", id)
	return nil
}

func (s *SalesInvoiceService) ApproveSalesInvoice(db *gorm.DB, companyID, userID, id uint64, remarks string) error {
	existing, err := s.repo.FindSalesInvoiceByID(db, companyID, id)
	if err != nil {
		return err
	}
	if existing.ApprovalStatus != "pending" {
		return errors.New("only pending sales invoices can be approved")
	}
	if err := s.revalidateExistingInvoice(db, companyID, existing, true); err != nil {
		return err
	}
	now := time.Now()
	err = db.Transaction(func(tx *gorm.DB) error {
		if err := s.repo.UpdateSalesInvoiceApprovalStatus(tx, companyID, id, "approved", userID, now); err != nil {
			return err
		}
		return s.repo.CreateSalesInvoiceApprovalRecord(tx, &models.SalesInvoiceApproval{SalesInvoiceID: id, Action: "approved", Remarks: remarks, ActionBy: userID, ActionAt: now})
	})
	if err != nil {
		return err
	}
	s.auditSvc.LogAction(db, companyID, userID, "SALES_INVOICE_APPROVED", "Sales Invoice "+existing.InvoiceNumber+" approved", id)
	return nil
}

func (s *SalesInvoiceService) RejectSalesInvoice(db *gorm.DB, companyID, userID, id uint64, remarks string) error {
	existing, err := s.repo.FindSalesInvoiceByID(db, companyID, id)
	if err != nil {
		return err
	}
	if existing.ApprovalStatus != "pending" {
		return errors.New("only pending sales invoices can be rejected")
	}
	if strings.TrimSpace(remarks) == "" {
		return errors.New("remarks are required when rejecting a sales invoice")
	}
	now := time.Now()
	err = db.Transaction(func(tx *gorm.DB) error {
		if err := s.repo.UpdateSalesInvoiceApprovalStatus(tx, companyID, id, "rejected", userID, now); err != nil {
			return err
		}
		return s.repo.CreateSalesInvoiceApprovalRecord(tx, &models.SalesInvoiceApproval{SalesInvoiceID: id, Action: "rejected", Remarks: remarks, ActionBy: userID, ActionAt: now})
	})
	if err != nil {
		return err
	}
	s.auditSvc.LogAction(db, companyID, userID, "SALES_INVOICE_REJECTED", "Sales Invoice "+existing.InvoiceNumber+" rejected", id)
	return nil
}

func (s *SalesInvoiceService) PostSalesInvoice(db *gorm.DB, companyID, userID, id uint64) error {
	existing, err := s.repo.FindSalesInvoiceByID(db, companyID, id)
	if err != nil {
		return err
	}
	if existing.ApprovalStatus != "approved" {
		return errors.New("only approved sales invoices can be posted")
	}
	if existing.PostedStatus == "posted" {
		return errors.New("sales invoice is already posted")
	}
	ledgerExists, err := s.repo.CheckSalesInvoiceLedgerExists(db, id)
	if err != nil {
		return err
	}
	if ledgerExists {
		return errors.New("Sales invoice is already posted to stock ledger")
	}
	if err := s.revalidateExistingInvoice(db, companyID, existing, true); err != nil {
		return err
	}

	now := time.Now()
	err = db.Transaction(func(tx *gorm.DB) error {
		if err := s.PostSalesInvoiceStockMovements(tx, companyID, userID, existing); err != nil {
			return err
		}
		if existing.SalesOrderID != nil {
			if err := s.UpdateLinkedSalesOrderInvoicingStatus(tx, existing); err != nil {
				return err
			}
			s.auditSvc.LogAction(tx, companyID, userID, "SALES_ORDER_INVOICED_QUANTITY_UPDATED", "Sales order invoiced quantities updated", *existing.SalesOrderID)
		}
		if err := s.UpdateCustomerBalanceAfterPosting(tx, companyID, existing.CustomerID, existing.BalanceAmount); err != nil {
			return err
		}
		s.auditSvc.LogAction(tx, companyID, userID, "CUSTOMER_BALANCE_UPDATED", "Customer balance updated from sales invoice "+existing.InvoiceNumber, existing.CustomerID)
		if err := s.repo.UpdateSalesInvoicePostedStatus(tx, companyID, id, "posted", userID, now); err != nil {
			return err
		}
		return s.repo.CreateSalesInvoiceApprovalRecord(tx, &models.SalesInvoiceApproval{SalesInvoiceID: id, Action: "posted", Remarks: "Posted to stock ledger", ActionBy: userID, ActionAt: now})
	})
	if err != nil {
		return err
	}
	s.auditSvc.LogAction(db, companyID, userID, "SALES_INVOICE_POSTED", "Sales Invoice "+existing.InvoiceNumber+" posted", id)
	return nil
}

func (s *SalesInvoiceService) CancelSalesInvoice(db *gorm.DB, companyID, userID, id uint64, remarks string) error {
	existing, err := s.repo.FindSalesInvoiceByID(db, companyID, id)
	if err != nil {
		return err
	}
	if existing.PostedStatus == "posted" {
		return errors.New("posted sales invoices cannot be cancelled in Step 52")
	}
	if existing.PaidAmount > 0 {
		return errors.New("paid sales invoices cannot be cancelled")
	}
	if existing.ApprovalStatus != "draft" && existing.ApprovalStatus != "rejected" && existing.ApprovalStatus != "pending" && existing.ApprovalStatus != "approved" {
		return errors.New("sales invoice cannot be cancelled in its current status")
	}
	if strings.TrimSpace(remarks) == "" {
		return errors.New("remarks are required when cancelling a sales invoice")
	}
	now := time.Now()
	err = db.Transaction(func(tx *gorm.DB) error {
		if err := s.repo.CancelSalesInvoice(tx, companyID, id, userID, remarks, now); err != nil {
			return err
		}
		return s.repo.CreateSalesInvoiceApprovalRecord(tx, &models.SalesInvoiceApproval{SalesInvoiceID: id, Action: "cancelled", Remarks: remarks, ActionBy: userID, ActionAt: now})
	})
	if err != nil {
		return err
	}
	s.auditSvc.LogAction(db, companyID, userID, "SALES_INVOICE_CANCELLED", "Sales Invoice "+existing.InvoiceNumber+" cancelled", id)
	return nil
}

func (s *SalesInvoiceService) PostSalesInvoiceStockMovements(db *gorm.DB, companyID, userID uint64, invoice *models.SalesInvoice) error {
	for _, line := range invoice.Lines {
		balance, err := s.repo.ValidateStockAvailability(db, companyID, invoice.WarehouseID, line.WarehouseLocationID, line.ProductID, line.ProductBatchID, line.Quantity)
		if err != nil {
			return err
		}
		unitCost := balance.AverageCost
		payload := invdto.StockOutPayload{
			CompanyID:           companyID,
			BranchID:            invoice.BranchID,
			WarehouseID:         invoice.WarehouseID,
			WarehouseLocationID: line.WarehouseLocationID,
			ProductID:           line.ProductID,
			ProductBatchID:      line.ProductBatchID,
			TransactionDate:     time.Now(),
			SourceType:          "sales_invoice",
			SourceID:            invoice.ID,
			SourceNumber:        invoice.InvoiceNumber,
			Quantity:            line.Quantity,
			UnitCost:            unitCost,
			Remarks:             "Sales invoice stock issue",
			CreatedBy:           userID,
		}
		if err := s.stockSvc.ProcessStockOut(db, payload); err != nil {
			return err
		}
		if err := s.repo.UpdateSalesInvoiceLineStockCost(db, line.ID, unitCost, unitCost*line.Quantity); err != nil {
			return err
		}
		s.auditSvc.LogAction(db, companyID, userID, "SALES_INVOICE_OUT_LEDGER_CREATED", "Sales invoice stock ledger entry created", invoice.ID)
		s.auditSvc.LogAction(db, companyID, userID, "STOCK_BALANCE_UPDATED", "Stock balance updated from sales invoice "+invoice.InvoiceNumber, line.ProductID)
		s.auditSvc.LogAction(db, companyID, userID, "STOCK_LEDGER_ENTRY_CREATED", "Stock ledger entry created from sales invoice "+invoice.InvoiceNumber, invoice.ID)
	}
	return nil
}

func (s *SalesInvoiceService) UpdateLinkedSalesOrderInvoicingStatus(db *gorm.DB, invoice *models.SalesInvoice) error {
	if invoice.SalesOrderID == nil {
		return nil
	}
	for _, line := range invoice.Lines {
		if line.SalesOrderLineID != nil {
			if err := s.repo.UpdateSalesOrderLineInvoicedQuantity(db, *line.SalesOrderLineID, line.Quantity); err != nil {
				return err
			}
		}
	}
	_, err := s.repo.UpdateSalesOrderStatus(db, *invoice.SalesOrderID)
	return err
}

func (s *SalesInvoiceService) UpdateCustomerBalanceAfterPosting(db *gorm.DB, companyID, customerID uint64, amount float64) error {
	return s.repo.UpdateCustomerBalance(db, companyID, customerID, amount)
}

func (s *SalesInvoiceService) revalidateExistingInvoice(db *gorm.DB, companyID uint64, invoice *models.SalesInvoice, includeCredit bool) error {
	customer, err := s.ValidateCustomerForInvoice(db, companyID, invoice.CustomerID)
	if err != nil {
		return err
	}
	if includeCredit {
		if err := s.ValidateCustomerCreditLimit(customer, invoice.TotalAmount); err != nil {
			return err
		}
	}
	if _, err := s.ValidateWarehouseForInvoice(db, companyID, invoice.BranchID, invoice.WarehouseID); err != nil {
		return err
	}
	for _, line := range invoice.Lines {
		if _, _, err := s.ValidateProductForInvoice(db, companyID, dto.CreateSalesInvoiceLineRequest{
			ProductID:      line.ProductID,
			ProductBatchID: line.ProductBatchID,
			Quantity:       line.Quantity,
			UnitPrice:      line.UnitPrice,
			DiscountAmount: line.DiscountAmount,
			TaxAmount:      line.TaxAmount,
		}); err != nil {
			return err
		}
		if line.WarehouseLocationID != nil {
			if _, err := s.repo.ValidateWarehouseLocation(db, companyID, invoice.WarehouseID, *line.WarehouseLocationID); err != nil {
				return err
			}
		}
		if _, err := s.repo.ValidateStockAvailability(db, companyID, invoice.WarehouseID, line.WarehouseLocationID, line.ProductID, line.ProductBatchID, line.Quantity); err != nil {
			return err
		}
		if invoice.SalesOrderID != nil && line.SalesOrderLineID != nil {
			if err := s.ValidateSalesOrderLineForInvoice(db, *invoice.SalesOrderID, dto.CreateSalesInvoiceLineRequest{
				SalesOrderLineID: line.SalesOrderLineID,
				ProductID:        line.ProductID,
				ProductBatchID:   line.ProductBatchID,
				Quantity:         line.Quantity,
			}); err != nil {
				return err
			}
		}
	}
	return nil
}

func (s *SalesInvoiceService) branchMap(db *gorm.DB, companyID, branchID uint64) map[string]interface{} {
	result := map[string]interface{}{"id": branchID, "branch_code": "", "branch_name": ""}
	branch, err := s.repo.GetBranch(db, companyID, branchID)
	if err == nil && branch != nil {
		result["branch_code"] = branch.BranchCode
		result["branch_name"] = branch.BranchName
	}
	return result
}

func (s *SalesInvoiceService) warehouseMap(db *gorm.DB, companyID, warehouseID uint64) map[string]interface{} {
	result := map[string]interface{}{"id": warehouseID, "warehouse_code": "", "warehouse_name": ""}
	warehouse, err := s.repo.GetWarehouse(db, companyID, warehouseID)
	if err == nil && warehouse != nil {
		result["warehouse_code"] = warehouse.WarehouseCode
		result["warehouse_name"] = warehouse.WarehouseName
	}
	return result
}

func (s *SalesInvoiceService) customerMap(customer models.Customer) map[string]interface{} {
	return map[string]interface{}{
		"id":               customer.ID,
		"customer_code":    customer.CustomerCode,
		"customer_name":    customer.CustomerName,
		"customer_type":    customer.CustomerType,
		"credit_limit":     customer.CreditLimit,
		"credit_days":      customer.CreditDays,
		"current_balance":  customer.CurrentBalance,
		"payment_status":   customer.Status,
		"primary_email":    customer.PrimaryEmail,
		"primary_contact":  customer.PrimaryContactPerson,
		"contact_number":   customer.PrimaryContactNumber,
		"billing_address":  customer.BillingAddress,
		"shipping_address": customer.ShippingAddress,
	}
}

func (s *SalesInvoiceService) lineResponse(line models.SalesInvoiceLine, productMap map[uint64]invmodels.Product, batchMap map[uint64]invmodels.ProductBatch, locationMap map[uint64]invmodels.WarehouseLocation) dto.SalesInvoiceLineResponse {
	product := map[string]interface{}{"id": line.ProductID, "product_code": "", "product_name": ""}
	if p, ok := productMap[line.ProductID]; ok {
		product["product_code"] = p.ProductCode
		product["product_name"] = p.ProductName
	}
	var batch map[string]interface{}
	if line.ProductBatchID != nil {
		if b, ok := batchMap[*line.ProductBatchID]; ok {
			expiry := ""
			if b.ExpiryDate != nil {
				expiry = b.ExpiryDate.Format("2006-01-02")
			}
			batch = map[string]interface{}{"id": b.ID, "batch_number": b.BatchNumber, "expiry_date": expiry}
		}
	}
	var location map[string]interface{}
	if line.WarehouseLocationID != nil {
		if l, ok := locationMap[*line.WarehouseLocationID]; ok {
			location = map[string]interface{}{"id": l.ID, "location_code": l.LocationCode, "location_name": l.LocationName}
		}
	}
	return dto.SalesInvoiceLineResponse{
		ID:                  line.ID,
		SalesOrderLineID:    line.SalesOrderLineID,
		WarehouseLocationID: line.WarehouseLocationID,
		WarehouseLocation:   location,
		ProductID:           line.ProductID,
		Product:             product,
		ProductBatchID:      line.ProductBatchID,
		Batch:               batch,
		Quantity:            line.Quantity,
		UnitPrice:           line.UnitPrice,
		DiscountAmount:      line.DiscountAmount,
		TaxAmount:           line.TaxAmount,
		LineTotal:           line.LineTotal,
		StockUnitCost:       line.StockUnitCost,
		StockTotalCost:      line.StockTotalCost,
		LineRemarks:         line.LineRemarks,
	}
}

func collectInvoiceLineIDs(lines []models.SalesInvoiceLine) ([]uint64, []uint64, []uint64) {
	productSet := map[uint64]bool{}
	batchSet := map[uint64]bool{}
	locationSet := map[uint64]bool{}
	for _, line := range lines {
		productSet[line.ProductID] = true
		if line.ProductBatchID != nil {
			batchSet[*line.ProductBatchID] = true
		}
		if line.WarehouseLocationID != nil {
			locationSet[*line.WarehouseLocationID] = true
		}
	}
	return mapKeys(productSet), mapKeys(batchSet), mapKeys(locationSet)
}

func mapKeys(m map[uint64]bool) []uint64 {
	values := make([]uint64, 0, len(m))
	for key := range m {
		values = append(values, key)
	}
	return values
}
