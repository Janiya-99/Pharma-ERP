import React, { useState, useEffect } from "react";
import ERPFormModal from "components/erp/ERPFormModal";
import { financeApi } from "api/financeApi";
import { toast } from "react-hot-toast";

interface OpeningBalanceFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: any;
  onSuccess: () => void;
}

export default function OpeningBalanceFormModal({
  open,
  onOpenChange,
  record,
  onSuccess,
}: OpeningBalanceFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [financialYears, setFinancialYears] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        try {
          const [fyRes, accRes] = await Promise.all([
            financeApi.getFinancialYears({ limit: 100 }),
            financeApi.getChartOfAccounts({ limit: 1000 }),
          ]);

          if (fyRes.data.success) {
            setFinancialYears(
              fyRes.data.data.map((y: any) => ({
                label: `${y.year_name} (${y.start_date} to ${y.end_date})`,
                value: y.id.toString(),
              }))
            );
          }

          if (accRes.data.success) {
            setAccounts(
              accRes.data.data.map((a: any) => ({
                label: `${a.account_code} - ${a.account_name}`,
                value: a.id.toString(),
              }))
            );
          }
        } catch (err) {
          console.error("Failed to fetch data for opening balances", err);
        }
      };
      fetchData();
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
      name: "account_id",
      label: "Account",
      type: "select",
      options: accounts,
      required: true,
      disabled: !!record, // Cannot change Account once created
    },
    {
      name: "debit_balance",
      label: "Debit Balance",
      type: "number",
      required: true,
    },
    {
      name: "credit_balance",
      label: "Credit Balance",
      type: "number",
      required: true,
    },
    {
      name: "base_currency",
      label: "Currency",
      type: "select",
      options: [
        { label: "LKR - Sri Lankan Rupee", value: "LKR" },
        { label: "USD - US Dollar", value: "USD" },
      ],
      required: true,
    },
    {
      name: "exchange_rate",
      label: "Exchange Rate",
      type: "number",
      required: true,
    },
  ];

  const handleSubmit = async (values: any) => {
    const debit = parseFloat(values.debit_balance || 0);
    const credit = parseFloat(values.credit_balance || 0);

    if (debit > 0 && credit > 0) {
      toast.error("An account cannot have both debit and credit balances simultaneously");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...values,
        financial_year_id: parseInt(values.financial_year_id, 10),
        account_id: parseInt(values.account_id, 10),
        debit_balance: debit,
        credit_balance: credit,
        exchange_rate: parseFloat(values.exchange_rate || 1),
      };

      let res;
      if (record) {
        res = await financeApi.updateOpeningBalance(record.id, payload);
        toast.success("Opening balance updated successfully");
      } else {
        res = await financeApi.createOpeningBalance(payload);
        toast.success("Opening balance created successfully");
      }

      if (res.data.success) {
        onSuccess();
        onOpenChange(false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save opening balance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ERPFormModal
      open={open}
      onOpenChange={onOpenChange}
      title={record ? "Edit Opening Balance" : "Add Opening Balance"}
      fields={fields}
      initialValues={
        record
          ? {
              financial_year_id: record.financial_year_id?.toString(),
              account_id: record.account_id?.toString(),
              debit_balance: record.debit_balance?.toString(),
              credit_balance: record.credit_balance?.toString(),
              base_currency: record.base_currency || "LKR",
              exchange_rate: record.exchange_rate?.toString() || "1",
            }
          : { debit_balance: "0", credit_balance: "0", base_currency: "LKR", exchange_rate: "1" }
      }
      onSubmit={handleSubmit}
      loading={loading}
    />
  );
}
