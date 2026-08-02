import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useParams, useHistory } from "react-router-dom";
import { financeApi } from "../../../api/financeApi";
import { getBranches } from "../../../api/controlApi";
import BankAccountSelect, {
  type BankAccountOption,
} from "../../../components/finance/BankAccountSelect";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import { toast } from "react-hot-toast";

type BranchOption = {
  id: number;
  branch_name: string;
};

type BankTransactionForm = {
  branch_id: string;
  bank_account_id: string;
  transaction_date: string;
  value_date: string;
  transaction_type: string;
  reference_number: string;
  description: string;
  debit_amount: number;
  credit_amount: number;
};

const formatMoney = (amount?: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
  }).format(Number(amount || 0));

export default function BankTransactionFormPage() {
  const { id } = useParams();
  const history = useHistory();
  const isEdit = !!id;

  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [selectedBankAccount, setSelectedBankAccount] =
    useState<BankAccountOption | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<BankTransactionForm>({
    branch_id: "",
    bank_account_id: "",
    transaction_date: new Date().toISOString().split("T")[0],
    value_date: "",
    transaction_type: "deposit",
    reference_number: "",
    description: "",
    debit_amount: 0,
    credit_amount: 0,
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const branchesRes = await getBranches({ limit: 100 });
      setBranches((Array.isArray(branchesRes?.data?.data) ? branchesRes.data.data : Array.isArray(branchesRes?.data) ? branchesRes.data : Array.isArray(branchesRes) ? branchesRes : []));

      if (isEdit) {
        const res = await financeApi.getBankTransactionById(id);
        if (res.data?.success) {
          const tx = res.data.data;
          setSelectedBankAccount(tx.bank_account || null);
          setFormData({
            branch_id: tx.branch_id?.toString() || "",
            bank_account_id: tx.bank_account_id?.toString() || "",
            transaction_date: tx.transaction_date
              ? tx.transaction_date.split("T")[0]
              : "",
            value_date: tx.value_date ? tx.value_date.split("T")[0] : "",
            transaction_type: tx.transaction_type || "deposit",
            reference_number: tx.reference_number || "",
            description: tx.description || "",
            debit_amount: tx.debit_amount || 0,
            credit_amount: tx.credit_amount || 0,
          });
        }
      }
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const setField = <K extends keyof BankTransactionForm>(
    key: K,
    value: BankTransactionForm[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.bank_account_id && !isEdit) {
      toast.error("Please select a bank account");
      return;
    }
    if (formData.debit_amount === 0 && formData.credit_amount === 0) {
      toast.error("Either Debit or Credit amount must be greater than 0");
      return;
    }
    if (formData.debit_amount > 0 && formData.credit_amount > 0) {
      toast.error(
        "A single transaction cannot have both Debit and Credit amounts"
      );
      return;
    }
    if (
      formData.transaction_type.includes("transfer") &&
      !selectedBankAccount
    ) {
      toast.error("Select a bank account with bank details for the transfer");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        branch_id: formData.branch_id
          ? parseInt(formData.branch_id)
          : undefined,
        bank_account_id: parseInt(formData.bank_account_id),
        value_date: formData.value_date ? formData.value_date : undefined,
      };

      if (isEdit) {
        await financeApi.updateBankTransaction(id, payload);
        toast.success("Transaction updated successfully");
      } else {
        await financeApi.createBankTransaction(payload);
        toast.success("Transaction created successfully");
      }
      history.push("/admin/finance/bank-transactions");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to save transaction"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="page-content space-y-6 pb-32">
      <Card className="rounded-2xl border-slate-200 bg-white/80 shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-semibold text-[#111827]">
                {isEdit
                  ? "Edit Bank Transaction"
                  : "Create Manual Bank Transaction"}
              </CardTitle>
              <p className="mt-1 text-sm text-[#6B7280]">
                Record bank deposits, withdrawals, charges, interest, and
                transfers against a selected bank account.
              </p>
            </div>
            <Button
              type="button"
              onClick={() => history.push("/admin/finance/bank-transactions")}
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label>Bank Account *</Label>
                <BankAccountSelect
                  value={formData.bank_account_id}
                  onChange={(val) => setField("bank_account_id", val)}
                  onAccountChange={setSelectedBankAccount}
                  disabled={isEdit}
                  className="mt-2 w-full border-slate-200 bg-white"
                />
                {isEdit && (
                  <p className="mt-1 text-xs text-[#6B7280]">
                    Bank account cannot be changed.
                  </p>
                )}
                {selectedBankAccount && (
                  <div className="mt-3 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                    <Detail
                      label="Bank"
                      value={selectedBankAccount.bank_name}
                    />
                    <Detail
                      label="Account"
                      value={`${selectedBankAccount.account_name} / ${selectedBankAccount.account_number}`}
                    />
                    <Detail
                      label="Branch"
                      value={selectedBankAccount.bank_branch_name || "-"}
                    />
                    <Detail
                      label="Balance"
                      value={formatMoney(selectedBankAccount.current_balance)}
                    />
                    <Detail
                      label="Bank Code"
                      value={selectedBankAccount.bank_code || "-"}
                    />
                    <Detail
                      label="Branch Code"
                      value={selectedBankAccount.branch_code || "-"}
                    />
                    <Detail
                      label="SWIFT"
                      value={selectedBankAccount.swift_code || "-"}
                    />
                  </div>
                )}
              </div>

              <div>
                <Label>Branch</Label>
                <Select
                  value={formData.branch_id || "none"}
                  onValueChange={(value) =>
                    setField("branch_id", value === "none" ? "" : value)
                  }
                >
                  <SelectTrigger className="mt-2 w-full border-slate-200 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Company Level</SelectItem>
                    {branches.map((b) => (
                      <SelectItem key={b.id} value={String(b.id)}>
                        {b.branch_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Transaction Type *</Label>
                <Select
                  value={formData.transaction_type}
                  onValueChange={(value) => setField("transaction_type", value)}
                  disabled={isEdit}
                >
                  <SelectTrigger className="mt-2 w-full border-slate-200 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deposit">Deposit</SelectItem>
                    <SelectItem value="withdrawal">Withdrawal</SelectItem>
                    <SelectItem value="bank_charge">Bank Charge</SelectItem>
                    <SelectItem value="interest_income">
                      Interest Income
                    </SelectItem>
                    <SelectItem value="transfer_in">Transfer In</SelectItem>
                    <SelectItem value="transfer_out">Transfer Out</SelectItem>
                    <SelectItem value="adjustment">Adjustment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Transaction Date *</Label>
                <Input
                  type="date"
                  value={formData.transaction_date}
                  onChange={(event) =>
                    setField("transaction_date", event.target.value)
                  }
                  required
                  className="mt-2 border-slate-200 bg-white"
                 placeholder="Enter value" />
              </div>

              <div>
                <Label>Value Date</Label>
                <Input
                  type="date"
                  value={formData.value_date}
                  onChange={(event) =>
                    setField("value_date", event.target.value)
                  }
                  className="mt-2 border-slate-200 bg-white"
                 placeholder="Enter value" />
              </div>

              <div>
                <Label>Reference Number</Label>
                <Input
                  value={formData.reference_number}
                  onChange={(event) =>
                    setField("reference_number", event.target.value)
                  }
                  className="mt-2 border-slate-200 bg-white"
                  placeholder="E.g., Chq No, Tx ID"
                />
              </div>

              <div className="md:col-span-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(event) =>
                    setField("description", event.target.value)
                  }
                  rows={2}
                  className="mt-2 border-slate-200 bg-white"
                 placeholder="Enter text..." />
              </div>

              <div>
                <Label>Debit Amount (In)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.debit_amount}
                  onChange={(event) =>
                    setField(
                      "debit_amount",
                      Number.parseFloat(event.target.value) || 0
                    )
                  }
                  className="mt-2 border-slate-200 bg-white"
                  disabled={formData.credit_amount > 0}
                 placeholder="0.00" />
              </div>

              <div>
                <Label>Credit Amount (Out)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.credit_amount}
                  onChange={(event) =>
                    setField(
                      "credit_amount",
                      Number.parseFloat(event.target.value) || 0
                    )
                  }
                  className="mt-2 border-slate-200 bg-white"
                  disabled={formData.debit_amount > 0}
                 placeholder="0.00" />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-6">
              <Button
                type="submit"
                disabled={saving}
                className="bg-[#002137] text-white hover:bg-[#003452]"
              >
                {saving
                  ? "Saving..."
                  : isEdit
                  ? "Update Transaction"
                  : "Save Transaction"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs font-medium uppercase tracking-wide text-[#6B7280]">
      {label}
    </p>
    <p className="mt-1 truncate text-sm font-semibold text-[#1F2937]">
      {value}
    </p>
  </div>
);
