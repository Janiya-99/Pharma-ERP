import React, { useEffect, useState } from "react";
import { invoiceCenterApi } from "../../api/invoiceCenterApi";
import type { InvoiceInventoryProductLookup } from "../../types/invoice-center";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onProductSelected?: (product: InvoiceInventoryProductLookup) => void;
  disabled?: boolean;
}

export const SalesInvoiceLineProductSelect: React.FC<Props> = ({
  value,
  onChange,
  onProductSelected,
  disabled,
}) => {
  const [products, setProducts] = useState<InvoiceInventoryProductLookup[]>([]);

  useEffect(() => {
    let mounted = true;
    invoiceCenterApi
      .getProductLookups({ limit: 100 })
      .then((response) => {
        if (mounted) setProducts(response.data.data || []);
      })
      .catch(() => {
        if (mounted) setProducts([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Select
      value={value ? String(value) : ""}
      onValueChange={(nextValue) => {
        onChange(nextValue);
        const selected = products.find((product) => String(product.product_id) === nextValue);
        if (selected) onProductSelected?.(selected);
      }}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select product" />
      </SelectTrigger>
      <SelectContent>
        {products.map((product) => (
          <SelectItem key={product.product_id} value={String(product.product_id)}>
            {product.product_code} - {product.product_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
