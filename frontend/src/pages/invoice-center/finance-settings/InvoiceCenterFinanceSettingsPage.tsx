import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  GitBranch,
  RefreshCw,
  Save,
  TestTube2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../../auth/AuthContext";
import PermissionGuard from "../../../auth/PermissionGuard";
import invoiceCenterApi from "../../../api/invoiceCenterApi";
import {
  FinanceSettingsAccountInput,
  FinanceSettingsWarningCard,
} from "../../../components/invoice-center";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Skeleton } from "../../../components/ui/skeleton";
import type {
  InvoiceCenterFinanceSettings,
  SaveFinanceSettingsPayload,
} from "../../../types/invoice-center";

const emptyForm: SaveFinanceSettingsPayload = {
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
};

const requiredKeys: (keyof SaveFinanceSettingsPayload)[] = [
  "accounts_receivable_account_id",
  "sales_revenue_account_id",
  "credit_note_adjustment_account_id",
  "debit_note_income_account_id",
];

const glPreview = {
  sales: [
    "Dr Accounts Receivable",
    "Dr Sales Discount",
    "Dr Cost of Goods Sold",
    "Cr Sales Revenue",
    "Cr Output Tax",
    "Cr Inventory Asset",
  ],
  receipt: [
    "Dr Cash / Bank / Payment Method Account",
    "Cr Accounts Receivable",
    "Cr Customer Advance if unallocated",
  ],
  credit: [
    "Dr Credit Note Adjustment",
    "Dr Output Tax",
    "Cr Accounts Receivable",
  ],
  debit: ["Dr Accounts Receivable", "Cr Debit Note Income", "Cr Output Tax"],
};

const InvoiceCenterFinanceSettingsPage = () => {
  const { activeSoftware } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<InvoiceCenterFinanceSettings | null>(
    null
  );
  const [branchId, setBranchId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<SaveFinanceSettingsPayload>(emptyForm);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {};
      if (branchId) params.branch_id = branchId;
      const response = await invoiceCenterApi.getInvoiceCenterFinanceSettings(
        params
      );
      const data = response.data?.data as
        | InvoiceCenterFinanceSettings
        | undefined;
      if (data) {
        setSettings(data);
        setForm({
          branch_id: data.branch_id ?? null,
          accounts_receivable_account_id:
            data.accounts_receivable_account_id || 0,
          sales_revenue_account_id: data.sales_revenue_account_id || 0,
          sales_discount_account_id: data.sales_discount_account_id ?? null,
          output_tax_account_id: data.output_tax_account_id ?? null,
          credit_note_adjustment_account_id:
            data.credit_note_adjustment_account_id || 0,
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
      setSettings(null);
      setForm(emptyForm);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSoftware?.software_code === "INVOICE_CENTER")
      void fetchSettings();
  }, [activeSoftware, branchId]);

  const updateField = (
    field: keyof SaveFinanceSettingsPayload,
    value: number | null
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const warnings = useMemo(() => {
    const next: { field: string; message: string }[] = [];
    if (!form.sales_discount_account_id)
      next.push({
        field: "Sales Discount Account",
        message: "Invoices with discounts cannot be finance posted.",
      });
    if (!form.output_tax_account_id)
      next.push({
        field: "Output Tax Account",
        message: "Documents with tax cannot be finance posted.",
      });
    if (!form.bank_transfer_account_id)
      next.push({
        field: "Bank Transfer Account",
        message: "Bank transfer receipts cannot be posted.",
      });
    if (!form.cash_account_id)
      next.push({
        field: "Cash Account",
        message: "Cash receipts cannot be posted.",
      });
    if (!form.customer_advance_account_id)
      next.push({
        field: "Customer Advance Account",
        message: "Unallocated receipts cannot be posted as advances.",
      });
    return next;
  }, [form]);

  const readiness = requiredKeys.filter(
    (key) => Number(form[key] || 0) > 0
  ).length;
  const isReady = readiness === requiredKeys.length;

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.accounts_receivable_account_id)
      nextErrors.accounts_receivable_account_id =
        "Accounts Receivable Account is required";
    if (!form.sales_revenue_account_id)
      nextErrors.sales_revenue_account_id = "Sales Revenue Account is required";
    if (!form.credit_note_adjustment_account_id)
      nextErrors.credit_note_adjustment_account_id =
        "Credit Note Adjustment Account is required";
    if (!form.debit_note_income_account_id)
      nextErrors.debit_note_income_account_id =
        "Debit Note Income Account is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const testConfiguration = () => {
    if (!validate()) {
      toast.error("Configuration has missing required accounts.");
      return;
    }
    if (warnings.length > 0) {
      toast.warning(
        "Configuration works for core posting but has optional gaps."
      );
      return;
    }
    toast.success("Finance posting configuration is ready.");
  };

  const handleSave = async () => {
    if (!validate()) {
      toast.error("Please fix the required account mappings.");
      return;
    }
    setSaving(true);
    try {
      await invoiceCenterApi.saveInvoiceCenterFinanceSettings({
        ...form,
        branch_id: branchId,
      });
      toast.success("Finance settings saved successfully.");
      await fetchSettings();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to save finance settings"
      );
    } finally {
      setSaving(false);
    }
  };

  if (activeSoftware?.software_code !== "INVOICE_CENTER") {
    return (
      <div className="flex h-64 items-center justify-center">
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
      <div className="page-content space-y-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="page-content space-y-5 pb-32">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#111827]">
            Finance Settings
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Guided account mapping for Invoice Center finance posting. Stock
            movement stays operational; GL posting happens here.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={fetchSettings}>
            <RefreshCw className="h-4 w-4" />
            Reload
          </Button>
          <Button variant="outline" onClick={testConfiguration}>
            <TestTube2 className="h-4 w-4" />
            Test Configuration
          </Button>
          <PermissionGuard permission="invoice_center.finance_settings.update">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#002137] text-white hover:bg-[#003452]"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </PermissionGuard>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatusCard title="Finance Module Status" status="Connected" ready />
        <StatusCard
          title="Chart of Accounts Status"
          status={settings ? "Connected" : "Not Configured"}
          ready={Boolean(settings)}
        />
        <StatusCard
          title="Invoice Posting Status"
          status={isReady ? "Ready" : "Missing Accounts"}
          ready={isReady}
        />
        <StatusCard
          title="Receipt Posting Status"
          status={
            form.cash_account_id || form.bank_transfer_account_id
              ? "Ready"
              : "Missing Accounts"
          }
          ready={Boolean(form.cash_account_id || form.bank_transfer_account_id)}
        />
        <StatusCard
          title="Credit Note Posting Status"
          status={
            form.credit_note_adjustment_account_id
              ? "Ready"
              : "Missing Accounts"
          }
          ready={Boolean(form.credit_note_adjustment_account_id)}
        />
        <StatusCard
          title="Debit Note Posting Status"
          status={
            form.debit_note_income_account_id ? "Ready" : "Missing Accounts"
          }
          ready={Boolean(form.debit_note_income_account_id)}
        />
      </div>

      <Card className="rounded-2xl border-slate-200 bg-white/80 shadow-sm">
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-[280px_1fr]">
            <div className="space-y-2">
              <Label>Branch Scope</Label>
              <Input
                type="number"
                min={1}
                placeholder="Company-wide"
                value={branchId ?? ""}
                onChange={(event) =>
                  setBranchId(
                    event.target.value ? Number(event.target.value) : null
                  )
                }
              />
              <p className="text-xs text-[#6B7280]">
                Empty branch means company-wide. Branch-specific settings
                override company-wide settings.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#111827]">
                <GitBranch className="h-4 w-4 text-[#002137]" />
                Posting Flow Preview
              </div>
              <p className="mt-2 text-sm text-[#6B7280]">
                Sales Invoice operational posting reduces inventory stock.
                Finance posting creates balanced GL entries and does not alter
                stock, batches, or product quantities.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <MappingSection
        title="Sales Invoice Posting"
        description="Used when Sales Invoice is finance posted."
        preview={glPreview.sales}
      >
        <FinanceSettingsAccountInput
          label="Accounts Receivable Account"
          description="Debited for customer balances."
          value={form.accounts_receivable_account_id || null}
          onChange={(value) =>
            updateField("accounts_receivable_account_id", value || 0)
          }
          required
          error={errors.accounts_receivable_account_id}
        />
        <FinanceSettingsAccountInput
          label="Sales Revenue Account"
          description="Credited for invoice revenue."
          value={form.sales_revenue_account_id || null}
          onChange={(value) =>
            updateField("sales_revenue_account_id", value || 0)
          }
          required
          error={errors.sales_revenue_account_id}
        />
        <FinanceSettingsAccountInput
          label="Sales Discount Account"
          description="Debited for invoice discounts."
          value={form.sales_discount_account_id}
          onChange={(value) => updateField("sales_discount_account_id", value)}
        />
        <FinanceSettingsAccountInput
          label="Output Tax Account"
          description="Credited or debited for tax."
          value={form.output_tax_account_id}
          onChange={(value) => updateField("output_tax_account_id", value)}
        />
        <PreparedAccount label="Cost of Goods Sold Account" />
        <PreparedAccount label="Inventory Asset Account" />
      </MappingSection>

      <MappingSection
        title="Customer Receipt Posting"
        description="Maps each payment method to a GL account."
        preview={glPreview.receipt}
      >
        <FinanceSettingsAccountInput
          label="Cash Account"
          description="Debited for cash receipts."
          value={form.cash_account_id}
          onChange={(value) => updateField("cash_account_id", value)}
        />
        <FinanceSettingsAccountInput
          label="Bank Transfer Account"
          description="Debited for bank transfer receipts."
          value={form.bank_transfer_account_id}
          onChange={(value) => updateField("bank_transfer_account_id", value)}
        />
        <FinanceSettingsAccountInput
          label="Cheque Clearing Account"
          description="Debited for cheque receipts."
          value={form.cheque_clearing_account_id}
          onChange={(value) => updateField("cheque_clearing_account_id", value)}
        />
        <FinanceSettingsAccountInput
          label="Card Clearing Account"
          description="Debited for card receipts."
          value={form.card_clearing_account_id}
          onChange={(value) => updateField("card_clearing_account_id", value)}
        />
        <FinanceSettingsAccountInput
          label="Online Payment Account"
          description="Debited for online receipts."
          value={form.online_payment_account_id}
          onChange={(value) => updateField("online_payment_account_id", value)}
        />
        <FinanceSettingsAccountInput
          label="Other Receipt Account"
          description="Debited for other payment methods."
          value={form.other_receipt_account_id}
          onChange={(value) => updateField("other_receipt_account_id", value)}
        />
        <FinanceSettingsAccountInput
          label="Customer Advance Account"
          description="Credited for unallocated receipt amounts."
          value={form.customer_advance_account_id}
          onChange={(value) =>
            updateField("customer_advance_account_id", value)
          }
        />
      </MappingSection>

      <MappingSection
        title="Credit Note Posting"
        description="Used when Credit Note is finance posted."
        preview={glPreview.credit}
      >
        <FinanceSettingsAccountInput
          label="Credit Note Adjustment Account"
          description="Debited for credit note adjustment."
          value={form.credit_note_adjustment_account_id || null}
          onChange={(value) =>
            updateField("credit_note_adjustment_account_id", value || 0)
          }
          required
          error={errors.credit_note_adjustment_account_id}
        />
        <FinanceSettingsAccountInput
          label="Output Tax Account"
          description="Debited when credit note reverses tax."
          value={form.output_tax_account_id}
          onChange={(value) => updateField("output_tax_account_id", value)}
        />
        <FinanceSettingsAccountInput
          label="Accounts Receivable Account"
          description="Credited to reduce customer balance."
          value={form.accounts_receivable_account_id || null}
          onChange={(value) =>
            updateField("accounts_receivable_account_id", value || 0)
          }
          required
        />
      </MappingSection>

      <MappingSection
        title="Debit Note Posting"
        description="Used when Debit Note is finance posted."
        preview={glPreview.debit}
      >
        <FinanceSettingsAccountInput
          label="Debit Note Income Account"
          description="Credited for debit note income."
          value={form.debit_note_income_account_id || null}
          onChange={(value) =>
            updateField("debit_note_income_account_id", value || 0)
          }
          required
          error={errors.debit_note_income_account_id}
        />
        <FinanceSettingsAccountInput
          label="Output Tax Account"
          description="Credited for debit note tax."
          value={form.output_tax_account_id}
          onChange={(value) => updateField("output_tax_account_id", value)}
        />
        <FinanceSettingsAccountInput
          label="Accounts Receivable Account"
          description="Debited to increase customer balance."
          value={form.accounts_receivable_account_id || null}
          onChange={(value) =>
            updateField("accounts_receivable_account_id", value || 0)
          }
          required
        />
      </MappingSection>

      <MappingSection
        title="Inventory / COGS Posting"
        description="Prepared for sales invoice cost posting, stock adjustment posting, and expiry disposal posting later."
        preview={[
          "Dr Cost of Goods Sold",
          "Cr Inventory Asset",
          "Dr Stock Adjustment Loss",
          "Cr Stock Adjustment Gain",
        ]}
      >
        <PreparedAccount label="Inventory Asset Account" />
        <PreparedAccount label="Cost of Goods Sold Account" />
        <PreparedAccount label="Stock Adjustment Gain Account" />
        <PreparedAccount label="Stock Adjustment Loss Account" />
        <PreparedAccount label="Expired Stock Loss Account" />
        <PreparedAccount label="Damaged Stock Loss Account" />
      </MappingSection>

      <FinanceSettingsWarningCard warnings={warnings} />
    </div>
  );
};

const StatusCard = ({
  title,
  status,
  ready,
}: {
  title: string;
  status: string;
  ready: boolean;
}) => (
  <Card className="rounded-2xl border-slate-200 bg-white/80 shadow-sm">
    <CardContent className="p-4">
      <div
        className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${
          ready ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
        }`}
      >
        {ready ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : (
          <AlertTriangle className="h-5 w-5" />
        )}
      </div>
      <p className="text-xs font-medium text-[#6B7280]">{title}</p>
      <p className="mt-1 text-sm font-semibold text-[#111827]">{status}</p>
    </CardContent>
  </Card>
);

const MappingSection = ({
  title,
  description,
  preview,
  children,
}: {
  title: string;
  description: string;
  preview: string[];
  children: ReactNode;
}) => (
  <Card className="rounded-2xl border-slate-200 bg-white/80 shadow-sm">
    <CardHeader>
      <CardTitle className="text-lg font-semibold text-[#111827]">
        {title}
      </CardTitle>
      <p className="text-sm text-[#6B7280]">{description}</p>
    </CardHeader>
    <CardContent className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-[#111827]">GL Preview</p>
        <div className="mt-3 space-y-2">
          {preview.map((line) => (
            <div
              key={line}
              className="rounded-lg bg-white px-3 py-2 text-sm text-[#1F2937]"
            >
              {line}
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

const PreparedAccount = ({ label }: { label: string }) => (
  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
    <Label className="text-sm font-medium text-[#1F2937]">{label}</Label>
    <p className="mt-1 text-xs text-[#6B7280]">
      Prepared for Inventory/COGS posting support. Current backend settings do
      not persist this account yet.
    </p>
    <Badge variant="outline" className="mt-3">
      Prepared
    </Badge>
  </div>
);

export default InvoiceCenterFinanceSettingsPage;
