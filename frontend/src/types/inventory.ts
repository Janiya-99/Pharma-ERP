export interface Warehouse {
  id: number;
  warehouse_name: string;
  status?: string;
}

export interface WarehouseLocation {
  id: number;
  location_name: string;
  warehouse_id?: number;
  status?: string;
}

export interface Product {
  id: number;
  product_name: string;
  requires_batch_tracking?: boolean;
  requires_expiry_tracking?: boolean;
  status?: string;
}

export interface ProductBatch {
  id: number;
  batch_number: string;
  expiry_date?: string;
}

export interface StockBalance {
  quantity_on_hand: number;
  quantity_available: number;
  average_cost: number;
}

export interface StockTransferLine {
  id?: string | number;
  product_id: number | null;
  product?: Product | null;
  product_batch_id: number | null;
  batch?: ProductBatch | null;
  product_batch?: ProductBatch | null;
  source_location_id: number | string;
  destination_location_id: number | string;
  transfer_quantity: number | string;
  available_quantity?: number | null;
  stock_balance_loading?: boolean;
  stock_balance_data?: StockBalance | null;
}

export interface StockTransfer {
  id: number;
  reference_no: string;
  transfer_date: string;
  source_warehouse_id: number;
  destination_warehouse_id: number;
  source_warehouse?: Warehouse;
  destination_warehouse?: Warehouse;
  total_quantity: number;
  total_stock_value?: number;
  approval_status: string;
  posted_status: string;
  remarks?: string;
  lines?: StockTransferLine[];
  created_at?: string;
  approved_at?: string;
  posted_at?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedData<T> {
  data: T[];
  total: number;
  page?: number;
  limit?: number;
  total_pages?: number;
}
