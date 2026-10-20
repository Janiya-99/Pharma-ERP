import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  Edit,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { InlineAiFormPrompt } from "../../../components/common/InlineAiFormPrompt";
import { useAuth } from "../../../auth/AuthContext";
import { financeApi } from "../../../api/financeApi";
import { getBranches } from "../../../api/controlApi";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../../../components/ui/sheet";
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
import { DataTableToolbar } from "./DataTableToolbar";
import { FinanceAiPromptBar, FinanceAiContextType } from "./FinanceAiPromptBar";

import { DynamicLinesEditor } from "./DynamicLinesEditor";

export type SourceName =
  | "branches"
  | "accounts"
  | "financialYears"
  | "accountingPeriods"
  | "bankAccounts"
  | "fixedAssetCategories"
  | "fixedAssets";

type FieldType =
  | "text"
  | "number"
  | "date"
  | "select"
  | "textarea"
  | "checkbox"
  | "json"
  | "dynamic-lines";

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
  columns?: QuickField[];
};

type QuickResourceConfig = {
  eyebrow: string;
  title: string;
  description: string;
  createLabel: string;
  listApi: (params: Record<string, unknown>) => Promise<any>;
  createApi: (payload: Record<string, unknown>) => Promise<any>;
  updateApi?: (
    id: string | number,
    payload: Record<string, unknown>
  ) => Promise<any>;
  deleteApi?: (id: string | number) => Promise<any>;
  deactivateApi?: (
    id: string | number,
    payload: Record<string, unknown>
  ) => Promise<any>;
  fields: QuickField[];
  searchPlaceholder?: string;
  statusFilter?: boolean;
};

const noneValue = "__none__";

const getErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

const labelize = (value: unknown) =>
  String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());

const unwrapRows = (response: any) => {
  return normalizeRows(response);
};

const normalizeRows = (value: any) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.data?.data)) return value.data.data;
  return [];
};

export const optionLabel = (source: SourceName, row: any) => {
  switch (source) {
    case "branches":
      return `${row.branch_code || row.code || row.id} - ${
        row.branch_name || row.name || "Branch"
      }`;
    case "accounts":
      return `${row.account_code || row.id} - ${row.account_name || "Account"}`;
    case "financialYears":
      return row.year_name || row.name || String(row.id);
    case "accountingPeriods":
      return row.period_name || row.name || String(row.id);
    case "bankAccounts":
      return `${row.bank_name || "Bank"} - ${
        row.account_name || row.account_number || row.id
      }`;
    case "fixedAssetCategories":
      return `${row.category_code || row.id} - ${
        row.category_name || "Category"
      }`;
    case "fixedAssets":
      return `${row.asset_code || row.id} - ${row.asset_name || "Asset"}`;
    default:
      return String(row.id);
  }
};

const makeEmptyForm = (
  fields: QuickField[],
  activeBranchId?: string | number
) => {
  const form: Record<string, any> = {};
  fields.forEach((field) => {
    if (field.defaultValue !== undefined) {
      form[field.name] =
        field.type === "json"
          ? JSON.stringify(field.defaultValue, null, 2)
          : field.defaultValue;
    } else if (field.type === "checkbox") {
      form[field.name] = false;
    } else if (field.type === "json") {
      form[field.name] = "[]";
    } else if (field.type === "dynamic-lines") {
      form[field.name] = [];
    } else {
      form[field.name] =
        field.name === "branch_id" && activeBranchId
          ? String(activeBranchId)
          : "";
    }
  });
  return form;
};

export function FinanceQuickResourcePage({
  config,
}: {
  config: QuickResourceConfig;
}) {
  const { company, activeBranch, user } = useAuth();
  const companyId = company?.id || company?.company_id;
  const activeBranchId =
    activeBranch?.id ||
    activeBranch?.branch_id ||
    activeBranch?.branch?.id ||
    "";

  const [rows, setRows] = useState<any[]>([]);
  const [refs, setRefs] = useState<Record<SourceName, any[]>>(
    {} as Record<SourceName, any[]>
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [rowToDelete, setRowToDelete] = useState<any | null>(null);
  const [form, setForm] = useState<Record<string, any>>(() =>
    makeEmptyForm(config.fields, activeBranchId)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filters, setFilters] = useState({ search: "", status: "all" });
  const [showDrawerAiPrompt, setShowDrawerAiPrompt] = useState(false);

  const tableFields = useMemo(
    () => config.fields.filter((field) => field.table),
    [config.fields]
  );

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
        status:
          config.statusFilter && filters.status !== "all" ? filters.status : "",
      });
      setRows(unwrapRows(res));
    } catch (error) {
      toast.error(getErrorMessage(error, `Failed to load ${config.title}`));
    } finally {
      setLoading(false);
    }
  };

  const fetchReferences = async () => {
    const needed = Array.from(
      new Set(config.fields.map((field) => field.source).filter(Boolean))
    ) as SourceName[];
    if (!companyId || needed.length === 0) return;

    const loaded: Partial<Record<SourceName, any[]>> = {};
    await Promise.all(
      needed.map(async (source) => {
        try {
          if (source === "branches")
            loaded[source] = normalizeRows(
              await getBranches({ limit: 500, status: "active" })
            );
          if (source === "accounts")
            loaded[source] = unwrapRows(
              await financeApi.getChartOfAccounts({
                limit: 1000,
                status: "active",
                company_id: companyId,
              })
            );
          if (source === "financialYears")
            loaded[source] = unwrapRows(
              await financeApi.getFinancialYears({
                limit: 100,
                status: "active",
                company_id: companyId,
              })
            );
          if (source === "accountingPeriods")
            loaded[source] = unwrapRows(
              await financeApi.getAccountingPeriods({
                limit: 200,
                status: "open",
                company_id: companyId,
              })
            );
          if (source === "bankAccounts")
            loaded[source] = unwrapRows(
              await financeApi.getBankAccounts({
                limit: 500,
                status: "active",
                company_id: companyId,
              })
            );
          if (source === "fixedAssetCategories")
            loaded[source] = unwrapRows(
              await financeApi.getFixedAssetCategories({
                limit: 500,
                status: "active",
                company_id: companyId,
              })
            );
          if (source === "fixedAssets")
            loaded[source] = unwrapRows(
              await financeApi.getFixedAssets({
                limit: 500,
                asset_status: "active",
                company_id: companyId,
              })
            );
        } catch {
          loaded[source] = [];
        }
      })
    );
    setRefs(
      (current) => ({ ...current, ...loaded } as Record<SourceName, any[]>)
    );
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
      if (field.type === "dynamic-lines") {
        next[field.name] = Array.isArray(value) ? value : [];
      } else {
        next[field.name] =
          field.type === "json" ? JSON.stringify(value, null, 2) : String(value);
        if (field.type === "checkbox") next[field.name] = !!value;
      }
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
    if (!companyId)
      nextErrors.company_id = "Please select a company before saving.";
    config.fields.forEach((field) => {
      const value = form[field.name];
      if (
        field.required &&
        (value === "" || value === null || value === undefined)
      ) {
        nextErrors[field.name] = `${field.label} is required.`;
      }
      if (
        field.type === "number" &&
        value !== "" &&
        Number.isNaN(Number(value))
      ) {
        nextErrors[field.name] = `${field.label} must be numeric.`;
      }
      if (field.type === "json") {
        try {
          JSON.parse(value || "[]");
        } catch {
          nextErrors[field.name] = `${field.label} must be valid JSON.`;
        }
      }
      if (field.type === "dynamic-lines") {
        if (!Array.isArray(value) || value.length === 0) {
          nextErrors[field.name] = `${field.label} requires at least one line.`;
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
    const payload: Record<string, any> = {
      company_id: companyId,
      ...(editingRow ? { updated_by: user?.id } : { created_by: user?.id }),
    };
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
      } else if (field.type === "dynamic-lines") {
        payload[field.name] = Array.isArray(value) ? value.map(row => {
          const formattedRow: any = { ...row };
          field.columns?.forEach(col => {
             if (col.type === "number") formattedRow[col.name] = Number(row[col.name] || 0);
          });
          return formattedRow;
        }) : [];
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
      if (config.deactivateApi)
        await config.deactivateApi(rowToDelete.id, { updated_by: user?.id });
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
      <div className="text-slate-900 min-h-full bg-[#F8FAFC] p-6">
        <Alert className="border-amber-200 bg-amber-50 text-amber-900">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select a company before using {config.title}.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="text-slate-900 min-h-full bg-[#F8FAFC] p-6">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            {config.eyebrow}
          </p>
          <h1 className="text-slate-900 mt-1 text-3xl font-bold tracking-tight">
            {config.title}
          </h1>
          <p className="text-slate-500 mt-2 max-w-3xl text-sm">
            {config.description}
          </p>
        </div>
      </div>

      <FinanceAiPromptBar
        contextType={(() => {
          const t = config.title.toLowerCase();
          if (t.includes("opening balance")) return "opening_balances";
          if (t.includes("financial year")) return "financial_year";
          if (t.includes("tax setting")) return "tax_settings";
          if (t.includes("journal entry")) return "journal_entries";
          if (t.includes("journal register")) return "journal_register";
          if (t.includes("voucher") || t.includes("reconciliation") || t.includes("bank")) return "banking";
          if (t.includes("asset")) return "fixed_assets";
          return "chart_of_accounts";
        })()}
        pageTitle={config.title}
        dataSnapshot={rows}
        className="mb-6"
      />

      <Card className="border-slate-200 border bg-white shadow-sm overflow-hidden">
        <DataTableToolbar
          searchQuery={filters.search}
          onSearchChange={(value) =>
            setFilters((current) => ({ ...current, search: value }))
          }
          onAdd={openCreateDialog}
          statusFilter={config.statusFilter}
          statusValue={filters.status}
          onStatusChange={(value) =>
            setFilters((current) => ({ ...current, status: value }))
          }
        />
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                {tableFields.map((field) => (
                  <TableHead key={field.name} className="text-xs uppercase font-bold text-slate-500 tracking-wide">
                    {field.label}
                  </TableHead>
                ))}
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={tableFields.length + 1}>
                      <div className="bg-slate-100 h-8 animate-pulse rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={tableFields.length + 1}
                    className="text-slate-500 h-32 text-center text-sm"
                  >
                    No records found.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    {tableFields.map((field) => {
                      // 1. Account fields
                      if (field.source === "accounts" || field.name.includes("account")) {
                        const acc = row.chart_of_account || row.account || (refs.accounts && refs.accounts.find((a: any) => String(a.id) === String(row[field.name])));
                        return (
                          <TableCell key={field.name} className="py-2.5">
                            <div className="flex flex-col min-w-[190px]">
                              <span className="font-bold text-slate-900 text-xs tracking-tight">
                                {acc ? `${acc.account_code || ""} - ${acc.account_name || ""}` : (row[field.name] || "-")}
                              </span>
                              {(acc?.account_type || acc?.classification || acc?.type) && (
                                <span className="text-[10px] font-semibold text-slate-400 capitalize">
                                  {(acc.account_type || acc.classification || acc.type).replace(/_/g, " ")}
                                </span>
                              )}
                            </div>
                          </TableCell>
                        );
                      }

                      // 2. Financial Year
                      if (field.source === "financialYears" || field.name === "financial_year_id") {
                        const fy = row.financial_year || (refs.financialYears && refs.financialYears.find((f: any) => String(f.id) === String(row[field.name])));
                        return (
                          <TableCell key={field.name} className="py-2.5">
                            <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                              {fy?.year_name || fy?.name || (row[field.name] ? `FY #${row[field.name]}` : "-")}
                            </span>
                          </TableCell>
                        );
                      }

                      // 3. Branch
                      if (field.source === "branches" || field.name === "branch_id") {
                        const br = row.branch || (refs.branches && refs.branches.find((b: any) => String(b.id) === String(row[field.name])));
                        return (
                          <TableCell key={field.name} className="py-2.5">
                            <span className="text-xs font-medium text-slate-600 whitespace-nowrap">
                              {br?.branch_name || br?.name || (row[field.name] ? `Branch #${row[field.name]}` : "All Branches")}
                            </span>
                          </TableCell>
                        );
                      }

                      // 4. Currency amounts
                      if (field.type === "number" && (field.name.includes("amount") || field.name.includes("cost") || field.name.includes("balance") || field.name.includes("rate"))) {
                        const numVal = Number(row[field.name]) || 0;
                        const isDebit = field.name.includes("debit");
                        const isCredit = field.name.includes("credit");
                        return (
                          <TableCell key={field.name} className="py-2.5">
                            <span className={`font-mono text-xs font-semibold ${
                              numVal > 0 
                                ? isDebit 
                                  ? "text-indigo-600 font-bold" 
                                  : isCredit 
                                  ? "text-emerald-600 font-bold" 
                                  : "text-slate-800" 
                                : "text-slate-300"
                            }`}>
                              {numVal !== 0 ? `LKR ${numVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "-"}
                            </span>
                          </TableCell>
                        );
                      }

                      // 5. Status fields
                      if (field.name === "status" || field.name.endsWith("_status")) {
                        const isOk = String(row[field.name]).toLowerCase() === "active" || String(row[field.name]).toLowerCase() === "posted";
                        return (
                          <TableCell key={field.name} className="py-2.5">
                            <Badge
                              variant="outline"
                              className={isOk 
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700 font-bold text-[10px]" 
                                : "border-slate-200 bg-slate-50 text-slate-700 font-medium text-[10px]"
                              }
                            >
                              {labelize(row[field.name])}
                            </Badge>
                          </TableCell>
                        );
                      }

                      // 6. Default text
                      return (
                        <TableCell key={field.name} className="py-2.5">
                          <span className="line-clamp-1 text-xs text-slate-700 font-medium">
                            {labelize(row[field.name] ?? "")}
                          </span>
                        </TableCell>
                      );
                    })}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {config.updateApi ? (
                            <DropdownMenuItem
                              onClick={() => openEditDialog(row)}
                            >
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                          ) : null}
                          {config.deleteApi || config.deactivateApi ? (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setRowToDelete(row);
                                  setConfirmOpen(true);
                                }}
                                className="text-red-600"
                              >
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

      <Sheet open={dialogOpen} onOpenChange={setDialogOpen}>
        <SheetContent className="flex w-full flex-col overflow-hidden bg-white p-0 sm:w-[min(96vw,1080px)] sm:max-w-[1080px] lg:w-[68vw] lg:max-w-[1120px] xl:w-[64vw] border-l border-slate-200 shadow-2xl">
          <SheetHeader className="border-b border-slate-100 bg-slate-50/50 px-6 py-5 shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <SheetTitle className="text-xl font-bold text-slate-800">
                  {editingRow ? `Update ${config.title}` : config.createLabel}
                </SheetTitle>
                <SheetDescription>
                  Required fields are marked with an asterisk. JSON fields are
                  sent as structured arrays.
                </SheetDescription>
              </div>
              <button
                type="button"
                onClick={() => setShowDrawerAiPrompt((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs shadow-md transition-all cursor-pointer shrink-0 ${
                  showDrawerAiPrompt
                    ? "bg-purple-700 text-white shadow-purple-500/30 ring-2 ring-purple-400/50"
                    : "bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]"
                }`}
                title="Toggle AI Copilot prompt to auto-fill form"
              >
                <Sparkles className="h-3.5 w-3.5 animate-pulse text-amber-300" />
                <span>{showDrawerAiPrompt ? "AI Prompt Open" : "AI Auto-Fill"}</span>
              </button>
            </div>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <form id="quick-resource-form" onSubmit={handleSubmit} className="space-y-6">
              {showDrawerAiPrompt && (
                <InlineAiFormPrompt
                  formType={config.resourceKey || "account"}
                  title={config.title}
                  fields={config.fields.map((f) => ({ key: f.name, name: f.name, label: f.label }))}
                  onApply={(aiData) => {
                    Object.keys(aiData).forEach((k) => {
                      if (config.fields.some((f) => f.name === k) || k in form) {
                        setField(k, aiData[k]);
                      }
                    });
                  }}
                  onClose={() => setShowDrawerAiPrompt(false)}
                />
              )}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {config.fields.map((field) => (
                <div
                  key={field.name}
                  className={
                    field.type === "textarea" || field.type === "json" || field.type === "dynamic-lines"
                      ? "md:col-span-2"
                      : undefined
                  }
                >
                  <Field
                    label={field.label}
                    required={field.required}
                    error={errors[field.name]}
                  >
                    {renderField(
                      field,
                      form[field.name],
                      (value) => setField(field.name, value),
                      refs
                    )}
                  </Field>
                </div>
              ))}
              </div>
            </form>
          </div>
          <SheetFooter className="border-t border-slate-100 bg-slate-50/50 px-6 py-4 shrink-0 flex flex-row items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              form="quick-resource-form"
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {editingRow ? `Update ${config.title}` : config.createLabel}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

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

function renderField(
  field: QuickField,
  value: any,
  onChange: (value: any) => void,
  refs: Record<SourceName, any[]>
) {
  if (field.type === "dynamic-lines") {
    return (
      <DynamicLinesEditor 
        columns={field.columns || []}
        value={Array.isArray(value) ? value : []}
        onChange={onChange}
        refs={refs}
      />
    );
  }
  if (field.type === "textarea" || field.type === "json") {
    return (
      <Textarea
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        rows={field.type === "json" ? 7 : 3}
        placeholder={field.placeholder || `Enter ${field.label}`}
      />
    );
  }
  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-sm shadow-sm hover:border-indigo-200 transition-colors cursor-pointer w-full">
        <input
          type="checkbox"
          checked={!!value}
          onChange={(event) => onChange(event.target.checked)}
          className="w-4 h-4 text-indigo-600 bg-slate-100 border-slate-300 rounded focus:ring-indigo-500 focus:ring-2"
        />
        <span className="font-medium text-slate-700">Enabled</span>
      </label>
    );
  }
  if (field.type === "select") {
    const options = field.source
      ? (refs[field.source] || []).map((row) => ({
          label: optionLabel(field.source!, row),
          value: String(row.id),
        }))
      : field.options || [];
    return (
      <Select value={value ? String(value) : ""} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue
            placeholder={field.placeholder || `Select ${field.label}`}
          />
        </SelectTrigger>
        <SelectContent>
          {!field.required ? (
            <SelectItem value={noneValue}>None</SelectItem>
          ) : null}
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
  return (
    <Input
      type={
        field.type === "number"
          ? "number"
          : field.type === "date"
          ? "date"
          : "text"
      }
      value={value || ""}
      onChange={(event) => onChange(event.target.value)}
      placeholder={field.placeholder || `Enter ${field.label}`}
    />
  );
}

const Field = ({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-semibold text-slate-700">
      {label} {required ? <span className="text-red-500">*</span> : null}
    </Label>
    {children}
    {error ? <p className="text-xs text-red-600">{error}</p> : null}
  </div>
);
