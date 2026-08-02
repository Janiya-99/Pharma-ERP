import React, { useEffect, useState } from "react";
import { invoiceCenterApi } from "../../api/invoiceCenterApi";
import type { ProductBatchLookup } from "../../types/invoice-center";
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
  productId?: string;
  onBatchSelected?: (batch: ProductBatchLookup) => void;
  disabled?: boolean;
}

export const SalesInvoiceLineBatchSelect: React.FC<Props> = ({
  value,
  onChange,
  productId,
  onBatchSelected,
  disabled,
}) => {
  const [batches, setBatches] = useState<ProductBatchLookup[]>([]);

  useEffect(() => {
    if (!productId) {
      setBatches([]);
      return;
    }
    let mounted = true;
    invoiceCenterApi
      .getProductBatchLookups({ product_id: productId })
      .then((response) => {
        if (mounted) {
          setBatches(
            (response.data.data || []).map((batch: ProductBatchLookup) => ({
              ...batch,
              id: batch.id || batch.product_batch_id || 0,
            }))
          );
        }
      })
      .catch(() => {
        if (mounted) setBatches([]);
      });
    return () => {
      mounted = false;
    };
  }, [productId]);

  return (
    <Select
      value={value ? String(value) : ""}
      onValueChange={(nextValue) => {
        onChange(nextValue);
        const selected = batches.find((batch) => String(batch.product_batch_id || batch.id) === nextValue);
        if (selected) onBatchSelected?.(selected);
      }}
      disabled={disabled || !productId}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={productId ? "Select batch" : "Pick product first"} />
      </SelectTrigger>
      <SelectContent>
        {batches.map((batch) => {
          const batchID = batch.product_batch_id || batch.id;
          return (
            <SelectItem key={batchID} value={String(batchID)}>
              {batch.batch_number} {batch.expiry_date ? `- Exp ${batch.expiry_date}` : ""}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};
