import apiClient from "./apiClient";

export const inventoryApi = {
  // Dashboard
  getInventoryDashboard: () => apiClient.get("/inventory/dashboard"),

  // Warehouses
  getWarehouses: (params) => apiClient.get("/inventory/warehouses", { params }),
  getWarehouseById: (id) => apiClient.get(`/inventory/warehouses/${id}`),
  createWarehouse: (payload) => apiClient.post("/inventory/warehouses", payload),
  updateWarehouse: (id, payload) => apiClient.put(`/inventory/warehouses/${id}`, payload),
  deleteWarehouse: (id) => apiClient.delete(`/inventory/warehouses/${id}`),

  // Warehouse Locations
  getWarehouseLocations: (params) => apiClient.get("/inventory/warehouse-locations", { params }),
  getWarehouseLocationById: (id) => apiClient.get(`/inventory/warehouse-locations/${id}`),
  createWarehouseLocation: (payload) => apiClient.post("/inventory/warehouse-locations", payload),
  updateWarehouseLocation: (id, payload) => apiClient.put(`/inventory/warehouse-locations/${id}`, payload),
  deleteWarehouseLocation: (id) => apiClient.delete(`/inventory/warehouse-locations/${id}`),

  // Product Categories
  getProductCategories: (params) => apiClient.get("/inventory/product-categories", { params }),
  getProductCategoryById: (id) => apiClient.get(`/inventory/product-categories/${id}`),
  createProductCategory: (payload) => apiClient.post("/inventory/product-categories", payload),
  updateProductCategory: (id, payload) => apiClient.put(`/inventory/product-categories/${id}`, payload),
  deleteProductCategory: (id) => apiClient.delete(`/inventory/product-categories/${id}`),

  // Product Units
  getProductUnits: (params) => apiClient.get("/inventory/product-units", { params }),
  getProductUnitById: (id) => apiClient.get(`/inventory/product-units/${id}`),
  createProductUnit: (payload) => apiClient.post("/inventory/product-units", payload),
  updateProductUnit: (id, payload) => apiClient.put(`/inventory/product-units/${id}`, payload),
  deleteProductUnit: (id) => apiClient.delete(`/inventory/product-units/${id}`),

  // Dosage Forms
  getDosageForms: (params) => apiClient.get("/inventory/dosage-forms", { params }),
  getDosageFormById: (id) => apiClient.get(`/inventory/dosage-forms/${id}`),
  createDosageForm: (payload) => apiClient.post("/inventory/dosage-forms", payload),
  updateDosageForm: (id, payload) => apiClient.put(`/inventory/dosage-forms/${id}`, payload),
  deleteDosageForm: (id) => apiClient.delete(`/inventory/dosage-forms/${id}`),

  // Generic Names
  getGenericNames: (params) => apiClient.get("/inventory/generic-names", { params }),
  getGenericNameById: (id) => apiClient.get(`/inventory/generic-names/${id}`),
  createGenericName: (payload) => apiClient.post("/inventory/generic-names", payload),
  updateGenericName: (id, payload) => apiClient.put(`/inventory/generic-names/${id}`, payload),
  deleteGenericName: (id) => apiClient.delete(`/inventory/generic-names/${id}`),

  // Manufacturers
  getManufacturers: (params) => apiClient.get("/inventory/manufacturers", { params }),
  getManufacturerById: (id) => apiClient.get(`/inventory/manufacturers/${id}`),
  createManufacturer: (payload) => apiClient.post("/inventory/manufacturers", payload),
  updateManufacturer: (id, payload) => apiClient.put(`/inventory/manufacturers/${id}`, payload),
  deleteManufacturer: (id) => apiClient.delete(`/inventory/manufacturers/${id}`),

  // Suppliers
  getSuppliers: (params) => apiClient.get("/inventory/suppliers", { params }),
  getSupplierById: (id) => apiClient.get(`/inventory/suppliers/${id}`),
  createSupplier: (payload) => apiClient.post("/inventory/suppliers", payload),
  updateSupplier: (id, payload) => apiClient.put(`/inventory/suppliers/${id}`, payload),
  deleteSupplier: (id) => apiClient.delete(`/inventory/suppliers/${id}`),

  // Products
  getProducts: (params) => apiClient.get("/inventory/products", { params }),
  getProductById: (id) => apiClient.get(`/inventory/products/${id}`),
  createProduct: (payload) => apiClient.post("/inventory/products", payload),
  updateProduct: (id, payload) => apiClient.put(`/inventory/products/${id}`, payload),
  deleteProduct: (id) => apiClient.delete(`/inventory/products/${id}`),

  // Product Batches
  getProductBatches: (params) => apiClient.get("/inventory/product-batches", { params }),
  getProductBatchById: (id) => apiClient.get(`/inventory/product-batches/${id}`),
  createProductBatch: (payload) => apiClient.post("/inventory/product-batches", payload),
  updateProductBatch: (id, payload) => apiClient.put(`/inventory/product-batches/${id}`, payload),
  blockProductBatch: (id, payload) => apiClient.post(`/inventory/product-batches/${id}/block`, payload),
  unblockProductBatch: (id) => apiClient.post(`/inventory/product-batches/${id}/unblock`),

  // Stock
  getStockBalances: (params) => apiClient.get("/inventory/stock-balances", { params }),
  getStockLedgerEntries: (params) => apiClient.get("/inventory/stock-ledger", { params }),
};
