// ============================================================
// Invoice Center — Shared TypeScript Types
// ============================================================

export type SalesOrderApprovalStatus = "draft" | "pending" | "approved" | "rejected" | "cancelled";
export type SalesOrderStatus = "open" | "partially_invoiced" | "fully_invoiced" | "cancelled" | "closed";

// ---- Customer -----------------------------------------------
export interface Customer {
  id: number;
  customer_code: string;
  customer_name: string;
  trade_name?: string;
  customer_type: string;
  customer_category_id?: number;
  customer_category_name?: string;
  primary_contact_person?: string;
  primary_contact_number?: string;
  primary_email?: string;
  billing_address?: string;
  shipping_address?: string;
  credit_limit: number;
  credit_days: number;
  current_balance: number;
  status: string;
}

// ---- Product Lookup -----------------------------------------
export interface ProductLookup {
  id: number;
  product_code?: string;
  product_name: string;
  base_unit?: string;
  requires_batch_tracking?: boolean;
  requires_expiry_tracking?: boolean;
  selling_price?: number;
  mrp?: number;
  status?: string;
}

// ---- Product Batch Lookup -----------------------------------
export interface ProductBatchLookup {
  id: number;
  product_id?: number;
  batch_number: string;
  expiry_date?: string;
  batch_status?: string;
  mrp?: number;
  selling_price?: number;
}

// ---- Sales Order Line (for form) ----------------------------
export interface SalesOrderLineForm {
  id?: string | number; // local key for react key
  product_id: number | null;
  product_batch_id: number | null;
  quantity: number | string;
  unit_price: number | string;
  discount_amount: number | string;
  tax_amount: number | string;
  line_remarks: string;
  // local computed display
  product?: ProductLookup | null;
  batch?: ProductBatchLookup | null;
}

// ---- Sales Order Line (from API response) -------------------
export interface SalesOrderLine {
  id: number;
  product_id: number;
  product_code?: string;
  product_name?: string;
  product_batch_id?: number;
  batch_number?: string;
  expiry_date?: string;
  quantity: number;
  invoiced_quantity?: number;
  pending_quantity?: number;
  unit_price: number;
  discount_amount: number;
  tax_amount: number;
  line_total: number;
  line_remarks?: string;
}

export type SalesOrderLineResponse = SalesOrderLine;

// ---- Sales Order Approval -----------------------------------
export interface SalesOrderApproval {
  id: number;
  action: string;
  remarks: string;
  action_by: number;
  action_at: string;
}

// ---- Sales Order (list item) --------------------------------
export interface SalesOrder {
  id: number;
  sales_order_number: string;
  sales_order_date: string;
  expected_delivery_date?: string;
  branch_id: number;
  branch?: { id: number; branch_name: string };
  customer_id: number;
  customer_code?: string;
  customer_name?: string;
  customer_reference_number?: string;
  subtotal_amount: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  approval_status: SalesOrderApprovalStatus;
  order_status: SalesOrderStatus;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

export type SalesOrderListItem = SalesOrder;

// ---- Sales Order Detail (single) ----------------------------
export interface SalesOrderDetail extends SalesOrder {
  financial_year_id?: number;
  accounting_period_id?: number;
  remarks?: string;
  customer?: Customer;
  branch?: { id: number; branch_name: string };
  lines: SalesOrderLineResponse[];
  approvals: SalesOrderApproval[];
  invoicing_summary?: {
    total_invoiced_amount: number;
    total_pending_amount: number;
    invoice_count: number;
  };
  actions_metadata?: Record<string, boolean>;
}

// ---- Create / Update Payloads --------------------------------
export interface SalesOrderLinePayload {
  product_id: number;
  product_batch_id?: number | null;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  tax_amount: number;
  line_remarks?: string;
}

export interface CreateSalesOrderPayload {
  branch_id: number;
  customer_id: number;
  sales_order_date: string;
  expected_delivery_date?: string;
  customer_reference_number?: string;
  remarks?: string;
  financial_year_id?: number;
  accounting_period_id?: number;
  lines: SalesOrderLinePayload[];
}

export interface UpdateSalesOrderPayload extends CreateSalesOrderPayload {}

// ---- List Query Params --------------------------------------
export interface SalesOrderListParams {
  search?: string;
  branch_id?: string | number;
  customer_id?: string | number;
  approval_status?: string;
  order_status?: string;
  sales_order_date_from?: string;
  sales_order_date_to?: string;
  expected_delivery_date_from?: string;
  expected_delivery_date_to?: string;
  page?: number;
  limit?: number;
}

// ---- Sales Invoice Types ------------------------------------
export type SalesInvoiceApprovalStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled';
export type SalesInvoicePostedStatus = 'unposted' | 'posted';
export type SalesInvoicePaymentStatus = 'unpaid' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';

export interface SalesInvoiceApproval {
  id: number;
  sales_invoice_id: number;
  action: string;
  remarks?: string | null;
  action_by: number;
  action_at: string;
}

export interface SalesInvoiceLine {
  id?: number;
  sales_invoice_id?: number;
  sales_order_line_id?: number | null;
  warehouse_location_id?: number | null;
  product_id: number;
  product_batch_id?: number | null;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  tax_amount: number;
  line_total: number;
  stock_unit_cost?: number;
  stock_total_cost?: number;
  line_remarks?: string | null;
  
  // Local display properties
  product_code?: string;
  product_name?: string;
  batch_number?: string;
  expiry_date?: string;
}

export interface SalesInvoice {
  id: number;
  invoice_number: string;
  invoice_date: string;
  due_date?: string | null;
  branch_id: number;
  customer_id: number;
  sales_order_id?: number | null;
  warehouse_id: number;
  customer_reference_number?: string | null;
  remarks?: string | null;
  subtotal_amount: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  approval_status: SalesInvoiceApprovalStatus;
  posted_status: SalesInvoicePostedStatus;
  payment_status: SalesInvoicePaymentStatus;
  created_by?: number;
  created_at?: string;
  lines?: SalesInvoiceLine[];
  approvals?: SalesInvoiceApproval[];
  
  // Relations mapped
  branch?: { id: number; branch_name: string };
  customer?: Customer;
  sales_order?: { sales_order_number: string; sales_order_date: string; order_status: string; approval_status: string };
  warehouse?: { id: number; warehouse_code: string; warehouse_name: string; warehouse_type: string };
}

export interface SalesInvoiceListParams {
  branch_id?: number;
  customer_id?: number;
  sales_order_id?: number;
  warehouse_id?: number;
  approval_status?: SalesInvoiceApprovalStatus;
  posted_status?: SalesInvoicePostedStatus;
  payment_status?: SalesInvoicePaymentStatus;
  invoice_date_from?: string;
  invoice_date_to?: string;
  due_date_from?: string;
  due_date_to?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface SalesInvoiceLinePayload {
  sales_order_line_id?: number | null;
  warehouse_location_id?: number | null;
  product_id: number;
  product_batch_id?: number | null;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  tax_amount: number;
  line_remarks?: string | null;
}

export interface CreateSalesInvoicePayload {
  branch_id: number;
  customer_id: number;
  sales_order_id?: number | null;
  warehouse_id: number;
  financial_year_id?: number | null;
  accounting_period_id?: number | null;
  invoice_date: string;
  due_date?: string | null;
  customer_reference_number?: string | null;
  remarks?: string | null;
  lines: SalesInvoiceLinePayload[];
}

export interface UpdateSalesInvoicePayload extends CreateSalesInvoicePayload {}

export interface WorkflowActionPayload {
  remarks?: string;
}

// ---- Credit Notes Types -------------------------------------
export type CreditNoteApprovalStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled';
export type CreditNotePostedStatus = 'unposted' | 'posted';
export type CreditNoteType =
  | 'sales_return'
  | 'price_adjustment'
  | 'discount_adjustment'
  | 'billing_error'
  | 'goodwill'
  | 'other';

export interface CreditNoteApproval {
  id: number;
  credit_note_id: number;
  action: string;
  remarks?: string | null;
  action_by: number;
  action_at: string;
}

export interface CreditNoteLine {
  id?: number;
  credit_note_id?: number;
  sales_invoice_line_id?: number | null;
  product_id?: number | null;
  description?: string | null;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  tax_amount: number;
  line_total: number;
  line_order?: number;

  // Local display properties
  product_code?: string;
  product_name?: string;
}

export interface CreditNote {
  id: number;
  credit_note_number: string;
  credit_note_date: string;
  branch_id: number;
  customer_id: number;
  sales_invoice_id?: number | null;
  credit_note_type: CreditNoteType;
  reference_number?: string | null;
  reason?: string | null;
  remarks?: string | null;
  subtotal_amount: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  approval_status: CreditNoteApprovalStatus;
  posted_status: CreditNotePostedStatus;
  created_by?: number;
  created_at?: string;
  approved_by?: number | null;
  approved_at?: string | null;
  posted_by?: number | null;
  posted_at?: string | null;
  cancelled_by?: number | null;
  cancelled_at?: string | null;
  cancel_reason?: string | null;
  lines?: CreditNoteLine[];
  approvals?: CreditNoteApproval[];

  // Relations mapped
  branch?: { id: number; branch_name: string };
  customer?: Customer;
  sales_invoice?: { invoice_number: string; invoice_date: string; total_amount: number; balance_amount: number; paid_amount: number; payment_status: string; posted_status: string; };
}

export interface CreditNoteListParams {
  branch_id?: number;
  customer_id?: number;
  sales_invoice_id?: number;
  credit_note_type?: CreditNoteType;
  approval_status?: CreditNoteApprovalStatus;
  posted_status?: CreditNotePostedStatus;
  credit_note_date_from?: string;
  credit_note_date_to?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreditNoteLinePayload {
  sales_invoice_line_id?: number | null;
  product_id?: number | null;
  description?: string | null;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  tax_amount: number;
}

export interface CreateCreditNotePayload {
  branch_id: number;
  customer_id: number;
  sales_invoice_id?: number | null;
  financial_year_id?: number | null;
  accounting_period_id?: number | null;
  credit_note_date: string;
  credit_note_type: CreditNoteType;
  reference_number?: string | null;
  reason?: string | null;
  remarks?: string | null;
  lines: CreditNoteLinePayload[];
}

export interface UpdateCreditNotePayload extends CreateCreditNotePayload {}

export interface CreditNoteImpactPreview {
  customer_current_balance: number;
  credit_note_total_amount: number;
  customer_balance_after_credit: number;
  linked_invoice_balance?: number | null;
  linked_invoice_balance_after_credit?: number | null;
}

// ---- Debit Notes Types --------------------------------------
export type DebitNoteApprovalStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled';

export type DebitNotePostedStatus = 'unposted' | 'posted';

export type DebitNoteType =
  | 'price_adjustment'
  | 'additional_charge'
  | 'billing_error'
  | 'freight_charge'
  | 'tax_adjustment'
  | 'other';

export interface DebitNote {
  id: number;
  debit_note_number: string;
  debit_note_date: string;
  branch_id: number;
  customer_id: number;
  sales_invoice_id?: number | null;
  debit_note_type: DebitNoteType;
  reference_number?: string | null;
  reason?: string | null;
  remarks?: string | null;
  subtotal_amount: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  approval_status: DebitNoteApprovalStatus;
  posted_status: DebitNotePostedStatus;
  created_by?: number;
  created_at?: string;
  approved_by?: number | null;
  approved_at?: string | null;
  posted_by?: number | null;
  posted_at?: string | null;
  cancelled_by?: number | null;
  cancelled_at?: string | null;
  cancel_reason?: string | null;
  lines?: DebitNoteLine[];
  approvals?: DebitNoteApproval[];
  
  // Relations mapped
  branch?: { id: number; branch_name: string };
  customer?: Customer;
  sales_invoice?: { invoice_number: string; invoice_date: string; total_amount: number; balance_amount: number; paid_amount: number; payment_status: string; posted_status: string; };
}

export interface DebitNoteLine {
  id?: number;
  debit_note_id?: number;
  sales_invoice_line_id?: number | null;
  product_id?: number | null;
  description?: string | null;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  tax_amount: number;
  line_total: number;
  line_order?: number;

  // Local display properties
  product_code?: string;
  product_name?: string;
}

export interface DebitNoteApproval {
  id: number;
  debit_note_id: number;
  action: string;
  remarks?: string | null;
  action_by: number;
  action_at: string;
}

export interface DebitNoteListParams {
  branch_id?: number;
  customer_id?: number;
  sales_invoice_id?: number;
  debit_note_type?: DebitNoteType;
  approval_status?: DebitNoteApprovalStatus;
  posted_status?: DebitNotePostedStatus;
  debit_note_date_from?: string;
  debit_note_date_to?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateDebitNotePayload {
  branch_id: number;
  customer_id: number;
  sales_invoice_id?: number | null;
  financial_year_id?: number | null;
  accounting_period_id?: number | null;
  debit_note_date: string;
  debit_note_type: DebitNoteType;
  reference_number?: string | null;
  reason?: string | null;
  remarks?: string | null;
  lines: DebitNoteLinePayload[];
}

export interface UpdateDebitNotePayload extends CreateDebitNotePayload {}

export interface DebitNoteLinePayload {
  sales_invoice_line_id?: number | null;
  product_id?: number | null;
  description?: string | null;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  tax_amount: number;
}

export interface DebitNoteImpactPreview {
  customer_current_balance: number;
  debit_note_total_amount: number;
  customer_balance_after_debit: number;
  credit_limit?: number;
  projected_credit_exceeded?: boolean;
  linked_invoice_balance?: number | null;
  linked_invoice_balance_after_debit?: number | null;
}


// ---- Generic API Wrappers -----------------------------------
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  message?: string;
  data: T[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

// ---- Customer Receipts --------------------------------------
export type CustomerReceiptApprovalStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled';
export type CustomerReceiptPostedStatus = 'unposted' | 'posted';
export type CustomerReceiptStatus = 'active' | 'cancelled';

export type CustomerReceiptPaymentMethod =
  | 'cash'
  | 'bank_transfer'
  | 'cheque'
  | 'card'
  | 'online'
  | 'other';

export interface CustomerReceipt {
  id: number;
  receipt_number: string;
  receipt_date: string;
  branch_id: number;
  customer_id: number;
  payment_method: CustomerReceiptPaymentMethod;
  reference_number?: string | null;
  bank_reference_number?: string | null;
  cheque_number?: string | null;
  cheque_date?: string | null;
  remarks?: string | null;
  receipt_amount: number;
  allocated_amount: number;
  unallocated_amount: number;
  approval_status: CustomerReceiptApprovalStatus;
  posted_status: CustomerReceiptPostedStatus;
  receipt_status: CustomerReceiptStatus;
  created_by?: number;
  created_at?: string;
  approved_by?: number | null;
  approved_at?: string | null;
  posted_by?: number | null;
  posted_at?: string | null;
  cancelled_by?: number | null;
  cancelled_at?: string | null;
  cancel_reason?: string | null;
  allocations?: CustomerReceiptAllocation[];
  approvals?: CustomerReceiptApproval[];
}

export interface CustomerReceiptAllocation {
  id?: number;
  customer_receipt_id?: number;
  sales_invoice_id: number;
  allocated_amount: number;
  remarks?: string | null;
}

export interface CustomerReceiptApproval {
  id: number;
  customer_receipt_id: number;
  action: string;
  remarks?: string | null;
  action_by: number;
  action_at: string;
}

export interface CustomerReceiptListParams {
  branch_id?: number;
  customer_id?: number;
  payment_method?: CustomerReceiptPaymentMethod;
  approval_status?: CustomerReceiptApprovalStatus;
  posted_status?: CustomerReceiptPostedStatus;
  receipt_status?: CustomerReceiptStatus;
  receipt_date_from?: string;
  receipt_date_to?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateCustomerReceiptPayload {
  branch_id: number;
  customer_id: number;
  financial_year_id?: number | null;
  accounting_period_id?: number | null;
  receipt_date: string;
  payment_method: CustomerReceiptPaymentMethod;
  reference_number?: string | null;
  bank_reference_number?: string | null;
  cheque_number?: string | null;
  cheque_date?: string | null;
  remarks?: string | null;
  receipt_amount: number;
  allocations?: CustomerReceiptAllocationPayload[];
}

export interface UpdateCustomerReceiptPayload extends CreateCustomerReceiptPayload {}

export interface CustomerReceiptAllocationPayload {
  sales_invoice_id: number;
  allocated_amount: number;
  remarks?: string | null;
}

export interface CustomerReceiptImpactPreview {
  receipt_amount: number;
  allocated_amount: number;
  unallocated_amount: number;
  customer_current_balance: number;
  customer_balance_after_receipt: number;
  allocation_count: number;
}

// ============================================================
// Invoice Center — Finance Posting Types
// ============================================================

export type InvoiceCenterFinancePostStatus = 'unposted' | 'posted' | 'failed';

export type InvoiceCenterFinancePostingDocumentType =
  | 'sales_invoice'
  | 'credit_note'
  | 'debit_note'
  | 'customer_receipt';

export interface FinanceSettingsParams {
  branch_id?: number | null;
}

export interface InvoiceCenterFinanceSettings {
  id?: number;
  company_id?: number;
  branch_id?: number | null;

  accounts_receivable_account_id: number;
  sales_revenue_account_id: number;
  sales_discount_account_id?: number | null;
  output_tax_account_id?: number | null;

  credit_note_adjustment_account_id: number;
  debit_note_income_account_id: number;

  cash_account_id?: number | null;
  bank_transfer_account_id?: number | null;
  cheque_clearing_account_id?: number | null;
  card_clearing_account_id?: number | null;
  online_payment_account_id?: number | null;
  other_receipt_account_id?: number | null;

  customer_advance_account_id?: number | null;

  is_active?: boolean;
  created_at?: string;
  updated_at?: string;

  account_summaries?: FinanceAccountSummary[];
}

export interface SaveFinanceSettingsPayload {
  branch_id?: number | null;

  accounts_receivable_account_id: number;
  sales_revenue_account_id: number;
  sales_discount_account_id?: number | null;
  output_tax_account_id?: number | null;

  credit_note_adjustment_account_id: number;
  debit_note_income_account_id: number;

  cash_account_id?: number | null;
  bank_transfer_account_id?: number | null;
  cheque_clearing_account_id?: number | null;
  card_clearing_account_id?: number | null;
  online_payment_account_id?: number | null;
  other_receipt_account_id?: number | null;

  customer_advance_account_id?: number | null;
}

export interface FinanceAccountSummary {
  id: number;
  account_code: string;
  account_name: string;
  account_type?: string;
  status?: string;
}

export interface PendingFinancePostingParams {
  branch_id?: number;
  document_type?: InvoiceCenterFinancePostingDocumentType;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export interface PendingFinancePosting {
  document_type: InvoiceCenterFinancePostingDocumentType;
  document_id: number;
  document_number: string;
  document_date: string;
  branch_id: number;
  branch_name?: string;
  customer_id?: number;
  customer_code?: string;
  customer_name?: string;
  total_amount: number;
  operational_posted_status: string;
  finance_post_status: InvoiceCenterFinancePostStatus;
  created_by?: number;
  created_at?: string;
}

export interface FinancePostingHistoryParams {
  branch_id?: number;
  document_type?: InvoiceCenterFinancePostingDocumentType;
  document_number?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export interface InvoiceCenterFinancePostingHistory {
  id: number;
  document_type: InvoiceCenterFinancePostingDocumentType;
  document_id: number;
  document_number: string;
  finance_reference_number: string;
  debit_total: number;
  credit_total: number;
  posting_status: string;
  posted_by: number;
  posted_at: string;
  remarks?: string | null;
}

export interface FinancePostingResult {
  finance_reference_number: string;
  debit_total: number;
  credit_total: number;
  message?: string;
}
