import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertCircle, Edit, Loader2, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";
import { useAuth } from "../../../auth/AuthContext";
import { financeApi } from "../../../api/financeApi";
import { getBranches } from "../../../api/controlApi";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import ERPConfirmDialog from "../../../components/erp/ERPConfirmDialog";

type SourceName =
  | "branches"
  | "accounts"
  | "financialYears"
  | "accountingPeriods"
  | "bankAccounts"
  | "fixedAssetCategories"
  | "fixedAssets";

type FieldType = "text" | "number" | "date" | "select" | "textarea" | "checkbox" | "json";

export type QuickField = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  table?: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
  source?: SourceName;
  defaultValue?: unknown;
};

type QuickResourceConfig = {
  eyebrow: string;
  title: string;
  description: string;
  createLabel: string;
  listApi: (params: Record<string, unknown>) => Promise<any>;
  createApi: (payload: Record<string, unknown>) => Promise<any>;
  updateApi?: (id: string | number, payload: Record<string, unknown>) => Promise<any>;
  deleteApi?: (id: string | number) => Promise<any>;
  deactivateApi?: (id: string | number, payload: Record<string, unknown>) => Promise<any>;
  fields: QuickField[];
  searchPlaceholder?: string;
  statusFilter?: boolean;
};

const noneValue = "__none__";

const getErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message || error?.response?.data?.error || error?.message || fallback;

const labelize = (value: unknown) =>
  String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());

const unwrapRows = (response: any) => response?.data?.data || response?.data || [];

const normalizeRows = (value: any) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.data?.data)) return value.data.data;
  return [];
};

const optionLabel = (source: SourceName, row: any) => {
  switch (source) {
    case "branches":
      return `${row.branch_code || row.code || row.id} - ${row.branch_name || row.name || "Branch"}`;
    case "accounts":
      return `${row.account_code || row.id} - ${row.account_name || "Account"}`;
    case "financialYears":
      return row.year_name || row.name || String(row.id);
    case "accountingPeriods":
      return row.period_name || row.name || String(row.id);
    case "bankAccounts":
      return `${row.bank_name || "Bank"} - ${row.account_name || row.account_number || row.id}`;
    case "fixedAssetCategories":
      return `${row.category_code || row.id} - ${row.category_name || "Category"}`;
    case "fixedAssets":
      return `${row.asset_code || row.id} - ${row.asset_name || "Asset"}`;
    default:
      return String(row.id);
  }
};

const makeEmptyForm = (fields: QuickField[], activeBranchId?: string | number) => {
  const form: Record<string, any> = {};
  fields.forEach((field) => {
    if (field.defaultValue !== undefined) {
      form[field.name] = field.type === "json" ? JSON.stringify(field.defaultValue, null, 2) : field.defaultValue;
    } else if (field.type === "checkbox") {
      form[field.name] = false;
    } else if (field.type === "json") {
      form[field.name] = "[]";
    } else {
      form[field.name] = field.name === "branch_id" && activeBranchId ? String(activeBranchId) : "";
    }
  });
  return form;
};

export function FinanceQuickResourcePage({ config }: { config: QuickResourceConfig }) {
  const { company, activeBranch, user } = useAuth();
  const companyId = company?.id || company?.company_id;
  const activeBranchId = activeBranch?.id || activeBranch?.branch_id || activeBranch?.branch?.id || "";

  const [rows, setRows] = useState<any[]>([]);
  const [refs, setRefs] = useState<Record<SourceName, any[]>>({} as Record<SourceName, any[]>);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [rowToDelete, setRowToDelete] = useState<any | null>(null);
  const [form, setForm] = useState<Record<string, any>>(() => makeEmptyForm(config.fields, activeBranchId));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filters, setFilters] = useState({ search: "", status: "all" });

  const tableFields = useMemo(() => config.fields.filter((field) => field.table), [config.fields]);

  const fetchRows = async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await config.listApi({
        page: 1,
        limit: 100,
        company_id: companyId,
        search: filters.search,
        status: config.statusFilter && filters.status !== "all" ? filters.status : "",
      });
      setRows(unwrapRows(res));
    } catch (error) {
      toast.error(getErrorMessage(error, `Failed to load ${config.title}`));
    } finally {
      setLoading(false);
    }
  };

  const fetchReferences = async () => {
    const needed = Array.from(new Set(config.fields.map((field) => field.source).filter(Boolean))) as SourceName[];
    if (!companyId || needed.length === 0) return;

    const loaded: Partial<Record<SourceName, any[]>> = {};
    await Promise.all(
      needed.map(async (source) => {
        try {
          if (source === "branches") loaded[source] = normalizeRows(await getBranches({ limit: 500, status: "active" }));
          if (source === "accounts") loaded[source] = unwrapRows(await financeApi.getChartOfAccounts({ limit: 1000, status: "active", company_id: companyId }));
          if (source === "financialYears") loaded[source] = unwrapRows(await financeApi.getFinancialYears({ limit: 100, status: "active", company_id: companyId }));
          if (source === "accountingPeriods") loaded[source] = unwrapRows(await financeApi.getAccountingPeriods({ limit: 200, status: "open", company_id: companyId }));
          if (source === "bankAccounts") loaded[source] = unwrapRows(await financeApi.getBankAccounts({ limit: 500, status: "active", company_id: companyId }));
          if (source === "fixedAssetCategories") loaded[source] = unwrapRows(await financeApi.getFixedAssetCategories({ limit: 500, status: "active", company_id: companyId }));
          if (source === "fixedAssets") loaded[source] = unwrapRows(await financeApi.getFixedAssets({ limit: 500, asset_status: "active", company_id: companyId }));
        } catch {
          loaded[source] = [];
        }
      })
    );
    setRefs((current) => ({ ...current, ...loaded } as Record<SourceName, any[]>));
  };

  useEffect(() => {
    fetchRows();
  }, [companyId, filters.search, filters.status]);

  useEffect(() => {
    fetchReferences();
  }, [companyId]);

  const openCreateDialog = () => {
    setEditingRow(null);
    setForm(makeEmptyForm(config.fields, activeBranchId));
    setErrors({});
    setDialogOpen(true);
  };

  const openEditDialog = (row: any) => {
    setEditingRow(row);
    const next = makeEmptyForm(config.fields, activeBranchId);
    config.fields.forEach((field) => {
      const value = row[field.name];
      if (value === undefined || value === null) return;
      next[field.name] = field.type === "json" ? JSON.stringify(value, null, 2) : String(value);
      if (field.type === "checkbox") next[field.name] = !!value;
    });
    setForm(next);
    setErrors({});
    setDialogOpen(true);
  };

  const setField = (name: string, value: unknown) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!companyId) nextErrors.company_id = "Please select a company before saving.";
    config.fields.forEach((field) => {
      const value = form[field.name];
      if (field.required && (value === "" || value === null || value === undefined)) {
        nextErrors[field.name] = `${field.label} is required.`;
      }
      if (field.type === "number" && value !== "" && Number.isNaN(Number(value))) {
        nextErrors[field.name] = `${field.label} must be numeric.`;
      }
      if (field.type === "json") {
        try {
          JSON.parse(value || "[]");
        } catch {
          nextErrors[field.name] = `${field.label} must be valid JSON.`;
        }
      }
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error(Object.values(nextErrors)[0]);
      return false;
    }
    return true;
  };

  const buildPayload = () => {
    const payload: Record<string, any> = { company_id: companyId, ...(editingRow ? { updated_by: user?.id } : { created_by: user?.id }) };
    config.fields.forEach((field) => {
      const value = form[field.name];
      if (value === "" || value === noneValue) {
        payload[field.name] = null;
      } else if (field.type === "number") {
        payload[field.name] = Number(value);
      } else if (field.type === "checkbox") {
        payload[field.name] = !!value;
      } else if (field.type === "json") {
        payload[field.name] = JSON.parse(value || "[]");
      } else if (field.source) {
        payload[field.name] = Number(value);
      } else {
        payload[field.name] = value;
      }
    });
    return payload;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = buildPayload();
      if (editingRow && config.updateApi) {
        await config.updateApi(editingRow.id, payload);
        toast.success(`${config.title} updated successfully`);
      } else {
        await config.createApi(payload);
        toast.success(`${config.title} created successfully`);
      }
      setDialogOpen(false);
      setEditingRow(null);
      await fetchRows();
    } catch (error) {
      toast.error(getErrorMessage(error, `Failed to save ${config.title}`));
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!rowToDelete) return;
    setDeleting(true);
    try {
      if (config.deactivateApi) await config.deactivateApi(rowToDelete.id, { updated_by: user?.id });
      else if (config.deleteApi) await config.deleteApi(rowToDelete.id);
      toast.success(`${config.title} removed successfully`);
      setConfirmOpen(false);
      setRowToDelete(null);
      await fetchRows();
    } catch (error) {
      toast.error(getErrorMessage(error, `Failed to remove ${config.title}`));
    } finally {
      setDeleting(false);
    }
  };

  if (!companyId) {
    return (
      <div className="min-h-full bg-[#F8FAFC] p-6 text-slate-900">
        <Alert className="border-amber-200 bg-amber-50 text-amber-900">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please select a company before using {config.title}.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#F8FAFC] p-6 text-slate-900">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">{config.eyebrow}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{config.title}</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-500">{config.description}</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-indigo-600 text-white hover:bg-indigo-700">
          <Plus className="h-4 w-4" />
          {config.createLabel}
        </Button>
      </div>

      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>{config.title}</CardTitle>
              <CardDescription>Records are loaded from the Finance API.</CardDescription>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(220px,1fr)_130px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={filters.search}
                  onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                  placeholder={config.searchPlaceholder || "Search"}
                  className="pl-9"
                />
              </div>
              {config.statusFilter ? (
                <Select value={filters.status} onValueChange={(value) => setFilters((current) => ({ ...current, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              ) : null}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                {tableFields.map((field) => <TableHead key={field.name}>{field.label}</TableHead>)}
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={tableFields.length + 1}><div className="h-8 animate-pulse rounded bg-slate-100" /></TableCell>
                  </TableRow>
                ))
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={tableFields.length + 1} className="h-32 text-center text-sm text-slate-500">No records found.</TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    {tableFields.map((field) => (
                      <TableCell key={field.name}>
                        {field.name === "status" || field.name.endsWith("_status") ? (
                          <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">{labelize(row[field.name])}</Badge>
                        ) : (
                          <span className="line-clamp-1">{labelize(row[field.name] ?? "")}</span>
                        )}
                      </TableCell>
                    ))}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {config.updateApi ? (
                            <DropdownMenuItem onClick={() => openEditDialog(row)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                          ) : null}
                          {config.deleteApi || config.deactivateApi ? (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => { setRowToDelete(row); setConfirmOpen(true); }} className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" /> Remove
                              </DropdownMenuItem>
                            </>
                          ) : null}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingRow ? `Update ${config.title}` : config.createLabel}</DialogTitle>
              <DialogDescription>Required fields are marked with an asterisk. JSON fields are sent as structured arrays.</DialogDescription>
            </DialogHeader>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              {config.fields.map((field) => (
                <div key={field.name} className={field.type === "textarea" || field.type === "json" ? "md:col-span-2" : undefined}>
                  <Field label={field.label} required={field.required} error={errors[field.name]}>
                    {renderField(field, form[field.name], (value) => setField(field.name, value), refs)}
                  </Field>
                </div>
              ))}
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>Cancel</Button>
              <Button type="submit" disabled={submitting} className="bg-indigo-600 text-white hover:bg-indigo-700">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {editingRow ? `Update ${config.title}` : config.createLabel}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ERPConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        title={`Remove ${config.title}`}
        message="This action is sent to the backend. Accounting safety rules are enforced there."
        confirmLabel="Remove"
        confirmVariant="danger"
        isLoading={deleting}
      />
    </div>
  );
}

function renderField(field: QuickField, value: any, onChange: (value: any) => void, refs: Record<SourceName, any[]>) {
  if (field.type === "textarea" || field.type === "json") {
    return <Textarea value={value || ""} onChange={(event) => onChange(event.target.value)} rows={field.type === "json" ? 7 : 3} placeholder={field.placeholder} />;
  }
  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
        <input type="checkbox" checked={!!value} onChange={(event) => onChange(event.target.checked)} />
        Enabled
      </label>
    );
  }
  if (field.type === "select") {
    const options = field.source ? (refs[field.source] || []).map((row) => ({ label: optionLabel(field.source!, row), value: String(row.id) })) : field.options || [];
    return (
      <Select value={value ? String(value) : ""} onValueChange={onChange}>
        <SelectTrigger><SelectValue placeholder={field.placeholder || `Select ${field.label}`} /></SelectTrigger>
        <SelectContent>
          {!field.required ? <SelectItem value={noneValue}>None</SelectItem> : null}
          {options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
        </SelectContent>
      </Select>
    );
  }
  return <Input type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"} value={value || ""} onChange={(event) => onChange(event.target.value)} placeholder={field.placeholder} />;
}

const Field = ({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium text-slate-700">{label} {required ? <span className="text-red-500">*</span> : null}</Label>
    {children}
    {error ? <p className="text-xs text-red-600">{error}</p> : null}
  </div>
);

