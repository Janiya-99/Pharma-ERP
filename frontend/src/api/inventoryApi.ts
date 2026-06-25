import apiClient from "./apiClient";

export const inventoryApi = {
  // Dashboard
  getInventoryDashboard: () => apiClient.get("/inventory/dashboard"),

  // Warehouses
  getWarehouses: (params: Record<string, unknown>) => apiClient.get("/inventory/warehouses", { params }),
  getWarehouseById: (id: string | number) => apiClient.get(`/inventory/warehouses/${id}`),
  createWarehouse: (payload: Record<string, unknown>) => apiClient.post("/inventory/warehouses", payload),
  updateWarehouse: (id: string | number, payload: Record<string, unknown>) => apiClient.put(`/inventory/warehouses/${id}`, payload),
  deleteWarehouse: (id: string | number) => apiClient.delete(`/inventory/warehouses/${id}`),

  // Warehouse Locations
  getWarehouseLocations: (params: Record<string, unknown>) => apiClient.get("/inventory/warehouse-locations", { params }),
  getWarehouseLocationById: (id: string | number) => apiClient.get(`/inventory/warehouse-locations/${id}`),
  createWarehouseLocation: (payload: Record<string, unknown>) => apiClient.post("/inventory/warehouse-locations", payload),
  updateWarehouseLocation: (id: string | number, payload: Record<string, unknown>) => apiClient.put(`/inventory/warehouse-locations/${id}`, payload),
  deleteWarehouseLocation: (id: string | number) => apiClient.delete(`/inventory/warehouse-locations/${id}`),

  // Product Categories
  getProductCategories: (params: Record<string, unknown>) => apiClient.get("/inventory/product-categories", { params }),
  getProductCategoryById: (id: string | number) => apiClient.get(`/inventory/product-categories/${id}`),
  createProductCategory: (payload: Record<string, unknown>) => apiClient.post("/inventory/product-categories", payload),
  updateProductCategory: (id: string | number, payload: Record<string, unknown>) => apiClient.put(`/inventory/product-categories/${id}`, payload),
  deleteProductCategory: (id: string | number) => apiClient.delete(`/inventory/product-categories/${id}`),

  // Product Units
  getProductUnits: (params: Record<string, unknown>) => apiClient.get("/inventory/product-units", { params }),
  getProductUnitById: (id: string | number) => apiClient.get(`/inventory/product-units/${id}`),
  createProductUnit: (payload: Record<string, unknown>) => apiClient.post("/inventory/product-units", payload),
  updateProductUnit: (id: string | number, payload: Record<string, unknown>) => apiClient.put(`/inventory/product-units/${id}`, payload),
  deleteProductUnit: (id: string | number) => apiClient.delete(`/inventory/product-units/${id}`),

  // Dosage Forms
  getDosageForms: (params: Record<string, unknown>) => apiClient.get("/inventory/dosage-forms", { params }),
  getDosageFormById: (id: string | number) => apiClient.get(`/inventory/dosage-forms/${id}`),
  createDosageForm: (payload: Record<string, unknown>) => apiClient.post("/inventory/dosage-forms", payload),
  updateDosageForm: (id: string | number, payload: Record<string, unknown>) => apiClient.put(`/inventory/dosage-forms/${id}`, payload),
  deleteDosageForm: (id: string | number) => apiClient.delete(`/inventory/dosage-forms/${id}`),

  // Generic Names
  getGenericNames: (params: Record<string, unknown>) => apiClient.get("/inventory/generic-names", { params }),
  getGenericNameById: (id: string | number) => apiClient.get(`/inventory/generic-names/${id}`),
  createGenericName: (payload: Record<string, unknown>) => apiClient.post("/inventory/generic-names", payload),
  updateGenericName: (id: string | number, payload: Record<string, unknown>) => apiClient.put(`/inventory/generic-names/${id}`, payload),
  deleteGenericName: (id: string | number) => apiClient.delete(`/inventory/generic-names/${id}`),

  // Manufacturers
  getManufacturers: (params: Record<string, unknown>) => apiClient.get("/inventory/manufacturers", { params }),
  getManufacturerById: (id: string | number) => apiClient.get(`/inventory/manufacturers/${id}`),
  createManufacturer: (payload: Record<string, unknown>) => apiClient.post("/inventory/manufacturers", payload),
  updateManufacturer: (id: string | number, payload: Record<string, unknown>) => apiClient.put(`/inventory/manufacturers/${id}`, payload),
  deleteManufacturer: (id: string | number) => apiClient.delete(`/inventory/manufacturers/${id}`),

  // Suppliers
  getSuppliers: (params: Record<string, unknown>) => apiClient.get("/inventory/suppliers", { params }),
  getSupplierById: (id: string | number) => apiClient.get(`/inventory/suppliers/${id}`),
  createSupplier: (payload: Record<string, unknown>) => apiClient.post("/inventory/suppliers", payload),
  updateSupplier: (id: string | number, payload: Record<string, unknown>) => apiClient.put(`/inventory/suppliers/${id}`, payload),
  deleteSupplier: (id: string | number) => apiClient.delete(`/inventory/suppliers/${id}`),

  // Products
  getProducts: (params: Record<string, unknown>) => apiClient.get("/inventory/products", { params }),
  getProductById: (id: string | number) => apiClient.get(`/inventory/products/${id}`),
  createProduct: (payload: Record<string, unknown>) => apiClient.post("/inventory/products", payload),
  updateProduct: (id: string | number, payload: Record<string, unknown>) => apiClient.put(`/inventory/products/${id}`, payload),
  deleteProduct: (id: string | number) => apiClient.delete(`/inventory/products/${id}`),

  // Product Batches
  getProductBatches: (params: Record<string, unknown>) => apiClient.get("/inventory/product-batches", { params }),
  getProductBatchById: (id: string | number) => apiClient.get(`/inventory/product-batches/${id}`),
  createProductBatch: (payload: Record<string, unknown>) => apiClient.post("/inventory/product-batches", payload),
  updateProductBatch: (id: string | number, payload: Record<string, unknown>) => apiClient.put(`/inventory/product-batches/${id}`, payload),
  blockProductBatch: (id: string | number, payload: Record<string, unknown>) => apiClient.post(`/inventory/product-batches/${id}/block`, payload),
  unblockProductBatch: (id: string | number) => apiClient.post(`/inventory/product-batches/${id}/unblock`),

  // Stock
  getStockBalances: (params: Record<string, unknown>) => apiClient.get("/inventory/stock-balances", { params }),
  getStockLedgerEntries: (params: Record<string, unknown>) => apiClient.get("/inventory/stock-ledger", { params }),

  // Opening Stock
  getOpeningStockEntries: (params: Record<string, unknown>) => apiClient.get("/inventory/opening-stock-entries", { params }),
  getOpeningStockEntryById: (id: string | number) => apiClient.get(`/inventory/opening-stock-entries/${id}`),
  createOpeningStockEntry: (payload: Record<string, unknown>) => apiClient.post("/inventory/opening-stock-entries", payload),
  updateOpeningStockEntry: (id: string | number, payload: Record<string, unknown>) => apiClient.put(`/inventory/opening-stock-entries/${id}`, payload),
  deleteOpeningStockEntry: (id: string | number) => apiClient.delete(`/inventory/opening-stock-entries/${id}`),
  submitOpeningStockEntry: (id: string | number, payload: Record<string, unknown>) => apiClient.post(`/inventory/opening-stock-entries/${id}/submit`, payload),
  approveOpeningStockEntry: (id: string | number, payload: Record<string, unknown>) => apiClient.post(`/inventory/opening-stock-entries/${id}/approve`, payload),
  rejectOpeningStockEntry: (id: string | number, payload: Record<string, unknown>) => apiClient.post(`/inventory/opening-stock-entries/${id}/reject`, payload),
  postOpeningStockEntry: (id: string | number) => apiClient.post(`/inventory/opening-stock-entries/${id}/post`),

  // Goods Receipt Notes (GRN)
  getGRNs: (params: Record<string, unknown>) => apiClient.get("/inventory/grns", { params }),
  getGRNById: (id: string | number) => apiClient.get(`/inventory/grns/${id}`),
  createGRN: (payload: Record<string, unknown>) => apiClient.post("/inventory/grns", payload),
  updateGRN: (id: string | number, payload: Record<string, unknown>) => apiClient.put(`/inventory/grns/${id}`, payload),
  deleteGRN: (id: string | number) => apiClient.delete(`/inventory/grns/${id}`),
  submitGRN: (id: string | number, payload: Record<string, unknown>) => apiClient.post(`/inventory/grns/${id}/submit`, payload),
  approveGRN: (id: string | number, payload: Record<string, unknown>) => apiClient.post(`/inventory/grns/${id}/approve`, payload),
  rejectGRN: (id: string | number, payload: Record<string, unknown>) => apiClient.post(`/inventory/grns/${id}/reject`, payload),
  postGRN: (id: string | number) => apiClient.post(`/inventory/grns/${id}/post`),

  // Stock Transfers
  getStockTransfers: (params: Record<string, unknown>) => apiClient.get("/inventory/stock-transfers", { params }),
  getStockTransferById: (id: string | number) => apiClient.get(`/inventory/stock-transfers/${id}`),
  createStockTransfer: (payload: Record<string, unknown>) => apiClient.post("/inventory/stock-transfers", payload),
  updateStockTransfer: (id: string | number, payload: Record<string, unknown>) => apiClient.put(`/inventory/stock-transfers/${id}`, payload),
  deleteStockTransfer: (id: string | number) => apiClient.delete(`/inventory/stock-transfers/${id}`),
  submitStockTransfer: (id: string | number, payload: Record<string, unknown>) => apiClient.post(`/inventory/stock-transfers/${id}/submit`, payload),
  approveStockTransfer: (id: string | number, payload: Record<string, unknown>) => apiClient.post(`/inventory/stock-transfers/${id}/approve`, payload),
  rejectStockTransfer: (id: string | number, payload: Record<string, unknown>) => apiClient.put(`/inventory/stock-transfers/${id}/reject`, payload),
  postStockTransfer: (id: string | number) => apiClient.put(`/inventory/stock-transfers/${id}/post`),

  // Stock Adjustments
  getStockAdjustments: (params: Record<string, unknown>) => apiClient.get("/inventory/stock-adjustments", { params }),
  getStockAdjustmentById: (id: string | number) => apiClient.get(`/inventory/stock-adjustments/${id}`),
  createStockAdjustment: (payload: Record<string, unknown>) => apiClient.post("/inventory/stock-adjustments", payload),
  updateStockAdjustment: (id: string | number, payload: Record<string, unknown>) => apiClient.put(`/inventory/stock-adjustments/${id}`, payload),
  deleteStockAdjustment: (id: string | number) => apiClient.delete(`/inventory/stock-adjustments/${id}`),
  submitStockAdjustment: (id: string | number, payload: Record<string, unknown>) => apiClient.post(`/inventory/stock-adjustments/${id}/submit`, payload),
  approveStockAdjustment: (id: string | number, payload: Record<string, unknown>) => apiClient.post(`/inventory/stock-adjustments/${id}/approve`, payload),
  rejectStockAdjustment: (id: string | number, payload: Record<string, unknown>) => apiClient.post(`/inventory/stock-adjustments/${id}/reject`, payload),
  postStockAdjustment: (id: string | number) => apiClient.post(`/inventory/stock-adjustments/${id}/post`),

  // Purchase Returns
  getPurchaseReturns: (params: Record<string, unknown>) => apiClient.get("/inventory/purchase-returns", { params }),
  getPurchaseReturnById: (id: string | number) => apiClient.get(`/inventory/purchase-returns/${id}`),
  createPurchaseReturn: (payload: Record<string, unknown>) => apiClient.post("/inventory/purchase-returns", payload),
  updatePurchaseReturn: (id: string | number, payload: Record<string, unknown>) => apiClient.put(`/inventory/purchase-returns/${id}`, payload),
  deletePurchaseReturn: (id: string | number) => apiClient.delete(`/inventory/purchase-returns/${id}`),
  submitPurchaseReturn: (id: string | number, payload: Record<string, unknown>) => apiClient.post(`/inventory/purchase-returns/${id}/submit`, payload),
  approvePurchaseReturn: (id: string | number, payload: Record<string, unknown>) => apiClient.post(`/inventory/purchase-returns/${id}/approve`, payload),
  rejectPurchaseReturn: (id: string | number, payload: Record<string, unknown>) => apiClient.post(`/inventory/purchase-returns/${id}/reject`, payload),
  postPurchaseReturn: (id: string | number) => apiClient.post(`/inventory/purchase-returns/${id}/post`),

  // Sales Returns
  getSalesReturns: (params: Record<string, unknown>) => apiClient.get("/inventory/sales-returns", { params }),
  getSalesReturnById: (id: string | number) => apiClient.get(`/inventory/sales-returns/${id}`),
  createSalesReturn: (payload: Record<string, unknown>) => apiClient.post("/inventory/sales-returns", payload),
  updateSalesReturn: (id: string | number, payload: Record<string, unknown>) => apiClient.put(`/inventory/sales-returns/${id}`, payload),
  deleteSalesReturn: (id: string | number) => apiClient.delete(`/inventory/sales-returns/${id}`),
  submitSalesReturn: (id: string | number, payload: Record<string, unknown>) => apiClient.post(`/inventory/sales-returns/${id}/submit`, payload),
  approveSalesReturn: (id: string | number, payload: Record<string, unknown>) => apiClient.post(`/inventory/sales-returns/${id}/approve`, payload),
  rejectSalesReturn: (id: string | number, payload: Record<string, unknown>) => apiClient.post(`/inventory/sales-returns/${id}/reject`, payload),
  postSalesReturn: (id: string | number) => apiClient.post(`/inventory/sales-returns/${id}/post`),
};

