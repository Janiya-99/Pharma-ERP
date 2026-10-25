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
	MinBalance         *float64   `form:"min_balance"`
	HasBalance         *bool      `form:"has_balance"`
	RiskProfile        *string    `form:"risk_profile"`
	IncludeUnposted    *bool      `form:"include_unposted"`
	PostedOnly         *bool      `form:"posted_only"`
	GroupBy            *string    `form:"group_by"`
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
	CustomerCode          string  `json:"customer_code" gorm:"column:customer_code"`
	CustomerName          string  `json:"customer_name" gorm:"column:customer_name"`
	CustomerCategory      string  `json:"customer_category" gorm:"column:customer_category"`
	CustomerType          string  `json:"customer_type" gorm:"column:customer_type"`
	PrimaryContactNumber  string  `json:"primary_contact_number" gorm:"column:primary_contact_number"`
	PrimaryEmail          string  `json:"primary_email" gorm:"column:primary_email"`
	CreditLimit           float64 `json:"credit_limit" gorm:"column:credit_limit"`
	CreditDays            int     `json:"credit_days" gorm:"column:credit_days"`
	CurrentBalance        float64 `json:"current_balance" gorm:"column:current_balance"`
	AvailableCredit       float64 `json:"available_credit" gorm:"column:available_credit"`
	CreditStatus          string  `json:"credit_status" gorm:"column:credit_status"`
	ReceivableAccountCode string  `json:"receivable_account_code" gorm:"column:receivable_account_code"`
	ReceivableAccountName string  `json:"receivable_account_name" gorm:"column:receivable_account_name"`
	Status                string  `json:"status" gorm:"column:status"`
}

type CustomerBalanceSummaryDTO struct {
	TotalCustomers           int64   `json:"total_customers"`
	TotalCreditLimit         float64 `json:"total_credit_limit"`
	TotalCurrentBalance      float64 `json:"total_current_balance"`
	TotalAvailableCredit     float64 `json:"total_available_credit"`
	CustomersOverCreditLimit int64   `json:"customers_over_credit_limit"`
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
	DateFrom       *string `json:"date_from"`
	DateTo         *string `json:"date_to"`
}

type CustomerStatementRowDTO struct {
	CreatedAt         time.Time `json:"-"`
	TransactionDate   time.Time `json:"transaction_date" gorm:"column:transaction_date"`
	DocumentType      string    `json:"document_type" gorm:"column:document_type"`
	DocumentNumber    string    `json:"document_number" gorm:"column:document_number"`
	ReferenceNumber   string    `json:"reference_number" gorm:"column:reference_number"`
	Description       string    `json:"description" gorm:"column:description"`
	DebitAmount       float64   `json:"debit_amount" gorm:"column:debit_amount"`
	CreditAmount      float64   `json:"credit_amount" gorm:"column:credit_amount"`
	RunningBalance    float64   `json:"running_balance" gorm:"column:running_balance"`
	OperationalStatus string    `json:"operational_status" gorm:"column:operational_status"`
	FinancePostStatus string    `json:"finance_post_status" gorm:"column:finance_post_status"`
}

// 10. Customer Aging Report
type CustomerAgingRowDTO struct {
	CustomerID       uint64  `json:"customer_id" gorm:"column:customer_id"`
	CustomerCode     string  `json:"customer_code" gorm:"column:customer_code"`
	CustomerName     string  `json:"customer_name" gorm:"column:customer_name"`
	CreditLimit      float64 `json:"credit_limit" gorm:"column:credit_limit"`
	CurrentBalance   float64 `json:"current_balance" gorm:"column:current_balance"`
	Current          float64 `json:"current" gorm:"column:current"`
	Days1To30        float64 `json:"days_1_30" gorm:"column:days_1_30"`
	Days31To60       float64 `json:"days_31_60" gorm:"column:days_31_60"`
	Days61To90       float64 `json:"days_61_90" gorm:"column:days_61_90"`
	Days91To120      float64 `json:"days_91_120" gorm:"column:days_91_120"`
	Over120Days      float64 `json:"over_120" gorm:"column:over_120"`
	TotalOutstanding float64 `json:"total_outstanding" gorm:"column:total_outstanding"`
}

// 11. Sales Order Register
type SalesOrderRegisterRowDTO struct {
	SalesOrderNumber        string     `json:"sales_order_number" gorm:"column:sales_order_number"`
	SalesOrderDate          time.Time  `json:"sales_order_date" gorm:"column:sales_order_date"`
	ExpectedDeliveryDate    *time.Time `json:"expected_delivery_date" gorm:"column:expected_delivery_date"`
	Branch                  string     `json:"branch" gorm:"column:branch"`
	CustomerCode            string     `json:"customer_code" gorm:"column:customer_code"`
	CustomerName            string     `json:"customer_name" gorm:"column:customer_name"`
	CustomerReferenceNumber string     `json:"customer_reference_number" gorm:"column:customer_reference_number"`
	SubtotalAmount          float64    `json:"subtotal_amount" gorm:"column:subtotal_amount"`
	DiscountAmount          float64    `json:"discount_amount" gorm:"column:discount_amount"`
	TaxAmount               float64    `json:"tax_amount" gorm:"column:tax_amount"`
	TotalAmount             float64    `json:"total_amount" gorm:"column:total_amount"`
	ApprovalStatus          string     `json:"approval_status" gorm:"column:approval_status"`
	OrderStatus             string     `json:"order_status" gorm:"column:order_status"`
	CreatedBy               string     `json:"created_by" gorm:"column:created_by"`
	CreatedAt               time.Time  `json:"created_at" gorm:"column:created_at"`
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
	InvoiceNumber     string     `json:"invoice_number" gorm:"column:invoice_number"`
	InvoiceDate       time.Time  `json:"invoice_date" gorm:"column:invoice_date"`
	DueDate           *time.Time `json:"due_date" gorm:"column:due_date"`
	Branch            string     `json:"branch" gorm:"column:branch"`
	CustomerCode      string     `json:"customer_code" gorm:"column:customer_code"`
	CustomerName      string     `json:"customer_name" gorm:"column:customer_name"`
	SalesOrderNumber  string     `json:"sales_order_number" gorm:"column:sales_order_number"`
	Warehouse         string     `json:"warehouse" gorm:"column:warehouse"`
	SubtotalAmount    float64    `json:"subtotal_amount" gorm:"column:subtotal_amount"`
	DiscountAmount    float64    `json:"discount_amount" gorm:"column:discount_amount"`
	TaxAmount         float64    `json:"tax_amount" gorm:"column:tax_amount"`
	TotalAmount       float64    `json:"total_amount" gorm:"column:total_amount"`
	PaidAmount        float64    `json:"paid_amount" gorm:"column:paid_amount"`
	BalanceAmount     float64    `json:"balance_amount" gorm:"column:balance_amount"`
	ApprovalStatus    string     `json:"approval_status" gorm:"column:approval_status"`
	PostedStatus      string     `json:"posted_status" gorm:"column:posted_status"`
	PaymentStatus     string     `json:"payment_status" gorm:"column:payment_status"`
	FinancePostStatus string     `json:"finance_post_status" gorm:"column:finance_post_status"`
	CreatedBy         string     `json:"created_by" gorm:"column:created_by"`
	CreatedAt         time.Time  `json:"created_at" gorm:"column:created_at"`
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
	Category              string  `json:"category"`
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
	GrossProfitPercent    float64 `json:"gross_profit_percent"`
	PercentageOfTotal     float64 `json:"percentage_of_total"`
}

type SalesByProductSummaryDTO struct {
	ProductCount          int64   `json:"product_count"`
	QuantitySold          float64 `json:"quantity_sold"`
	TotalQuantity         float64 `json:"total_quantity"`
	TotalSalesAmount      float64 `json:"total_sales_amount"`
	TotalRevenue          float64 `json:"total_revenue"`
	StockTotalCost        float64 `json:"stock_total_cost"`
	GrossProfit           float64 `json:"gross_profit"`
	GrossProfitPercentage float64 `json:"gross_profit_percentage"`
}

// 19. Collection Summary Report
type CollectionSummaryRowDTO struct {
	PaymentMethod       string    `json:"payment_method"`
	ReceiptCount        int64     `json:"receipt_count"`
	TotalAmount         float64   `json:"total_amount"`
	ReceiptAmount       float64   `json:"receipt_amount"`
	AllocatedAmount     float64   `json:"allocated_amount"`
	UnallocatedAmount   float64   `json:"unallocated_amount"`
	PercentageOfTotal   float64   `json:"percentage_of_total"`
	ReceiptDate         time.Time `json:"receipt_date,omitempty"`
	ReceiptNumber       string    `json:"receipt_number,omitempty"`
	CustomerCode        string    `json:"customer_code,omitempty"`
	CustomerName        string    `json:"customer_name,omitempty"`
	ReferenceNumber     string    `json:"reference_number,omitempty"`
	BankReferenceNumber string    `json:"bank_reference_number,omitempty"`
	ChequeNumber        string    `json:"cheque_number,omitempty"`
	FinancePostStatus   string    `json:"finance_post_status,omitempty"`
}

type CollectionSummarySummaryDTO struct {
	ReceiptCount       int64   `json:"receipt_count"`
	TotalReceipts      int64   `json:"total_receipts"`
	ReceiptAmount      float64 `json:"receipt_amount"`
	TotalAmount        float64 `json:"total_amount"`
	TotalCollected     float64 `json:"total_collected"`
	AllocatedAmount    float64 `json:"allocated_amount"`
	TotalAllocated     float64 `json:"total_allocated"`
	UnallocatedAmount  float64 `json:"unallocated_amount"`
	TotalUnallocated   float64 `json:"total_unallocated"`
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
	BranchID                *uint64    `json:"branch_id,omitempty"`
	Branch                  string     `json:"branch"`
	Customer                string     `json:"customer"`
	CustomerName            string     `json:"customer_name"`
	DocumentAmount          float64    `json:"document_amount"`
	OperationalPostedStatus string     `json:"operational_posted_status"`
	FinancePostStatus       string     `json:"finance_post_status"`
	FinanceReferenceNumber  string     `json:"finance_reference_number"`
	JournalEntryNumber      string     `json:"journal_entry_number"`
	FinancePostedBy         string     `json:"finance_posted_by"`
	FinancePostedAt         *time.Time `json:"finance_posted_at"`
	PostedDate              *time.Time `json:"posted_date"`
}

type FinancePostingStatusSummaryDTO struct {
	DocumentCount        int64   `json:"document_count"`
	TotalDocuments       int64   `json:"total_documents"`
	FinancePostedCount   int64   `json:"finance_posted_count"`
	PostedCount          int64   `json:"posted_count"`
	FinanceUnpostedCount int64   `json:"finance_unposted_count"`
	UnpostedCount        int64   `json:"unposted_count"`
	FinanceFailedCount   int64   `json:"finance_failed_count"`
	FailedCount          int64   `json:"failed_count"`
	TotalAmount          float64 `json:"total_amount"`
}
