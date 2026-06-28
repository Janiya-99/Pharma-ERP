package services

import (
	"errors"
	"strings"
	"time"

	compmodels "github.com/pixandco/erp-phrma/internal/company/models"
	invmodels "github.com/pixandco/erp-phrma/internal/inventory/models"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/dto"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/models"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/repositories"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type SalesOrderService struct {
	repo     *repositories.SalesOrderRepository
	auditSvc *AuditLogService
	logger   *zap.Logger
}

func NewSalesOrderService(repo *repositories.SalesOrderRepository, auditSvc *AuditLogService, logger *zap.Logger) *SalesOrderService {
	return &SalesOrderService{
		repo:     repo,
		auditSvc: auditSvc,
		logger:   logger,
	}
}

func (s *SalesOrderService) GenerateSalesOrderNumber(db *gorm.DB, companyID uint64) (string, error) {
	return s.repo.GetLastSalesOrderNumber(db, companyID)
}

func (s *SalesOrderService) ValidateCustomerForSalesOrder(db *gorm.DB, companyID, customerID uint64) (*models.Customer, error) {
	cust, err := s.repo.ValidateCustomer(db, companyID, customerID)
	if err != nil {
		return nil, err
	}
	if cust.Status == "blocked" || cust.Status == "inactive" || cust.Status == "on_hold" {
		return nil, errors.New("customer status is not allowed for sales orders")
	}
	return cust, nil
}

func (s *SalesOrderService) ValidateCustomerCreditLimit(cust *models.Customer) error {
	limit, balance, exceeded := s.repo.GetCustomerCreditSummary(cust)
	if limit > 0 && exceeded && balance > limit {
		return errors.New("Customer has exceeded credit limit")
	}
	return nil
}

func (s *SalesOrderService) ValidateProductForSalesOrder(db *gorm.DB, companyID, productID uint64, batchID *uint64) (*invmodels.Product, *invmodels.ProductBatch, error) {
	prod, err := s.repo.ValidateProduct(db, companyID, productID)
	if err != nil {
		return nil, nil, err
	}
	var batch *invmodels.ProductBatch
	if batchID != nil && *batchID > 0 {
		b, err := s.repo.ValidateProductBatch(db, companyID, productID, *batchID)
		if err != nil {
			return nil, nil, err
		}
		batch = b
	}
	return prod, batch, nil
}

func (s *SalesOrderService) CalculateSalesOrderLineTotals(qty, unitPrice, discount, tax float64) float64 {
	return qty*unitPrice - discount + tax
}

func (s *SalesOrderService) CalculateSalesOrderHeaderTotals(lines []models.SalesOrderLine) (float64, float64, float64, float64) {
	var subtotal, discount, tax, total float64
	for _, l := range lines {
		subtotal += l.Quantity * l.UnitPrice
		discount += l.DiscountAmount
		tax += l.TaxAmount
		total += l.LineTotal
	}
	return subtotal, discount, tax, total
}

func (s *SalesOrderService) ValidateSalesOrderLines(db *gorm.DB, companyID uint64, linesDto []dto.CreateSalesOrderLineRequest) ([]models.SalesOrderLine, error) {
	if len(linesDto) == 0 {
		return nil, errors.New("at least one line is required")
	}
	var lines []models.SalesOrderLine
	for idx, l := range linesDto {
		if l.Quantity <= 0 {
			return nil, errors.New("quantity must be greater than zero")
		}
		if l.UnitPrice < 0 || l.DiscountAmount < 0 || l.TaxAmount < 0 {
			return nil, errors.New("unit price, discount, and tax amounts cannot be negative")
		}
		_, _, err := s.ValidateProductForSalesOrder(db, companyID, l.ProductID, l.ProductBatchID)
		if err != nil {
			return nil, err
		}
		lineTotal := s.CalculateSalesOrderLineTotals(l.Quantity, l.UnitPrice, l.DiscountAmount, l.TaxAmount)
		sol := models.SalesOrderLine{
			ProductID:        l.ProductID,
			ProductBatchID:   l.ProductBatchID,
			Quantity:         l.Quantity,
			InvoicedQuantity: 0,
			PendingQuantity:  l.Quantity,
			UnitPrice:        l.UnitPrice,
			DiscountAmount:   l.DiscountAmount,
			TaxAmount:        l.TaxAmount,
			LineTotal:        lineTotal,
			LineRemarks:      l.LineRemarks,
			LineOrder:        idx + 1,
		}
		lines = append(lines, sol)
	}
	return lines, nil
}

func (s *SalesOrderService) ValidateSalesOrder(db *gorm.DB, companyID uint64, req dto.CreateSalesOrderRequest) (*models.Customer, []models.SalesOrderLine, time.Time, *time.Time, error) {
	cust, err := s.ValidateCustomerForSalesOrder(db, companyID, req.CustomerID)
	if err != nil {
		return nil, nil, time.Time{}, nil, err
	}
	if err := s.ValidateCustomerCreditLimit(cust); err != nil {
		return nil, nil, time.Time{}, nil, err
	}

	soDate, err := time.Parse("2006-01-02", req.SalesOrderDate)
	if err != nil {
		return nil, nil, time.Time{}, nil, errors.New("invalid sales order date format")
	}

	var expDate *time.Time
	if req.ExpectedDeliveryDate != "" {
		ed, err := time.Parse("2006-01-02", req.ExpectedDeliveryDate)
		if err != nil {
			return nil, nil, time.Time{}, nil, errors.New("invalid expected delivery date format")
		}
		if ed.Before(soDate) {
			return nil, nil, time.Time{}, nil, errors.New("expected delivery date cannot be before sales order date")
		}
		expDate = &ed
	}

	lines, err := s.ValidateSalesOrderLines(db, companyID, req.Lines)
	if err != nil {
		return nil, nil, time.Time{}, nil, err
	}

	return cust, lines, soDate, expDate, nil
}

func (s *SalesOrderService) getActionsMetadata(order *models.SalesOrder) map[string]bool {
	m := make(map[string]bool)
	isDraftOrRejected := order.ApprovalStatus == "draft" || order.ApprovalStatus == "rejected"
	isPending := order.ApprovalStatus == "pending"
	isApproved := order.ApprovalStatus == "approved"
	isInvoiced := order.OrderStatus == "partially_invoiced" || order.OrderStatus == "fully_invoiced"

	m["can_edit"] = isDraftOrRejected && !isInvoiced
	m["can_delete"] = isDraftOrRejected && !isInvoiced
	m["can_submit"] = isDraftOrRejected && !isInvoiced
	m["can_approve"] = isPending
	m["can_reject"] = isPending
	m["can_close"] = isApproved && order.OrderStatus == "open"
	m["can_cancel"] = (isDraftOrRejected || isPending || isApproved) && !isInvoiced
	return m
}

func (s *SalesOrderService) ListSalesOrders(db *gorm.DB, companyID uint64, filters map[string]interface{}, search string, page, limit int) ([]dto.SalesOrderListItemResponse, int64, error) {
	orders, total, err := s.repo.FindSalesOrders(db, companyID, filters, search, page, limit)
	if err != nil {
		return nil, 0, err
	}

	var branchIDs []uint64
	bMap := make(map[uint64]*compmodels.Branch)
	for _, o := range orders {
		branchIDs = append(branchIDs, o.BranchID)
	}
	for _, bid := range branchIDs {
		if _, ok := bMap[bid]; !ok {
			br, _ := s.repo.GetBranch(db, companyID, bid)
			if br != nil {
				bMap[bid] = br
			}
		}
	}

	var res []dto.SalesOrderListItemResponse
	for _, o := range orders {
		var expStr *string
		if o.ExpectedDeliveryDate != nil {
			es := o.ExpectedDeliveryDate.Format("2006-01-02")
			expStr = &es
		}
		brObj := map[string]interface{}{"id": o.BranchID, "branch_code": "", "branch_name": ""}
		if b, ok := bMap[o.BranchID]; ok && b != nil {
			brObj["branch_code"] = b.BranchCode
			brObj["branch_name"] = b.BranchName
		}

		item := dto.SalesOrderListItemResponse{
			ID:                      o.ID,
			SalesOrderNumber:        o.SalesOrderNumber,
			SalesOrderDate:          o.SalesOrderDate.Format("2006-01-02"),
			ExpectedDeliveryDate:    expStr,
			Branch:                  brObj,
			CustomerCode:            o.Customer.CustomerCode,
			CustomerName:            o.Customer.CustomerName,
			CustomerReferenceNumber: o.CustomerReferenceNumber,
			SubtotalAmount:          o.SubtotalAmount,
			DiscountAmount:          o.DiscountAmount,
			TaxAmount:               o.TaxAmount,
			TotalAmount:             o.TotalAmount,
			ApprovalStatus:          o.ApprovalStatus,
			OrderStatus:             o.OrderStatus,
			CreatedBy:               o.CreatedBy,
			CreatedAt:               o.CreatedAt,
			ActionsMetadata:         s.getActionsMetadata(&o),
		}
		res = append(res, item)
	}
	return res, total, nil
}

func (s *SalesOrderService) GetSalesOrderByID(db *gorm.DB, companyID, id uint64) (*dto.SalesOrderDetailResponse, error) {
	order, err := s.repo.FindSalesOrderByID(db, companyID, id)
	if err != nil {
		return nil, err
	}

	br, _ := s.repo.GetBranch(db, companyID, order.BranchID)
	brObj := map[string]interface{}{"id": order.BranchID, "branch_code": "", "branch_name": ""}
	if br != nil {
		brObj["branch_code"] = br.BranchCode
		brObj["branch_name"] = br.BranchName
	}

	custObj := map[string]interface{}{
		"id":            order.Customer.ID,
		"customer_code": order.Customer.CustomerCode,
		"customer_name": order.Customer.CustomerName,
		"customer_type": order.Customer.CustomerType,
	}

	var prodIDs, batchIDs []uint64
	for _, l := range order.Lines {
		prodIDs = append(prodIDs, l.ProductID)
		if l.ProductBatchID != nil && *l.ProductBatchID > 0 {
			batchIDs = append(batchIDs, *l.ProductBatchID)
		}
	}
	prodMap, _ := s.repo.GetProductMap(db, companyID, prodIDs)
	batchMap, _ := s.repo.GetBatchMap(db, companyID, batchIDs)

	var lineRes []dto.SalesOrderLineResponse
	for _, l := range order.Lines {
		pObj := map[string]interface{}{"id": l.ProductID, "product_code": "", "product_name": ""}
		if p, ok := prodMap[l.ProductID]; ok {
			pObj["product_code"] = p.ProductCode
			pObj["product_name"] = p.ProductName
		}
		var bObj map[string]interface{}
		if l.ProductBatchID != nil && *l.ProductBatchID > 0 {
			if b, ok := batchMap[*l.ProductBatchID]; ok {
				exp := ""
				if b.ExpiryDate != nil {
					exp = b.ExpiryDate.Format("2006-01-02")
				}
				bObj = map[string]interface{}{
					"id":           b.ID,
					"batch_number": b.BatchNumber,
					"expiry_date":  exp,
				}
			}
		}

		lr := dto.SalesOrderLineResponse{
			ID:               l.ID,
			ProductID:        l.ProductID,
			Product:          pObj,
			ProductBatchID:   l.ProductBatchID,
			Batch:            bObj,
			Quantity:         l.Quantity,
			InvoicedQuantity: l.InvoicedQuantity,
			PendingQuantity:  l.PendingQuantity,
			UnitPrice:        l.UnitPrice,
			DiscountAmount:   l.DiscountAmount,
			TaxAmount:        l.TaxAmount,
			LineTotal:        l.LineTotal,
			LineRemarks:      l.LineRemarks,
		}
		lineRes = append(lineRes, lr)
	}

	var appRes []dto.SalesOrderApprovalResponse
	for _, a := range order.Approvals {
		appRes = append(appRes, dto.SalesOrderApprovalResponse{
			ID:       a.ID,
			Action:   a.Action,
			Remarks:  a.Remarks,
			ActionBy: a.ActionBy,
			ActionAt: a.ActionAt,
		})
	}

	var expStr *string
	if order.ExpectedDeliveryDate != nil {
		es := order.ExpectedDeliveryDate.Format("2006-01-02")
		expStr = &es
	}

	res := &dto.SalesOrderDetailResponse{
		ID:                      order.ID,
		CompanyID:               order.CompanyID,
		BranchID:                order.BranchID,
		Branch:                  brObj,
		CustomerID:              order.CustomerID,
		Customer:                custObj,
		FinancialYearID:         order.FinancialYearID,
		AccountingPeriodID:      order.AccountingPeriodID,
		SalesOrderNumber:        order.SalesOrderNumber,
		SalesOrderDate:          order.SalesOrderDate.Format("2006-01-02"),
		ExpectedDeliveryDate:    expStr,
		CustomerReferenceNumber: order.CustomerReferenceNumber,
		Remarks:                 order.Remarks,
		SubtotalAmount:          order.SubtotalAmount,
		DiscountAmount:          order.DiscountAmount,
		TaxAmount:               order.TaxAmount,
		TotalAmount:             order.TotalAmount,
		ApprovalStatus:          order.ApprovalStatus,
		OrderStatus:             order.OrderStatus,
		Status:                  order.Status,
		CreatedBy:               order.CreatedBy,
		UpdatedBy:               order.UpdatedBy,
		CreatedAt:               order.CreatedAt,
		UpdatedAt:               order.UpdatedAt,
		Lines:                   lineRes,
		Approvals:               appRes,
		InvoicingSummary: dto.InvoicingSummaryPlaceholder{
			TotalInvoicedAmount: 0,
			TotalPendingAmount:  order.TotalAmount,
			InvoiceCount:        0,
		},
		ActionsMetadata: s.getActionsMetadata(order),
	}

	return res, nil
}

func (s *SalesOrderService) CreateSalesOrder(db *gorm.DB, companyID, userID uint64, req dto.CreateSalesOrderRequest) (*models.SalesOrder, error) {
	_, lines, soDate, expDate, err := s.ValidateSalesOrder(db, companyID, req)
	if err != nil {
		return nil, err
	}

	soNumber, err := s.GenerateSalesOrderNumber(db, companyID)
	if err != nil {
		return nil, err
	}

	subtotal, discount, tax, total := s.CalculateSalesOrderHeaderTotals(lines)

	order := models.SalesOrder{
		CompanyID:               companyID,
		BranchID:                req.BranchID,
		CustomerID:              req.CustomerID,
		FinancialYearID:         req.FinancialYearID,
		AccountingPeriodID:      req.AccountingPeriodID,
		SalesOrderNumber:        soNumber,
		SalesOrderDate:          soDate,
		ExpectedDeliveryDate:    expDate,
		CustomerReferenceNumber: req.CustomerReferenceNumber,
		Remarks:                 req.Remarks,
		SubtotalAmount:          subtotal,
		DiscountAmount:          discount,
		TaxAmount:               tax,
		TotalAmount:             total,
		ApprovalStatus:          "draft",
		OrderStatus:             "open",
		Status:                  "active",
		CreatedBy:               &userID,
		UpdatedBy:               &userID,
		Lines:                   lines,
	}

	if err := s.repo.CreateSalesOrderWithLines(db, &order); err != nil {
		return nil, err
	}

	s.auditSvc.LogAction(db, companyID, userID, "SALES_ORDER_CREATED", "Sales Order "+soNumber+" created", order.ID)
	return &order, nil
}

func (s *SalesOrderService) UpdateSalesOrder(db *gorm.DB, companyID, userID, id uint64, req dto.CreateSalesOrderRequest) (*models.SalesOrder, error) {
	existing, err := s.repo.FindSalesOrderByID(db, companyID, id)
	if err != nil {
		return nil, err
	}
	if existing.ApprovalStatus != "draft" && existing.ApprovalStatus != "rejected" {
		return nil, errors.New("only draft or rejected sales orders can be updated")
	}
	if existing.OrderStatus == "partially_invoiced" || existing.OrderStatus == "fully_invoiced" {
		return nil, errors.New("invoiced sales orders cannot be updated")
	}

	_, lines, soDate, expDate, err := s.ValidateSalesOrder(db, companyID, req)
	if err != nil {
		return nil, err
	}

	subtotal, discount, tax, total := s.CalculateSalesOrderHeaderTotals(lines)

	existing.BranchID = req.BranchID
	existing.CustomerID = req.CustomerID
	existing.FinancialYearID = req.FinancialYearID
	existing.AccountingPeriodID = req.AccountingPeriodID
	existing.SalesOrderDate = soDate
	existing.ExpectedDeliveryDate = expDate
	existing.CustomerReferenceNumber = req.CustomerReferenceNumber
	existing.Remarks = req.Remarks
	existing.SubtotalAmount = subtotal
	existing.DiscountAmount = discount
	existing.TaxAmount = tax
	existing.TotalAmount = total
	existing.UpdatedBy = &userID
	existing.Lines = lines

	if existing.ApprovalStatus == "rejected" {
		existing.ApprovalStatus = "draft"
	}

	if err := s.repo.UpdateSalesOrderWithLines(db, existing); err != nil {
		return nil, err
	}

	s.auditSvc.LogAction(db, companyID, userID, "SALES_ORDER_UPDATED", "Sales Order "+existing.SalesOrderNumber+" updated", existing.ID)
	return existing, nil
}

func (s *SalesOrderService) DeleteSalesOrder(db *gorm.DB, companyID, userID, id uint64) error {
	existing, err := s.repo.FindSalesOrderByID(db, companyID, id)
	if err != nil {
		return err
	}
	if existing.ApprovalStatus != "draft" && existing.ApprovalStatus != "rejected" {
		return errors.New("only draft or rejected sales orders can be deleted")
	}
	if existing.OrderStatus == "partially_invoiced" || existing.OrderStatus == "fully_invoiced" {
		return errors.New("invoiced sales orders cannot be deleted")
	}

	inUse, err := s.repo.CheckSalesOrderInvoiceUsage(db, id)
	if err != nil {
		return err
	}
	if inUse {
		return errors.New("cannot delete sales order that has linked sales invoices")
	}

	if err := s.repo.SoftDeleteSalesOrder(db, companyID, id); err != nil {
		return err
	}

	s.auditSvc.LogAction(db, companyID, userID, "SALES_ORDER_DELETED", "Sales Order "+existing.SalesOrderNumber+" deleted", id)
	return nil
}

func (s *SalesOrderService) SubmitSalesOrder(db *gorm.DB, companyID, userID, id uint64, remarks string) error {
	existing, err := s.repo.FindSalesOrderByID(db, companyID, id)
	if err != nil {
		return err
	}
	if existing.ApprovalStatus != "draft" && existing.ApprovalStatus != "rejected" {
		return errors.New("only draft or rejected sales orders can be submitted")
	}
	if len(existing.Lines) == 0 {
		return errors.New("sales order must have at least one line")
	}
	if existing.TotalAmount < 0 {
		return errors.New("total amount cannot be negative")
	}

	cust, err := s.ValidateCustomerForSalesOrder(db, companyID, existing.CustomerID)
	if err != nil {
		return err
	}
	if err := s.ValidateCustomerCreditLimit(cust); err != nil {
		return err
	}

	now := time.Now()
	err = db.Transaction(func(tx *gorm.DB) error {
		if err := s.repo.UpdateSalesOrderApprovalStatus(tx, companyID, id, "pending", userID, now); err != nil {
			return err
		}
		app := models.SalesOrderApproval{
			SalesOrderID: id,
			Action:       "submitted",
			Remarks:      remarks,
			ActionBy:     userID,
			ActionAt:     now,
		}
		return s.repo.CreateSalesOrderApprovalRecord(tx, &app)
	})
	if err != nil {
		return err
	}

	s.auditSvc.LogAction(db, companyID, userID, "SALES_ORDER_SUBMITTED", "Sales Order "+existing.SalesOrderNumber+" submitted", id)
	return nil
}

func (s *SalesOrderService) ApproveSalesOrder(db *gorm.DB, companyID, userID, id uint64, remarks string) error {
	existing, err := s.repo.FindSalesOrderByID(db, companyID, id)
	if err != nil {
		return err
	}
	if existing.ApprovalStatus != "pending" {
		return errors.New("only pending sales orders can be approved")
	}

	cust, err := s.ValidateCustomerForSalesOrder(db, companyID, existing.CustomerID)
	if err != nil {
		return err
	}
	if err := s.ValidateCustomerCreditLimit(cust); err != nil {
		return err
	}

	now := time.Now()
	err = db.Transaction(func(tx *gorm.DB) error {
		if err := s.repo.UpdateSalesOrderApprovalStatus(tx, companyID, id, "approved", userID, now); err != nil {
			return err
		}
		app := models.SalesOrderApproval{
			SalesOrderID: id,
			Action:       "approved",
			Remarks:      remarks,
			ActionBy:     userID,
			ActionAt:     now,
		}
		return s.repo.CreateSalesOrderApprovalRecord(tx, &app)
	})
	if err != nil {
		return err
	}

	s.auditSvc.LogAction(db, companyID, userID, "SALES_ORDER_APPROVED", "Sales Order "+existing.SalesOrderNumber+" approved", id)
	return nil
}

func (s *SalesOrderService) RejectSalesOrder(db *gorm.DB, companyID, userID, id uint64, remarks string) error {
	existing, err := s.repo.FindSalesOrderByID(db, companyID, id)
	if err != nil {
		return err
	}
	if existing.ApprovalStatus != "pending" {
		return errors.New("only pending sales orders can be rejected")
	}
	if strings.TrimSpace(remarks) == "" {
		return errors.New("remarks are required when rejecting a sales order")
	}

	now := time.Now()
	err = db.Transaction(func(tx *gorm.DB) error {
		if err := s.repo.UpdateSalesOrderApprovalStatus(tx, companyID, id, "rejected", userID, now); err != nil {
			return err
		}
		app := models.SalesOrderApproval{
			SalesOrderID: id,
			Action:       "rejected",
			Remarks:      remarks,
			ActionBy:     userID,
			ActionAt:     now,
		}
		return s.repo.CreateSalesOrderApprovalRecord(tx, &app)
	})
	if err != nil {
		return err
	}

	s.auditSvc.LogAction(db, companyID, userID, "SALES_ORDER_REJECTED", "Sales Order "+existing.SalesOrderNumber+" rejected", id)
	return nil
}

func (s *SalesOrderService) CloseSalesOrder(db *gorm.DB, companyID, userID, id uint64, remarks string) error {
	existing, err := s.repo.FindSalesOrderByID(db, companyID, id)
	if err != nil {
		return err
	}
	if existing.ApprovalStatus != "approved" {
		return errors.New("only approved sales orders can be closed")
	}
	if existing.OrderStatus == "fully_invoiced" {
		return errors.New("fully invoiced orders cannot be manually closed")
	}

	now := time.Now()
	err = db.Transaction(func(tx *gorm.DB) error {
		if err := s.repo.UpdateSalesOrderOrderStatus(tx, companyID, id, "closed", userID, now); err != nil {
			return err
		}
		app := models.SalesOrderApproval{
			SalesOrderID: id,
			Action:       "closed",
			Remarks:      remarks,
			ActionBy:     userID,
			ActionAt:     now,
		}
		return s.repo.CreateSalesOrderApprovalRecord(tx, &app)
	})
	if err != nil {
		return err
	}

	s.auditSvc.LogAction(db, companyID, userID, "SALES_ORDER_CLOSED", "Sales Order "+existing.SalesOrderNumber+" closed", id)
	return nil
}

func (s *SalesOrderService) CancelSalesOrder(db *gorm.DB, companyID, userID, id uint64, remarks string) error {
	existing, err := s.repo.FindSalesOrderByID(db, companyID, id)
	if err != nil {
		return err
	}
	if existing.OrderStatus == "partially_invoiced" || existing.OrderStatus == "fully_invoiced" {
		return errors.New("invoiced sales orders cannot be cancelled")
	}
	if strings.TrimSpace(remarks) == "" {
		return errors.New("remarks are required when cancelling a sales order")
	}

	now := time.Now()
	err = db.Transaction(func(tx *gorm.DB) error {
		if err := s.repo.UpdateSalesOrderApprovalStatus(tx, companyID, id, "cancelled", userID, now); err != nil {
			return err
		}
		app := models.SalesOrderApproval{
			SalesOrderID: id,
			Action:       "cancelled",
			Remarks:      remarks,
			ActionBy:     userID,
			ActionAt:     now,
		}
		return s.repo.CreateSalesOrderApprovalRecord(tx, &app)
	})
	if err != nil {
		return err
	}

	s.auditSvc.LogAction(db, companyID, userID, "SALES_ORDER_CANCELLED", "Sales Order "+existing.SalesOrderNumber+" cancelled", id)
	return nil
}
