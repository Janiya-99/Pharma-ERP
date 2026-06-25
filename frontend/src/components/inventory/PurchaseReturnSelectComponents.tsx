import React, { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "components/ui/select";
import { inventoryApi } from "api/inventoryApi";
import { Product, ProductBatch } from "types/inventory";

interface ProductSelectProps {
  value: string;
  onChange: (value: string, product: Product | null) => void;
  disabled?: boolean;
}

export const PurchaseReturnLineProductSelect: React.FC<ProductSelectProps> = ({ value, onChange, disabled }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await inventoryApi.getProducts({ status: "active", limit: 1000 });
        if (response.data?.success) {
          // Check if response is paginated or not
          setProducts(response.data.data?.data || response.data.data || []);
        }
      } catch (error) {
        console.error("Failed to load products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <Select
      value={value?.toString() || ""}
      onValueChange={(val) => {
        const product = products.find((p) => p.id.toString() === val) || null;
        onChange(val, product);
      }}
      disabled={disabled || loading}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={loading ? "Loading..." : "Select Product"} />
      </SelectTrigger>
      <SelectContent>
        {products.map((p) => (
          <SelectItem key={p.id} value={p.id.toString()}>
            {p.product_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

interface BatchSelectProps {
  productId: string | number | null;
  value: string;
  onChange: (value: string, batch: ProductBatch | null) => void;
  disabled?: boolean;
}

export const PurchaseReturnLineBatchSelect: React.FC<BatchSelectProps> = ({ productId, value, onChange, disabled }) => {
  const [batches, setBatches] = useState<ProductBatch[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBatches = async () => {
      if (!productId) {
        setBatches([]);
        return;
      }
      setLoading(true);
      try {
        const response = await inventoryApi.getProductBatches({ product_id: productId, batch_status: "active", limit: 1000 });
        if (response.data?.success) {
          setBatches(response.data.data?.data || response.data.data || []);
        }
      } catch (error) {
        console.error("Failed to load batches", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBatches();
  }, [productId]);

  return (
    <Select
      value={value?.toString() || ""}
      onValueChange={(val) => {
        const batch = batches.find((b) => b.id.toString() === val) || null;
        onChange(val, batch);
      }}
      disabled={disabled || loading || !productId}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={loading ? "Loading..." : "Select Batch"} />
      </SelectTrigger>
      <SelectContent>
        {batches.map((b) => (
          <SelectItem key={b.id} value={b.id.toString()}>
            {b.batch_number} {b.expiry_date ? ` (Exp: ${new Date(b.expiry_date).toLocaleDateString()})` : ""}
          </SelectItem>
        ))}
        {batches.length === 0 && !loading && (
          <div className="p-2 text-sm text-gray-500 text-center">No active batches</div>
        )}
      </SelectContent>
    </Select>
  );
};
