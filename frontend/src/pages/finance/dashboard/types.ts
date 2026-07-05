export interface KpiMetric {
  value: number;
  trend: number;
  comparison_text: string;
}

export interface SummaryMetric {
  value: number;
  secondary: string;
}

export interface DashboardSummary {
  cash_balance: KpiMetric;
  bank_balance: KpiMetric;
  accounts_receivable: KpiMetric;
  accounts_payable: KpiMetric;
  monthly_revenue: KpiMetric;
  monthly_expenses: KpiMetric;
  gross_profit: SummaryMetric;
  net_profit: SummaryMetric;
  pending_payments: SummaryMetric;
  pending_receipts: SummaryMetric;
}

export interface TrendPoint {
  period: string;
  Revenue: number;
  Expenses: number;
  Profit: number;
}

export interface ExpenseCategory {
  category: string;
  amount: number;
  share: number;
}

export interface AgingBucket {
  label: string;
  amount: number;
}

export interface ReceivablesSummary {
  total_outstanding: number;
  collection_rate: number;
  aging: AgingBucket[];
}

export interface PayablesSummary {
  total_payable: number;
  supplier_count: number;
  payment_due_count: number;
  aging: AgingBucket[];
}

export interface RecentTransaction {
  date: string;
  voucher: string;
  type: string;
  account: string;
  reference: string;
  debit: number;
  credit: number;
  status: string;
}

export interface PendingApproval {
  id: number;
  document: string;
  reference: string;
  amount: number;
  submitted_by: string;
  submitted_at: string;
  current_stage: string;
  status: string;
}

export interface LiquiditySummary {
  cash_in: number;
  cash_out: number;
  net_surplus: number;
  outflow_ratio: number;
  liquidity_status: string;
}

export interface PeriodStatus {
  financial_year: string;
  accounting_period: string;
  status: string;
  closing_date: string;
  posting_allowed: boolean;
}

export interface FinanceDashboardResponse {
  summary: DashboardSummary;
  trend: TrendPoint[];
  expense_distribution: ExpenseCategory[];
  receivables: ReceivablesSummary;
  payables: PayablesSummary;
  recent_transactions: RecentTransaction[];
  pending_approvals: PendingApproval[];
  liquidity: LiquiditySummary;
  period_status: PeriodStatus;
}
