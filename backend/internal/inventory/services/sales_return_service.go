package services

import (
	"errors"
	"fmt"
	"time"

	"github.com/pixandco/erp-phrma/internal/inventory/dto"
	inventoryModels "github.com/pixandco/erp-phrma/internal/inventory/models"
	"github.com/pixandco/erp-phrma/internal/inventory/repositories"
	invoiceModels "github.com/pixandco/erp-phrma/internal/invoicecenter/models"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type SalesReturnService interface {
	ListSalesReturns(db *gorm.DB, companyID uint64, filter dto.SalesReturnFilter) ([]inventoryModels.SalesReturn, int64, error)
	GetSalesReturnByID(db *gorm.DB, companyID, id uint64) (*inventoryModels.SalesReturn, error)
	CreateSalesReturn(db *gorm.DB, companyID, userID uint64, req dto.CreateSalesReturnRequest) (*inventoryModels.SalesReturn, error)
	UpdateSalesReturn(db *gorm.DB, companyID, userID, id uint64, req dto.UpdateSalesReturnRequest) (*inventoryModels.SalesReturn, error)
	DeleteSalesReturn(db *gorm.DB, companyID, userID, id uint64) error
	SubmitSalesReturn(db *gorm.DB, companyID, userID, id uint64, req dto.SalesReturnActionRequest) error
	ApproveSalesReturn(db *gorm.DB, companyID, userID, id uint64, req dto.SalesReturnActionRequest) error
	RejectSalesReturn(db *gorm.DB, companyID, userID, id uint64, req dto.SalesReturnActionRequest) error
	PostSalesReturn(db *gorm.DB, companyID, userID, id uint64) error
	GenerateCreditNote(db *gorm.DB, companyID, userID, id uint64) (*invoiceModels.CreditNote, error)
}

type salesReturnService struct {
	repo              repositories.SalesReturnRepository
	stockMovementRepo repositories.StockMovementRepository
	stockMovementSvc  InventoryStockMovementService
	logger            *zap.Logger
}

func NewSalesReturnService(
	repo repositories.SalesReturnRepository,
	stockMovementRepo repositories.StockMovementRepository,
	stockMovementSvc InventoryStockMovementService,
	logger *zap.Logger,
) SalesReturnService {
	return &salesReturnService{
		repo:              repo,
		stockMovementRepo: stockMovementRepo,
		stockMovementSvc:  stockMovementSvc,
		logger:            logger,
	}
}

func (s *salesReturnService) ListSalesReturns(db *gorm.DB, companyID uint64, filter dto.SalesReturnFilter) ([]inventoryModels.SalesReturn, int64, error) {
	return s.repo.FindSalesReturns(db, companyID, filter)
}

func (s *salesReturnService) GetSalesReturnByID(db *gorm.DB, companyID, id uint64) (*inventoryModels.SalesReturn, error) {
	return s.repo.FindSalesReturnByID(db, companyID, id)
}

func (s *salesReturnService) ValidateReturnConditionWarehouse(warehouseType, returnCondition string) error {
	returnCondition = normalizeReturnCondition(returnCondition)
	switch returnCondition {
	case "resellable":
		if warehouseType != "main" && warehouseType != "secondary" && warehouseType != "cold_storage" {
			return errors.New("Selected warehouse type is not suitable for this sales return condition")
		}
	case "other":
		if warehouseType != "quarantine" && warehouseType != "return" {
			return errors.New("Selected warehouse type is not suitable for this sales return condition")
		}
	case "damaged":
		if warehouseType != "damaged" && warehouseType != "return" {
			return errors.New("Selected warehouse type is not suitable for this sales return condition")
		}
	case "expired":
		if warehouseType != "expired" && warehouseType != "return" {
			return errors.New("Selected warehouse type is not suitable for this sales return condition")
		}
	case "recalled":
		if warehouseType != "quarantine" && warehouseType != "return" && warehouseType != "damaged" {
			return errors.New("Selected warehouse type is not suitable for this sales return condition")
		}
	}
	return nil
}

func normalizeReturnCondition(condition string) string {
	switch condition {
	case "saleable":
		return "resellable"
	case "recall":
		return "recalled"
	case "quarantine":
		return "other"
	default:
		return condition
	}
}

func (s *salesReturnService) validateOriginalInvoice(db *gorm.DB, companyID uint64, salesInvoiceID *uint64, customerID *uint64) (*invoiceModels.SalesInvoice, error) {
	if salesInvoiceID == nil {
		return nil, errors.New("sales_invoice_id is required for sales returns")
	}
	var invoice invoiceModels.SalesInvoice
	if err := db.Where("company_id = ? AND id = ?", companyID, *salesInvoiceID).Preload("Lines").First(&invoice).Error; err != nil {
		return nil, errors.New("original sales invoice not found")
	}
	if invoice.PostedStatus != "posted" {
		return nil, errors.New("original sales invoice must be posted")
	}
	if customerID != nil && invoice.CustomerID != *customerID {
		return nil, errors.New("sales return customer does not match original invoice")
	}
	return &invoice, nil
}

func (s *salesReturnService) validateReturnedLine(db *gorm.DB, companyID, currentReturnID uint64, invoice *invoiceModels.SalesInvoice, lReq dto.SalesReturnLineRequest) (*invoiceModels.SalesInvoiceLine, error) {
	if lReq.SalesInvoiceLineID == nil {
		return nil, errors.New("sales_invoice_line_id is required for each sales return line")
	}
	var invoiceLine invoiceModels.SalesInvoiceLine
	if err := db.Where("id = ? AND sales_invoice_id = ?", *lReq.SalesInvoiceLineID, invoice.ID).First(&invoiceLine).Error; err != nil {
		return nil, errors.New("sales return line does not belong to original sales invoice")
	}
	if invoiceLine.ProductID != lReq.ProductID {
		return nil, errors.New("returned product does not match original invoice line")
	}
	if invoiceLine.ProductBatchID != nil {
		if lReq.ProductBatchID == nil || *invoiceLine.ProductBatchID != *lReq.ProductBatchID {
			return nil, errors.New("returned batch does not match original invoice line")
		}
	}
	var alreadyReturned float64
	query := db.Table("sales_return_lines").
		Joins("JOIN sales_returns ON sales_returns.id = sales_return_lines.sales_return_id").
		Where("sales_returns.company_id = ? AND sales_returns.posted_status = ? AND sales_return_lines.sales_invoice_line_id = ?", companyID, "posted", *lReq.SalesInvoiceLineID)
	if currentReturnID > 0 {
		query = query.Where("sales_returns.id <> ?", currentReturnID)
	}
	if err := query.Select("COALESCE(SUM(sales_return_lines.return_quantity), 0)").Scan(&alreadyReturned).Error; err != nil {
		return nil, err
	}
	if lReq.ReturnQuantity > invoiceLine.Quantity-alreadyReturned {
		return nil, errors.New("return quantity exceeds sold quantity minus already returned quantity")
	}
	return &invoiceLine, nil
}

func (s *salesReturnService) GenerateSalesReturnNumber(db *gorm.DB, companyID uint64) (string, error) {
	yearMonthPrefix := fmt.Sprintf("SR-%s-", time.Now().Format("0601"))
	lastNumber, err := s.repo.GetLastSalesReturnNumber(db, companyID, yearMonthPrefix)
	if err != nil {
		return "", err
	}

	var nextSequence int
	if lastNumber == "" {
		nextSequence = 1
	} else {
		fmt.Sscanf(lastNumber, yearMonthPrefix+"%04d", &nextSequence)
		nextSequence++
	}

	return fmt.Sprintf("%s%04d", yearMonthPrefix, nextSequence), nil
}

func (s *salesReturnService) generateCreditNoteNumber(db *gorm.DB, companyID uint64) (string, error) {
	prefix := "CN-"
	var last invoiceModels.CreditNote
	err := db.Where("company_id = ? AND credit_note_number LIKE ?", companyID, prefix+"%").
		Order("credit_note_number desc").
		First(&last).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return "CN-000001", nil
	}
	if err != nil {
		return "", err
	}
	var next int
	if _, scanErr := fmt.Sscanf(last.CreditNoteNumber, "CN-%06d", &next); scanErr != nil {
		return "CN-000001", nil
	}
	return fmt.Sprintf("CN-%06d", next+1), nil
}

func (s *salesReturnService) CreateSalesReturn(db *gorm.DB, companyID, userID uint64, req dto.CreateSalesReturnRequest) (*inventoryModels.SalesReturn, error) {
	warehouse, err := s.stockMovementRepo.FindWarehouseByID(db, req.WarehouseID)
	if err != nil {
		return nil, err
	}
	if warehouse == nil || warehouse.Status != "active" {
		return nil, errors.New("invalid or inactive warehouse")
	}
	if warehouse.BranchID != req.BranchID {
		return nil, errors.New("warehouse does not belong to selected branch")
	}

	if err := s.ValidateReturnConditionWarehouse(warehouse.WarehouseType, req.ReturnCondition); err != nil {
		return nil, err
	}
	req.ReturnCondition = normalizeReturnCondition(req.ReturnCondition)

	originalInvoice, err := s.validateOriginalInvoice(db, companyID, req.SalesInvoiceID, req.CustomerID)
	if err != nil {
		return nil, err
	}
	customerID := req.CustomerID
	if customerID == nil {
		customerID = &originalInvoice.CustomerID
	}
	if req.SalesInvoiceNumber == "" {
		req.SalesInvoiceNumber = originalInvoice.InvoiceNumber
	}

	parsedDate, err := time.Parse("2006-01-02", req.SalesReturnDate)
	if err != nil {
		return nil, errors.New("invalid sales return date format")
	}

	returnNumber, err := s.GenerateSalesReturnNumber(db, companyID)
	if err != nil {
		return nil, err
	}

	salesReturn := &inventoryModels.SalesReturn{
		CompanyID:                companyID,
		BranchID:                 req.BranchID,
		WarehouseID:              req.WarehouseID,
		CustomerID:               customerID,
		SalesInvoiceID:           req.SalesInvoiceID,
		FinancialYearID:          req.FinancialYearID,
		AccountingPeriodID:       req.AccountingPeriodID,
		SalesReturnNumber:        returnNumber,
		SalesReturnDate:          parsedDate,
		CustomerName:             req.CustomerName,
		CustomerContactNumber:    req.CustomerContactNumber,
		SalesInvoiceNumber:       req.SalesInvoiceNumber,
		CustomerCreditNoteNumber: req.CustomerCreditNoteNumber,
		ReferenceNumber:          req.ReferenceNumber,
		ReturnReason:             req.ReturnReason,
		ReturnCondition:          req.ReturnCondition,
		Remarks:                  req.Remarks,
		ApprovalStatus:           "draft",
		PostedStatus:             "unposted",
		Status:                   "active",
		CreatedBy:                userID,
		UpdatedBy:                userID,
	}

	var totalQty, subtotal, discount, tax, total float64

	for i, lReq := range req.Lines {
		if lReq.ReturnQuantity <= 0 {
			return nil, errors.New("return quantity must be greater than zero")
		}

		product, err := s.stockMovementRepo.FindProductByID(db, lReq.ProductID)
		if err != nil || product == nil || product.Status != "active" {
			return nil, errors.New("invalid or inactive product")
		}

		if product.RequiresBatchTracking && lReq.ProductBatchID == nil {
			return nil, errors.New("product batch is required for batch tracked product")
		}

		if lReq.ProductBatchID != nil {
			batch, err := s.stockMovementRepo.FindBatchByID(db, *lReq.ProductBatchID)
			if err != nil || batch == nil {
				return nil, errors.New("invalid product batch")
			}
			if batch.ProductID != lReq.ProductID {
				return nil, errors.New("batch does not belong to selected product")
			}
			if batch.BatchStatus == "disposed" {
				return nil, errors.New("cannot return disposed batch")
			}

			if req.ReturnCondition == "resellable" && batch.BatchStatus == "expired" {
				return nil, errors.New("cannot use expired batch for resellable return")
			}
		}

		if lReq.WarehouseLocationID != nil {
			location, err := s.stockMovementRepo.FindWarehouseLocationByID(db, *lReq.WarehouseLocationID)
			if err != nil || location == nil || location.WarehouseID != req.WarehouseID {
				return nil, errors.New("invalid warehouse location")
			}
		}

		invoiceLine, err := s.validateReturnedLine(db, companyID, 0, originalInvoice, lReq)
		if err != nil {
			return nil, err
		}
		if lReq.UnitPrice == 0 {
			lReq.UnitPrice = invoiceLine.UnitPrice
		}
		if lReq.StockUnitCost == 0 {
			lReq.StockUnitCost = invoiceLine.StockUnitCost
		}

		lineCond := normalizeReturnCondition(lReq.ReturnCondition)
		if lineCond == "" {
			lineCond = req.ReturnCondition
		}

		lineTotal := (lReq.ReturnQuantity * lReq.UnitPrice) - lReq.DiscountAmount + lReq.TaxAmount

		salesReturn.Lines = append(salesReturn.Lines, inventoryModels.SalesReturnLine{
			SalesInvoiceLineID:  lReq.SalesInvoiceLineID,
			WarehouseLocationID: lReq.WarehouseLocationID,
			ProductID:           lReq.ProductID,
			ProductBatchID:      lReq.ProductBatchID,
			ReturnQuantity:      lReq.ReturnQuantity,
			UnitPrice:           lReq.UnitPrice,
			DiscountAmount:      lReq.DiscountAmount,
			TaxAmount:           lReq.TaxAmount,
			LineTotal:           lineTotal,
			StockUnitCost:       lReq.StockUnitCost,
			StockTotalCost:      lReq.StockUnitCost * lReq.ReturnQuantity,
			ReturnReason:        lReq.ReturnReason,
			ReturnCondition:     lineCond,
			LineRemarks:         lReq.LineRemarks,
			LineOrder:           i + 1,
		})

		totalQty += lReq.ReturnQuantity
		subtotal += (lReq.ReturnQuantity * lReq.UnitPrice)
		discount += lReq.DiscountAmount
		tax += lReq.TaxAmount
		total += lineTotal
	}

	salesReturn.TotalQuantity = totalQty
	salesReturn.SubtotalAmount = subtotal
	salesReturn.DiscountAmount = discount
	salesReturn.TaxAmount = tax
	salesReturn.TotalAmount = total

	if err := s.repo.CreateSalesReturnWithLines(db, salesReturn); err != nil {
		return nil, err
	}

	return salesReturn, nil
}

func (s *salesReturnService) UpdateSalesReturn(db *gorm.DB, companyID, userID, id uint64, req dto.UpdateSalesReturnRequest) (*inventoryModels.SalesReturn, error) {
	existing, err := s.repo.FindSalesReturnByID(db, companyID, id)
	if err != nil {
		return nil, err
	}
	if existing == nil {
		return nil, errors.New("sales return not found")
	}

	if existing.ApprovalStatus != "draft" && existing.ApprovalStatus != "rejected" {
		return nil, errors.New("only draft or rejected sales returns can be updated")
	}

	warehouse, err := s.stockMovementRepo.FindWarehouseByID(db, existing.WarehouseID)
	if err != nil {
		return nil, err
	}

	if err := s.ValidateReturnConditionWarehouse(warehouse.WarehouseType, req.ReturnCondition); err != nil {
		return nil, err
	}
	req.ReturnCondition = normalizeReturnCondition(req.ReturnCondition)
	originalInvoice, err := s.validateOriginalInvoice(db, companyID, req.SalesInvoiceID, req.CustomerID)
	if err != nil {
		return nil, err
	}
	customerID := req.CustomerID
	if customerID == nil {
		customerID = &originalInvoice.CustomerID
	}
	if req.SalesInvoiceNumber == "" {
		req.SalesInvoiceNumber = originalInvoice.InvoiceNumber
	}

	parsedDate, err := time.Parse("2006-01-02", req.SalesReturnDate)
	if err != nil {
		return nil, errors.New("invalid sales return date format")
	}

	existing.SalesReturnDate = parsedDate
	existing.CustomerID = customerID
	existing.SalesInvoiceID = req.SalesInvoiceID
	existing.CustomerName = req.CustomerName
	existing.CustomerContactNumber = req.CustomerContactNumber
	existing.SalesInvoiceNumber = req.SalesInvoiceNumber
	existing.CustomerCreditNoteNumber = req.CustomerCreditNoteNumber
	existing.ReferenceNumber = req.ReferenceNumber
	existing.ReturnReason = req.ReturnReason
	existing.ReturnCondition = req.ReturnCondition
	existing.Remarks = req.Remarks
	existing.UpdatedBy = userID

	var totalQty, subtotal, discount, tax, total float64
	var newLines []inventoryModels.SalesReturnLine

	for i, lReq := range req.Lines {
		if lReq.ReturnQuantity <= 0 {
			return nil, errors.New("return quantity must be greater than zero")
		}

		product, err := s.stockMovementRepo.FindProductByID(db, lReq.ProductID)
		if err != nil || product == nil || product.Status != "active" {
			return nil, errors.New("invalid or inactive product")
		}

		if product.RequiresBatchTracking && lReq.ProductBatchID == nil {
			return nil, errors.New("product batch is required for batch tracked product")
		}

		if lReq.ProductBatchID != nil {
			batch, err := s.stockMovementRepo.FindBatchByID(db, *lReq.ProductBatchID)
			if err != nil || batch == nil {
				return nil, errors.New("invalid product batch")
			}
			if batch.ProductID != lReq.ProductID {
				return nil, errors.New("batch does not belong to selected product")
			}
			if batch.BatchStatus == "disposed" {
				return nil, errors.New("cannot return disposed batch")
			}
			if req.ReturnCondition == "resellable" && batch.BatchStatus == "expired" {
				return nil, errors.New("cannot use expired batch for resellable return")
			}
		}

		if lReq.WarehouseLocationID != nil {
			location, err := s.stockMovementRepo.FindWarehouseLocationByID(db, *lReq.WarehouseLocationID)
			if err != nil || location == nil || location.WarehouseID != existing.WarehouseID {
				return nil, errors.New("invalid warehouse location")
			}
		}

		invoiceLine, err := s.validateReturnedLine(db, companyID, id, originalInvoice, lReq)
		if err != nil {
			return nil, err
		}
		if lReq.UnitPrice == 0 {
			lReq.UnitPrice = invoiceLine.UnitPrice
		}
		if lReq.StockUnitCost == 0 {
			lReq.StockUnitCost = invoiceLine.StockUnitCost
		}

		lineCond := normalizeReturnCondition(lReq.ReturnCondition)
		if lineCond == "" {
			lineCond = req.ReturnCondition
		}
		lineTotal := (lReq.ReturnQuantity * lReq.UnitPrice) - lReq.DiscountAmount + lReq.TaxAmount

		newLines = append(newLines, inventoryModels.SalesReturnLine{
			SalesReturnID:       existing.ID,
			SalesInvoiceLineID:  lReq.SalesInvoiceLineID,
			WarehouseLocationID: lReq.WarehouseLocationID,
			ProductID:           lReq.ProductID,
			ProductBatchID:      lReq.ProductBatchID,
			ReturnQuantity:      lReq.ReturnQuantity,
			UnitPrice:           lReq.UnitPrice,
			DiscountAmount:      lReq.DiscountAmount,
			TaxAmount:           lReq.TaxAmount,
			LineTotal:           lineTotal,
			StockUnitCost:       lReq.StockUnitCost,
			StockTotalCost:      lReq.StockUnitCost * lReq.ReturnQuantity,
			ReturnReason:        lReq.ReturnReason,
			ReturnCondition:     lineCond,
			LineRemarks:         lReq.LineRemarks,
			LineOrder:           i + 1,
		})

		totalQty += lReq.ReturnQuantity
		subtotal += (lReq.ReturnQuantity * lReq.UnitPrice)
		discount += lReq.DiscountAmount
		tax += lReq.TaxAmount
		total += lineTotal
	}

	existing.Lines = newLines
	existing.TotalQuantity = totalQty
	existing.SubtotalAmount = subtotal
	existing.DiscountAmount = discount
	existing.TaxAmount = tax
	existing.TotalAmount = total

	if err := s.repo.UpdateSalesReturnWithLines(db, existing); err != nil {
		return nil, err
	}

	return existing, nil
}

func (s *salesReturnService) DeleteSalesReturn(db *gorm.DB, companyID, userID, id uint64) error {
	existing, err := s.repo.FindSalesReturnByID(db, companyID, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("sales return not found")
	}

	if existing.ApprovalStatus != "draft" && existing.ApprovalStatus != "rejected" {
		return errors.New("only draft or rejected sales returns can be deleted")
	}

	if existing.PostedStatus == "posted" {
		return errors.New("posted sales returns cannot be deleted")
	}

	if err := s.repo.SoftDeleteSalesReturn(db, companyID, id, userID); err != nil {
		return err
	}

	return nil
}

func (s *salesReturnService) SubmitSalesReturn(db *gorm.DB, companyID, userID, id uint64, req dto.SalesReturnActionRequest) error {
	existing, err := s.repo.FindSalesReturnByID(db, companyID, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("sales return not found")
	}

	if existing.ApprovalStatus != "draft" && existing.ApprovalStatus != "rejected" {
		return errors.New("only draft or rejected sales returns can be submitted")
	}
	if len(existing.Lines) == 0 {
		return errors.New("sales return must have at least one line")
	}
	if existing.TotalQuantity <= 0 {
		return errors.New("total quantity must be greater than zero")
	}

	if err := s.repo.UpdateSalesReturnStatus(db, id, map[string]interface{}{
		"approval_status": "pending",
		"updated_by":      userID,
	}); err != nil {
		return err
	}

	approval := &inventoryModels.SalesReturnApproval{
		SalesReturnID: id,
		Action:        "submitted",
		Remarks:       req.Remarks,
		ActionBy:      userID,
		ActionAt:      time.Now(),
	}
	if err := s.repo.CreateSalesReturnApprovalRecord(db, approval); err != nil {
		return err
	}

	return nil
}

func (s *salesReturnService) ApproveSalesReturn(db *gorm.DB, companyID, userID, id uint64, req dto.SalesReturnActionRequest) error {
	existing, err := s.repo.FindSalesReturnByID(db, companyID, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("sales return not found")
	}

	if existing.ApprovalStatus != "pending" {
		return errors.New("only pending sales returns can be approved")
	}

	now := time.Now()
	if err := s.repo.UpdateSalesReturnStatus(db, id, map[string]interface{}{
		"approval_status": "approved",
		"approved_by":     userID,
		"approved_at":     now,
		"updated_by":      userID,
	}); err != nil {
		return err
	}

	approval := &inventoryModels.SalesReturnApproval{
		SalesReturnID: id,
		Action:        "approved",
		Remarks:       req.Remarks,
		ActionBy:      userID,
		ActionAt:      now,
	}
	if err := s.repo.CreateSalesReturnApprovalRecord(db, approval); err != nil {
		return err
	}

	return nil
}

func (s *salesReturnService) RejectSalesReturn(db *gorm.DB, companyID, userID, id uint64, req dto.SalesReturnActionRequest) error {
	if req.Remarks == "" {
		return errors.New("remarks are required for rejection")
	}

	existing, err := s.repo.FindSalesReturnByID(db, companyID, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("sales return not found")
	}

	if existing.ApprovalStatus != "pending" {
		return errors.New("only pending sales returns can be rejected")
	}

	if err := s.repo.UpdateSalesReturnStatus(db, id, map[string]interface{}{
		"approval_status": "rejected",
		"updated_by":      userID,
	}); err != nil {
		return err
	}

	approval := &inventoryModels.SalesReturnApproval{
		SalesReturnID: id,
		Action:        "rejected",
		Remarks:       req.Remarks,
		ActionBy:      userID,
		ActionAt:      time.Now(),
	}
	if err := s.repo.CreateSalesReturnApprovalRecord(db, approval); err != nil {
		return err
	}

	return nil
}

func (s *salesReturnService) PostSalesReturn(db *gorm.DB, companyID, userID, id uint64) error {
	existing, err := s.repo.FindSalesReturnByID(db, companyID, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("sales return not found")
	}

	if existing.ApprovalStatus != "approved" {
		return errors.New("only approved sales returns can be posted")
	}
	if existing.PostedStatus == "posted" {
		return errors.New("sales return is already posted to stock ledger")
	}
	originalInvoice, err := s.validateOriginalInvoice(db, companyID, existing.SalesInvoiceID, existing.CustomerID)
	if err != nil {
		return err
	}
	for _, line := range existing.Lines {
		if _, err := s.validateReturnedLine(db, companyID, existing.ID, originalInvoice, dto.SalesReturnLineRequest{
			SalesInvoiceLineID: line.SalesInvoiceLineID,
			ProductID:          line.ProductID,
			ProductBatchID:     line.ProductBatchID,
			ReturnQuantity:     line.ReturnQuantity,
		}); err != nil {
			return err
		}
	}

	return db.Transaction(func(tx *gorm.DB) error {
		exists, err := s.repo.CheckSalesReturnLedgerExists(tx, companyID, id)
		if err != nil {
			return err
		}
		if exists {
			return errors.New("Sales return is already posted to stock ledger")
		}

		for _, line := range existing.Lines {

			allowExpired := false
			allowBlocked := false
			allowRecalled := false

			warehouse, _ := s.stockMovementRepo.FindWarehouseByID(tx, existing.WarehouseID)
			whType := ""
			if warehouse != nil {
				whType = warehouse.WarehouseType
			}

			if line.ReturnCondition == "expired" && (whType == "expired" || whType == "return") {
				allowExpired = true
			}
			if line.ReturnCondition == "recalled" && (whType == "quarantine" || whType == "return" || whType == "damaged") {
				allowRecalled = true
				allowBlocked = true
			}
			if line.ReturnCondition == "damaged" || line.ReturnCondition == "disposed" || line.ReturnCondition == "other" {
				allowBlocked = true
			}

			stockInPayload := dto.StockInPayload{
				CompanyID:           companyID,
				BranchID:            existing.BranchID,
				WarehouseID:         existing.WarehouseID,
				WarehouseLocationID: line.WarehouseLocationID,
				ProductID:           line.ProductID,
				ProductBatchID:      line.ProductBatchID,
				TransactionDate:     existing.SalesReturnDate,
				SourceModule:        "INVENTORY",
				SourceType:          "sales_return",
				SourceID:            existing.ID,
				SourceNumber:        existing.SalesReturnNumber,
				Quantity:            line.ReturnQuantity,
				UnitCost:            line.StockUnitCost,
				Remarks:             fmt.Sprintf("Sales Return %s", existing.SalesReturnNumber),
				CreatedBy:           userID,
				AllowExpiredBatch:   allowExpired,
				AllowBlockedBatch:   allowBlocked,
				AllowRecalledBatch:  allowRecalled,
			}

			if err := s.stockMovementSvc.ProcessStockIn(tx, stockInPayload); err != nil {
				return fmt.Errorf("failed to process stock in for product %d: %w", line.ProductID, err)
			}
			if line.ReturnCondition != "resellable" {
				balance, err := s.stockMovementRepo.FindStockBalance(tx, companyID, existing.WarehouseID, line.WarehouseLocationID, line.ProductID, line.ProductBatchID)
				if err != nil {
					return err
				}
				if balance != nil {
					balance.QuantityAllocated += line.ReturnQuantity
					balance.QuantityAvailable = balance.QuantityOnHand - balance.QuantityAllocated
					if balance.QuantityAvailable < 0 {
						balance.QuantityAvailable = 0
					}
					if err := s.stockMovementRepo.UpdateStockBalance(tx, balance); err != nil {
						return err
					}
				}
			}
		}

		now := time.Now()
		if err := s.repo.UpdateSalesReturnStatus(tx, id, map[string]interface{}{
			"posted_status": "posted",
			"posted_by":     userID,
			"posted_at":     now,
			"updated_by":    userID,
		}); err != nil {
			return err
		}

		approval := &inventoryModels.SalesReturnApproval{
			SalesReturnID: id,
			Action:        "posted",
			Remarks:       "Posted to stock ledger",
			ActionBy:      userID,
			ActionAt:      now,
		}
		if err := s.repo.CreateSalesReturnApprovalRecord(tx, approval); err != nil {
			return err
		}

		return nil
	})
}

func (s *salesReturnService) GenerateCreditNote(db *gorm.DB, companyID, userID, id uint64) (*invoiceModels.CreditNote, error) {
	existing, err := s.repo.FindSalesReturnByID(db, companyID, id)
	if err != nil {
		return nil, err
	}
	if existing == nil {
		return nil, errors.New("sales return not found")
	}
	if existing.PostedStatus != "posted" {
		return nil, errors.New("only posted sales returns can generate credit notes")
	}
	if existing.CreditNoteID != nil {
		return nil, errors.New("credit note has already been generated for this sales return")
	}
	originalInvoice, err := s.validateOriginalInvoice(db, companyID, existing.SalesInvoiceID, existing.CustomerID)
	if err != nil {
		return nil, err
	}

	noteNumber, err := s.generateCreditNoteNumber(db, companyID)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	note := &invoiceModels.CreditNote{
		CompanyID:          companyID,
		BranchID:           existing.BranchID,
		CustomerID:         originalInvoice.CustomerID,
		SalesInvoiceID:     existing.SalesInvoiceID,
		FinancialYearID:    existing.FinancialYearID,
		AccountingPeriodID: existing.AccountingPeriodID,
		CreditNoteNumber:   noteNumber,
		CreditNoteDate:     now,
		CreditNoteType:     "sales_return",
		ReferenceNumber:    existing.SalesReturnNumber,
		Reason:             existing.ReturnReason,
		Remarks:            "Generated from sales return " + existing.SalesReturnNumber,
		ApprovalStatus:     "draft",
		PostedStatus:       "unposted",
		Status:             "active",
		CreatedBy:          &userID,
		UpdatedBy:          &userID,
	}

	var subtotal, discount, tax, total float64
	for idx, line := range existing.Lines {
		productID := line.ProductID
		lineTotal := line.ReturnQuantity*line.UnitPrice - line.DiscountAmount + line.TaxAmount
		note.Lines = append(note.Lines, invoiceModels.CreditNoteLine{
			SalesInvoiceLineID: line.SalesInvoiceLineID,
			ProductID:          &productID,
			Description:        line.Product.ProductName,
			Quantity:           line.ReturnQuantity,
			UnitPrice:          line.UnitPrice,
			DiscountAmount:     line.DiscountAmount,
			TaxAmount:          line.TaxAmount,
			LineTotal:          lineTotal,
			LineOrder:          idx + 1,
		})
		subtotal += line.ReturnQuantity * line.UnitPrice
		discount += line.DiscountAmount
		tax += line.TaxAmount
		total += lineTotal
	}
	note.SubtotalAmount = subtotal
	note.DiscountAmount = discount
	note.TaxAmount = tax
	note.TotalAmount = total

	err = db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(note).Error; err != nil {
			return err
		}
		return s.repo.LinkCreditNote(tx, companyID, id, note.ID)
	})
	if err != nil {
		return nil, err
	}
	return note, nil
}
