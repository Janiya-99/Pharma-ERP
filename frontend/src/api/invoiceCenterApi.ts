import apiClient from "./client";

export const invoiceCenterApi = {
  getInvoiceCenterDashboard: () => apiClient.get("/invoice-center/dashboard"),

  getCustomerCategories: (params: Record<string, unknown> = {}) => apiClient.get("/invoice-center/customer-categories", { params }),
  getCustomerCategoryById: (id: number | string) => apiClient.get(`/invoice-center/customer-categories/${id}`),
  createCustomerCategory: (payload: Record<string, unknown>) => apiClient.post("/invoice-center/customer-categories", payload),
  updateCustomerCategory: (id: number | string, payload: Record<string, unknown>) => apiClient.put(`/invoice-center/customer-categories/${id}`, payload),
  deleteCustomerCategory: (id: number | string) => apiClient.delete(`/invoice-center/customer-categories/${id}`),

  getCustomers: (params: Record<string, unknown> = {}) => apiClient.get("/invoice-center/customers", { params }),
  getCustomerById: (id: number | string) => apiClient.get(`/invoice-center/customers/${id}`),
  createCustomer: (payload: Record<string, unknown>) => apiClient.post("/invoice-center/customers", payload),
  updateCustomer: (id: number | string, payload: Record<string, unknown>) => apiClient.put(`/invoice-center/customers/${id}`, payload),
  deleteCustomer: (id: number | string) => apiClient.delete(`/invoice-center/customers/${id}`),
  changeCustomerStatus: (id: number | string, payload: { status: string; reason?: string }) => apiClient.patch(`/invoice-center/customers/${id}/status`, payload),

  getCustomerAddresses: (customerId: number | string, params: Record<string, unknown> = {}) => apiClient.get(`/invoice-center/customers/${customerId}/addresses`, { params }),
  createCustomerAddress: (customerId: number | string, payload: Record<string, unknown>) => apiClient.post(`/invoice-center/customers/${customerId}/addresses`, payload),
  updateCustomerAddress: (customerId: number | string, addressId: number | string, payload: Record<string, unknown>) => apiClient.put(`/invoice-center/customers/${customerId}/addresses/${addressId}`, payload),
  deleteCustomerAddress: (customerId: number | string, addressId: number | string) => apiClient.delete(`/invoice-center/customers/${customerId}/addresses/${addressId}`),

  getCustomerContacts: (customerId: number | string, params: Record<string, unknown> = {}) => apiClient.get(`/invoice-center/customers/${customerId}/contacts`, { params }),
  createCustomerContact: (customerId: number | string, payload: Record<string, unknown>) => apiClient.post(`/invoice-center/customers/${customerId}/contacts`, payload),
  updateCustomerContact: (customerId: number | string, contactId: number | string, payload: Record<string, unknown>) => apiClient.put(`/invoice-center/customers/${customerId}/contacts/${contactId}`, payload),
  deleteCustomerContact: (customerId: number | string, contactId: number | string) => apiClient.delete(`/invoice-center/customers/${customerId}/contacts/${contactId}`),
};

export default invoiceCenterApi;
