export interface ReportPaginationParams {
  page?: number;
  limit?: number;
}

export interface DateRangeReportParams {
  date_from?: string;
  date_to?: string;
}

export interface BranchReportParams {
  branch_id?: number;
}

export interface ReportResponse<TSummary, TRow> {
  summary: TSummary;
  rows: TRow[];
}

export interface DashboardSummaryReportParams {
  branch_id?: number;
  date_from?: string;
  date_to?: string;
}

export interface DashboardSummaryReport {
  total_customers: number;
  active_customers: number;
  blocked_customers: number;
  customers_over_credit_limit: number;

  total_sales_orders: number;
  approved_sales_orders: number;
  pending_sales_orders: number;
  closed_sales_orders: number;

  total_sales_invoices: number;
  posted_sales_invoices: number;
  unposted_sales_invoices: number;
  unpaid_invoices: number;
  partially_paid_invoices: number;
  paid_invoices: number;

  total_invoice_amount: number;
  total_paid_amount: number;
  total_balance_amount: number;

  total_credit_note_amount: number;
  total_debit_note_amount: number;
  total_receipt_amount: number;
  total_allocated_receipt_amount: number;
  total_unallocated_receipt_amount: number;

  finance_posted_documents: number;
  finance_unposted_documents: number;
}

export interface CustomerBalanceReportParams extends ReportPaginationParams {
  branch_id?: number;
  customer_id?: number;
  customer_category_id?: number;
  customer_type?: string;
  status?: string;
  over_credit_limit?: boolean;
  search?: string;
}

export interface CustomerStatementReportParams {
  customer_id: number;
  branch_id?: number;
  date_from?: string;
  date_to?: string;
  include_unposted?: boolean;
}

export interface CustomerAgingReportParams extends ReportPaginationParams {
  branch_id?: number;
  customer_id?: number;
  as_of_date?: string;
  customer_category_id?: number;
  customer_type?: string;
  search?: string;
}

export interface RegisterReportParams extends ReportPaginationParams {
  branch_id?: number;
  customer_id?: number;
  approval_status?: string;
  posted_status?: string;
  finance_post_status?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface SalesOrderRegisterReportParams extends ReportPaginationParams {
  branch_id?: number;
  customer_id?: number;
  approval_status?: string;
  order_status?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface SalesInvoiceRegisterReportParams extends RegisterReportParams {
  sales_order_id?: number;
  payment_status?: string;
}

export interface CreditNoteRegisterReportParams extends RegisterReportParams {
  sales_invoice_id?: number;
  credit_note_type?: string;
}

export interface DebitNoteRegisterReportParams extends RegisterReportParams {
  sales_invoice_id?: number;
  debit_note_type?: string;
}

export interface CustomerReceiptRegisterReportParams extends RegisterReportParams {
  payment_method?: string;
  receipt_status?: string;
}

export interface OutstandingInvoiceReportParams extends ReportPaginationParams {
  branch_id?: number;
  customer_id?: number;
  payment_status?: string;
  due_date_from?: string;
  due_date_to?: string;
  as_of_date?: string;
  search?: string;
}

export interface SalesByCustomerReportParams extends ReportPaginationParams {
  branch_id?: number;
  customer_id?: number;
  customer_category_id?: number;
  customer_type?: string;
  date_from?: string;
  date_to?: string;
  posted_only?: boolean;
  search?: string;
}

export interface SalesByProductReportParams extends ReportPaginationParams {
  branch_id?: number;
  customer_id?: number;
  product_id?: number;
  product_category_id?: number;
  date_from?: string;
  date_to?: string;
  posted_only?: boolean;
  search?: string;
}

export interface CollectionSummaryReportParams extends ReportPaginationParams {
  branch_id?: number;
  customer_id?: number;
  payment_method?: string;
  date_from?: string;
  date_to?: string;
  posted_only?: boolean;
  search?: string;
}

export interface FinancePostingStatusReportParams extends ReportPaginationParams {
  branch_id?: number;
  document_type?: string;
  finance_post_status?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

// Responses / Rows
export interface CustomerBalanceReportRow {
  customer_code: string;
  customer_name: string;
  customer_category: string;
  customer_type: string;
  primary_contact_number: string;
  primary_email: string;
  credit_limit: number;
  credit_days: number;
  current_balance: number;
  available_credit: number;
  credit_status: string;
  status: string;
}

export interface CustomerStatementReportHeader {
  customer_code: string;
  customer_name: string;
  customer_type: string;
  credit_limit: number;
  credit_days: number;
  opening_balance: number;
  closing_balance: number;
  date_from: string;
  date_to: string;
}

export interface CustomerStatementReportLine {
  transaction_date: string;
  document_type: string;
  document_number: string;
  reference_number: string;
  description: string;
  debit_amount: number;
  credit_amount: number;
  running_balance: number;
  operational_status: string;
  finance_post_status: string;
}

export interface CustomerAgingReportRow {
  customer_code: string;
  customer_name: string;
  credit_limit: number;
  current_balance: number;
  current: number;
  days_1_30: number;
  days_31_60: number;
  days_61_90: number;
  days_91_120: number;
  over_120: number;
  total_outstanding: number;
}

export interface SalesOrderRegisterReportRow {
  sales_order_number: string;
  sales_order_date: string;
  expected_delivery_date: string;
  branch: string;
  customer_code: string;
  customer_name: string;
  customer_reference_number: string;
  subtotal_amount: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  approval_status: string;
  order_status: string;
  created_by: string;
  created_at: string;
}

export interface SalesInvoiceRegisterReportRow {
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  branch: string;
  customer_code: string;
  customer_name: string;
  sales_order_number: string;
  warehouse: string;
  subtotal_amount: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  approval_status: string;
  posted_status: string;
  payment_status: string;
  finance_post_status: string;
  created_by: string;
  created_at: string;
}

export interface CreditNoteRegisterReportRow {
  credit_note_number: string;
  credit_note_date: string;
  branch: string;
  customer_code: string;
  customer_name: string;
  sales_invoice_number: string;
  credit_note_type: string;
  reference_number: string;
  subtotal_amount: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  approval_status: string;
  posted_status: string;
  finance_post_status: string;
  created_by: string;
  created_at: string;
}

export interface DebitNoteRegisterReportRow {
  debit_note_number: string;
  debit_note_date: string;
  branch: string;
  customer_code: string;
  customer_name: string;
  sales_invoice_number: string;
  debit_note_type: string;
  reference_number: string;
  subtotal_amount: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  approval_status: string;
  posted_status: string;
  finance_post_status: string;
  created_by: string;
  created_at: string;
}

export interface CustomerReceiptRegisterReportRow {
  receipt_number: string;
  receipt_date: string;
  branch: string;
  customer_code: string;
  customer_name: string;
  payment_method: string;
  reference_number: string;
  bank_reference_number: string;
  cheque_number: string;
  receipt_amount: number;
  allocated_amount: number;
  unallocated_amount: number;
  approval_status: string;
  posted_status: string;
  receipt_status: string;
  finance_post_status: string;
  created_by: string;
  created_at: string;
}

export interface OutstandingInvoiceReportRow {
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  branch: string;
  customer_code: string;
  customer_name: string;
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  payment_status: string;
  days_overdue: number;
  finance_post_status: string;
}

export interface SalesByCustomerReportRow {
  customer_code: string;
  customer_name: string;
  customer_category: string;
  customer_type: string;
  invoice_count: number;
  subtotal_amount: number;
  discount_amount: number;
  tax_amount: number;
  total_sales_amount: number;
  paid_amount: number;
  balance_amount: number;
  credit_notes_amount: number;
  debit_notes_amount: number;
  receipt_amount: number;
  net_outstanding: number;
}

export interface SalesByProductReportRow {
  product_code: string;
  product_name: string;
  batch_number: string;
  quantity_sold: number;
  subtotal_amount: number;
  discount_amount: number;
  tax_amount: number;
  total_sales_amount: number;
  average_unit_price: number;
  stock_unit_cost: number;
  stock_total_cost: number;
  gross_profit: number;
  gross_profit_percent: number;
}

export interface CollectionSummaryReportRow {
  receipt_date: string;
  receipt_number: string;
  customer_code: string;
  customer_name: string;
  payment_method: string;
  receipt_amount: number;
  allocated_amount: number;
  unallocated_amount: number;
  reference_number: string;
  bank_reference_number: string;
  cheque_number: string;
  finance_post_status: string;
}

export interface FinancePostingStatusReportRow {
  document_type: string;
  document_number: string;
  document_date: string;
  branch: string;
  customer: string;
  document_amount: number;
  operational_posted_status: string;
  finance_post_status: string;
  finance_reference_number: string;
  finance_posted_by: string;
  finance_posted_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message?: string;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}
