import React, { useState, useEffect } from "react";
import ERPFormModal from "components/erp/ERPFormModal";
import { financeApi } from "api/financeApi";
import { toast } from "react-hot-toast";

interface AccountClassificationFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: any;
  onSuccess: () => void;
}

export default function AccountClassificationFormModal({
  open,
  onOpenChange,
  record,
  onSuccess,
}: AccountClassificationFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [classifications, setClassifications] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      const fetchClassifications = async () => {
        try {
          const res = await financeApi.getAccountClassifications({});
          if (res.data.success) {
            // Only Level 1 and 2 can be parents
            const validParents = res.data.data.filter((c: any) => c.level < 3 && c.id !== record?.id);
            setClassifications(
              validParents.map((c: any) => ({
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
  }, [open, record]);

  const fields = [
    {
      name: "type",
      label: "Type",
      type: "select",
      options: [
        { label: "Balance Sheet", value: "Balance Sheet" },
        { label: "Profit & Loss", value: "Profit & Loss" },
      ],
      required: true,
    },
    {
      name: "name",
      label: "Name",
      type: "text",
      required: true,
    },
    {
      name: "level",
      label: "Level",
      type: "select",
      options: [
        { label: "Level 1 (Main Category)", value: "1" },
        { label: "Level 2 (Sub Category)", value: "2" },
        { label: "Level 3 (Category)", value: "3" },
      ],
      required: true,
    },
    {
      name: "parent_id",
      label: "Parent Classification",
      type: "select",
      options: classifications,
      // Logic for required parent is handled in backend and can be dynamic here,
      // but to keep ERPFormModal simple, we make it optional in UI 
      // and backend will strictly validate.
    },
    {
      name: "normal_balance",
      label: "Normal Balance",
      type: "select",
      options: [
        { label: "Debit", value: "Debit" },
        { label: "Credit", value: "Credit" },
      ],
      required: true,
    },
    {
      name: "report_section",
      label: "Report Section",
      type: "text",
    },
    {
      name: "sort_order",
      label: "Sort Order",
      type: "number",
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
    const level = parseInt(values.level, 10);
    const parentId = values.parent_id ? parseInt(values.parent_id, 10) : null;

    if (level === 1 && parentId) {
      toast.error("Level 1 classifications cannot have a parent");
      return;
    }
    if ((level === 2 || level === 3) && !parentId) {
      toast.error("Level 2 and 3 classifications must have a parent");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...values,
        level: level,
        parent_id: parentId,
        sort_order: values.sort_order ? parseInt(values.sort_order, 10) : 0,
      };

      let res;
      if (record) {
        res = await financeApi.updateAccountClassification(record.id, payload);
        toast.success("Classification updated successfully");
      } else {
        res = await financeApi.createAccountClassification(payload);
        toast.success("Classification created successfully");
      }

      if (res.data.success) {
        onSuccess();
        onOpenChange(false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save classification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ERPFormModal
      open={open}
      onOpenChange={onOpenChange}
      title={record ? "Edit Classification" : "Create Classification"}
      fields={fields}
      initialValues={
        record
          ? {
              type: record.type,
              name: record.name,
              level: record.level?.toString(),
              parent_id: record.parent_id?.toString() || "",
              normal_balance: record.normal_balance,
              report_section: record.report_section || "",
              sort_order: record.sort_order || 0,
              status: record.status,
            }
          : { status: "active", level: "1", sort_order: 0 }
      }
      onSubmit={handleSubmit}
      loading={loading}
    />
  );
}
