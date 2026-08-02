import { useState, useEffect } from "react";
import ERPFormModal from "components/erp/ERPFormModal";
import { financeApi } from "api/financeApi";
import { toast } from "react-hot-toast";

interface AccountingPeriodFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: any;
  onSuccess: () => void;
}

export default function AccountingPeriodFormModal({
  open,
  onOpenChange,
  record,
  onSuccess,
}: AccountingPeriodFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [financialYears, setFinancialYears] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      // Fetch financial years for the dropdown
      const fetchYears = async () => {
        try {
          // If creating new, we only want active/open years, but let's just fetch all and let the backend validate
          const res = await financeApi.getFinancialYears({ limit: 100 });
          if (res.data.success) {
            setFinancialYears(
              res.data.data.map((y: any) => ({
                label: `${y.year_name} (${y.start_date} to ${y.end_date})`,
                value: y.id.toString(),
              }))
            );
          }
        } catch (err) {
          console.error("Failed to fetch financial years", err);
        }
      };
      fetchYears();
    }
  }, [open]);

  const fields = [
    {
      name: "financial_year_id",
      label: "Financial Year",
      type: "select",
      options: financialYears,
      required: true,
      disabled: !!record, // Cannot change FY once created
    },
    {
      name: "period_name",
      label: "Period Name",
      type: "text",
      placeholder: "e.g. Q1 2024 or January 2024",
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
        financial_year_id: parseInt(values.financial_year_id, 10),
      };

      let res;
      if (record) {
        res = await financeApi.updateAccountingPeriod(record.id, payload);
        toast.success("Accounting period updated successfully");
      } else {
        res = await financeApi.createAccountingPeriod(payload);
        toast.success("Accounting period created successfully");
      }

      if (res.data.success) {
        onSuccess();
        onOpenChange(false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save accounting period");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ERPFormModal
      open={open}
      onOpenChange={onOpenChange}
      title={record ? "Edit Accounting Period" : "Create Accounting Period"}
      fields={fields}
      initialValues={
        record
          ? {
              financial_year_id: record.financial_year_id?.toString(),
              period_name: record.period_name,
              start_date: record.start_date,
              end_date: record.end_date,
              status: record.status,
            }
          : { status: "active" }
      }
      onSubmit={handleSubmit}
      loading={loading}
    />
  );
}
