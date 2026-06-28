import apiClient from "./client";
import type {
  SalesOrderListParams,
  CreateSalesOrderPayload,
  UpdateSalesOrderPayload,
} from "../types/invoice-center";

export const invoiceCenterApi = {
  getInvoiceCenterDashboard: () => apiClient.get("/invoice-center/dashboard"),

  // ---- Customer Categories ----
  getCustomerCategories: (params: Record<string, unknown> = {}) => apiClient.get("/invoice-center/customer-categories", { params }),
  getCustomerCategoryById: (id: number | string) => apiClient.get(`/invoice-center/customer-categories/${id}`),
  createCustomerCategory: (payload: Record<string, unknown>) => apiClient.post("/invoice-center/customer-categories", payload),
  updateCustomerCategory: (id: number | string, payload: Record<string, unknown>) => apiClient.put(`/invoice-center/customer-categories/${id}`, payload),
  deleteCustomerCategory: (id: number | string) => apiClient.delete(`/invoice-center/customer-categories/${id}`),

  // ---- Customers ----
  getCustomers: (params: Record<string, unknown> = {}) => apiClient.get("/invoice-center/customers", { params }),
  getCustomerById: (id: number | string) => apiClient.get(`/invoice-center/customers/${id}`),
  createCustomer: (payload: Record<string, unknown>) => apiClient.post("/invoice-center/customers", payload),
  updateCustomer: (id: number | string, payload: Record<string, unknown>) => apiClient.put(`/invoice-center/customers/${id}`, payload),
  deleteCustomer: (id: number | string) => apiClient.delete(`/invoice-center/customers/${id}`),
  changeCustomerStatus: (id: number | string, payload: { status: string; reason?: string }) => apiClient.patch(`/invoice-center/customers/${id}/status`, payload),

  // ---- Customer Addresses ----
  getCustomerAddresses: (customerId: number | string, params: Record<string, unknown> = {}) => apiClient.get(`/invoice-center/customers/${customerId}/addresses`, { params }),
  createCustomerAddress: (customerId: number | string, payload: Record<string, unknown>) => apiClient.post(`/invoice-center/customers/${customerId}/addresses`, payload),
  updateCustomerAddress: (customerId: number | string, addressId: number | string, payload: Record<string, unknown>) => apiClient.put(`/invoice-center/customers/${customerId}/addresses/${addressId}`, payload),
  deleteCustomerAddress: (customerId: number | string, addressId: number | string) => apiClient.delete(`/invoice-center/customers/${customerId}/addresses/${addressId}`),

  // ---- Customer Contacts ----
  getCustomerContacts: (customerId: number | string, params: Record<string, unknown> = {}) => apiClient.get(`/invoice-center/customers/${customerId}/contacts`, { params }),
  createCustomerContact: (customerId: number | string, payload: Record<string, unknown>) => apiClient.post(`/invoice-center/customers/${customerId}/contacts`, payload),
  updateCustomerContact: (customerId: number | string, contactId: number | string, payload: Record<string, unknown>) => apiClient.put(`/invoice-center/customers/${customerId}/contacts/${contactId}`, payload),
  deleteCustomerContact: (customerId: number | string, contactId: number | string) => apiClient.delete(`/invoice-center/customers/${customerId}/contacts/${contactId}`),

  // ---- Sales Orders ----
  getSalesOrders: (params: SalesOrderListParams = {}) => apiClient.get("/invoice-center/sales-orders", { params }),
  getSalesOrderById: (id: number | string) => apiClient.get(`/invoice-center/sales-orders/${id}`),
  createSalesOrder: (payload: CreateSalesOrderPayload) => apiClient.post("/invoice-center/sales-orders", payload),
  updateSalesOrder: (id: number | string, payload: UpdateSalesOrderPayload) => apiClient.put(`/invoice-center/sales-orders/${id}`, payload),
  deleteSalesOrder: (id: number | string) => apiClient.delete(`/invoice-center/sales-orders/${id}`),
  submitSalesOrder: (id: number | string, payload: { remarks: string }) => apiClient.post(`/invoice-center/sales-orders/${id}/submit`, payload),
  approveSalesOrder: (id: number | string, payload: { remarks: string }) => apiClient.post(`/invoice-center/sales-orders/${id}/approve`, payload),
  rejectSalesOrder: (id: number | string, payload: { remarks: string }) => apiClient.post(`/invoice-center/sales-orders/${id}/reject`, payload),
  closeSalesOrder: (id: number | string, payload: { remarks: string }) => apiClient.post(`/invoice-center/sales-orders/${id}/close`, payload),
  cancelSalesOrder: (id: number | string, payload: { remarks: string }) => apiClient.post(`/invoice-center/sales-orders/${id}/cancel`, payload),

  // ---- Sales Invoices ----
  getSalesInvoices: (params: any = {}) => apiClient.get("/invoice-center/sales-invoices", { params }),
  getSalesInvoiceById: (id: number | string) => apiClient.get(`/invoice-center/sales-invoices/${id}`),
  createSalesInvoice: (payload: any) => apiClient.post("/invoice-center/sales-invoices", payload),
  updateSalesInvoice: (id: number | string, payload: any) => apiClient.put(`/invoice-center/sales-invoices/${id}`, payload),
  deleteSalesInvoice: (id: number | string) => apiClient.delete(`/invoice-center/sales-invoices/${id}`),
  submitSalesInvoice: (id: number | string, payload: { remarks?: string }) => apiClient.post(`/invoice-center/sales-invoices/${id}/submit`, payload),
  approveSalesInvoice: (id: number | string, payload: { remarks?: string }) => apiClient.post(`/invoice-center/sales-invoices/${id}/approve`, payload),
  rejectSalesInvoice: (id: number | string, payload: { remarks?: string }) => apiClient.post(`/invoice-center/sales-invoices/${id}/reject`, payload),
  postSalesInvoice: (id: number | string) => apiClient.post(`/invoice-center/sales-invoices/${id}/post`),
  cancelSalesInvoice: (id: number | string, payload: { remarks?: string }) => apiClient.post(`/invoice-center/sales-invoices/${id}/cancel`, payload),
};

export default invoiceCenterApi;
