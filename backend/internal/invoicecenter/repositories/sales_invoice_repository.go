package repositories

import (
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"

	compmodels "github.com/pixandco/erp-phrma/internal/company/models"
	invmodels "github.com/pixandco/erp-phrma/internal/inventory/models"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/models"
	"gorm.io/gorm"
)

type SalesInvoiceRepository struct{}

func NewSalesInvoiceRepository() *SalesInvoiceRepository {
	return &SalesInvoiceRepository{}
}

func (r *SalesInvoiceRepository) GetLastSalesInvoiceNumber(db *gorm.DB, companyID uint64) (string, error) {
	var numbers []string
	if err := db.Model(&models.SalesInvoice{}).Unscoped().
		Where("company_id = ? AND invoice_number LIKE ?", companyID, "INV-%").
		Pluck("invoice_number", &numbers).Error; err != nil {
		return "", err
	}

	maxSeq := 0
	for _, n := range numbers {
		parts := strings.Split(n, "INV-")
		if len(parts) == 2 {
			if num, err := strconv.Atoi(parts[1]); err == nil && num > maxSeq {
				maxSeq = num
			}
		}
	}

	return fmt.Sprintf("INV-%06d", maxSeq+1), nil
}

func (r *SalesInvoiceRepository) FindSalesInvoices(db *gorm.DB, companyID uint64, filters map[string]interface{}, search string, page, limit int) ([]models.SalesInvoice, int64, error) {
	query := db.Model(&models.SalesInvoice{}).Where("sales_invoices.company_id = ?", companyID)

	if v, ok := filters["branch_id"].(uint64); ok && v > 0 {
		query = query.Where("sales_invoices.branch_id = ?", v)
	}
	if v, ok := filters["customer_id"].(uint64); ok && v > 0 {
		query = query.Where("sales_invoices.customer_id = ?", v)
	}
	if v, ok := filters["sales_order_id"].(uint64); ok && v > 0 {
		query = query.Where("sales_invoices.sales_order_id = ?", v)
	}
	if v, ok := filters["warehouse_id"].(uint64); ok && v > 0 {
		query = query.Where("sales_invoices.warehouse_id = ?", v)
	}
	if v, ok := filters["financial_year_id"].(uint64); ok && v > 0 {
		query = query.Where("sales_invoices.financial_year_id = ?", v)
	}
	if v, ok := filters["accounting_period_id"].(uint64); ok && v > 0 {
		query = query.Where("sales_invoices.accounting_period_id = ?", v)
	}
	if v, ok := filters["approval_status"].(string); ok && v != "" {
		query = query.Where("sales_invoices.approval_status = ?", v)
	}
	if v, ok := filters["posted_status"].(string); ok && v != "" {
		query = query.Where("sales_invoices.posted_status = ?", v)
	}
	if v, ok := filters["payment_status"].(string); ok && v != "" {
		query = query.Where("sales_invoices.payment_status = ?", v)
	}
	if v, ok := filters["invoice_date_from"].(string); ok && v != "" {
		query = query.Where("sales_invoices.invoice_date >= ?", v)
	}
	if v, ok := filters["invoice_date_to"].(string); ok && v != "" {
		query = query.Where("sales_invoices.invoice_date <= ?", v)
	}
	if v, ok := filters["due_date_from"].(string); ok && v != "" {
		query = query.Where("sales_invoices.due_date >= ?", v)
	}
	if v, ok := filters["due_date_to"].(string); ok && v != "" {
		query = query.Where("sales_invoices.due_date <= ?", v)
	}

	if search != "" {
		searchTerm := "%" + search + "%"
		query = query.Joins("LEFT JOIN customers ON customers.id = sales_invoices.customer_id").
			Joins("LEFT JOIN sales_orders ON sales_orders.id = sales_invoices.sales_order_id").
			Where(
				"sales_invoices.invoice_number LIKE ? OR sales_invoices.customer_reference_number LIKE ? OR sales_invoices.remarks LIKE ? OR customers.customer_code LIKE ? OR customers.customer_name LIKE ? OR sales_orders.sales_order_number LIKE ?",
				searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm,
			)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	var invoices []models.SalesInvoice
	if err := query.Preload("Customer").Preload("SalesOrder").
		Order("sales_invoices.invoice_date DESC, sales_invoices.id DESC").
		Offset(offset).Limit(limit).Find(&invoices).Error; err != nil {
		return nil, 0, err
	}

	return invoices, total, nil
}

func (r *SalesInvoiceRepository) FindSalesInvoiceByID(db *gorm.DB, companyID, id uint64) (*models.SalesInvoice, error) {
	var invoice models.SalesInvoice
	err := db.Preload("Customer").Preload("SalesOrder").Preload("Lines").Preload("Approvals").
		Where("id = ? AND company_id = ?", id, companyID).First(&invoice).Error
	if err != nil {
		return nil, err
	}
	return &invoice, nil
}

func (r *SalesInvoiceRepository) CreateSalesInvoiceWithLines(db *gorm.DB, invoice *models.SalesInvoice) error {
	return db.Transaction(func(tx *gorm.DB) error {
		return tx.Create(invoice).Error
	})
}

func (r *SalesInvoiceRepository) UpdateSalesInvoiceWithLines(db *gorm.DB, invoice *models.SalesInvoice) error {
	return db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("sales_invoice_id = ?", invoice.ID).Delete(&models.SalesInvoiceLine{}).Error; err != nil {
			return err
		}
		return tx.Save(invoice).Error
	})
}

func (r *SalesInvoiceRepository) SoftDeleteSalesInvoice(db *gorm.DB, companyID, id uint64) error {
	return db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("sales_invoice_id = ?", id).Delete(&models.SalesInvoiceLine{}).Error; err != nil {
			return err
		}
		return tx.Where("id = ? AND company_id = ?", id, companyID).Delete(&models.SalesInvoice{}).Error
	})
}

func (r *SalesInvoiceRepository) UpdateSalesInvoiceApprovalStatus(db *gorm.DB, companyID, id uint64, approvalStatus string, actionBy uint64, actionAt time.Time) error {
	updates := map[string]interface{}{
		"approval_status": approvalStatus,
		"updated_by":      actionBy,
		"updated_at":      actionAt,
	}
	if approvalStatus == "approved" {
		updates["approved_by"] = actionBy
		updates["approved_at"] = actionAt
	}
	return db.Model(&models.SalesInvoice{}).Where("id = ? AND company_id = ?", id, companyID).Updates(updates).Error
}

func (r *SalesInvoiceRepository) UpdateSalesInvoicePostedStatus(db *gorm.DB, companyID, id uint64, postedStatus string, actionBy uint64, actionAt time.Time) error {
	return db.Model(&models.SalesInvoice{}).Where("id = ? AND company_id = ?", id, companyID).Updates(map[string]interface{}{
		"posted_status": postedStatus,
		"posted_by":     actionBy,
		"posted_at":     actionAt,
		"updated_by":    actionBy,
		"updated_at":    actionAt,
	}).Error
}

func (r *SalesInvoiceRepository) UpdateSalesInvoicePaymentStatus(db *gorm.DB, companyID, id uint64, paymentStatus string, actionBy uint64) error {
	return db.Model(&models.SalesInvoice{}).Where("id = ? AND company_id = ?", id, companyID).Updates(map[string]interface{}{
		"payment_status": paymentStatus,
		"updated_by":     actionBy,
		"updated_at":     time.Now(),
	}).Error
}

func (r *SalesInvoiceRepository) CreateSalesInvoiceApprovalRecord(db *gorm.DB, approval *models.SalesInvoiceApproval) error {
	return db.Create(approval).Error
}

func (r *SalesInvoiceRepository) CancelSalesInvoice(db *gorm.DB, companyID, id, userID uint64, remarks string, now time.Time) error {
	return db.Model(&models.SalesInvoice{}).Where("id = ? AND company_id = ?", id, companyID).Updates(map[string]interface{}{
		"approval_status": "cancelled",
		"payment_status":  "cancelled",
		"cancelled_by":    userID,
		"cancelled_at":    now,
		"cancel_reason":   remarks,
		"updated_by":      userID,
		"updated_at":      now,
	}).Error
}

func (r *SalesInvoiceRepository) ValidateCustomer(db *gorm.DB, companyID, customerID uint64) (*models.Customer, error) {
	var customer models.Customer
	if err := db.Where("id = ? AND company_id = ?", customerID, companyID).First(&customer).Error; err != nil {
		return nil, errors.New("customer does not exist")
	}
	if customer.Status != "active" {
		return nil, errors.New("customer is not active")
	}
	return &customer, nil
}

func (r *SalesInvoiceRepository) ValidateSalesOrder(db *gorm.DB, companyID, salesOrderID uint64) (*models.SalesOrder, error) {
	var order models.SalesOrder
	if err := db.Preload("Lines").Where("id = ? AND company_id = ?", salesOrderID, companyID).First(&order).Error; err != nil {
		return nil, errors.New("sales order does not exist")
	}
	return &order, nil
}

func (r *SalesInvoiceRepository) ValidateSalesOrderLine(db *gorm.DB, salesOrderID, salesOrderLineID uint64) (*models.SalesOrderLine, error) {
	var line models.SalesOrderLine
	if err := db.Where("id = ? AND sales_order_id = ?", salesOrderLineID, salesOrderID).First(&line).Error; err != nil {
		return nil, errors.New("sales order line does not exist or does not belong to selected sales order")
	}
	return &line, nil
}

func (r *SalesInvoiceRepository) ValidateWarehouse(db *gorm.DB, companyID, branchID, warehouseID uint64) (*invmodels.Warehouse, error) {
	var warehouse invmodels.Warehouse
	if err := db.Where("id = ? AND company_id = ? AND branch_id = ?", warehouseID, companyID, branchID).First(&warehouse).Error; err != nil {
		return nil, errors.New("warehouse does not exist or does not belong to selected branch")
	}
	if warehouse.Status != "active" {
		return nil, errors.New("warehouse is not active")
	}
	return &warehouse, nil
}

func (r *SalesInvoiceRepository) ValidateWarehouseLocation(db *gorm.DB, companyID, warehouseID, locationID uint64) (*invmodels.WarehouseLocation, error) {
	var location invmodels.WarehouseLocation
	if err := db.Where("id = ? AND company_id = ? AND warehouse_id = ?", locationID, companyID, warehouseID).First(&location).Error; err != nil {
		return nil, errors.New("warehouse location does not exist or does not belong to selected warehouse")
	}
	if location.Status != "active" {
		return nil, errors.New("warehouse location is not active")
	}
	return &location, nil
}

func (r *SalesInvoiceRepository) ValidateProduct(db *gorm.DB, companyID, productID uint64) (*invmodels.Product, error) {
	var product invmodels.Product
	if err := db.Where("id = ? AND company_id = ?", productID, companyID).First(&product).Error; err != nil {
		return nil, errors.New("product does not exist")
	}
	if product.Status != "active" {
		return nil, errors.New("product is not active")
	}
	return &product, nil
}

func (r *SalesInvoiceRepository) ValidateProductBatch(db *gorm.DB, companyID, productID, batchID uint64) (*invmodels.ProductBatch, error) {
	var batch invmodels.ProductBatch
	if err := db.Where("id = ? AND company_id = ? AND product_id = ?", batchID, companyID, productID).First(&batch).Error; err != nil {
		return nil, errors.New("product batch does not exist or does not belong to product")
	}
	if batch.IsBlocked {
		return nil, errors.New("product batch is blocked")
	}
	if batch.BatchStatus == "disposed" || batch.BatchStatus == "blocked" || batch.BatchStatus == "recalled" || batch.BatchStatus == "expired" || batch.BatchStatus == "inactive" {
		return nil, errors.New("product batch is in invalid state for invoice")
	}
	if batch.ExpiryDate != nil && batch.ExpiryDate.Before(time.Now()) {
		return nil, errors.New("product batch is expired")
	}
	return &batch, nil
}

func (r *SalesInvoiceRepository) ValidateStockAvailability(db *gorm.DB, companyID, warehouseID uint64, locationID *uint64, productID uint64, batchID *uint64, quantity float64) (*invmodels.StockBalance, error) {
	var balance invmodels.StockBalance
	query := db.Where("company_id = ? AND warehouse_id = ? AND product_id = ?", companyID, warehouseID, productID)
	if locationID != nil {
		query = query.Where("warehouse_location_id = ?", *locationID)
	} else {
		query = query.Where("warehouse_location_id IS NULL")
	}
	if batchID != nil {
		query = query.Where("product_batch_id = ?", *batchID)
	} else {
		query = query.Where("product_batch_id IS NULL")
	}
	if err := query.First(&balance).Error; err != nil {
		return nil, errors.New("stock balance not found")
	}
	if balance.QuantityOnHand < quantity || balance.QuantityAvailable < quantity {
		return nil, errors.New("Insufficient available stock for invoice")
	}
	return &balance, nil
}

func (r *SalesInvoiceRepository) CheckSalesInvoiceLedgerExists(db *gorm.DB, invoiceID uint64) (bool, error) {
	var count int64
	err := db.Model(&invmodels.StockLedgerEntry{}).Where("source_type = ? AND source_id = ?", "sales_invoice", invoiceID).Count(&count).Error
	return count > 0, err
}

func (r *SalesInvoiceRepository) UpdateSalesInvoiceLineStockCost(db *gorm.DB, lineID uint64, unitCost, totalCost float64) error {
	return db.Model(&models.SalesInvoiceLine{}).Where("id = ?", lineID).Updates(map[string]interface{}{
		"stock_unit_cost":  unitCost,
		"stock_total_cost": totalCost,
		"updated_at":       time.Now(),
	}).Error
}

func (r *SalesInvoiceRepository) UpdateSalesOrderLineInvoicedQuantity(db *gorm.DB, lineID uint64, invoiceQty float64) error {
	var line models.SalesOrderLine
	if err := db.First(&line, lineID).Error; err != nil {
		return err
	}
	line.InvoicedQuantity += invoiceQty
	line.PendingQuantity = line.Quantity - line.InvoicedQuantity
	if line.PendingQuantity < 0 {
		line.PendingQuantity = 0
	}
	return db.Save(&line).Error
}

func (r *SalesInvoiceRepository) UpdateSalesOrderStatus(db *gorm.DB, salesOrderID uint64) (string, error) {
	var lines []models.SalesOrderLine
	if err := db.Where("sales_order_id = ?", salesOrderID).Find(&lines).Error; err != nil {
		return "", err
	}
	if len(lines) == 0 {
		return "open", nil
	}
	hasPending := false
	hasInvoiced := false
	for _, line := range lines {
		if line.PendingQuantity > 0 {
			hasPending = true
		}
		if line.InvoicedQuantity > 0 {
			hasInvoiced = true
		}
	}
	status := "open"
	if hasInvoiced && hasPending {
		status = "partially_invoiced"
	} else if hasInvoiced && !hasPending {
		status = "fully_invoiced"
	}
	return status, db.Model(&models.SalesOrder{}).Where("id = ?", salesOrderID).Updates(map[string]interface{}{
		"order_status": status,
		"updated_at":   time.Now(),
	}).Error
}

func (r *SalesInvoiceRepository) UpdateCustomerBalance(db *gorm.DB, companyID, customerID uint64, delta float64) error {
	return db.Model(&models.Customer{}).Where("id = ? AND company_id = ?", customerID, companyID).
		Update("current_balance", gorm.Expr("current_balance + ?", delta)).Error
}

func (r *SalesInvoiceRepository) CheckInvoicePaymentUsage(db *gorm.DB, invoiceID uint64) (bool, error) {
	var count int64
	if err := db.Model(&models.CustomerReceiptAllocation{}).Where("sales_invoice_id = ? AND allocated_amount > 0", invoiceID).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

func (r *SalesInvoiceRepository) GetBranch(db *gorm.DB, companyID, branchID uint64) (*compmodels.Branch, error) {
	var branch compmodels.Branch
	if err := db.Where("id = ? AND company_id = ?", branchID, companyID).First(&branch).Error; err != nil {
		return nil, err
	}
	return &branch, nil
}

func (r *SalesInvoiceRepository) GetWarehouse(db *gorm.DB, companyID, warehouseID uint64) (*invmodels.Warehouse, error) {
	var warehouse invmodels.Warehouse
	if err := db.Where("id = ? AND company_id = ?", warehouseID, companyID).First(&warehouse).Error; err != nil {
		return nil, err
	}
	return &warehouse, nil
}

func (r *SalesInvoiceRepository) GetProductMap(db *gorm.DB, companyID uint64, productIDs []uint64) (map[uint64]invmodels.Product, error) {
	var products []invmodels.Product
	if len(productIDs) == 0 {
		return make(map[uint64]invmodels.Product), nil
	}
	if err := db.Where("company_id = ? AND id IN ?", companyID, productIDs).Find(&products).Error; err != nil {
		return nil, err
	}
	result := make(map[uint64]invmodels.Product)
	for _, product := range products {
		result[product.ID] = product
	}
	return result, nil
}

func (r *SalesInvoiceRepository) GetBatchMap(db *gorm.DB, companyID uint64, batchIDs []uint64) (map[uint64]invmodels.ProductBatch, error) {
	var batches []invmodels.ProductBatch
	if len(batchIDs) == 0 {
		return make(map[uint64]invmodels.ProductBatch), nil
	}
	if err := db.Where("company_id = ? AND id IN ?", companyID, batchIDs).Find(&batches).Error; err != nil {
		return nil, err
	}
	result := make(map[uint64]invmodels.ProductBatch)
	for _, batch := range batches {
		result[batch.ID] = batch
	}
	return result, nil
}

func (r *SalesInvoiceRepository) GetWarehouseLocationMap(db *gorm.DB, companyID uint64, locationIDs []uint64) (map[uint64]invmodels.WarehouseLocation, error) {
	var locations []invmodels.WarehouseLocation
	if len(locationIDs) == 0 {
		return make(map[uint64]invmodels.WarehouseLocation), nil
	}
	if err := db.Where("company_id = ? AND id IN ?", companyID, locationIDs).Find(&locations).Error; err != nil {
		return nil, err
	}
	result := make(map[uint64]invmodels.WarehouseLocation)
	for _, location := range locations {
		result[location.ID] = location
	}
	return result, nil
}
