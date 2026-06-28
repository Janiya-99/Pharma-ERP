package dto

type DashboardSummaryResponse struct {
	TotalCustomers               int64   `json:"total_customers"`
	ActiveCustomers              int64   `json:"active_customers"`
	InactiveCustomers            int64   `json:"inactive_customers"`
	CustomersOverCreditLimit     int64   `json:"customers_over_credit_limit"`
	TotalCustomerBalance         float64 `json:"total_customer_balance"`
	TotalCustomerCategories      int64   `json:"total_customer_categories"`
	DraftSalesOrders             int64   `json:"draft_sales_orders"`
	DraftSalesInvoices           int64   `json:"draft_sales_invoices"`
	UnpaidSalesInvoices          int64   `json:"unpaid_sales_invoices"`
	UnallocatedCustomerReceipts  int64   `json:"unallocated_customer_receipts"`
}
