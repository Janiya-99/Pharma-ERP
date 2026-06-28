import React, { useState, useEffect } from "react";
import ERPFormModal from "components/erp/ERPFormModal";
import { financeApi } from "api/financeApi";
import { toast } from "react-hot-toast";

interface FinancialYearFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: any;
  onSuccess: () => void;
}

export default function FinancialYearFormModal({
  open,
  onOpenChange,
  record,
  onSuccess,
}: FinancialYearFormModalProps) {
  const [loading, setLoading] = useState(false);

  const fields = [
    {
      name: "year_name",
      label: "Year Name",
      type: "text",
      placeholder: "e.g. FY 2023-2024",
      required: true,
    },
    {
      name: "start_date",
      label: "Start Date",
      type: "date",
      required: true,
    },
    {
      name: "end_date",
      label: "End Date",
      type: "date",
      required: true,
    },
    {
      name: "is_active",
      label: "Active Financial Year",
      type: "select",
      options: [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" },
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
    // Validate dates
    if (new Date(values.start_date) >= new Date(values.end_date)) {
      toast.error("Start Date must be before End Date");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...values,
        is_active: values.is_active === "true" || values.is_active === true,
      };

      let res;
      if (record) {
        res = await financeApi.updateFinancialYear(record.id, payload);
        toast.success("Financial year updated successfully");
      } else {
        res = await financeApi.createFinancialYear(payload);
        toast.success("Financial year created successfully");
      }

      if (res.data.success) {
        onSuccess();
        onOpenChange(false);
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to save financial year"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ERPFormModal
      open={open}
      onOpenChange={onOpenChange}
      title={record ? "Edit Financial Year" : "Create Financial Year"}
      fields={fields}
      initialValues={
        record
          ? {
              year_name: record.year_name,
              start_date: record.start_date,
              end_date: record.end_date,
              is_active: record.is_active ? "true" : "false",
              status: record.status,
            }
          : { status: "active", is_active: "false" }
      }
      onSubmit={handleSubmit}
      loading={loading}
    />
  );
}
