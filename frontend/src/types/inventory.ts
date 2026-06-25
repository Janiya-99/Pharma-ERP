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

export interface StockAdjustmentLine {
  id?: string | number;
  product_id: number | null;
  product?: Product | null;
  product_batch_id?: number | null;
  batch?: ProductBatch | null;
  product_batch?: ProductBatch | null;
  warehouse_location_id: number | string;
  warehouse_location?: WarehouseLocation;
  adjustment_direction: "in" | "out";
  system_quantity?: number | string;
  physical_quantity?: number | string;
  quantity: number | string;
  variance_quantity?: number | string;
  unit_cost: number | string;
  total_cost?: number;
  line_reason?: string;
  line_remarks?: string;
  reason?: string;
  stock_balance_loading?: boolean;
  stock_balance_data?: StockBalance | null;
}

export interface StockAdjustment {
  id: number;
  adjustment_number: string;
  adjustment_date: string;
  branch_id?: number;
  branch?: { id: number; branch_name: string };
  warehouse_id: number;
  warehouse?: Warehouse;
  adjustment_type: string;
  reason?: string;
  remarks?: string;
  reference_no?: string;
  reference_number?: string;
  approval_status: string;
  posted_status: string;
  total_quantity_in: number;
  total_quantity_out: number;
  total_stock_value: number;
  lines?: StockAdjustmentLine[];
  created_by?: number | string;
  created_by_user?: { name: string };
  created_at?: string;
  approved_by?: number | string;
  approved_by_user?: { name: string };
  approved_at?: string;
  posted_by?: number | string;
  posted_by_user?: { name: string };
  posted_at?: string;
}
