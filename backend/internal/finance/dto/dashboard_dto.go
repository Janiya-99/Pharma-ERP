package dto

type DashboardFilter struct {
	CompanyID  uint64 `form:"company_id" binding:"required"`
	BranchID   uint64 `form:"branch_id"`
	DateFrom   string `form:"date_from"`
	DateTo     string `form:"date_to"`
	PeriodType string `form:"period_type"` // e.g., "month", "quarter", "year"
}

type KpiMetric struct {
	Value          float64 `json:"value"`
	Trend          float64 `json:"trend"` // Percentage change
	ComparisonText string  `json:"comparison_text"`
}

type SummaryMetric struct {
	Value     float64 `json:"value"`
	Secondary string  `json:"secondary"` // E.g., "39.1% gross margin"
}

type DashboardSummary struct {
	CashBalance         KpiMetric `json:"cash_balance"`
	BankBalance         KpiMetric `json:"bank_balance"`
	AccountsReceivable  KpiMetric `json:"accounts_receivable"`
	AccountsPayable     KpiMetric `json:"accounts_payable"`
	MonthlyRevenue      KpiMetric `json:"monthly_revenue"`
	MonthlyExpenses     KpiMetric `json:"monthly_expenses"`
	
	GrossProfit      SummaryMetric `json:"gross_profit"`
	NetProfit        SummaryMetric `json:"net_profit"`
	PendingPayments  SummaryMetric `json:"pending_payments"`
	PendingReceipts  SummaryMetric `json:"pending_receipts"`
}

type TrendPoint struct {
	Period   string  `json:"period"`
	Revenue  float64 `json:"Revenue"`
	Expenses float64 `json:"Expenses"`
	Profit   float64 `json:"Profit"`
}

type ExpenseCategory struct {
	Category string  `json:"category"`
	Amount   float64 `json:"amount"`
	Share    float64 `json:"share"`
}

type AgingBucket struct {
	Label  string  `json:"label"`
	Amount float64 `json:"amount"`
}

type ReceivablesSummary struct {
	TotalOutstanding float64       `json:"total_outstanding"`
	CollectionRate   float64       `json:"collection_rate"`
	Aging            []AgingBucket `json:"aging"`
}

type PayablesSummary struct {
	TotalPayable     float64       `json:"total_payable"`
	SupplierCount    int           `json:"supplier_count"`
	PaymentDueCount  int           `json:"payment_due_count"`
	Aging            []AgingBucket `json:"aging"`
}

type RecentTransaction struct {
	Date      string  `json:"date"`
	Voucher   string  `json:"voucher"`
	Type      string  `json:"type"`
	Account   string  `json:"account"`
	Reference string  `json:"reference"`
	Debit     float64 `json:"debit"`
	Credit    float64 `json:"credit"`
	Status    string  `json:"status"`
}

type PendingApproval struct {
	ID          uint64  `json:"id"`
	Document    string  `json:"document"` // e.g., "Payment Voucher", "Journal Entry"
	Reference   string  `json:"reference"`
	Amount      float64 `json:"amount"`
	SubmittedBy string  `json:"submitted_by"`
	SubmittedAt string  `json:"submitted_at"`
	CurrentStage string `json:"current_stage"`
	Status      string  `json:"status"`
}

type LiquiditySummary struct {
	CashIn         float64 `json:"cash_in"`
	CashOut        float64 `json:"cash_out"`
	NetSurplus     float64 `json:"net_surplus"`
	OutflowRatio   float64 `json:"outflow_ratio"`
	LiquidityStatus string `json:"liquidity_status"` // e.g., "Healthy", "Warning"
}

type PeriodStatus struct {
	FinancialYear    string `json:"financial_year"`
	AccountingPeriod string `json:"accounting_period"`
	Status           string `json:"status"` // "Open", "Closing Soon", "Closed"
	ClosingDate      string `json:"closing_date"`
	PostingAllowed   bool   `json:"posting_allowed"`
}

type DashboardResponse struct {
	Summary             DashboardSummary    `json:"summary"`
	Trend               []TrendPoint        `json:"trend"`
	ExpenseDistribution []ExpenseCategory   `json:"expense_distribution"`
	Receivables         ReceivablesSummary  `json:"receivables"`
	Payables            PayablesSummary     `json:"payables"`
	RecentTransactions  []RecentTransaction `json:"recent_transactions"`
	PendingApprovals    []PendingApproval   `json:"pending_approvals"`
	Liquidity           LiquiditySummary    `json:"liquidity"`
	PeriodStatus        PeriodStatus        `json:"period_status"`
}
