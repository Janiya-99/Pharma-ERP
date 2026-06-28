package repositories

import (
	"github.com/pixandco/erp-phrma/internal/invoicecenter/dto"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/models"
	"gorm.io/gorm"
)

type InvoiceDashboardRepository struct{}

func NewInvoiceDashboardRepository() *InvoiceDashboardRepository {
	return &InvoiceDashboardRepository{}
}

func (r *InvoiceDashboardRepository) GetSummary(db *gorm.DB, companyID uint64) (*dto.DashboardSummaryResponse, error) {
	var summary dto.DashboardSummaryResponse

	// Total Customers
	if err := db.Model(&models.Customer{}).Where("company_id = ?", companyID).Count(&summary.TotalCustomers).Error; err != nil {
		return nil, err
	}

	// Active Customers
	if err := db.Model(&models.Customer{}).Where("company_id = ? AND status = ?", companyID, "active").Count(&summary.ActiveCustomers).Error; err != nil {
		return nil, err
	}

	// Inactive Customers
	if err := db.Model(&models.Customer{}).Where("company_id = ? AND status = ?", companyID, "inactive").Count(&summary.InactiveCustomers).Error; err != nil {
		return nil, err
	}

	// Blocked Customers
	if err := db.Model(&models.Customer{}).Where("company_id = ? AND status = ?", companyID, "blocked").Count(&summary.BlockedCustomers).Error; err != nil {
		return nil, err
	}

	// On Hold Customers
	if err := db.Model(&models.Customer{}).Where("company_id = ? AND status = ?", companyID, "on_hold").Count(&summary.OnHoldCustomers).Error; err != nil {
		return nil, err
	}

	// Customers Over Credit Limit
	if err := db.Model(&models.Customer{}).Where("company_id = ? AND credit_limit > 0 AND current_balance > credit_limit", companyID).Count(&summary.CustomersOverCreditLimit).Error; err != nil {
		return nil, err
	}

	// Total Credit Limit
	var totalCredit *float64
	if err := db.Model(&models.Customer{}).Where("company_id = ?", companyID).Select("SUM(credit_limit)").Scan(&totalCredit).Error; err != nil {
		return nil, err
	}
	if totalCredit != nil {
		summary.TotalCreditLimit = *totalCredit
	}

	// Total Customer Balance
	var totalBalance *float64
	if err := db.Model(&models.Customer{}).Where("company_id = ?", companyID).Select("SUM(current_balance)").Scan(&totalBalance).Error; err != nil {
		return nil, err
	}
	if totalBalance != nil {
		summary.TotalCustomerBalance = *totalBalance
	}

	// Total Customer Categories
	if err := db.Model(&models.CustomerCategory{}).Where("company_id = ?", companyID).Count(&summary.TotalCustomerCategories).Error; err != nil {
		return nil, err
	}

	// Draft Sales Orders
	if err := db.Model(&models.SalesOrder{}).Where("company_id = ? AND approval_status = ?", companyID, "draft").Count(&summary.DraftSalesOrders).Error; err != nil {
		return nil, err
	}

	// Draft Sales Invoices
	if err := db.Model(&models.SalesInvoice{}).Where("company_id = ? AND approval_status = ?", companyID, "draft").Count(&summary.DraftSalesInvoices).Error; err != nil {
		return nil, err
	}

	// Unpaid Sales Invoices
	if err := db.Model(&models.SalesInvoice{}).Where("company_id = ? AND payment_status = ? AND approval_status != ?", companyID, "unpaid", "cancelled").Count(&summary.UnpaidSalesInvoices).Error; err != nil {
		return nil, err
	}

	// Unallocated Customer Receipts
	if err := db.Model(&models.CustomerReceipt{}).Where("company_id = ? AND unallocated_amount > 0 AND approval_status != ?", companyID, "cancelled").Count(&summary.UnallocatedCustomerReceipts).Error; err != nil {
		return nil, err
	}

	return &summary, nil
}
