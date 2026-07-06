import React, { useEffect, useMemo, useState } from "react";
import { invoiceCenterApi } from "../../api/invoiceCenterApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import type { InvoiceInventoryProductLookup } from "../../types/invoice-center";

type SalesOrderLineProductSelectProps = {
  value: number | null;
  onChange: (
    value: number | null,
    product?: InvoiceInventoryProductLookup | null
  ) => void;
  disabled?: boolean;
};

const unwrapList = <T,>(payload: any): T[] => {
  const data = payload?.data?.data ?? payload?.data ?? payload;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.rows)) return data.rows;
  return [];
};

const SalesOrderLineProductSelect: React.FC<
  SalesOrderLineProductSelectProps
> = ({ value, onChange, disabled }) => {
  const [products, setProducts] = useState<InvoiceInventoryProductLookup[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      setLoading(true);
      try {
        const response = await invoiceCenterApi.getProductLookups({
          limit: 100,
        });
        if (!cancelled) {
          setProducts(unwrapList<InvoiceInventoryProductLookup>(response));
        }
      } catch (error) {
        console.error("Failed to load product lookups", error);
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedValue = value ? String(value) : "";
  const selectedProduct = useMemo(
    () => products.find((product) => product.product_id === value) || null,
    [products, value]
  );

  return (
    <Select
      value={selectedValue}
      disabled={disabled || loading}
      onValueChange={(nextValue) => {
        const product =
          products.find((item) => item.product_id === Number(nextValue)) ||
          null;
        onChange(product?.product_id ?? null, product);
      }}
    >
      <SelectTrigger
        className="min-w-[230px]"
        title={
          selectedProduct
            ? `${selectedProduct.product_code} - ${selectedProduct.product_name}`
            : undefined
        }
      >
        <SelectValue
          placeholder={loading ? "Loading products..." : "Select product"}
        />
      </SelectTrigger>
      <SelectContent>
        {products.map((product, index) => (
          <SelectItem
            key={`${product.product_id}-${index}`}
            value={String(product.product_id)}
          >
            {product.product_code} - {product.product_name}
          </SelectItem>
        ))}
        {!products.length && !loading && (
          <SelectItem value="no-products" disabled>
            No products found
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
};

export default SalesOrderLineProductSelect;
