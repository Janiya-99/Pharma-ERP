package dto

type InvoiceTrendItem struct {
	Month             string  `json:"month"`
	InvoicedAmount    float64 `json:"Invoiced Amount"`
	CollectedReceipts float64 `json:"Collected Receipts"`
	CollectionRatio   float64 `json:"Collection Ratio"`
}

type AgingDistributionItem struct {
	Bucket string  `json:"bucket"`
	Value  float64 `json:"value"`
}

type CriticalCustomerItem struct {
	ID             uint64  `json:"id"`
	CustomerCode   string  `json:"customer_code"`
	CustomerName   string  `json:"customer_name"`
	CustomerType   string  `json:"customer_type"`
	CreditLimit    float64 `json:"credit_limit"`
	CurrentBalance float64 `json:"current_balance"`
	Status         string  `json:"status"`
}

type DashboardSummaryResponse struct {
	TotalCustomers              int64                    `json:"total_customers"`
	ActiveCustomers             int64                    `json:"active_customers"`
	InactiveCustomers           int64                    `json:"inactive_customers"`
	BlockedCustomers            int64                    `json:"blocked_customers"`
	OnHoldCustomers             int64                    `json:"on_hold_customers"`
	CustomersOverCreditLimit    int64                    `json:"customers_over_credit_limit"`
	TotalCreditLimit            float64                  `json:"total_credit_limit"`
	TotalCustomerBalance        float64                  `json:"total_customer_balance"`
	TotalCustomerCategories     int64                    `json:"total_customer_categories"`
	DraftSalesOrders            int64                    `json:"draft_sales_orders"`
	DraftSalesInvoices          int64                    `json:"draft_sales_invoices"`
	UnpaidSalesInvoices         int64                    `json:"unpaid_sales_invoices"`
	UnallocatedCustomerReceipts int64                    `json:"unallocated_customer_receipts"`
	InvoiceTrends               []InvoiceTrendItem       `json:"invoice_trends"`
	AgingDistribution           []AgingDistributionItem  `json:"aging_distribution"`
	CriticalCustomers           []CriticalCustomerItem   `json:"critical_customers"`
}
