package dto

import "time"

type ReportFilterDTO struct {
	BranchID           *uint64    `form:"branch_id"`
	CustomerID         *uint64    `form:"customer_id"`
	CustomerCategoryID *uint64    `form:"customer_category_id"`
	CustomerType       *string    `form:"customer_type"`
	ProductID          *uint64    `form:"product_id"`
	ProductCategoryID  *uint64    `form:"product_category_id"`
	SalesOrderID       *uint64    `form:"sales_order_id"`
	SalesInvoiceID     *uint64    `form:"sales_invoice_id"`
	DocumentType       *string    `form:"document_type"`
	CreditNoteType     *string    `form:"credit_note_type"`
	DebitNoteType      *string    `form:"debit_note_type"`
	PaymentMethod      *string    `form:"payment_method"`
	Status             *string    `form:"status"`
	OrderStatus        *string    `form:"order_status"`
	ApprovalStatus     *string    `form:"approval_status"`
	PostedStatus       *string    `form:"posted_status"`
	PaymentStatus      *string    `form:"payment_status"`
	ReceiptStatus      *string    `form:"receipt_status"`
	FinancePostStatus  *string    `form:"finance_post_status"`
	DateFrom           *time.Time `form:"date_from" time_format:"2006-01-02"`
	DateTo             *time.Time `form:"date_to" time_format:"2006-01-02"`
	DueDateFrom        *time.Time `form:"due_date_from" time_format:"2006-01-02"`
	DueDateTo          *time.Time `form:"due_date_to" time_format:"2006-01-02"`
	AsOfDate           *time.Time `form:"as_of_date" time_format:"2006-01-02"`
	OverCreditLimit    *bool      `form:"over_credit_limit"`
	IncludeUnposted    *bool      `form:"include_unposted"`
	PostedOnly         *bool      `form:"posted_only"`
	Search             string     `form:"search"`
	Page               int        `form:"page,default=1"`
	Limit              int        `form:"limit,default=10"`
}

type ReportResponseDTO struct {
	Summary interface{} `json:"summary"`
	Rows    interface{} `json:"rows"`
}

// 7. Dashboard Summary Report
type DashboardSummaryReportDTO struct {
	TotalCustomers                int64   `json:"total_customers"`
	ActiveCustomers               int64   `json:"active_customers"`
	BlockedCustomers              int64   `json:"blocked_customers"`
	CustomersOverCreditLimit      int64   `json:"customers_over_credit_limit"`
	TotalSalesOrders              int64   `json:"total_sales_orders"`
	ApprovedSalesOrders           int64   `json:"approved_sales_orders"`
	PendingSalesOrders            int64   `json:"pending_sales_orders"`
	ClosedSalesOrders             int64   `json:"closed_sales_orders"`
	TotalSalesInvoices            int64   `json:"total_sales_invoices"`
	PostedSalesInvoices           int64   `json:"posted_sales_invoices"`
	UnpostedSalesInvoices         int64   `json:"unposted_sales_invoices"`
	UnpaidInvoices                int64   `json:"unpaid_invoices"`
	PartiallyPaidInvoices         int64   `json:"partially_paid_invoices"`
	PaidInvoices                  int64   `json:"paid_invoices"`
	TotalInvoiceAmount            float64 `json:"total_invoice_amount"`
	TotalPaidAmount               float64 `json:"total_paid_amount"`
	TotalBalanceAmount            float64 `json:"total_balance_amount"`
	TotalCreditNoteAmount         float64 `json:"total_credit_note_amount"`
	TotalDebitNoteAmount          float64 `json:"total_debit_note_amount"`
	TotalReceiptAmount            float64 `json:"total_receipt_amount"`
	TotalAllocatedReceiptAmount   float64 `json:"total_allocated_receipt_amount"`
	TotalUnallocatedReceiptAmount float64 `json:"total_unallocated_receipt_amount"`
	FinancePostedDocuments        int64   `json:"finance_posted_documents"`
	FinanceUnpostedDocuments      int64   `json:"finance_unposted_documents"`
}

// 8. Customer Balance Summary Report
type CustomerBalanceRowDTO struct {
	CustomerCode         string  `json:"customer_code"`
	CustomerName         string  `json:"customer_name"`
	CustomerCategory     string  `json:"customer_category"`
	CustomerType         string  `json:"customer_type"`
	PrimaryContactNumber string  `json:"primary_contact_number"`
	PrimaryEmail         string  `json:"primary_email"`
	CreditLimit          float64 `json:"credit_limit"`
	CreditDays           int     `json:"credit_days"`
	CurrentBalance       float64 `json:"current_balance"`
	AvailableCredit      float64 `json:"available_credit"`
	CreditStatus         string  `json:"credit_status"`
	Status               string  `json:"status"`
}

// 9. Customer Statement Report
type CustomerStatementHeaderDTO struct {
	CustomerCode   string     `json:"customer_code"`
	CustomerName   string     `json:"customer_name"`
	CustomerType   string     `json:"customer_type"`
	CreditLimit    float64    `json:"credit_limit"`
	CreditDays     int        `json:"credit_days"`
	OpeningBalance float64    `json:"opening_balance"`
	ClosingBalance float64    `json:"closing_balance"`
	DateFrom       *time.Time `json:"date_from"`
	DateTo         *time.Time `json:"date_to"`
}

type CustomerStatementRowDTO struct {
	CreatedAt         time.Time `json:"-"`
	TransactionDate   time.Time `json:"transaction_date"`
	DocumentType      string    `json:"document_type"`
	DocumentNumber    string    `json:"document_number"`
	ReferenceNumber   string    `json:"reference_number"`
	Description       string    `json:"description"`
	DebitAmount       float64   `json:"debit_amount"`
	CreditAmount      float64   `json:"credit_amount"`
	RunningBalance    float64   `json:"running_balance"`
	OperationalStatus string    `json:"operational_status"`
	FinancePostStatus string    `json:"finance_post_status"`
}

// 10. Customer Aging Report
type CustomerAgingRowDTO struct {
	CustomerID       uint64  `json:"customer_id"`
	CustomerCode     string  `json:"customer_code"`
	CustomerName     string  `json:"customer_name"`
	CreditLimit      float64 `json:"credit_limit"`
	CurrentBalance   float64 `json:"current_balance"`
	Current          float64 `json:"current"`
	Days1To30        float64 `json:"1_30_days"`
	Days31To60       float64 `json:"31_60_days"`
	Days61To90       float64 `json:"61_90_days"`
	Days91To120      float64 `json:"91_120_days"`
	Over120Days      float64 `json:"over_120_days"`
	TotalOutstanding float64 `json:"total_outstanding"`
}

// 11. Sales Order Register
type SalesOrderRegisterRowDTO struct {
	SalesOrderNumber        string     `json:"sales_order_number"`
	SalesOrderDate          time.Time  `json:"sales_order_date"`
	ExpectedDeliveryDate    *time.Time `json:"expected_delivery_date"`
	Branch                  string     `json:"branch"`
	CustomerCode            string     `json:"customer_code"`
	CustomerName            string     `json:"customer_name"`
	CustomerReferenceNumber string     `json:"customer_reference_number"`
	SubtotalAmount          float64    `json:"subtotal_amount"`
	DiscountAmount          float64    `json:"discount_amount"`
	TaxAmount               float64    `json:"tax_amount"`
	TotalAmount             float64    `json:"total_amount"`
	ApprovalStatus          string     `json:"approval_status"`
	OrderStatus             string     `json:"order_status"`
	CreatedBy               string     `json:"created_by"`
	CreatedAt               time.Time  `json:"created_at"`
}

type SalesOrderRegisterSummaryDTO struct {
	OrderCount     int64   `json:"order_count"`
	SubtotalAmount float64 `json:"subtotal_amount"`
	DiscountAmount float64 `json:"discount_amount"`
	TaxAmount      float64 `json:"tax_amount"`
	TotalAmount    float64 `json:"total_amount"`
	ApprovedCount  int64   `json:"approved_count"`
	PendingCount   int64   `json:"pending_count"`
	ClosedCount    int64   `json:"closed_count"`
	CancelledCount int64   `json:"cancelled_count"`
}

// 12. Sales Invoice Register
type SalesInvoiceRegisterRowDTO struct {
	InvoiceNumber     string     `json:"invoice_number"`
	InvoiceDate       time.Time  `json:"invoice_date"`
	DueDate           *time.Time `json:"due_date"`
	Branch            string     `json:"branch"`
	CustomerCode      string     `json:"customer_code"`
	CustomerName      string     `json:"customer_name"`
	SalesOrderNumber  string     `json:"sales_order_number"`
	Warehouse         string     `json:"warehouse"`
	SubtotalAmount    float64    `json:"subtotal_amount"`
	DiscountAmount    float64    `json:"discount_amount"`
	TaxAmount         float64    `json:"tax_amount"`
	TotalAmount       float64    `json:"total_amount"`
	PaidAmount        float64    `json:"paid_amount"`
	BalanceAmount     float64    `json:"balance_amount"`
	ApprovalStatus    string     `json:"approval_status"`
	PostedStatus      string     `json:"posted_status"`
	PaymentStatus     string     `json:"payment_status"`
	FinancePostStatus string     `json:"finance_post_status"`
	CreatedBy         string     `json:"created_by"`
	CreatedAt         time.Time  `json:"created_at"`
}

type SalesInvoiceRegisterSummaryDTO struct {
	InvoiceCount         int64   `json:"invoice_count"`
	SubtotalAmount       float64 `json:"subtotal_amount"`
	DiscountAmount       float64 `json:"discount_amount"`
	TaxAmount            float64 `json:"tax_amount"`
	TotalAmount          float64 `json:"total_amount"`
	PaidAmount           float64 `json:"paid_amount"`
	BalanceAmount        float64 `json:"balance_amount"`
	PostedCount          int64   `json:"posted_count"`
	FinancePostedCount   int64   `json:"finance_posted_count"`
	FinanceUnpostedCount int64   `json:"finance_unposted_count"`
}

// 13. Credit Note Register
type CreditNoteRegisterRowDTO struct {
	CreditNoteNumber   string    `json:"credit_note_number"`
	CreditNoteDate     time.Time `json:"credit_note_date"`
	Branch             string    `json:"branch"`
	CustomerCode       string    `json:"customer_code"`
	CustomerName       string    `json:"customer_name"`
	SalesInvoiceNumber string    `json:"sales_invoice_number"`
	CreditNoteType     string    `json:"credit_note_type"`
	ReferenceNumber    string    `json:"reference_number"`
	SubtotalAmount     float64   `json:"subtotal_amount"`
	DiscountAmount     float64   `json:"discount_amount"`
	TaxAmount          float64   `json:"tax_amount"`
	TotalAmount        float64   `json:"total_amount"`
	ApprovalStatus     string    `json:"approval_status"`
	PostedStatus       string    `json:"posted_status"`
	FinancePostStatus  string    `json:"finance_post_status"`
	CreatedBy          string    `json:"created_by"`
	CreatedAt          time.Time `json:"created_at"`
}

type CreditNoteRegisterSummaryDTO struct {
	CreditNoteCount      int64   `json:"credit_note_count"`
	SubtotalAmount       float64 `json:"subtotal_amount"`
	DiscountAmount       float64 `json:"discount_amount"`
	TaxAmount            float64 `json:"tax_amount"`
	TotalAmount          float64 `json:"total_amount"`
	PostedCount          int64   `json:"posted_count"`
	FinancePostedCount   int64   `json:"finance_posted_count"`
	FinanceUnpostedCount int64   `json:"finance_unposted_count"`
}

// 14. Debit Note Register
type DebitNoteRegisterRowDTO struct {
	DebitNoteNumber    string    `json:"debit_note_number"`
	DebitNoteDate      time.Time `json:"debit_note_date"`
	Branch             string    `json:"branch"`
	CustomerCode       string    `json:"customer_code"`
	CustomerName       string    `json:"customer_name"`
	SalesInvoiceNumber string    `json:"sales_invoice_number"`
	DebitNoteType      string    `json:"debit_note_type"`
	ReferenceNumber    string    `json:"reference_number"`
	SubtotalAmount     float64   `json:"subtotal_amount"`
	DiscountAmount     float64   `json:"discount_amount"`
	TaxAmount          float64   `json:"tax_amount"`
	TotalAmount        float64   `json:"total_amount"`
	ApprovalStatus     string    `json:"approval_status"`
	PostedStatus       string    `json:"posted_status"`
	FinancePostStatus  string    `json:"finance_post_status"`
	CreatedBy          string    `json:"created_by"`
	CreatedAt          time.Time `json:"created_at"`
}

type DebitNoteRegisterSummaryDTO struct {
	DebitNoteCount       int64   `json:"debit_note_count"`
	SubtotalAmount       float64 `json:"subtotal_amount"`
	DiscountAmount       float64 `json:"discount_amount"`
	TaxAmount            float64 `json:"tax_amount"`
	TotalAmount          float64 `json:"total_amount"`
	PostedCount          int64   `json:"posted_count"`
	FinancePostedCount   int64   `json:"finance_posted_count"`
	FinanceUnpostedCount int64   `json:"finance_unposted_count"`
}

// 15. Customer Receipt Register
type CustomerReceiptRegisterRowDTO struct {
	ReceiptNumber       string    `json:"receipt_number"`
	ReceiptDate         time.Time `json:"receipt_date"`
	Branch              string    `json:"branch"`
	CustomerCode        string    `json:"customer_code"`
	CustomerName        string    `json:"customer_name"`
	PaymentMethod       string    `json:"payment_method"`
	ReferenceNumber     string    `json:"reference_number"`
	BankReferenceNumber string    `json:"bank_reference_number"`
	ChequeNumber        string    `json:"cheque_number"`
	ReceiptAmount       float64   `json:"receipt_amount"`
	AllocatedAmount     float64   `json:"allocated_amount"`
	UnallocatedAmount   float64   `json:"unallocated_amount"`
	ApprovalStatus      string    `json:"approval_status"`
	PostedStatus        string    `json:"posted_status"`
	ReceiptStatus       string    `json:"receipt_status"`
	FinancePostStatus   string    `json:"finance_post_status"`
	CreatedBy           string    `json:"created_by"`
	CreatedAt           time.Time `json:"created_at"`
}

type CustomerReceiptRegisterSummaryDTO struct {
	ReceiptCount         int64   `json:"receipt_count"`
	ReceiptAmount        float64 `json:"receipt_amount"`
	AllocatedAmount      float64 `json:"allocated_amount"`
	UnallocatedAmount    float64 `json:"unallocated_amount"`
	PostedCount          int64   `json:"posted_count"`
	FinancePostedCount   int64   `json:"finance_posted_count"`
	FinanceUnpostedCount int64   `json:"finance_unposted_count"`
}

// 16. Outstanding Invoice Report
type OutstandingInvoiceRowDTO struct {
	InvoiceNumber     string     `json:"invoice_number"`
	InvoiceDate       time.Time  `json:"invoice_date"`
	DueDate           *time.Time `json:"due_date"`
	Branch            string     `json:"branch"`
	CustomerCode      string     `json:"customer_code"`
	CustomerName      string     `json:"customer_name"`
	TotalAmount       float64    `json:"total_amount"`
	PaidAmount        float64    `json:"paid_amount"`
	BalanceAmount     float64    `json:"balance_amount"`
	PaymentStatus     string     `json:"payment_status"`
	DaysOverdue       int        `json:"days_overdue"`
	FinancePostStatus string     `json:"finance_post_status"`
}

type OutstandingInvoiceSummaryDTO struct {
	InvoiceCount  int64   `json:"invoice_count"`
	TotalAmount   float64 `json:"total_amount"`
	PaidAmount    float64 `json:"paid_amount"`
	BalanceAmount float64 `json:"balance_amount"`
	OverdueAmount float64 `json:"overdue_amount"`
	NotDueAmount  float64 `json:"not_due_amount"`
}

// 17. Sales By Customer Report
type SalesByCustomerRowDTO struct {
	CustomerCode      string  `json:"customer_code"`
	CustomerName      string  `json:"customer_name"`
	CustomerCategory  string  `json:"customer_category"`
	CustomerType      string  `json:"customer_type"`
	InvoiceCount      int64   `json:"invoice_count"`
	SubtotalAmount    float64 `json:"subtotal_amount"`
	DiscountAmount    float64 `json:"discount_amount"`
	TaxAmount         float64 `json:"tax_amount"`
	TotalSalesAmount  float64 `json:"total_sales_amount"`
	PaidAmount        float64 `json:"paid_amount"`
	BalanceAmount     float64 `json:"balance_amount"`
	CreditNotesAmount float64 `json:"credit_notes_amount"`
	DebitNotesAmount  float64 `json:"debit_notes_amount"`
	ReceiptAmount     float64 `json:"receipt_amount"`
	NetOutstanding    float64 `json:"net_outstanding"`
}

type SalesByCustomerSummaryDTO struct {
	CustomerCount     int64   `json:"customer_count"`
	InvoiceCount      int64   `json:"invoice_count"`
	TotalSalesAmount  float64 `json:"total_sales_amount"`
	PaidAmount        float64 `json:"paid_amount"`
	BalanceAmount     float64 `json:"balance_amount"`
	CreditNotesAmount float64 `json:"credit_notes_amount"`
	DebitNotesAmount  float64 `json:"debit_notes_amount"`
	ReceiptAmount     float64 `json:"receipt_amount"`
}

// 18. Sales By Product Report
type SalesByProductRowDTO struct {
	ProductCode           string  `json:"product_code"`
	ProductName           string  `json:"product_name"`
	BatchNumber           string  `json:"batch_number"`
	QuantitySold          float64 `json:"quantity_sold"`
	SubtotalAmount        float64 `json:"subtotal_amount"`
	DiscountAmount        float64 `json:"discount_amount"`
	TaxAmount             float64 `json:"tax_amount"`
	TotalSalesAmount      float64 `json:"total_sales_amount"`
	AverageUnitPrice      float64 `json:"average_unit_price"`
	StockUnitCost         float64 `json:"stock_unit_cost"`
	StockTotalCost        float64 `json:"stock_total_cost"`
	GrossProfit           float64 `json:"gross_profit"`
	GrossProfitPercentage float64 `json:"gross_profit_percentage"`
}

type SalesByProductSummaryDTO struct {
	ProductCount          int64   `json:"product_count"`
	QuantitySold          float64 `json:"quantity_sold"`
	TotalSalesAmount      float64 `json:"total_sales_amount"`
	StockTotalCost        float64 `json:"stock_total_cost"`
	GrossProfit           float64 `json:"gross_profit"`
	GrossProfitPercentage float64 `json:"gross_profit_percentage"`
}

// 19. Collection Summary Report
type CollectionSummaryRowDTO struct {
	ReceiptDate         time.Time `json:"receipt_date"`
	ReceiptNumber       string    `json:"receipt_number"`
	CustomerCode        string    `json:"customer_code"`
	CustomerName        string    `json:"customer_name"`
	PaymentMethod       string    `json:"payment_method"`
	ReceiptAmount       float64   `json:"receipt_amount"`
	AllocatedAmount     float64   `json:"allocated_amount"`
	UnallocatedAmount   float64   `json:"unallocated_amount"`
	ReferenceNumber     string    `json:"reference_number"`
	BankReferenceNumber string    `json:"bank_reference_number"`
	ChequeNumber        string    `json:"cheque_number"`
	FinancePostStatus   string    `json:"finance_post_status"`
}

type CollectionSummarySummaryDTO struct {
	ReceiptCount       int64   `json:"receipt_count"`
	ReceiptAmount      float64 `json:"receipt_amount"`
	AllocatedAmount    float64 `json:"allocated_amount"`
	UnallocatedAmount  float64 `json:"unallocated_amount"`
	CashAmount         float64 `json:"cash_amount"`
	BankTransferAmount float64 `json:"bank_transfer_amount"`
	ChequeAmount       float64 `json:"cheque_amount"`
	CardAmount         float64 `json:"card_amount"`
	OnlineAmount       float64 `json:"online_amount"`
	OtherAmount        float64 `json:"other_amount"`
}

// 20. Finance Posting Status Report
type FinancePostingStatusRowDTO struct {
	DocumentType            string     `json:"document_type"`
	DocumentNumber          string     `json:"document_number"`
	DocumentDate            time.Time  `json:"document_date"`
	Branch                  string     `json:"branch"`
	Customer                string     `json:"customer"`
	DocumentAmount          float64    `json:"document_amount"`
	OperationalPostedStatus string     `json:"operational_posted_status"`
	FinancePostStatus       string     `json:"finance_post_status"`
	FinanceReferenceNumber  string     `json:"finance_reference_number"`
	FinancePostedBy         string     `json:"finance_posted_by"`
	FinancePostedAt         *time.Time `json:"finance_posted_at"`
}

type FinancePostingStatusSummaryDTO struct {
	DocumentCount        int64   `json:"document_count"`
	FinancePostedCount   int64   `json:"finance_posted_count"`
	FinanceUnpostedCount int64   `json:"finance_unposted_count"`
	FinanceFailedCount   int64   `json:"finance_failed_count"`
	TotalAmount          float64 `json:"total_amount"`
}
