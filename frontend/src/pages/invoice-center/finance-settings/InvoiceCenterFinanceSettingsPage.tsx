import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Save, RefreshCw } from "lucide-react";
import { useAuth } from "../../../auth/AuthContext";
import PermissionGuard from "../../../auth/PermissionGuard";
import invoiceCenterApi from "../../../api/invoiceCenterApi";
import { FinanceSettingsAccountInput, FinanceSettingsWarningCard } from "../../../components/invoice-center";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Separator } from "../../../components/ui/separator";
import { Skeleton } from "../../../components/ui/skeleton";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { AlertTriangle, Info } from "lucide-react";
import type { InvoiceCenterFinanceSettings, SaveFinanceSettingsPayload } from "../../../types/invoice-center";

const InvoiceCenterFinanceSettingsPage = () => {
  const { activeSoftware, hasPermission, activeBranch } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<InvoiceCenterFinanceSettings | null>(null);
  const [branchId, setBranchId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [form, setForm] = useState<SaveFinanceSettingsPayload>({
    branch_id: null,
    accounts_receivable_account_id: 0,
    sales_revenue_account_id: 0,
    sales_discount_account_id: null,
    output_tax_account_id: null,
    credit_note_adjustment_account_id: 0,
    debit_note_income_account_id: 0,
    cash_account_id: null,
    bank_transfer_account_id: null,
    cheque_clearing_account_id: null,
    card_clearing_account_id: null,
    online_payment_account_id: null,
    other_receipt_account_id: null,
    customer_advance_account_id: null,
  });

  useEffect(() => {
    if (activeSoftware?.software_code === "INVOICE_CENTER") {
      fetchSettings();
    }
  }, [activeSoftware, branchId]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {};
      if (branchId) params.branch_id = branchId;
      const response = await invoiceCenterApi.getInvoiceCenterFinanceSettings(params);
      const res = response as any;
      if (res.data?.success && res.data?.data) {
        const data = res.data.data as InvoiceCenterFinanceSettings;
        setSettings(data);
        setForm({
          branch_id: data.branch_id ?? null,
          accounts_receivable_account_id: data.accounts_receivable_account_id || 0,
          sales_revenue_account_id: data.sales_revenue_account_id || 0,
          sales_discount_account_id: data.sales_discount_account_id ?? null,
          output_tax_account_id: data.output_tax_account_id ?? null,
          credit_note_adjustment_account_id: data.credit_note_adjustment_account_id || 0,
          debit_note_income_account_id: data.debit_note_income_account_id || 0,
          cash_account_id: data.cash_account_id ?? null,
          bank_transfer_account_id: data.bank_transfer_account_id ?? null,
          cheque_clearing_account_id: data.cheque_clearing_account_id ?? null,
          card_clearing_account_id: data.card_clearing_account_id ?? null,
          online_payment_account_id: data.online_payment_account_id ?? null,
          other_receipt_account_id: data.other_receipt_account_id ?? null,
          customer_advance_account_id: data.customer_advance_account_id ?? null,
        });
      }
    } catch {
      // Settings may not exist yet - that's OK
      setSettings(null);
    } finally {
      setLoading(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.accounts_receivable_account_id || form.accounts_receivable_account_id <= 0) {
      newErrors.accounts_receivable_account_id = "Accounts Receivable Account is required";
    }
    if (!form.sales_revenue_account_id || form.sales_revenue_account_id <= 0) {
      newErrors.sales_revenue_account_id = "Sales Revenue Account is required";
    }
    if (!form.credit_note_adjustment_account_id || form.credit_note_adjustment_account_id <= 0) {
      newErrors.credit_note_adjustment_account_id = "Credit Note Adjustment Account is required";
    }
    if (!form.debit_note_income_account_id || form.debit_note_income_account_id <= 0) {
      newErrors.debit_note_income_account_id = "Debit Note Income Account is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      toast.error("Please fix the validation errors before saving.");
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = { ...form };
      if (branchId) payload.branch_id = branchId;
      await invoiceCenterApi.saveInvoiceCenterFinanceSettings(payload);
      toast.success("Finance settings saved successfully.");
      await fetchSettings();
      setErrors({});
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to save finance settings";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof SaveFinanceSettingsPayload, value: number | null) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Build warnings for missing optional accounts
  const getWarnings = () => {
    const warnings: { field: string; message: string }[] = [];
    if (!form.sales_discount_account_id) {
      warnings.push({ field: "Sales Discount Account", message: "Sales invoices with discount cannot be posted to Finance." });
    }
    if (!form.output_tax_account_id) {
      warnings.push({ field: "Output Tax Account", message: "Sales invoices, credit notes, or debit notes with tax cannot be posted to Finance." });
    }
    if (!form.cash_account_id) {
      warnings.push({ field: "Cash Account", message: "Customer receipts using Cash payment method cannot be posted." });
    }
    if (!form.bank_transfer_account_id) {
      warnings.push({ field: "Bank Transfer Account", message: "Customer receipts using Bank Transfer cannot be posted." });
    }
    if (!form.cheque_clearing_account_id) {
      warnings.push({ field: "Cheque Clearing Account", message: "Customer receipts using Cheque cannot be posted." });
    }
    if (!form.card_clearing_account_id) {
      warnings.push({ field: "Card Clearing Account", message: "Customer receipts using Card cannot be posted." });
    }
    if (!form.online_payment_account_id) {
      warnings.push({ field: "Online Payment Account", message: "Customer receipts using Online Payment cannot be posted." });
    }
    if (!form.other_receipt_account_id) {
      warnings.push({ field: "Other Receipt Account", message: "Customer receipts using Other payment methods cannot be posted." });
    }
    if (!form.customer_advance_account_id) {
      warnings.push({ field: "Customer Advance Account", message: "Customer receipts with unallocated amount cannot be posted to Finance." });
    }
    return warnings;
  };

  if (activeSoftware?.software_code !== "INVOICE_CENTER") {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please switch to Invoice Center module to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finance Settings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure account mappings for posting Invoice Center documents to the Finance General Ledger.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchSettings} disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Reload
        </Button>
      </div>

      {/* Section 1: Scope */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Scope</CardTitle>
          <CardDescription className="text-xs">
            Select a branch for branch-specific settings, or leave empty for company-wide defaults.
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4 space-y-3">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">Branch</Label>
            <Input
              type="number"
              min={1}
              placeholder="Leave empty for company-wide settings"
              value={branchId ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                setBranchId(val ? parseInt(val, 10) : null);
              }}
              className="max-w-xs"
            />
            <p className="text-xs text-gray-500">
              <Info className="inline h-3 w-3 mr-1" />
              Branch-specific settings override company-wide settings.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Receivable and Sales Accounts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Receivable and Sales Accounts</CardTitle>
          <CardDescription className="text-xs">
            These accounts are used when sales invoices are posted to Finance.
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4 space-y-5">
          <FinanceSettingsAccountInput
            label="Accounts Receivable Account"
            description="Used when sales invoices, debit notes, credit notes, and customer receipts affect customer balances."
            value={form.accounts_receivable_account_id || null}
            onChange={(v) => updateField("accounts_receivable_account_id", v || 0)}
            required
            error={errors.accounts_receivable_account_id}
          />
          <FinanceSettingsAccountInput
            label="Sales Revenue Account"
            description="Credited when sales invoices are posted to Finance."
            value={form.sales_revenue_account_id || null}
            onChange={(v) => updateField("sales_revenue_account_id", v || 0)}
            required
            error={errors.sales_revenue_account_id}
          />
          <FinanceSettingsAccountInput
            label="Sales Discount Account"
            description="Debited when sales invoice discounts are posted."
            value={form.sales_discount_account_id}
            onChange={(v) => updateField("sales_discount_account_id", v)}
          />
          <FinanceSettingsAccountInput
            label="Output Tax Account"
            description="Credited or debited when tax amounts are posted."
            value={form.output_tax_account_id}
            onChange={(v) => updateField("output_tax_account_id", v)}
          />
        </CardContent>
      </Card>

      {/* Section 3: Adjustment Accounts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Adjustment Accounts</CardTitle>
          <CardDescription className="text-xs">
            These accounts are used when credit notes and debit notes are posted.
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4 space-y-5">
          <FinanceSettingsAccountInput
            label="Credit Note Adjustment Account"
            description="Debited when credit notes are posted."
            value={form.credit_note_adjustment_account_id || null}
            onChange={(v) => updateField("credit_note_adjustment_account_id", v || 0)}
            required
            error={errors.credit_note_adjustment_account_id}
          />
          <FinanceSettingsAccountInput
            label="Debit Note Income Account"
            description="Credited when debit notes are posted."
            value={form.debit_note_income_account_id || null}
            onChange={(v) => updateField("debit_note_income_account_id", v || 0)}
            required
            error={errors.debit_note_income_account_id}
          />
        </CardContent>
      </Card>

      {/* Section 4: Receipt Payment Accounts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Receipt Payment Accounts</CardTitle>
          <CardDescription className="text-xs">
            Map each payment method to a GL account. Required for posting customer receipts.
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4 space-y-5">
          <FinanceSettingsAccountInput
            label="Cash Account"
            description="Debited when customer receipts with Cash payment method are posted."
            value={form.cash_account_id}
            onChange={(v) => updateField("cash_account_id", v)}
          />
          <FinanceSettingsAccountInput
            label="Bank Transfer Account"
            description="Debited when customer receipts with Bank Transfer payment method are posted."
            value={form.bank_transfer_account_id}
            onChange={(v) => updateField("bank_transfer_account_id", v)}
          />
          <FinanceSettingsAccountInput
            label="Cheque Clearing Account"
            description="Debited when customer receipts with Cheque payment method are posted."
            value={form.cheque_clearing_account_id}
            onChange={(v) => updateField("cheque_clearing_account_id", v)}
          />
          <FinanceSettingsAccountInput
            label="Card Clearing Account"
            description="Debited when customer receipts with Card payment method are posted."
            value={form.card_clearing_account_id}
            onChange={(v) => updateField("card_clearing_account_id", v)}
          />
          <FinanceSettingsAccountInput
            label="Online Payment Account"
            description="Debited when customer receipts with Online payment method are posted."
            value={form.online_payment_account_id}
            onChange={(v) => updateField("online_payment_account_id", v)}
          />
          <FinanceSettingsAccountInput
            label="Other Receipt Account"
            description="Debited when customer receipts with Other payment method are posted."
            value={form.other_receipt_account_id}
            onChange={(v) => updateField("other_receipt_account_id", v)}
          />
        </CardContent>
      </Card>

      {/* Section 5: Advance and Unallocated Receipt Account */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Advance and Unallocated Receipt Account</CardTitle>
          <CardDescription className="text-xs">
            Used when a customer receipt has unallocated amount that is not applied to any invoice.
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4 space-y-5">
          <FinanceSettingsAccountInput
            label="Customer Advance Account"
            description="Credited when receipt amount is not allocated to invoices."
            value={form.customer_advance_account_id}
            onChange={(v) => updateField("customer_advance_account_id", v)}
          />
        </CardContent>
      </Card>

      {/* Warnings */}
      <FinanceSettingsWarningCard warnings={getWarnings()} />

      {/* Save Button */}
      <PermissionGuard permission="invoice_center.finance_settings.update">
        <div className="flex justify-end pt-2 pb-8">
          <Button onClick={handleSave} disabled={saving} size="lg">
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Finance Settings"}
          </Button>
        </div>
      </PermissionGuard>
    </div>
  );
};

export default InvoiceCenterFinanceSettingsPage;
