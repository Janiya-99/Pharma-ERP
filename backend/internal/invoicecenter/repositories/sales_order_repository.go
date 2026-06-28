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

type SalesOrderRepository struct{}

func NewSalesOrderRepository() *SalesOrderRepository {
	return &SalesOrderRepository{}
}

func (r *SalesOrderRepository) GetLastSalesOrderNumber(db *gorm.DB, companyID uint64) (string, error) {
	var numbers []string
	if err := db.Model(&models.SalesOrder{}).Unscoped().
		Where("company_id = ? AND sales_order_number LIKE ?", companyID, "SO-%").
		Pluck("sales_order_number", &numbers).Error; err != nil {
		return "", err
	}

	maxSeq := 0
	for _, n := range numbers {
		parts := strings.Split(n, "SO-")
		if len(parts) == 2 {
			if num, err := strconv.Atoi(parts[1]); err == nil {
				if num > maxSeq {
					maxSeq = num
				}
			}
		}
	}

	return fmt.Sprintf("SO-%06d", maxSeq+1), nil
}

func (r *SalesOrderRepository) FindSalesOrders(db *gorm.DB, companyID uint64, filters map[string]interface{}, search string, page, limit int) ([]models.SalesOrder, int64, error) {
	query := db.Model(&models.SalesOrder{}).Where("company_id = ?", companyID)

	if branchID, ok := filters["branch_id"]; ok && branchID != nil {
		if bid, valid := branchID.(uint64); valid && bid > 0 {
			query = query.Where("branch_id = ?", bid)
		}
	}
	if customerID, ok := filters["customer_id"]; ok && customerID != nil {
		if cid, valid := customerID.(uint64); valid && cid > 0 {
			query = query.Where("customer_id = ?", cid)
		}
	}
	if fyID, ok := filters["financial_year_id"]; ok && fyID != nil {
		if fid, valid := fyID.(uint64); valid && fid > 0 {
			query = query.Where("financial_year_id = ?", fid)
		}
	}
	if apID, ok := filters["accounting_period_id"]; ok && apID != nil {
		if aid, valid := apID.(uint64); valid && aid > 0 {
			query = query.Where("accounting_period_id = ?", aid)
		}
	}
	if status, ok := filters["approval_status"]; ok && status != "" {
		query = query.Where("approval_status = ?", status)
	}
	if oStatus, ok := filters["order_status"]; ok && oStatus != "" {
		query = query.Where("order_status = ?", oStatus)
	}
	if fromDate, ok := filters["sales_order_date_from"]; ok && fromDate != "" {
		query = query.Where("sales_order_date >= ?", fromDate)
	}
	if toDate, ok := filters["sales_order_date_to"]; ok && toDate != "" {
		query = query.Where("sales_order_date <= ?", toDate)
	}
	if expFrom, ok := filters["expected_delivery_date_from"]; ok && expFrom != "" {
		query = query.Where("expected_delivery_date >= ?", expFrom)
	}
	if expTo, ok := filters["expected_delivery_date_to"]; ok && expTo != "" {
		query = query.Where("expected_delivery_date <= ?", expTo)
	}

	if search != "" {
		searchTerm := "%" + search + "%"
		query = query.Joins("Customer").Where(
			"sales_orders.sales_order_number LIKE ? OR sales_orders.customer_reference_number LIKE ? OR sales_orders.remarks LIKE ? OR Customer.customer_code LIKE ? OR Customer.customer_name LIKE ?",
			searchTerm, searchTerm, searchTerm, searchTerm, searchTerm,
		)
	} else {
		query = query.Preload("Customer")
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	var orders []models.SalesOrder
	if err := query.Order("sales_order_date DESC, id DESC").Offset(offset).Limit(limit).Find(&orders).Error; err != nil {
		return nil, 0, err
	}

	return orders, total, nil
}

func (r *SalesOrderRepository) FindSalesOrderByID(db *gorm.DB, companyID uint64, id uint64) (*models.SalesOrder, error) {
	var order models.SalesOrder
	err := db.Preload("Customer").Preload("Lines").Preload("Approvals").
		Where("id = ? AND company_id = ?", id, companyID).First(&order).Error
	if err != nil {
		return nil, err
	}
	return &order, nil
}

func (r *SalesOrderRepository) ValidateCustomer(db *gorm.DB, companyID uint64, customerID uint64) (*models.Customer, error) {
	var cust models.Customer
	if err := db.Where("id = ? AND company_id = ?", customerID, companyID).First(&cust).Error; err != nil {
		return nil, errors.New("customer does not exist")
	}
	if cust.Status != "active" {
		return nil, errors.New("customer is not active")
	}
	return &cust, nil
}

func (r *SalesOrderRepository) GetCustomerCreditSummary(cust *models.Customer) (float64, float64, bool) {
	limit := cust.CreditLimit
	balance := cust.CurrentBalance
	exceeded := false
	if limit > 0 && balance > limit {
		exceeded = true
	}
	return limit, balance, exceeded
}

func (r *SalesOrderRepository) ValidateProduct(db *gorm.DB, companyID uint64, productID uint64) (*invmodels.Product, error) {
	var prod invmodels.Product
	if err := db.Where("id = ? AND company_id = ?", productID, companyID).First(&prod).Error; err != nil {
		return nil, errors.New("product does not exist")
	}
	if prod.Status != "active" {
		return nil, errors.New("product is not active")
	}
	return &prod, nil
}

func (r *SalesOrderRepository) ValidateProductBatch(db *gorm.DB, companyID uint64, productID uint64, batchID uint64) (*invmodels.ProductBatch, error) {
	var batch invmodels.ProductBatch
	if err := db.Where("id = ? AND company_id = ? AND product_id = ?", batchID, companyID, productID).First(&batch).Error; err != nil {
		return nil, errors.New("product batch does not exist or does not belong to product")
	}
	if batch.BatchStatus != "active" || batch.IsBlocked {
		return nil, errors.New("product batch is not active or is blocked")
	}
	return &batch, nil
}

func (r *SalesOrderRepository) GetBranch(db *gorm.DB, companyID uint64, branchID uint64) (*compmodels.Branch, error) {
	var branch compmodels.Branch
	if err := db.Where("id = ? AND company_id = ?", branchID, companyID).First(&branch).Error; err != nil {
		return nil, err
	}
	return &branch, nil
}

func (r *SalesOrderRepository) GetProductMap(db *gorm.DB, companyID uint64, productIDs []uint64) (map[uint64]invmodels.Product, error) {
	var products []invmodels.Product
	if len(productIDs) == 0 {
		return make(map[uint64]invmodels.Product), nil
	}
	if err := db.Where("company_id = ? AND id IN ?", companyID, productIDs).Find(&products).Error; err != nil {
		return nil, err
	}
	m := make(map[uint64]invmodels.Product)
	for _, p := range products {
		m[p.ID] = p
	}
	return m, nil
}

func (r *SalesOrderRepository) GetBatchMap(db *gorm.DB, companyID uint64, batchIDs []uint64) (map[uint64]invmodels.ProductBatch, error) {
	var batches []invmodels.ProductBatch
	if len(batchIDs) == 0 {
		return make(map[uint64]invmodels.ProductBatch), nil
	}
	if err := db.Where("company_id = ? AND id IN ?", companyID, batchIDs).Find(&batches).Error; err != nil {
		return nil, err
	}
	m := make(map[uint64]invmodels.ProductBatch)
	for _, b := range batches {
		m[b.ID] = b
	}
	return m, nil
}

func (r *SalesOrderRepository) CheckSalesOrderInvoiceUsage(db *gorm.DB, salesOrderID uint64) (bool, error) {
	var count int64
	if err := db.Model(&models.SalesInvoice{}).Where("sales_order_id = ? AND status != 'cancelled'", salesOrderID).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

func (r *SalesOrderRepository) CreateSalesOrderWithLines(db *gorm.DB, order *models.SalesOrder) error {
	return db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(order).Error; err != nil {
			return err
		}
		return nil
	})
}

func (r *SalesOrderRepository) UpdateSalesOrderWithLines(db *gorm.DB, order *models.SalesOrder) error {
	return db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("sales_order_id = ?", order.ID).Delete(&models.SalesOrderLine{}).Error; err != nil {
			return err
		}
		if err := tx.Save(order).Error; err != nil {
			return err
		}
		return nil
	})
}

func (r *SalesOrderRepository) SoftDeleteSalesOrder(db *gorm.DB, companyID uint64, id uint64) error {
	return db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("sales_order_id = ?", id).Delete(&models.SalesOrderLine{}).Error; err != nil {
			return err
		}
		if err := tx.Where("id = ? AND company_id = ?", id, companyID).Delete(&models.SalesOrder{}).Error; err != nil {
			return err
		}
		return nil
	})
}

func (r *SalesOrderRepository) UpdateSalesOrderApprovalStatus(db *gorm.DB, companyID uint64, id uint64, approvalStatus string, actionBy uint64, actionAt time.Time) error {
	updates := map[string]interface{}{
		"approval_status": approvalStatus,
		"updated_by":      actionBy,
		"updated_at":      actionAt,
	}
	if approvalStatus == "approved" {
		updates["approved_by"] = actionBy
		updates["approved_at"] = actionAt
	} else if approvalStatus == "cancelled" {
		updates["cancelled_by"] = actionBy
		updates["cancelled_at"] = actionAt
		updates["order_status"] = "cancelled"
	}
	return db.Model(&models.SalesOrder{}).Where("id = ? AND company_id = ?", id, companyID).Updates(updates).Error
}

func (r *SalesOrderRepository) UpdateSalesOrderOrderStatus(db *gorm.DB, companyID uint64, id uint64, orderStatus string, actionBy uint64, actionAt time.Time) error {
	updates := map[string]interface{}{
		"order_status": orderStatus,
		"updated_by":   actionBy,
		"updated_at":   actionAt,
	}
	if orderStatus == "closed" {
		updates["closed_by"] = actionBy
		updates["closed_at"] = actionAt
	}
	return db.Model(&models.SalesOrder{}).Where("id = ? AND company_id = ?", id, companyID).Updates(updates).Error
}

func (r *SalesOrderRepository) CreateSalesOrderApprovalRecord(db *gorm.DB, approval *models.SalesOrderApproval) error {
	return db.Create(approval).Error
}
