import React, { useState, useEffect } from "react";
import ERPFormModal from "components/erp/ERPFormModal";
import { financeApi } from "api/financeApi";
import { toast } from "react-hot-toast";

interface ChartOfAccountFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: any;
  onSuccess: () => void;
}

export default function ChartOfAccountFormModal({
  open,
  onOpenChange,
  record,
  onSuccess,
}: ChartOfAccountFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [classifications, setClassifications] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      const fetchClassifications = async () => {
        try {
          const res = await financeApi.getAccountClassifications({
            limit: 1000,
          });
          if (res.data.success) {
            setClassifications(
              res.data.data.map((c: any) => ({
                label: `${c.name} (Level ${c.level})`,
                value: c.id.toString(),
              }))
            );
          }
        } catch (err) {
          console.error("Failed to fetch classifications", err);
        }
      };
      fetchClassifications();
    }
  }, [open]);

  const fields = [
    {
      name: "account_code",
      label: "Account Code",
      type: "text",
      placeholder: "e.g. 1000",
      required: true,
      disabled: !!record, // Account code is usually immutable once created
    },
    {
      name: "account_name",
      label: "Account Name",
      type: "text",
      placeholder: "e.g. Cash in Bank",
      required: true,
    },
    {
      name: "classification_id",
      label: "Classification",
      type: "select",
      options: classifications,
      required: true,
    },
    {
      name: "description",
      label: "Description",
      type: "text",
    },
    {
      name: "currency",
      label: "Currency",
      type: "select",
      options: [
        { label: "LKR - Sri Lankan Rupee", value: "LKR" },
        { label: "USD - US Dollar", value: "USD" },
      ],
      required: true,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
      required: true,
    },
  ];

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        classification_id: parseInt(values.classification_id, 10),
      };

      let res;
      if (record) {
        res = await financeApi.updateChartOfAccount(record.id, payload);
        toast.success("Account updated successfully");
      } else {
        res = await financeApi.createChartOfAccount(payload);
        toast.success("Account created successfully");
      }

      if (res.data.success) {
        onSuccess();
        onOpenChange(false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ERPFormModal
      open={open}
      onOpenChange={onOpenChange}
      title={record ? "Edit Account" : "Create Account"}
      fields={fields}
      initialValues={
        record
          ? {
              account_code: record.account_code,
              account_name: record.account_name,
              classification_id: record.classification_id?.toString(),
              description: record.description || "",
              currency: record.currency || "LKR",
              status: record.status,
            }
          : { status: "active", currency: "LKR" }
      }
      onSubmit={handleSubmit}
      loading={loading}
    />
  );
}
