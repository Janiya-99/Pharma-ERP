import apiClient from "./client";
import type {
  SalesOrderListParams,
  CreateSalesOrderPayload,
  UpdateSalesOrderPayload,
  SalesInvoiceListParams,
  CreateSalesInvoicePayload,
  UpdateSalesInvoicePayload,
  WorkflowActionPayload,
} from "../types/invoice-center";
import type {
  DashboardSummaryReportParams,
  CustomerBalanceReportParams,
  CustomerStatementReportParams,
  CustomerAgingReportParams,
  SalesOrderRegisterReportParams,
  SalesInvoiceRegisterReportParams,
  CreditNoteRegisterReportParams,
  DebitNoteRegisterReportParams,
  CustomerReceiptRegisterReportParams,
  OutstandingInvoiceReportParams,
  SalesByCustomerReportParams,
  SalesByProductReportParams,
  CollectionSummaryReportParams,
  FinancePostingStatusReportParams,
} from "../types/invoice-center-reports";

export const invoiceCenterApi = {
  getInvoiceCenterDashboard: () => apiClient.get("/invoice-center/dashboard"),

  // ---- Customer Categories ----
  getCustomerCategories: (params: Record<string, unknown> = {}) =>
    apiClient.get("/invoice-center/customer-categories", { params }),
  getCustomerCategoryById: (id: number | string) =>
    apiClient.get(`/invoice-center/customer-categories/${id}`),
  createCustomerCategory: (payload: Record<string, unknown>) =>
    apiClient.post("/invoice-center/customer-categories", payload),
  updateCustomerCategory: (
    id: number | string,
    payload: Record<string, unknown>
  ) => apiClient.put(`/invoice-center/customer-categories/${id}`, payload),
  deleteCustomerCategory: (id: number | string) =>
    apiClient.delete(`/invoice-center/customer-categories/${id}`),

  // ---- Customers ----
  getCustomers: (params: Record<string, unknown> = {}) =>
    apiClient.get("/invoice-center/customers", { params }),
  getCustomerById: (id: number | string) =>
    apiClient.get(`/invoice-center/customers/${id}`),
  createCustomer: (payload: Record<string, unknown>) =>
    apiClient.post("/invoice-center/customers", payload),
  updateCustomer: (id: number | string, payload: Record<string, unknown>) =>
    apiClient.put(`/invoice-center/customers/${id}`, payload),
  deleteCustomer: (id: number | string) =>
    apiClient.delete(`/invoice-center/customers/${id}`),
  changeCustomerStatus: (
    id: number | string,
    payload: { status: string; reason?: string }
  ) => apiClient.patch(`/invoice-center/customers/${id}/status`, payload),

  // ---- Customer Addresses ----
  getCustomerAddresses: (
    customerId: number | string,
    params: Record<string, unknown> = {}
  ) =>
    apiClient.get(`/invoice-center/customers/${customerId}/addresses`, {
      params,
    }),
  createCustomerAddress: (
    customerId: number | string,
    payload: Record<string, unknown>
  ) =>
    apiClient.post(
      `/invoice-center/customers/${customerId}/addresses`,
      payload
    ),
  updateCustomerAddress: (
    customerId: number | string,
    addressId: number | string,
    payload: Record<string, unknown>
  ) =>
    apiClient.put(
      `/invoice-center/customers/${customerId}/addresses/${addressId}`,
      payload
    ),
  deleteCustomerAddress: (
    customerId: number | string,
    addressId: number | string
  ) =>
    apiClient.delete(
      `/invoice-center/customers/${customerId}/addresses/${addressId}`
    ),

  // ---- Customer Contacts ----
  getCustomerContacts: (
    customerId: number | string,
    params: Record<string, unknown> = {}
  ) =>
    apiClient.get(`/invoice-center/customers/${customerId}/contacts`, {
      params,
    }),
  createCustomerContact: (
    customerId: number | string,
    payload: Record<string, unknown>
  ) =>
    apiClient.post(`/invoice-center/customers/${customerId}/contacts`, payload),
  updateCustomerContact: (
    customerId: number | string,
    contactId: number | string,
    payload: Record<string, unknown>
  ) =>
    apiClient.put(
      `/invoice-center/customers/${customerId}/contacts/${contactId}`,
      payload
    ),
  deleteCustomerContact: (
    customerId: number | string,
    contactId: number | string
  ) =>
    apiClient.delete(
      `/invoice-center/customers/${customerId}/contacts/${contactId}`
    ),

  // ---- Sales Orders ----
  getSalesOrders: (params: SalesOrderListParams = {}) =>
    apiClient.get("/invoice-center/sales-orders", { params }),
  getSalesOrderById: (id: number | string) =>
    apiClient.get(`/invoice-center/sales-orders/${id}`),
  createSalesOrder: (payload: CreateSalesOrderPayload) =>
    apiClient.post("/invoice-center/sales-orders", payload),
  updateSalesOrder: (id: number | string, payload: UpdateSalesOrderPayload) =>
    apiClient.put(`/invoice-center/sales-orders/${id}`, payload),
  deleteSalesOrder: (id: number | string) =>
    apiClient.delete(`/invoice-center/sales-orders/${id}`),
  submitSalesOrder: (id: number | string, payload: { remarks: string }) =>
    apiClient.post(`/invoice-center/sales-orders/${id}/submit`, payload),
  approveSalesOrder: (id: number | string, payload: { remarks: string }) =>
    apiClient.post(`/invoice-center/sales-orders/${id}/approve`, payload),
  rejectSalesOrder: (id: number | string, payload: { remarks: string }) =>
    apiClient.post(`/invoice-center/sales-orders/${id}/reject`, payload),
  closeSalesOrder: (id: number | string, payload: { remarks: string }) =>
    apiClient.post(`/invoice-center/sales-orders/${id}/close`, payload),
  cancelSalesOrder: (id: number | string, payload: { remarks: string }) =>
    apiClient.post(`/invoice-center/sales-orders/${id}/cancel`, payload),

  // ---- Sales Invoices ----
  getSalesInvoices: (params: SalesInvoiceListParams = {}) =>
    apiClient.get("/invoice-center/sales-invoices", { params }),
  getSalesInvoiceById: (id: number | string) =>
    apiClient.get(`/invoice-center/sales-invoices/${id}`),
  createSalesInvoice: (payload: CreateSalesInvoicePayload) =>
    apiClient.post("/invoice-center/sales-invoices", payload),
  updateSalesInvoice: (
    id: number | string,
    payload: UpdateSalesInvoicePayload
  ) => apiClient.put(`/invoice-center/sales-invoices/${id}`, payload),
  deleteSalesInvoice: (id: number | string) =>
    apiClient.delete(`/invoice-center/sales-invoices/${id}`),
  submitSalesInvoice: (
    id: number | string,
    payload: WorkflowActionPayload
  ) => apiClient.post(`/invoice-center/sales-invoices/${id}/submit`, payload),
  approveSalesInvoice: (
    id: number | string,
    payload: WorkflowActionPayload
  ) => apiClient.post(`/invoice-center/sales-invoices/${id}/approve`, payload),
  rejectSalesInvoice: (
    id: number | string,
    payload: WorkflowActionPayload
  ) => apiClient.post(`/invoice-center/sales-invoices/${id}/reject`, payload),
  postSalesInvoice: (id: number | string) =>
    apiClient.post(`/invoice-center/sales-invoices/${id}/post`),
  cancelSalesInvoice: (
    id: number | string,
    payload: WorkflowActionPayload
  ) => apiClient.post(`/invoice-center/sales-invoices/${id}/cancel`, payload),

  // ---- Invoice Center-safe lookup fallbacks ----
  getWarehouseLookups: (params: Record<string, unknown> = {}) =>
    apiClient.get("/invoice-center/lookups/warehouses", { params }),
  getWarehouseLocationLookups: (params: Record<string, unknown> = {}) =>
    apiClient.get("/invoice-center/lookups/warehouse-locations", { params }),
  getProductLookups: (params: Record<string, unknown> = {}) =>
    apiClient.get("/invoice-center/lookups/products", { params }),
  getProductBatchLookups: (params: Record<string, unknown> = {}) =>
    apiClient.get("/invoice-center/lookups/product-batches", { params }),
  getStockBalanceLookups: (params: Record<string, unknown> = {}) =>
    apiClient.get("/invoice-center/lookups/stock-availability", { params }),
  getInvoiceStockAvailability: (params: Record<string, unknown> = {}) =>
    apiClient.get("/invoice-center/lookups/stock-availability", { params }),

  // ---- Credit Notes ----
  getCreditNotes: (params: any = {}) =>
    apiClient.get("/invoice-center/credit-notes", { params }),
  getCreditNoteById: (id: number | string) =>
    apiClient.get(`/invoice-center/credit-notes/${id}`),
  createCreditNote: (payload: any) =>
    apiClient.post("/invoice-center/credit-notes", payload),
  updateCreditNote: (id: number | string, payload: any) =>
    apiClient.put(`/invoice-center/credit-notes/${id}`, payload),
  deleteCreditNote: (id: number | string) =>
    apiClient.delete(`/invoice-center/credit-notes/${id}`),
  submitCreditNote: (id: number | string, payload: { remarks?: string }) =>
    apiClient.post(`/invoice-center/credit-notes/${id}/submit`, payload),
  approveCreditNote: (id: number | string, payload: { remarks?: string }) =>
    apiClient.post(`/invoice-center/credit-notes/${id}/approve`, payload),
  rejectCreditNote: (id: number | string, payload: { remarks?: string }) =>
    apiClient.post(`/invoice-center/credit-notes/${id}/reject`, payload),
  postCreditNote: (id: number | string) =>
    apiClient.post(`/invoice-center/credit-notes/${id}/post`),
  cancelCreditNote: (id: number | string, payload: { remarks?: string }) =>
    apiClient.post(`/invoice-center/credit-notes/${id}/cancel`, payload),

  // ---- Debit Notes ----
  getDebitNotes: (params: any = {}) =>
    apiClient.get("/invoice-center/debit-notes", { params }),
  getDebitNoteById: (id: number | string) =>
    apiClient.get(`/invoice-center/debit-notes/${id}`),
  createDebitNote: (payload: any) =>
    apiClient.post("/invoice-center/debit-notes", payload),
  updateDebitNote: (id: number | string, payload: any) =>
    apiClient.put(`/invoice-center/debit-notes/${id}`, payload),
  deleteDebitNote: (id: number | string) =>
    apiClient.delete(`/invoice-center/debit-notes/${id}`),
  submitDebitNote: (id: number | string, payload: { remarks?: string }) =>
    apiClient.post(`/invoice-center/debit-notes/${id}/submit`, payload),
  approveDebitNote: (id: number | string, payload: { remarks?: string }) =>
    apiClient.post(`/invoice-center/debit-notes/${id}/approve`, payload),
  rejectDebitNote: (id: number | string, payload: { remarks?: string }) =>
    apiClient.post(`/invoice-center/debit-notes/${id}/reject`, payload),
  postDebitNote: (id: number | string) =>
    apiClient.post(`/invoice-center/debit-notes/${id}/post`),
  cancelDebitNote: (id: number | string, payload: { remarks?: string }) =>
    apiClient.post(`/invoice-center/debit-notes/${id}/cancel`, payload),

  // ---- Customer Receipts ----
  getCustomerReceipts: (params: any = {}) =>
    apiClient.get("/invoice-center/customer-receipts", { params }),
  getCustomerReceiptById: (id: number | string) =>
    apiClient.get(`/invoice-center/customer-receipts/${id}`),
  createCustomerReceipt: (payload: any) =>
    apiClient.post("/invoice-center/customer-receipts", payload),
  updateCustomerReceipt: (id: number | string, payload: any) =>
    apiClient.put(`/invoice-center/customer-receipts/${id}`, payload),
  deleteCustomerReceipt: (id: number | string) =>
    apiClient.delete(`/invoice-center/customer-receipts/${id}`),
  submitCustomerReceipt: (id: number | string, payload: { remarks?: string }) =>
    apiClient.post(`/invoice-center/customer-receipts/${id}/submit`, payload),
  approveCustomerReceipt: (
    id: number | string,
    payload: { remarks?: string }
  ) =>
    apiClient.post(`/invoice-center/customer-receipts/${id}/approve`, payload),
  rejectCustomerReceipt: (id: number | string, payload: { remarks?: string }) =>
    apiClient.post(`/invoice-center/customer-receipts/${id}/reject`, payload),
  postCustomerReceipt: (id: number | string) =>
    apiClient.post(`/invoice-center/customer-receipts/${id}/post`),
  cancelCustomerReceipt: (id: number | string, payload: { remarks?: string }) =>
    apiClient.post(`/invoice-center/customer-receipts/${id}/cancel`, payload),

  // ---- Finance Settings ----
  getInvoiceCenterFinanceSettings: (params: Record<string, unknown> = {}) =>
    apiClient.get("/invoice-center/finance-settings", { params }),
  saveInvoiceCenterFinanceSettings: (payload: Record<string, unknown>) =>
    apiClient.post("/invoice-center/finance-settings", payload),

  // ---- Finance Posting ----
  getPendingFinancePostings: (params: Record<string, unknown> = {}) =>
    apiClient.get("/invoice-center/finance-posting/pending", { params }),
  getFinancePostingHistory: (params: Record<string, unknown> = {}) =>
    apiClient.get("/invoice-center/finance-posting/history", { params }),
  postSalesInvoiceToFinance: (id: number | string) =>
    apiClient.post(`/invoice-center/finance-posting/sales-invoice/${id}/post`),
  postCreditNoteToFinance: (id: number | string) =>
    apiClient.post(`/invoice-center/finance-posting/credit-note/${id}/post`),
  postDebitNoteToFinance: (id: number | string) =>
    apiClient.post(`/invoice-center/finance-posting/debit-note/${id}/post`),
  postCustomerReceiptToFinance: (id: number | string) =>
    apiClient.post(
      `/invoice-center/finance-posting/customer-receipt/${id}/post`
    ),

  // ---- Print Formats ----
  getPrintFormats: (params: Record<string, unknown> = {}) =>
    apiClient.get("/invoice-center/print-formats", { params }),
  getPrintFormatById: (id: number | string) =>
    apiClient.get(`/invoice-center/print-formats/${id}`),
  createPrintFormat: (payload: Record<string, unknown>) =>
    apiClient.post("/invoice-center/print-formats", payload),
  updatePrintFormat: (id: number | string, payload: Record<string, unknown>) =>
    apiClient.put(`/invoice-center/print-formats/${id}`, payload),
  deletePrintFormat: (id: number | string) =>
    apiClient.delete(`/invoice-center/print-formats/${id}`),
  setDefaultPrintFormat: (id: number | string) =>
    apiClient.post(`/invoice-center/print-formats/${id}/set-default`),
  getDefaultPrintFormat: (params: Record<string, unknown> = {}) =>
    apiClient.get("/invoice-center/print-formats/default", { params }),

  // ---- Reports ----
  getInvoiceCenterDashboardSummary: (
    params: DashboardSummaryReportParams = {}
  ) => apiClient.get("/invoice-center/dashboard/summary", { params }),
  getCustomerBalanceReport: (params: CustomerBalanceReportParams = {}) =>
    apiClient.get("/invoice-center/reports/customer-balance", { params }),
  getCustomerStatementReport: (params: CustomerStatementReportParams) =>
    apiClient.get("/invoice-center/reports/customer-statement", { params }),
  getCustomerAgingReport: (params: CustomerAgingReportParams = {}) =>
    apiClient.get("/invoice-center/reports/customer-aging", { params }),
  getSalesOrderRegisterReport: (params: SalesOrderRegisterReportParams = {}) =>
    apiClient.get("/invoice-center/reports/sales-order-register", { params }),
  getSalesInvoiceRegisterReport: (
    params: SalesInvoiceRegisterReportParams = {}
  ) =>
    apiClient.get("/invoice-center/reports/sales-invoice-register", { params }),
  getCreditNoteRegisterReport: (params: CreditNoteRegisterReportParams = {}) =>
    apiClient.get("/invoice-center/reports/credit-note-register", { params }),
  getDebitNoteRegisterReport: (params: DebitNoteRegisterReportParams = {}) =>
    apiClient.get("/invoice-center/reports/debit-note-register", { params }),
  getCustomerReceiptRegisterReport: (
    params: CustomerReceiptRegisterReportParams = {}
  ) =>
    apiClient.get("/invoice-center/reports/customer-receipt-register", {
      params,
    }),
  getOutstandingInvoiceReport: (params: OutstandingInvoiceReportParams = {}) =>
    apiClient.get("/invoice-center/reports/outstanding-invoices", { params }),
  getSalesByCustomerReport: (params: SalesByCustomerReportParams = {}) =>
    apiClient.get("/invoice-center/reports/sales-by-customer", { params }),
  getSalesByProductReport: (params: SalesByProductReportParams = {}) =>
    apiClient.get("/invoice-center/reports/sales-by-product", { params }),
  getCollectionSummaryReport: (params: CollectionSummaryReportParams = {}) =>
    apiClient.get("/invoice-center/reports/collection-summary", { params }),
  getFinancePostingStatusReport: (
    params: FinancePostingStatusReportParams = {}
  ) =>
    apiClient.get("/invoice-center/reports/finance-posting-status", { params }),
};

export default invoiceCenterApi;
