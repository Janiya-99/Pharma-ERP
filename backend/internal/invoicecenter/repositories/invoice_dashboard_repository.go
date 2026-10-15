package repositories

import (
	"time"

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

	// 1. Invoice Trends (Last 6 Months)
	now := time.Now()
	var trends []dto.InvoiceTrendItem
	for i := 5; i >= 0; i-- {
		t := now.AddDate(0, -i, 0)
		startOfMonth := time.Date(t.Year(), t.Month(), 1, 0, 0, 0, 0, time.UTC)
		endOfMonth := startOfMonth.AddDate(0, 1, 0).Add(-time.Nanosecond)
		monthName := t.Format("Jan")

		var invoiced, collected float64
		db.Model(&models.SalesInvoice{}).
			Where("company_id = ? AND invoice_date BETWEEN ? AND ? AND approval_status != 'cancelled'", companyID, startOfMonth, endOfMonth).
			Select("COALESCE(SUM(total_amount), 0)").Scan(&invoiced)

		db.Model(&models.CustomerReceipt{}).
			Where("company_id = ? AND receipt_date BETWEEN ? AND ? AND approval_status != 'cancelled'", companyID, startOfMonth, endOfMonth).
			Select("COALESCE(SUM(receipt_amount), 0)").Scan(&collected)

		ratio := 100.0
		if invoiced > 0 {
			ratio = (collected / invoiced) * 100.0
			if ratio > 100 {
				ratio = 100
			}
		}

		trends = append(trends, dto.InvoiceTrendItem{
			Month:             monthName,
			InvoicedAmount:    invoiced,
			CollectedReceipts: collected,
			CollectionRatio:   ratio,
		})
	}
	summary.InvoiceTrends = trends

	// 2. Aging Distribution
	agingBuckets := []dto.AgingDistributionItem{
		{Bucket: "Current (0-30 Days)", Value: 0},
		{Bucket: "31-60 Days Overdue", Value: 0},
		{Bucket: "61-90 Days Overdue", Value: 0},
		{Bucket: "90+ Days Critical", Value: 0},
	}

	var curVal, b30Val, b60Val, b90Val float64
	db.Raw(`
		SELECT
			COALESCE(SUM(CASE WHEN DATEDIFF(NOW(), invoice_date) <= 30 THEN balance_amount ELSE 0 END), 0) as cur_val,
			COALESCE(SUM(CASE WHEN DATEDIFF(NOW(), invoice_date) BETWEEN 31 AND 60 THEN balance_amount ELSE 0 END), 0) as b30_val,
			COALESCE(SUM(CASE WHEN DATEDIFF(NOW(), invoice_date) BETWEEN 61 AND 90 THEN balance_amount ELSE 0 END), 0) as b60_val,
			COALESCE(SUM(CASE WHEN DATEDIFF(NOW(), invoice_date) > 90 THEN balance_amount ELSE 0 END), 0) as b90_val
		FROM sales_invoices
		WHERE company_id = ? AND payment_status != 'paid' AND approval_status != 'cancelled'
	`, companyID).Row().Scan(&curVal, &b30Val, &b60Val, &b90Val)

	agingBuckets[0].Value = curVal
	agingBuckets[1].Value = b30Val
	agingBuckets[2].Value = b60Val
	agingBuckets[3].Value = b90Val
	summary.AgingDistribution = agingBuckets

	// 3. Critical Customers
	var criticalCustomers []dto.CriticalCustomerItem
	db.Model(&models.Customer{}).
		Select("id, customer_code, customer_name, customer_type, credit_limit, current_balance, status").
		Where("company_id = ?", companyID).
		Order("current_balance DESC").
		Limit(5).
		Scan(&criticalCustomers)

	if criticalCustomers == nil {
		criticalCustomers = []dto.CriticalCustomerItem{}
	}
	summary.CriticalCustomers = criticalCustomers

	return &summary, nil
}
