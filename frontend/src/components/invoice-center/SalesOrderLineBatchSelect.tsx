import React, { useEffect, useMemo, useState } from "react";
import { invoiceCenterApi } from "../../api/invoiceCenterApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import type { ProductBatchLookup } from "../../types/invoice-center";

type SalesOrderLineBatchSelectProps = {
  value: number | null;
  productId: number | null;
  onChange: (value: number | null) => void;
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

const SalesOrderLineBatchSelect: React.FC<SalesOrderLineBatchSelectProps> = ({
  value,
  productId,
  onChange,
  disabled,
}) => {
  const [batches, setBatches] = useState<ProductBatchLookup[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!productId) {
      setBatches([]);
      if (value) onChange(null);
      return;
    }

    let cancelled = false;

    const loadBatches = async () => {
      setLoading(true);
      try {
        const response = await invoiceCenterApi.getProductBatchLookups({
          product_id: productId,
        });
        if (!cancelled) {
          setBatches(unwrapList<ProductBatchLookup>(response));
        }
      } catch (error) {
        console.error("Failed to load product batch lookups", error);
        if (!cancelled) setBatches([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadBatches();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  const selectedValue = value ? String(value) : "";
  const selectedBatch = useMemo(
    () =>
      batches.find((batch) => (batch.product_batch_id || batch.id) === value) ||
      null,
    [batches, value]
  );

  return (
    <Select
      value={selectedValue}
      disabled={disabled || loading || !productId || !batches.length}
      onValueChange={(nextValue) =>
        onChange(nextValue === "__none" ? null : Number(nextValue))
      }
    >
      <SelectTrigger
        className="min-w-[170px]"
        title={selectedBatch?.batch_number}
      >
        <SelectValue
          placeholder={
            !productId
              ? "Select product first"
              : loading
              ? "Loading batches..."
              : batches.length
              ? "Select batch"
              : "No batch"
          }
        />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__none">No batch</SelectItem>
        {batches.map((batch) => {
          const batchId = batch.product_batch_id || batch.id;
          return (
            <SelectItem key={batchId} value={String(batchId)}>
              {batch.batch_number}
              {batch.expiry_date ? ` - Exp ${batch.expiry_date}` : ""}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

export default SalesOrderLineBatchSelect;
