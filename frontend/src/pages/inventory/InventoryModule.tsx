import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertTriangle,
  BarChart3,
  Boxes,
  CalendarClock,
  ClipboardList,
  Edit,
  Eye,
  FileText,
  Loader2,
  MoreHorizontal,
  Package,
  Plus,
  Repeat,
  RotateCcw,
  Search,
  Settings,
  SlidersHorizontal,
  Trash2,
  Truck,
  Warehouse,
} from "lucide-react";

import { inventoryApi } from "@/api/inventoryApi";
import { useAuth } from "@/auth/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type ApiRecord = Record<string, any>;
type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";
type DrawerMode = "create" | "edit" | "view";
type FieldType = "text" | "number" | "date" | "email" | "textarea" | "select" | "switch";

type Option = {
  label: string;
  value: string;
};

type FieldConfig = {
  name: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  options?: Option[];
  placeholder?: string;
  colSpan?: boolean;
};

type TableColumn = {
  header: string;
  render: (row: ApiRecord) => React.ReactNode;
};

type SetupConfig = {
  key: string;
  label: string;
  singular: string;
  uniqueField?: string;
  list: (params: ApiRecord) => Promise<any>;
  get: (id: string | number) => Promise<any>;
  create: (payload: ApiRecord) => Promise<any>;
  update: (id: string | number, payload: ApiRecord) => Promise<any>;
  deactivate: (id: string | number) => Promise<any>;
  columns: TableColumn[];
  fields: FieldConfig[];
  defaults: ApiRecord;
  buildPayload: (form: ApiRecord, context: InventoryContextValue) => ApiRecord;
};

type InventoryContextValue = {
  companyId?: number;
  branchId?: number;
};

const toneClasses: Record<StatusTone, string> = {
  success: "border-green-100 bg-green-50 text-green-700",
  warning: "border-amber-100 bg-amber-50 text-amber-700",
  danger: "border-red-100 bg-red-50 text-red-700",
  info: "border-blue-100 bg-blue-50 text-blue-700",
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
};

const statusTone = (status: unknown): StatusTone => {
  const value = String(status || "").toLowerCase();
  if (["active", "posted", "approved", "available", "good"].some((word) => value.includes(word))) return "success";
  if (["draft", "pending", "low", "soon", "hold", "blocked", "submitted"].some((word) => value.includes(word))) return "warning";
  if (["inactive", "expired", "rejected", "deleted", "out"].some((word) => value.includes(word))) return "danger";
  if (["transfer", "grn", "open"].some((word) => value.includes(word))) return "info";
  return "neutral";
};

const normalizeStatus = (value: unknown) => String(value || "active").toLowerCase();
const normalizeDate = (value: unknown) => (value ? String(value).slice(0, 10) : "");
const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
const toNullableNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};
const compact = (payload: ApiRecord) =>
  Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== "" && value !== undefined));

const getId = (row?: ApiRecord) => row?.id ?? row?.ID;
const getNested = (row: ApiRecord, path: string) =>
  path.split(".").reduce<any>((current, key) => (current == null ? undefined : current[key]), row);
const valueOf = (row: ApiRecord, paths: string[], fallback = "—") => {
  for (const path of paths) {
    const value = getNested(row, path);
    if (value !== undefined && value !== null && value !== "") return String(value);
  }
  return fallback;
};
const nameOf = (row?: ApiRecord) =>
  row ? valueOf(row, ["name", "product_name", "warehouse_name", "supplier_name", "category_name", "unit_name", "dosage_form_name", "generic_name", "manufacturer_name", "batch_number", "grn_number", "opening_stock_number", "transfer_number", "adjustment_number", "purchase_return_number", "sales_return_number"], "Record") : "Record";
const makeOptions = (rows: ApiRecord[], labelPaths: string[], valuePath = "id") =>
  rows
    .map((row) => ({ label: valueOf(row, labelPaths), value: String(getNested(row, valuePath) ?? "") }))
    .filter((option) => option.value);

const unwrapBody = (response: any) => response?.data ?? response;
const unwrapData = (response: any) => {
  const body = unwrapBody(response);
  return body?.data?.data ?? body?.data ?? body;
};
const unwrapList = (response: any): ApiRecord[] => {
  const data = unwrapData(response);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

const getErrorMessage = (error: any) => {
  const status = error?.response?.status;
  if (status === 403) return "You do not have permission to perform this action.";
  if (status === 404) return "Record not found.";
  if (status >= 500) return "Something went wrong. Please try again.";
  return error?.response?.data?.message || error?.message || "Something went wrong. Please try again.";
};

const normalizeComparable = (value: unknown) => String(value ?? "").trim().toLowerCase();

const fieldLabel = (fields: FieldConfig[], name: string) =>
  fields.find((field) => field.name === name)?.label || name.replaceAll("_", " ");

const duplicateFieldError = (field: string, fields: FieldConfig[]) => {
  const label = fieldLabel(fields, field);
  return `${label} already exists. Use a different ${label.toLowerCase()}.`;
};

const localDuplicateErrors = (config: SetupConfig, form: ApiRecord, rows: ApiRecord[], currentId?: string | number) => {
  const field = config.uniqueField;
  if (!field) return {};
  const value = normalizeComparable(form[field]);
  if (!value) return {};
  const duplicate = rows.find((row) => normalizeComparable(row[field]) === value && String(getId(row) ?? "") !== String(currentId ?? ""));
  return duplicate ? { [field]: duplicateFieldError(field, config.fields) } : {};
};

const backendFieldErrors = (error: any, config: SetupConfig) => {
  const message = getErrorMessage(error);
  const normalizedMessage = normalizeComparable(message);
  const field = config.uniqueField;
  if (!field || !normalizedMessage.includes("exists")) return {};
  if (normalizedMessage.includes(field) || normalizedMessage.includes("code exists") || normalizedMessage.includes("already exists")) {
    return { [field]: duplicateFieldError(field, config.fields) };
  }
  return {};
};

function StatusBadge({ status }: { status: unknown }) {
  const label = String(status || "—").replaceAll("_", " ");
  return (
    <Badge variant="outline" className={toneClasses[statusTone(label)]}>
      {label}
    </Badge>
  );
}

function useInventoryContext(): InventoryContextValue {
  const { company, activeBranch } = useAuth();
  return {
    companyId: company?.id ?? company?.company_id,
    branchId: activeBranch?.id ?? activeBranch?.branch_id,
  };
}

function useBackendList(
  loader: (params: ApiRecord) => Promise<any>,
  params: ApiRecord = {},
  enabled = true,
) {
  const [rows, setRows] = useState<ApiRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError("");
    try {
      const response = await loader(params);
      setRows(unwrapList(response));
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [enabled, loader, JSON.stringify(params)]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { rows, loading, error, refresh, setRows };
}

function useBackendRecord(
  loader: (params: ApiRecord) => Promise<any>,
  params: ApiRecord = {},
  enabled = true,
) {
  const [record, setRecord] = useState<ApiRecord>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError("");
    try {
      const response = await loader(params);
      const data = unwrapData(response);
      setRecord(Array.isArray(data) ? data[0] || {} : data || {});
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [enabled, loader, JSON.stringify(params)]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { record, loading, error, refresh };
}

function requireCompany(context: InventoryContextValue) {
  if (!context.companyId) {
    toast.error("Please select a company first.");
    return false;
  }
  return true;
}

function requireBranch(context: InventoryContextValue) {
  if (!context.branchId) {
    toast.error("Please select a branch first.");
    return false;
  }
  return true;
}

async function runBackendAction(
  action: () => Promise<any>,
  successMessage: string,
  refresh?: () => Promise<void> | void,
) {
  try {
    await action();
    toast.success(successMessage);
    await refresh?.();
    return true;
  } catch (error) {
    toast.error(getErrorMessage(error));
    return false;
  }
}

function InventoryPage({
  title,
  description,
  icon: Icon,
  actions,
  children,
}: {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full bg-[#F8FAFC] px-4 py-5 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            {Icon ? (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-blue-600 shadow-sm">
                <Icon className="h-5 w-5" />
              </div>
            ) : null}
            <div>
              <h1 className="text-2xl font-semibold tracking-normal text-slate-950">{title}</h1>
              <p className="mt-1 max-w-3xl text-sm tracking-normal text-slate-500">{description}</p>
            </div>
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
        {children}
      </div>
    </div>
  );
}

function SearchToolbar({
  search,
  setSearch,
  children,
}: {
  search: string;
  setSearch: (value: string) => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="relative min-w-0 flex-1 sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search"
          className="h-9 rounded-lg border-slate-200 bg-white pl-9 tracking-normal"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

function DataGrid({
  columns,
  data,
  loading,
  error,
  emptyText = "No records found.",
}: {
  columns: TableColumn[];
  data: ApiRecord[];
  loading?: boolean;
  error?: string;
  emptyText?: string;
}) {
  if (loading) {
    return (
      <div className="grid gap-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-14 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="border-red-100 bg-red-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Unable to load data</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
            {columns.map((column) => (
              <TableHead key={column.header} className="px-4 text-xs font-semibold uppercase tracking-normal text-slate-500">
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-sm text-slate-500">
                {emptyText}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow key={getId(row) || index} className="hover:bg-blue-50/30">
                {columns.map((column) => (
                  <TableCell key={column.header} className="px-4 py-3 text-sm tracking-normal text-slate-700">
                    {column.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function ActionMenu({
  onView,
  onEdit,
  onDeactivate,
  onPost,
  onHold,
  onRelease,
}: {
  onView?: () => void;
  onEdit?: () => void;
  onDeactivate?: () => void;
  onPost?: () => void;
  onHold?: () => void;
  onRelease?: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="More actions">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {onView ? (
          <DropdownMenuItem onClick={onView}>
            <Eye className="mr-2 h-4 w-4" />
            View
          </DropdownMenuItem>
        ) : null}
        {onEdit ? (
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        ) : null}
        {onPost ? <DropdownMenuItem onClick={onPost}>Post</DropdownMenuItem> : null}
        {onHold ? <DropdownMenuItem onClick={onHold}>Hold Batch</DropdownMenuItem> : null}
        {onRelease ? <DropdownMenuItem onClick={onRelease}>Release Batch</DropdownMenuItem> : null}
        {onDeactivate ? (
          <DropdownMenuItem onClick={onDeactivate} className="text-red-600 focus:text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Deactivate
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function FormField({
  field,
  value,
  error,
  disabled,
  onChange,
}: {
  field: FieldConfig;
  value: any;
  error?: string;
  disabled?: boolean;
  onChange: (name: string, value: any) => void;
}) {
  const id = `field-${field.name}`;
  return (
    <div className={`min-w-0 space-y-1.5 ${field.colSpan ? "sm:col-span-2" : ""}`}>
      <Label htmlFor={id} className="text-xs font-medium tracking-normal text-slate-600">
        {field.label}
        {field.required ? <span className="text-red-500"> *</span> : null}
      </Label>
      {field.type === "textarea" ? (
        <Textarea
          id={id}
          value={value ?? ""}
          disabled={disabled}
          placeholder={field.placeholder || field.label}
          onChange={(event) => onChange(field.name, event.target.value)}
          className="min-h-20 w-full rounded-lg border-slate-200 tracking-normal"
        />
      ) : field.type === "select" ? (
        <Select
          value={value ? String(value) : ""}
          disabled={disabled}
          onValueChange={(selected) => onChange(field.name, selected)}
        >
          <SelectTrigger id={id} className="h-9 w-full min-w-0 overflow-hidden rounded-lg border-slate-200 tracking-normal [&>span]:truncate">
            <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
          </SelectTrigger>
          <SelectContent>
            {(field.options || []).map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : field.type === "switch" ? (
        <div className="flex h-9 items-center justify-between rounded-lg border border-slate-200 px-3">
          <span className="text-sm text-slate-600">{value ? "Enabled" : "Disabled"}</span>
          <Switch checked={!!value} disabled={disabled} onCheckedChange={(checked) => onChange(field.name, checked)} />
        </div>
      ) : (
        <Input
          id={id}
          type={field.type || "text"}
          value={value ?? ""}
          disabled={disabled}
          placeholder={field.placeholder || field.label}
          onChange={(event) => onChange(field.name, field.type === "number" ? event.target.value : event.target.value)}
          className="h-9 w-full rounded-lg border-slate-200 tracking-normal"
        />
      )}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function DrawerForm({
  open,
  onOpenChange,
  title,
  description,
  fields,
  form,
  setForm,
  errors,
  mode,
  submitting,
  onSubmit,
  primaryLabel,
  secondaryAction,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  fields: FieldConfig[];
  form: ApiRecord;
  setForm: (next: ApiRecord) => void;
  errors: Record<string, string>;
  mode: DrawerMode;
  submitting: boolean;
  onSubmit: () => void;
  primaryLabel: string;
  secondaryAction?: React.ReactNode;
}) {
  const readOnly = mode === "view";
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="max-w-full overflow-x-hidden overflow-y-auto border-slate-200 bg-white p-0 data-[side=right]:w-full data-[side=right]:max-w-full sm:data-[side=right]:w-[min(92vw,720px)] sm:data-[side=right]:max-w-[720px] lg:data-[side=right]:w-[50vw] lg:data-[side=right]:max-w-[50vw]">
        <SheetHeader className="select-none border-b border-slate-200 px-6 py-5 sm:px-8">
          <SheetTitle className="text-xl font-semibold tracking-normal text-slate-950">{title}</SheetTitle>
          <SheetDescription className="max-w-2xl rounded-lg bg-blue-50 px-3 py-2 text-sm tracking-normal text-blue-700">
            {description}
          </SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 px-6 py-6 sm:px-8">
          <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
            {fields.map((field) => (
              <FormField
                key={field.name}
                field={field}
                value={form[field.name]}
                error={errors[field.name]}
                disabled={readOnly || submitting}
                onChange={(name, value) => setForm({ ...form, [name]: value })}
              />
            ))}
          </div>
        </div>
        <SheetFooter className="border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end sm:px-8">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Close
          </Button>
          {secondaryAction}
          {readOnly ? null : (
            <Button type="button" onClick={onSubmit} disabled={submitting} className="bg-blue-600 text-white hover:bg-blue-700">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {primaryLabel}
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function validateForm(fields: FieldConfig[], form: ApiRecord) {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    if (field.required && (form[field.name] === undefined || form[field.name] === null || form[field.name] === "")) {
      errors[field.name] = `${field.label} is required`;
    }
    if (field.type === "email" && form[field.name] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(form[field.name]))) {
      errors[field.name] = "Enter a valid email address";
    }
    if (field.type === "number" && form[field.name] !== "" && Number(form[field.name]) < 0) {
      errors[field.name] = `${field.label} cannot be negative`;
    }
  }
  return errors;
}

function useReferenceData() {
  const context = useInventoryContext();
  const [refs, setRefs] = useState({
    categories: [] as ApiRecord[],
    units: [] as ApiRecord[],
    dosageForms: [] as ApiRecord[],
    genericNames: [] as ApiRecord[],
    manufacturers: [] as ApiRecord[],
    suppliers: [] as ApiRecord[],
    products: [] as ApiRecord[],
    warehouses: [] as ApiRecord[],
    batches: [] as ApiRecord[],
    grns: [] as ApiRecord[],
  });

  const refresh = useCallback(async () => {
    if (!context.companyId) return;
    const params = { limit: 1000, company_id: context.companyId, branch_id: context.branchId };
    try {
      const [
        categories,
        units,
        dosageForms,
        genericNames,
        manufacturers,
        suppliers,
        products,
        warehouses,
        batches,
        grns,
      ] = await Promise.all([
        inventoryApi.getProductCategories(params),
        inventoryApi.getProductUnits(params),
        inventoryApi.getDosageForms(params),
        inventoryApi.getGenericNames(params),
        inventoryApi.getManufacturers(params),
        inventoryApi.getSuppliers(params),
        inventoryApi.getProducts(params),
        inventoryApi.getWarehouses(params),
        inventoryApi.getProductBatches(params),
        inventoryApi.getGRNs(params),
      ]);
      setRefs({
        categories: unwrapList(categories),
        units: unwrapList(units),
        dosageForms: unwrapList(dosageForms),
        genericNames: unwrapList(genericNames),
        manufacturers: unwrapList(manufacturers),
        suppliers: unwrapList(suppliers),
        products: unwrapList(products),
        warehouses: unwrapList(warehouses),
        batches: unwrapList(batches),
        grns: unwrapList(grns),
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }, [context.companyId, context.branchId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { refs, refresh };
}

function KpiCard({
  title,
  value,
  subtext,
  icon: Icon,
  tone = "info",
}: {
  title: string;
  value: React.ReactNode;
  subtext: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: StatusTone;
}) {
  return (
    <Card className="border border-slate-200 bg-white shadow-sm">
      <CardContent className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium tracking-normal text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">{value}</p>
          <p className="mt-1 text-xs tracking-normal text-slate-500">{subtext}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

export function InventoryDashboardPage() {
  const context = useInventoryContext();
  const dashboard = useBackendRecord(inventoryApi.getInventoryDashboard, {
    company_id: context.companyId,
    branch_id: context.branchId,
  }, !!context.companyId);
  const lowStock = useBackendList(inventoryApi.getStockBalances, {
    company_id: context.companyId,
    branch_id: context.branchId,
    low_stock_only: true,
    limit: 5,
  }, !!context.companyId);
  const expiring = useBackendList(inventoryApi.getExpiryReport, {
    company_id: context.companyId,
    branch_id: context.branchId,
    days: 90,
    limit: 5,
  }, !!context.companyId);
  const movements = useBackendList(inventoryApi.getStockLedgerEntries, {
    company_id: context.companyId,
    branch_id: context.branchId,
    limit: 5,
  }, !!context.companyId);
  const grns = useBackendList(inventoryApi.getGRNs, {
    company_id: context.companyId,
    branch_id: context.branchId,
    limit: 5,
  }, !!context.companyId);

  const data = dashboard.record || {};

  return (
    <InventoryPage
      title="Inventory Dashboard"
      description="Monitor stock levels, batches, expiry risks, warehouse activity, and inventory movements."
      icon={BarChart3}
      actions={
        <Button variant="outline" onClick={() => Promise.all([dashboard.refresh(), lowStock.refresh(), expiring.refresh(), movements.refresh(), grns.refresh()])}>
          Refresh
        </Button>
      }
    >
      {!context.companyId ? (
        <Alert className="border-amber-100 bg-amber-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Company required</AlertTitle>
          <AlertDescription>Please select a company first.</AlertDescription>
        </Alert>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {dashboard.loading ? (
          Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-32 rounded-xl" />)
        ) : (
          <>
            <KpiCard title="Total Products" value={data.total_products ?? 0} subtext={`${data.active_products ?? 0} active products`} icon={Package} tone="info" />
            <KpiCard title="Total Stock Value" value={`Rs. ${Number(data.total_stock_value || 0).toLocaleString()}`} subtext="Backend stock valuation" icon={BarChart3} tone="success" />
            <KpiCard title="Low Stock Items" value={data.low_stock_products ?? lowStock.rows.length} subtext="Below reorder level" icon={AlertTriangle} tone="warning" />
            <KpiCard title="Out of Stock Items" value={data.out_of_stock_items ?? 0} subtext="Requires replenishment" icon={Boxes} tone="danger" />
            <KpiCard title="Expiring Soon" value={data.near_expiry_batches ?? expiring.rows.length} subtext="Near expiry batches" icon={CalendarClock} tone="warning" />
            <KpiCard title="Active Batches" value={data.total_batches ?? 0} subtext={`${data.blocked_batches ?? 0} blocked`} icon={ClipboardList} tone="neutral" />
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <KpiCard title="Expired Batches" value={data.expired_batches ?? 0} subtext="Past expiry" icon={AlertTriangle} tone="danger" />
        <KpiCard title="Recent GRNs" value={grns.rows.length} subtext="Latest receipts" icon={Truck} tone="info" />
        <KpiCard title="Recent Movements" value={movements.rows.length} subtext="Ledger entries" icon={Repeat} tone="neutral" />
        <KpiCard title="Warehouses" value={data.total_warehouses ?? 0} subtext="Inventory locations" icon={Warehouse} tone="success" />
      </div>

      <Tabs defaultValue="low-stock" className="gap-4">
        <TabsList className="inline-flex h-10 w-fit max-w-full flex-wrap items-center justify-start gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <TabsTrigger className="h-8 flex-none rounded-lg px-3 py-1 text-sm focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:outline-none data-active:bg-blue-50 data-active:text-blue-700 data-active:shadow-none" value="low-stock">Low Stock</TabsTrigger>
          <TabsTrigger className="h-8 flex-none rounded-lg px-3 py-1 text-sm focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:outline-none data-active:bg-blue-50 data-active:text-blue-700 data-active:shadow-none" value="expiry">Expiring Batches</TabsTrigger>
          <TabsTrigger className="h-8 flex-none rounded-lg px-3 py-1 text-sm focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:outline-none data-active:bg-blue-50 data-active:text-blue-700 data-active:shadow-none" value="movements">Recent Movements</TabsTrigger>
          <TabsTrigger className="h-8 flex-none rounded-lg px-3 py-1 text-sm focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:outline-none data-active:bg-blue-50 data-active:text-blue-700 data-active:shadow-none" value="grns">Recent GRNs</TabsTrigger>
        </TabsList>
        <TabsContent value="low-stock">
          <DataGrid
            loading={lowStock.loading}
            error={lowStock.error}
            data={lowStock.rows}
            columns={[
              { header: "Product", render: (row) => valueOf(row, ["product.product_name", "product_name"]) },
              { header: "Batch", render: (row) => valueOf(row, ["product_batch.batch_number", "batch_number"]) },
              { header: "Warehouse", render: (row) => valueOf(row, ["warehouse.warehouse_name", "warehouse_name"]) },
              { header: "Available", render: (row) => valueOf(row, ["quantity_available"]) },
              { header: "Status", render: (row) => <StatusBadge status={valueOf(row, ["status"], "low stock")} /> },
            ]}
          />
        </TabsContent>
        <TabsContent value="expiry">
          <DataGrid
            loading={expiring.loading}
            error={expiring.error}
            data={expiring.rows}
            columns={[
              { header: "Product", render: (row) => valueOf(row, ["product.product_name", "product_name"]) },
              { header: "Batch", render: (row) => valueOf(row, ["batch_number", "product_batch.batch_number"]) },
              { header: "Expiry", render: (row) => normalizeDate(valueOf(row, ["expiry_date", "product_batch.expiry_date"], "")) || "—" },
              { header: "Purchase Rate", render: (row) => valueOf(row, ["purchase_rate"], "—") },
              { header: "Status", render: (row) => <StatusBadge status={row.is_blocked ? "On Hold" : row.batch_status || row.status} /> },
            ]}
          />
        </TabsContent>
        <TabsContent value="movements">
          <DataGrid
            loading={movements.loading}
            error={movements.error}
            data={movements.rows}
            columns={[
              { header: "Date", render: (row) => normalizeDate(valueOf(row, ["transaction_date", "created_at"], "")) },
              { header: "Movement Type", render: (row) => valueOf(row, ["movement_type", "source_type"]) },
              { header: "Product", render: (row) => valueOf(row, ["product.product_name", "product_name"]) },
              { header: "In", render: (row) => valueOf(row, ["quantity_in"], "0") },
              { header: "Out", render: (row) => valueOf(row, ["quantity_out"], "0") },
              { header: "Balance", render: (row) => valueOf(row, ["balance_quantity", "running_balance"], "—") },
            ]}
          />
        </TabsContent>
        <TabsContent value="grns">
          <DataGrid
            loading={grns.loading}
            error={grns.error}
            data={grns.rows}
            columns={[
              { header: "GRN No", render: (row) => valueOf(row, ["grn_number"]) },
              { header: "Date", render: (row) => normalizeDate(valueOf(row, ["grn_date"], "")) },
              { header: "Supplier", render: (row) => valueOf(row, ["supplier.supplier_name", "supplier_name", "supplier_id"]) },
              { header: "Quantity", render: (row) => valueOf(row, ["total_quantity", "total_stock_quantity"]) },
              { header: "Posted", render: (row) => <StatusBadge status={valueOf(row, ["posted_status"], "draft")} /> },
            ]}
          />
        </TabsContent>
      </Tabs>
    </InventoryPage>
  );
}

function setupConfigs(context: InventoryContextValue): SetupConfig[] {
  return [
    {
      key: "categories",
      label: "Categories",
      singular: "Category",
      uniqueField: "category_code",
      list: inventoryApi.getProductCategories,
      get: inventoryApi.getProductCategoryById,
      create: inventoryApi.createProductCategory,
      update: inventoryApi.updateProductCategory,
      deactivate: inventoryApi.deactivateProductCategory,
      defaults: { category_code: "", category_name: "", description: "", level: 1, status: "active" },
      fields: [
        { name: "category_code", label: "Category Code", required: true },
        { name: "category_name", label: "Category Name", required: true },
        { name: "description", label: "Description" },
        { name: "level", label: "Level", type: "number", required: true },
        { name: "status", label: "Status", type: "select", required: true, options: statusOptions },
      ],
      columns: [
        { header: "Code", render: (row) => valueOf(row, ["category_code"]) },
        { header: "Name", render: (row) => valueOf(row, ["category_name"]) },
        { header: "Description", render: (row) => valueOf(row, ["description"]) },
        { header: "Status", render: (row) => <StatusBadge status={row.status} /> },
      ],
      buildPayload: (form) => compact({ ...form, company_id: context.companyId, level: toNumber(form.level) || 1, status: normalizeStatus(form.status) }),
    },
    {
      key: "units",
      label: "Units",
      singular: "Unit",
      uniqueField: "unit_code",
      list: inventoryApi.getProductUnits,
      get: inventoryApi.getProductUnitById,
      create: inventoryApi.createProductUnit,
      update: inventoryApi.updateProductUnit,
      deactivate: inventoryApi.deactivateProductUnit,
      defaults: { unit_code: "", unit_name: "", description: "", status: "active" },
      fields: [
        { name: "unit_code", label: "Unit Code", required: true },
        { name: "unit_name", label: "Unit Name", required: true },
        { name: "description", label: "Description" },
        { name: "status", label: "Status", type: "select", required: true, options: statusOptions },
      ],
      columns: [
        { header: "Code", render: (row) => valueOf(row, ["unit_code"]) },
        { header: "Name", render: (row) => valueOf(row, ["unit_name"]) },
        { header: "Description", render: (row) => valueOf(row, ["description"]) },
        { header: "Status", render: (row) => <StatusBadge status={row.status} /> },
      ],
      buildPayload: (form) => compact({ ...form, company_id: context.companyId, status: normalizeStatus(form.status) }),
    },
    {
      key: "dosageForms",
      label: "Dosage Forms",
      singular: "Dosage Form",
      uniqueField: "dosage_form_code",
      list: inventoryApi.getDosageForms,
      get: inventoryApi.getDosageFormById,
      create: inventoryApi.createDosageForm,
      update: inventoryApi.updateDosageForm,
      deactivate: inventoryApi.deactivateDosageForm,
      defaults: { dosage_form_code: "", dosage_form_name: "", description: "", status: "active" },
      fields: [
        { name: "dosage_form_code", label: "Dosage Form Code", required: true },
        { name: "dosage_form_name", label: "Dosage Form Name", required: true },
        { name: "description", label: "Description" },
        { name: "status", label: "Status", type: "select", required: true, options: statusOptions },
      ],
      columns: [
        { header: "Code", render: (row) => valueOf(row, ["dosage_form_code"]) },
        { header: "Name", render: (row) => valueOf(row, ["dosage_form_name"]) },
        { header: "Description", render: (row) => valueOf(row, ["description"]) },
        { header: "Status", render: (row) => <StatusBadge status={row.status} /> },
      ],
      buildPayload: (form) => compact({ ...form, company_id: context.companyId, status: normalizeStatus(form.status) }),
    },
    {
      key: "genericNames",
      label: "Generic Names",
      singular: "Generic Name",
      uniqueField: "generic_code",
      list: inventoryApi.getGenericNames,
      get: inventoryApi.getGenericNameById,
      create: inventoryApi.createGenericName,
      update: inventoryApi.updateGenericName,
      deactivate: inventoryApi.deactivateGenericName,
      defaults: { generic_code: "", generic_name: "", description: "", status: "active" },
      fields: [
        { name: "generic_code", label: "Generic Code", required: true },
        { name: "generic_name", label: "Generic Name", required: true },
        { name: "description", label: "Description" },
        { name: "status", label: "Status", type: "select", required: true, options: statusOptions },
      ],
      columns: [
        { header: "Code", render: (row) => valueOf(row, ["generic_code"]) },
        { header: "Name", render: (row) => valueOf(row, ["generic_name"]) },
        { header: "Description", render: (row) => valueOf(row, ["description"]) },
        { header: "Status", render: (row) => <StatusBadge status={row.status} /> },
      ],
      buildPayload: (form) => compact({ ...form, company_id: context.companyId, status: normalizeStatus(form.status) }),
    },
    {
      key: "manufacturers",
      label: "Manufacturers",
      singular: "Manufacturer",
      uniqueField: "manufacturer_code",
      list: inventoryApi.getManufacturers,
      get: inventoryApi.getManufacturerById,
      create: inventoryApi.createManufacturer,
      update: inventoryApi.updateManufacturer,
      deactivate: inventoryApi.deactivateManufacturer,
      defaults: { manufacturer_code: "", manufacturer_name: "", country: "", contact_person: "", contact_number: "", email: "", address: "", status: "active" },
      fields: [
        { name: "manufacturer_code", label: "Manufacturer Code", required: true },
        { name: "manufacturer_name", label: "Manufacturer Name", required: true },
        { name: "country", label: "Country" },
        { name: "contact_person", label: "Contact Person" },
        { name: "contact_number", label: "Contact Number" },
        { name: "email", label: "Email", type: "email" },
        { name: "address", label: "Address", type: "textarea", colSpan: true },
        { name: "status", label: "Status", type: "select", required: true, options: statusOptions },
      ],
      columns: [
        { header: "Code", render: (row) => valueOf(row, ["manufacturer_code"]) },
        { header: "Name", render: (row) => valueOf(row, ["manufacturer_name"]) },
        { header: "Country", render: (row) => valueOf(row, ["country"]) },
        { header: "Email", render: (row) => valueOf(row, ["email"]) },
        { header: "Status", render: (row) => <StatusBadge status={row.status} /> },
      ],
      buildPayload: (form) => compact({ ...form, company_id: context.companyId, status: normalizeStatus(form.status) }),
    },
  ];
}

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

function BackendCrudPage({
  title,
  description,
  icon,
  rows,
  loading,
  error,
  refresh,
  fields,
  columns,
  defaults,
  buildPayload,
  create,
  update,
  get,
  deactivate,
  permissionContext,
  requireBranchForSubmit = false,
  addLabel = "Add New",
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  rows: ApiRecord[];
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  fields: FieldConfig[];
  columns: TableColumn[];
  defaults: ApiRecord;
  buildPayload: (form: ApiRecord, context: InventoryContextValue) => ApiRecord;
  create: (payload: ApiRecord) => Promise<any>;
  update: (id: string | number, payload: ApiRecord) => Promise<any>;
  get: (id: string | number) => Promise<any>;
  deactivate: (id: string | number) => Promise<any>;
  permissionContext: InventoryContextValue;
  requireBranchForSubmit?: boolean;
  addLabel?: string;
}) {
  const [search, setSearch] = useState("");
  const [drawer, setDrawer] = useState<{ open: boolean; mode: DrawerMode; id?: string | number }>({ open: false, mode: "create" });
  const [form, setForm] = useState<ApiRecord>(defaults);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const filtered = useMemo(
    () => rows.filter((row) => JSON.stringify(row).toLowerCase().includes(search.toLowerCase())),
    [rows, search],
  );

  const openCreate = () => {
    setErrors({});
    setForm(defaults);
    setDrawer({ open: true, mode: "create" });
  };

  const openRecord = async (row: ApiRecord, mode: DrawerMode) => {
    const id = getId(row);
    if (!id) return;
    setSubmitting(true);
    setErrors({});
    try {
      const response = await get(id);
      setForm({ ...defaults, ...unwrapData(response) });
      setDrawer({ open: true, mode, id });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const submit = async () => {
    if (!requireCompany(permissionContext)) return;
    if (requireBranchForSubmit && !requireBranch(permissionContext)) return;
    const nextErrors = validateForm(fields, form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSubmitting(true);
    try {
      const payload = buildPayload(form, permissionContext);
      if (drawer.mode === "edit" && drawer.id) {
        await update(drawer.id, payload);
        toast.success(`${title} updated`);
      } else {
        await create(payload);
        toast.success(`${title} created`);
      }
      setDrawer({ open: false, mode: "create" });
      setForm(defaults);
      await refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const deactivateRecord = async (row: ApiRecord) => {
    const id = getId(row);
    if (!id || !window.confirm(`Deactivate ${nameOf(row)}?`)) return;
    await runBackendAction(() => deactivate(id), `${nameOf(row)} deactivated`, refresh);
  };

  return (
    <InventoryPage title={title} description={description} icon={icon}>
      <SearchToolbar search={search} setSearch={setSearch}>
        <Button onClick={openCreate} className="rounded-lg bg-blue-600 text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          {addLabel}
        </Button>
      </SearchToolbar>
      <DataGrid
        loading={loading}
        error={error}
        data={filtered}
        columns={[
          ...columns,
          {
            header: "Actions",
            render: (row) => (
              <ActionMenu
                onView={() => openRecord(row, "view")}
                onEdit={() => openRecord(row, "edit")}
                onDeactivate={() => deactivateRecord(row)}
              />
            ),
          },
        ]}
      />
      <DrawerForm
        open={drawer.open}
        onOpenChange={(open) => setDrawer((current) => ({ ...current, open }))}
        title={drawer.mode === "create" ? addLabel : drawer.mode === "edit" ? `Update ${title}` : `${title} Details`}
        description="This action is connected to the Go backend and refreshes the list after success."
        fields={fields}
        form={form}
        setForm={setForm}
        errors={errors}
        mode={drawer.mode}
        submitting={submitting}
        onSubmit={submit}
        primaryLabel={drawer.mode === "edit" ? "Update" : "Save"}
      />
    </InventoryPage>
  );
}

export function ProductSetupPage() {
  const context = useInventoryContext();
  const configs = useMemo(() => setupConfigs(context), [context.companyId, context.branchId]);
  const [activeTab, setActiveTab] = useState(configs[0].key);
  const [search, setSearch] = useState("");
  const [drawer, setDrawer] = useState<{ open: boolean; mode: DrawerMode; id?: string | number; config: SetupConfig }>({
    open: false,
    mode: "create",
    config: configs[0],
  });
  const [form, setForm] = useState<ApiRecord>(configs[0].defaults);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const activeConfig = configs.find((config) => config.key === activeTab) || configs[0];
  const list = useBackendList(activeConfig.list, { company_id: context.companyId, limit: 1000, search }, !!context.companyId);

  useEffect(() => {
    setForm(activeConfig.defaults);
  }, [activeConfig.key]);

  const openSetup = async (mode: DrawerMode, row?: ApiRecord) => {
    setErrors({});
    if (!row) {
      setForm(activeConfig.defaults);
      setDrawer({ open: true, mode: "create", config: activeConfig });
      return;
    }
    const id = getId(row);
    if (!id) return;
    setSubmitting(true);
    try {
      const response = await activeConfig.get(id);
      setForm({ ...activeConfig.defaults, ...unwrapData(response) });
      setDrawer({ open: true, mode, id, config: activeConfig });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const submit = async () => {
    if (!requireCompany(context)) return;
    const nextErrors = {
      ...validateForm(drawer.config.fields, form),
      ...localDuplicateErrors(drawer.config, form, list.rows, drawer.id),
    };
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSubmitting(true);
    try {
      const payload = drawer.config.buildPayload(form, context);
      if (drawer.mode === "edit" && drawer.id) {
        await drawer.config.update(drawer.id, payload);
        toast.success(`${drawer.config.singular} updated`);
      } else {
        await drawer.config.create(payload);
        toast.success(`${drawer.config.singular} created`);
      }
      setDrawer((current) => ({ ...current, open: false }));
      await list.refresh();
    } catch (error) {
      const fieldErrors = backendFieldErrors(error, drawer.config);
      if (Object.keys(fieldErrors).length) {
        setErrors(fieldErrors);
        toast.error(Object.values(fieldErrors)[0]);
      } else {
        toast.error(getErrorMessage(error));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const deactivateSetup = async (config: SetupConfig, row: ApiRecord) => {
    const id = getId(row);
    if (!id || !window.confirm(`Deactivate ${nameOf(row)}?`)) return;
    await runBackendAction(() => config.deactivate(id), `${config.singular} deactivated`, list.refresh);
  };

  return (
    <InventoryPage title="Product Setup" description="Manage product-related setup data in one backend-backed screen." icon={Settings}>
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-200">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <CardTitle className="text-base font-semibold tracking-normal text-slate-950">Setup Library</CardTitle>
              <p className="mt-1 text-sm tracking-normal text-slate-500">
                Maintain product categories, units, dosage forms, generic names, and manufacturers.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative min-w-0 sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={`Search ${activeConfig.label.toLowerCase()}`}
                  className="h-9 w-full rounded-lg border-slate-200 bg-white pl-9 tracking-normal"
                />
              </div>
              <Button onClick={() => openSetup("create")} className="h-9 rounded-lg bg-blue-600 px-3 text-white hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                Add {activeConfig.singular}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col gap-4">
            <TabsList className="inline-flex h-auto w-fit max-w-full flex-wrap items-center justify-start gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
              {configs.map((config) => (
                <TabsTrigger
                  key={config.key}
                  value={config.key}
                  className="h-8 flex-none rounded-lg px-3 py-1 text-sm focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:outline-none data-active:bg-white data-active:text-blue-700 data-active:shadow-sm"
                >
                  {config.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {configs.map((config) => (
              <TabsContent key={config.key} value={config.key} className="mt-0">
                <DataGrid
                  loading={list.loading && activeTab === config.key}
                  error={list.error}
                  data={list.rows}
                  columns={[
                    ...config.columns,
                    {
                      header: "Actions",
                      render: (row) => (
                        <ActionMenu
                          onView={() => openSetup("view", row)}
                          onEdit={() => openSetup("edit", row)}
                          onDeactivate={() => deactivateSetup(config, row)}
                        />
                      ),
                    },
                  ]}
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
      <DrawerForm
        open={drawer.open}
        onOpenChange={(open) => setDrawer((current) => ({ ...current, open }))}
        title={drawer.mode === "create" ? `Add ${drawer.config.singular}` : drawer.mode === "edit" ? `Update ${drawer.config.singular}` : `${drawer.config.singular} Details`}
        description="Setup records are loaded from and saved to the Go backend."
        fields={drawer.config.fields}
        form={form}
        setForm={setForm}
        errors={errors}
        mode={drawer.mode}
        submitting={submitting}
        onSubmit={submit}
        primaryLabel={drawer.mode === "edit" ? "Update" : "Save"}
      />
    </InventoryPage>
  );
}

export function SuppliersPage() {
  const context = useInventoryContext();
  const list = useBackendList(inventoryApi.getSuppliers, { company_id: context.companyId, limit: 1000 }, !!context.companyId);
  const fields: FieldConfig[] = [
    { name: "supplier_code", label: "Supplier Code", required: true },
    { name: "supplier_name", label: "Supplier Name", required: true },
    { name: "contact_person", label: "Contact Person" },
    { name: "contact_number", label: "Phone" },
    { name: "email", label: "Email", type: "email" },
    { name: "payment_terms_days", label: "Payment Terms Days", type: "number" },
    { name: "address", label: "Address", type: "textarea", colSpan: true },
    { name: "status", label: "Status", type: "select", required: true, options: statusOptions },
  ];

  return (
    <BackendCrudPage
      title="Suppliers"
      description="Create and manage suppliers."
      icon={Truck}
      rows={list.rows}
      loading={list.loading}
      error={list.error}
      refresh={list.refresh}
      fields={fields}
      columns={[
        { header: "Supplier Code", render: (row) => valueOf(row, ["supplier_code"]) },
        { header: "Supplier Name", render: (row) => valueOf(row, ["supplier_name"]) },
        { header: "Contact Person", render: (row) => valueOf(row, ["contact_person"]) },
        { header: "Phone", render: (row) => valueOf(row, ["contact_number", "phone"]) },
        { header: "Email", render: (row) => valueOf(row, ["email"]) },
        { header: "Status", render: (row) => <StatusBadge status={row.status} /> },
      ]}
      defaults={{ supplier_code: "", supplier_name: "", contact_person: "", contact_number: "", email: "", address: "", payment_terms_days: 0, status: "active" }}
      buildPayload={(form, ctx) => compact({ ...form, company_id: ctx.companyId, payment_terms_days: toNumber(form.payment_terms_days), status: normalizeStatus(form.status) })}
      create={inventoryApi.createSupplier}
      update={inventoryApi.updateSupplier}
      get={inventoryApi.getSupplierById}
      deactivate={inventoryApi.deactivateSupplier}
      permissionContext={context}
      addLabel="Add Supplier"
    />
  );
}

export function ProductsPage() {
  const context = useInventoryContext();
  const { refs, refresh: refreshRefs } = useReferenceData();
  const list = useBackendList(inventoryApi.getProducts, { company_id: context.companyId, limit: 1000 }, !!context.companyId);
  const fields: FieldConfig[] = [
    { name: "product_code", label: "Product Code", required: true },
    { name: "product_name", label: "Product Name", required: true },
    { name: "generic_name_id", label: "Generic Name", type: "select", options: makeOptions(refs.genericNames, ["generic_name"]) },
    { name: "product_category_id", label: "Category", type: "select", required: true, options: makeOptions(refs.categories, ["category_name"]) },
    { name: "dosage_form_id", label: "Dosage Form", type: "select", options: makeOptions(refs.dosageForms, ["dosage_form_name"]) },
    { name: "base_unit_id", label: "Unit", type: "select", required: true, options: makeOptions(refs.units, ["unit_name"]) },
    { name: "manufacturer_id", label: "Manufacturer", type: "select", options: makeOptions(refs.manufacturers, ["manufacturer_name"]) },
    { name: "barcode", label: "Barcode" },
    { name: "strength", label: "Strength" },
    { name: "pack_size", label: "Pack Size" },
    { name: "product_type", label: "Product Type", type: "select", required: true, options: [{ label: "Medicine", value: "medicine" }, { label: "Medical Device", value: "medical_device" }, { label: "Other", value: "other" }] },
    { name: "requires_batch_tracking", label: "Batch Tracking Required", type: "switch" },
    { name: "requires_expiry_tracking", label: "Expiry Tracking Required", type: "switch" },
    { name: "storage_condition", label: "Storage Condition", type: "select", options: [{ label: "Room Temperature", value: "room_temperature" }, { label: "Cold Storage", value: "cold_storage" }, { label: "Controlled", value: "controlled" }] },
    { name: "reorder_level", label: "Reorder Level", type: "number" },
    { name: "reorder_quantity", label: "Reorder Quantity", type: "number" },
    { name: "status", label: "Status", type: "select", required: true, options: statusOptions },
  ];
  const defaults = {
    product_code: "",
    product_name: "",
    product_category_id: "",
    generic_name_id: "",
    dosage_form_id: "",
    manufacturer_id: "",
    base_unit_id: "",
    barcode: "",
    strength: "",
    pack_size: "",
    product_type: "medicine",
    requires_batch_tracking: true,
    requires_expiry_tracking: true,
    storage_condition: "room_temperature",
    reorder_level: 0,
    reorder_quantity: 0,
    status: "active",
  };

  return (
    <BackendCrudPage
      title="Products"
      description="Manage product master records, pharma details, stock rules, and pricing."
      icon={Package}
      rows={list.rows}
      loading={list.loading}
      error={list.error}
      refresh={async () => {
        await list.refresh();
        await refreshRefs();
      }}
      fields={fields}
      columns={[
        { header: "Product Code", render: (row) => valueOf(row, ["product_code"]) },
        { header: "Product Name", render: (row) => valueOf(row, ["product_name"]) },
        { header: "Generic Name", render: (row) => valueOf(row, ["generic_name.generic_name", "generic_name"]) },
        { header: "Category", render: (row) => valueOf(row, ["product_category.category_name", "category.category_name", "category_name"]) },
        { header: "Unit", render: (row) => valueOf(row, ["base_unit.unit_name", "unit.unit_name", "unit_name"]) },
        { header: "Manufacturer", render: (row) => valueOf(row, ["manufacturer.manufacturer_name", "manufacturer_name"]) },
        { header: "Status", render: (row) => <StatusBadge status={row.status} /> },
      ]}
      defaults={defaults}
      buildPayload={(form, ctx) =>
        compact({
          ...form,
          company_id: ctx.companyId,
          product_category_id: toNullableNumber(form.product_category_id),
          generic_name_id: toNullableNumber(form.generic_name_id),
          dosage_form_id: toNullableNumber(form.dosage_form_id),
          manufacturer_id: toNullableNumber(form.manufacturer_id),
          base_unit_id: toNumber(form.base_unit_id),
          reorder_level: toNumber(form.reorder_level),
          reorder_quantity: toNumber(form.reorder_quantity),
          status: normalizeStatus(form.status),
          barcodes: form.barcode ? [{ barcode: form.barcode, barcode_type: "primary" }] : [],
        })
      }
      create={inventoryApi.createProduct}
      update={inventoryApi.updateProduct}
      get={inventoryApi.getProductById}
      deactivate={inventoryApi.deactivateProduct}
      permissionContext={context}
      addLabel="Add Product"
    />
  );
}

export function ProductBatchesPage() {
  const context = useInventoryContext();
  const { refs } = useReferenceData();
  const list = useBackendList(inventoryApi.getProductBatches, { company_id: context.companyId, limit: 1000 }, !!context.companyId);
  const [drawer, setDrawer] = useState<{ open: boolean; mode: DrawerMode; id?: string | number }>({ open: false, mode: "view" });
  const [form, setForm] = useState<ApiRecord>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const fields: FieldConfig[] = [
    { name: "batch_number", label: "Batch Number", required: true },
    { name: "manufacture_date", label: "Manufacture Date", type: "date" },
    { name: "expiry_date", label: "Expiry Date", type: "date" },
    { name: "supplier_id", label: "Supplier", type: "select", options: makeOptions(refs.suppliers, ["supplier_name"]) },
    { name: "manufacturer_id", label: "Manufacturer", type: "select", options: makeOptions(refs.manufacturers, ["manufacturer_name"]) },
    { name: "purchase_rate", label: "Purchase Rate", type: "number" },
    { name: "selling_price", label: "Selling Price", type: "number" },
    { name: "mrp", label: "MRP", type: "number" },
    { name: "batch_status", label: "Status", type: "select", required: true, options: statusOptions },
  ];

  const openBatch = async (row: ApiRecord, mode: DrawerMode) => {
    const id = getId(row);
    if (!id) return;
    setSubmitting(true);
    setErrors({});
    try {
      const response = await inventoryApi.getProductBatchById(id);
      setForm({ batch_status: "active", ...unwrapData(response) });
      setDrawer({ open: true, mode, id });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const submit = async () => {
    const nextErrors = validateForm(fields, form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length || !drawer.id) return;
    setSubmitting(true);
    try {
      await inventoryApi.updateProductBatch(drawer.id, compact({
        batch_number: form.batch_number,
        manufacture_date: form.manufacture_date || null,
        expiry_date: form.expiry_date || null,
        supplier_id: toNullableNumber(form.supplier_id),
        manufacturer_id: toNullableNumber(form.manufacturer_id),
        purchase_rate: toNumber(form.purchase_rate),
        selling_price: toNumber(form.selling_price),
        mrp: toNumber(form.mrp),
        batch_status: normalizeStatus(form.batch_status),
      }));
      toast.success("Batch updated");
      setDrawer((current) => ({ ...current, open: false }));
      await list.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const holdBatch = async (row: ApiRecord) => {
    const id = getId(row);
    if (!id || !window.confirm(`Hold batch ${nameOf(row)}?`)) return;
    await runBackendAction(() => inventoryApi.holdProductBatch(id, { block_reason: "Held from inventory module" }), "Batch held", list.refresh);
  };

  const releaseBatch = async (row: ApiRecord) => {
    const id = getId(row);
    if (!id || !window.confirm(`Release batch ${nameOf(row)}?`)) return;
    await runBackendAction(() => inventoryApi.releaseProductBatch(id), "Batch released", list.refresh);
  };

  return (
    <InventoryPage title="Product Batches" description="View and manage product batch records created by GRNs." icon={Boxes}>
      <DataGrid
        loading={list.loading}
        error={list.error}
        data={list.rows}
        columns={[
          { header: "Product", render: (row) => valueOf(row, ["product.product_name", "product_name", "product_id"]) },
          { header: "Batch Number", render: (row) => valueOf(row, ["batch_number"]) },
          { header: "Manufacture Date", render: (row) => normalizeDate(row.manufacture_date) || "—" },
          { header: "Expiry Date", render: (row) => normalizeDate(row.expiry_date) || "—" },
          { header: "Status", render: (row) => <StatusBadge status={row.is_blocked ? "On Hold" : row.batch_status || row.status} /> },
          {
            header: "Actions",
            render: (row) => (
              <ActionMenu
                onView={() => openBatch(row, "view")}
                onEdit={() => openBatch(row, "edit")}
                onHold={() => holdBatch(row)}
                onRelease={() => releaseBatch(row)}
              />
            ),
          },
        ]}
      />
      <DrawerForm
        open={drawer.open}
        onOpenChange={(open) => setDrawer((current) => ({ ...current, open }))}
        title={drawer.mode === "edit" ? "Update Batch" : "Batch Details"}
        description="Limited batch edits are saved to the Go backend."
        fields={fields}
        form={form}
        setForm={setForm}
        errors={errors}
        mode={drawer.mode}
        submitting={submitting}
        onSubmit={submit}
        primaryLabel="Update"
      />
    </InventoryPage>
  );
}

export function WarehousesAndLocationsPage() {
  const context = useInventoryContext();
  const warehouses = useBackendList(inventoryApi.getWarehouses, { company_id: context.companyId, branch_id: context.branchId, limit: 1000 }, !!context.companyId);
  const [selected, setSelected] = useState<ApiRecord | null>(null);
  const locations = useBackendList(inventoryApi.getWarehouseLocations, { warehouse_id: getId(selected), company_id: context.companyId, limit: 1000 }, !!getId(selected));
  const [drawerType, setDrawerType] = useState<"warehouse" | "location" | null>(null);

  useEffect(() => {
    if (!selected && warehouses.rows.length) setSelected(warehouses.rows[0]);
  }, [warehouses.rows, selected]);

  const warehouseFields: FieldConfig[] = [
    { name: "warehouse_code", label: "Warehouse Code", required: true },
    { name: "warehouse_name", label: "Warehouse Name", required: true },
    { name: "warehouse_type", label: "Warehouse Type", type: "select", required: true, options: [{ label: "Primary", value: "primary" }, { label: "Branch", value: "branch" }, { label: "Cold Storage", value: "cold_storage" }, { label: "Quarantine", value: "quarantine" }] },
    { name: "address", label: "Address" },
    { name: "contact_person", label: "Responsible Person" },
    { name: "contact_number", label: "Contact Number" },
    { name: "is_default", label: "Default Warehouse", type: "switch" },
    { name: "status", label: "Status", type: "select", required: true, options: statusOptions },
  ];
  const locationFields: FieldConfig[] = [
    { name: "location_code", label: "Location Code", required: true },
    { name: "location_name", label: "Location Name" },
    { name: "rack", label: "Rack" },
    { name: "shelf", label: "Shelf" },
    { name: "bin", label: "Bin" },
    { name: "storage_condition", label: "Storage Condition", type: "select", required: true, options: [{ label: "Room Temperature", value: "room_temperature" }, { label: "Cold Storage", value: "cold_storage" }, { label: "Controlled", value: "controlled" }] },
    { name: "status", label: "Status", type: "select", required: true, options: statusOptions },
  ];

  return (
    <InventoryPage
      title="Warehouses & Locations"
      description="Manage warehouses, branch stock locations, racks, shelves, and bins."
      icon={Warehouse}
      actions={
        <Button onClick={() => setDrawerType("warehouse")} className="rounded-lg bg-blue-600 text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Add Warehouse
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold tracking-normal text-slate-950">Warehouse List</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {warehouses.loading ? <Skeleton className="h-20 rounded-xl" /> : null}
            {warehouses.rows.map((warehouse) => (
              <button
                key={getId(warehouse)}
                onClick={async () => {
                  setSelected(warehouse);
                  const id = getId(warehouse);
                  if (id) {
                    const response = await inventoryApi.getWarehouseById(id);
                    setSelected(unwrapData(response));
                  }
                }}
                className={`w-full rounded-xl border p-4 text-left transition ${getId(selected || {}) === getId(warehouse) ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold tracking-normal text-slate-950">{valueOf(warehouse, ["warehouse_name"])}</p>
                    <p className="mt-1 text-xs tracking-normal text-slate-500">{valueOf(warehouse, ["warehouse_code"])} | {valueOf(warehouse, ["branch.branch_name", "branch_id"])}</p>
                  </div>
                  <StatusBadge status={warehouse.status} />
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold tracking-normal text-slate-950">{selected ? valueOf(selected, ["warehouse_name"]) : "Select a warehouse"}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {selected ? (
                [
                  ["Warehouse Code", valueOf(selected, ["warehouse_code"])],
                  ["Branch", valueOf(selected, ["branch.branch_name", "branch_id"])],
                  ["Warehouse Type", valueOf(selected, ["warehouse_type"])],
                  ["Address", valueOf(selected, ["address"])],
                  ["Responsible Person", valueOf(selected, ["contact_person"])],
                  ["Status", <StatusBadge key="status" status={selected.status} />],
                ].map(([label, value]) => (
                  <div key={String(label)} className="rounded-xl border border-slate-200 p-3">
                    <p className="text-xs font-medium tracking-normal text-slate-500">{label}</p>
                    <div className="mt-1 text-sm font-semibold tracking-normal text-slate-950">{value}</div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No warehouse selected.</p>
              )}
            </CardContent>
          </Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold tracking-normal text-slate-950">Internal Locations</h2>
            <Button onClick={() => setDrawerType("location")} variant="outline" className="rounded-lg border-slate-200" disabled={!selected}>
              <Plus className="h-4 w-4" />
              Add Location
            </Button>
          </div>
          <LocationManager
            context={context}
            selected={selected}
            locations={locations}
            warehouseFields={warehouseFields}
            locationFields={locationFields}
            drawerType={drawerType}
            setDrawerType={setDrawerType}
            refreshWarehouses={warehouses.refresh}
          />
        </div>
      </div>
    </InventoryPage>
  );
}

function LocationManager({
  context,
  selected,
  locations,
  warehouseFields,
  locationFields,
  drawerType,
  setDrawerType,
  refreshWarehouses,
}: {
  context: InventoryContextValue;
  selected: ApiRecord | null;
  locations: ReturnType<typeof useBackendList>;
  warehouseFields: FieldConfig[];
  locationFields: FieldConfig[];
  drawerType: "warehouse" | "location" | null;
  setDrawerType: (type: "warehouse" | "location" | null) => void;
  refreshWarehouses: () => Promise<void>;
}) {
  const [drawer, setDrawer] = useState<{ open: boolean; mode: DrawerMode; id?: string | number }>({ open: false, mode: "create" });
  const [form, setForm] = useState<ApiRecord>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!drawerType) return;
    if (drawerType === "warehouse") {
      setForm({ warehouse_code: "", warehouse_name: "", warehouse_type: "primary", address: "", contact_person: "", contact_number: "", is_default: false, status: "active" });
      setDrawer({ open: true, mode: "create" });
    }
    if (drawerType === "location" && selected) {
      setForm({ location_code: "", location_name: "", rack: "", shelf: "", bin: "", storage_condition: "room_temperature", status: "active" });
      setDrawer({ open: true, mode: "create" });
    }
  }, [drawerType]);

  const fields = drawerType === "warehouse" ? warehouseFields : locationFields;

  const submit = async () => {
    if (!requireCompany(context)) return;
    if (drawerType === "warehouse" && !requireBranch(context)) return;
    if (drawerType === "location" && !selected) {
      toast.error("Please select a warehouse first.");
      return;
    }
    const nextErrors = validateForm(fields, form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSubmitting(true);
    try {
      if (drawerType === "warehouse") {
        const payload = compact({ ...form, company_id: context.companyId, branch_id: context.branchId, status: normalizeStatus(form.status) });
        if (drawer.mode === "edit" && drawer.id) await inventoryApi.updateWarehouse(drawer.id, payload);
        else await inventoryApi.createWarehouse(payload);
        toast.success(drawer.mode === "edit" ? "Warehouse updated" : "Warehouse created");
        await refreshWarehouses();
      } else {
        const payload = compact({ ...form, company_id: context.companyId, warehouse_id: getId(selected || {}), status: normalizeStatus(form.status) });
        if (drawer.mode === "edit" && drawer.id) await inventoryApi.updateWarehouseLocation(drawer.id, payload);
        else await inventoryApi.createWarehouseLocation(payload);
        toast.success(drawer.mode === "edit" ? "Location updated" : "Location created");
        await locations.refresh();
      }
      setDrawer((current) => ({ ...current, open: false }));
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const openLocation = async (row: ApiRecord, mode: DrawerMode) => {
    setDrawerType("location");
    setForm({ location_code: row.location_code, location_name: row.location_name, rack: row.rack, shelf: row.shelf, bin: row.bin, storage_condition: row.storage_condition || "room_temperature", status: normalizeStatus(row.status) });
    setDrawer({ open: true, mode, id: getId(row) });
  };

  const deactivateLocation = async (row: ApiRecord) => {
    const id = getId(row);
    if (!id || !window.confirm(`Deactivate ${nameOf(row)}?`)) return;
    await runBackendAction(() => inventoryApi.deactivateWarehouseLocation(id), "Location deactivated", locations.refresh);
  };

  return (
    <>
      <DataGrid
        loading={locations.loading}
        error={locations.error}
        data={locations.rows}
        columns={[
          { header: "Location Code", render: (row) => valueOf(row, ["location_code"]) },
          { header: "Location Name", render: (row) => valueOf(row, ["location_name"]) },
          { header: "Rack", render: (row) => valueOf(row, ["rack"]) },
          { header: "Shelf", render: (row) => valueOf(row, ["shelf"]) },
          { header: "Bin", render: (row) => valueOf(row, ["bin"]) },
          { header: "Status", render: (row) => <StatusBadge status={row.status} /> },
          {
            header: "Actions",
            render: (row) => <ActionMenu onView={() => openLocation(row, "view")} onEdit={() => openLocation(row, "edit")} onDeactivate={() => deactivateLocation(row)} />,
          },
        ]}
      />
      <DrawerForm
        open={drawer.open}
        onOpenChange={(open) => {
          setDrawer((current) => ({ ...current, open }));
          if (!open) setDrawerType(null);
        }}
        title={`${drawer.mode === "edit" ? "Update" : drawer.mode === "view" ? "View" : "Add"} ${drawerType === "warehouse" ? "Warehouse" : "Location"}`}
        description="Warehouse and location actions are saved to the Go backend."
        fields={fields}
        form={form}
        setForm={setForm}
        errors={errors}
        mode={drawer.mode}
        submitting={submitting}
        onSubmit={submit}
        primaryLabel={drawer.mode === "edit" ? "Update" : "Save"}
      />
    </>
  );
}

type WorkflowKind = "opening" | "grn" | "transfer" | "adjustment" | "purchaseReturn" | "salesReturn";

function workflowConfig(kind: WorkflowKind, refs: ReturnType<typeof useReferenceData>["refs"], context: InventoryContextValue) {
  const productOptions = makeOptions(refs.products, ["product_name"]);
  const warehouseOptions = makeOptions(refs.warehouses, ["warehouse_name"]);
  const batchOptions = makeOptions(refs.batches, ["batch_number"]);
  const supplierOptions = makeOptions(refs.suppliers, ["supplier_name"]);
  const grnOptions = makeOptions(refs.grns, ["grn_number"]);
  const baseLineFields: FieldConfig[] = [
    { name: "product_id", label: "Product", type: "select", required: true, options: productOptions },
    { name: "product_batch_id", label: "Batch", type: "select", options: batchOptions },
    { name: "quantity", label: "Quantity", type: "number", required: true },
    { name: "remarks", label: "Line Remarks" },
  ];
  const configs = {
    opening: {
      title: "Opening Stock",
      description: "Enter starting stock when implementing the ERP.",
      icon: FileText,
      list: inventoryApi.getOpeningStockEntries,
      get: inventoryApi.getOpeningStockEntryById,
      create: inventoryApi.createOpeningStockEntry,
      update: inventoryApi.updateOpeningStockEntry,
      post: inventoryApi.postOpeningStockEntry,
      cancel: inventoryApi.cancelOpeningStockEntry,
      numberPath: "opening_stock_number",
      datePath: "opening_stock_date",
      fields: [
        { name: "opening_stock_date", label: "Opening Date", type: "date", required: true },
        { name: "warehouse_id", label: "Warehouse", type: "select", required: true, options: warehouseOptions },
        { name: "reference_number", label: "Reference Number" },
        { name: "remarks", label: "Notes", type: "textarea", colSpan: true },
        ...baseLineFields,
        { name: "unit_cost", label: "Cost Price", type: "number" },
      ],
      defaults: { opening_stock_date: "", warehouse_id: "", reference_number: "", remarks: "", product_id: "", product_batch_id: "", quantity: 1, unit_cost: 0 },
      payload: (form: ApiRecord) => compact({
        company_id: context.companyId,
        branch_id: context.branchId,
        opening_stock_date: form.opening_stock_date,
        warehouse_id: toNumber(form.warehouse_id),
        reference_number: form.reference_number,
        remarks: form.remarks,
        lines: [{ product_id: toNumber(form.product_id), product_batch_id: toNullableNumber(form.product_batch_id), quantity: toNumber(form.quantity), unit_cost: toNumber(form.unit_cost), line_remarks: form.remarks }],
      }),
    },
    grn: {
      title: "GRN / Goods Receipt",
      description: "Receive supplier stock, record batches, and update inventory.",
      icon: ClipboardList,
      list: inventoryApi.getGRNs,
      get: inventoryApi.getGRNById,
      create: inventoryApi.createGRN,
      update: inventoryApi.updateGRN,
      post: inventoryApi.postGRN,
      cancel: inventoryApi.cancelGRN,
      numberPath: "grn_number",
      datePath: "grn_date",
      fields: [
        { name: "grn_date", label: "GRN Date", type: "date", required: true },
        { name: "supplier_id", label: "Supplier", type: "select", required: true, options: supplierOptions },
        { name: "warehouse_id", label: "Warehouse", type: "select", required: true, options: warehouseOptions },
        { name: "purchase_order_number", label: "Purchase Order Number" },
        { name: "remarks", label: "Notes", type: "textarea", colSpan: true },
        { name: "product_id", label: "Product", type: "select", required: true, options: productOptions },
        { name: "batch_number", label: "Batch Number" },
        { name: "manufacture_date", label: "Manufacture Date", type: "date" },
        { name: "expiry_date", label: "Expiry Date", type: "date" },
        { name: "quantity_received", label: "Quantity", type: "number", required: true },
        { name: "free_quantity", label: "Free Quantity", type: "number" },
        { name: "unit_cost", label: "Purchase Price", type: "number" },
        { name: "selling_price", label: "Selling Price", type: "number" },
        { name: "tax_amount", label: "Tax Amount", type: "number" },
      ],
      defaults: { grn_date: "", supplier_id: "", warehouse_id: "", purchase_order_number: "", remarks: "", product_id: "", batch_number: "", manufacture_date: "", expiry_date: "", quantity_received: 1, free_quantity: 0, unit_cost: 0, selling_price: 0, tax_amount: 0 },
      payload: (form: ApiRecord) => compact({
        company_id: context.companyId,
        branch_id: context.branchId,
        supplier_id: toNumber(form.supplier_id),
        warehouse_id: toNumber(form.warehouse_id),
        grn_date: form.grn_date,
        purchase_order_number: form.purchase_order_number,
        remarks: form.remarks,
        lines: [{
          product_id: toNumber(form.product_id),
          batch_number: form.batch_number,
          manufacture_date: form.manufacture_date,
          expiry_date: form.expiry_date,
          quantity_received: toNumber(form.quantity_received),
          free_quantity: toNumber(form.free_quantity),
          unit_cost: toNumber(form.unit_cost),
          selling_price: toNumber(form.selling_price),
          tax_amount: toNumber(form.tax_amount),
        }],
      }),
    },
    transfer: {
      title: "Stock Transfers",
      description: "Transfer stock between warehouses or branches.",
      icon: Repeat,
      list: inventoryApi.getStockTransfers,
      get: inventoryApi.getStockTransferById,
      create: inventoryApi.createStockTransfer,
      update: inventoryApi.updateStockTransfer,
      post: inventoryApi.postStockTransfer,
      cancel: inventoryApi.cancelStockTransfer,
      numberPath: "transfer_number",
      datePath: "transfer_date",
      fields: [
        { name: "transfer_date", label: "Transfer Date", type: "date", required: true },
        { name: "from_warehouse_id", label: "From Warehouse", type: "select", required: true, options: warehouseOptions },
        { name: "to_warehouse_id", label: "To Warehouse", type: "select", required: true, options: warehouseOptions },
        { name: "reference_number", label: "Reference Number" },
        { name: "remarks", label: "Notes", type: "textarea", colSpan: true },
        ...baseLineFields,
      ],
      defaults: { transfer_date: "", from_warehouse_id: "", to_warehouse_id: "", reference_number: "", remarks: "", product_id: "", product_batch_id: "", quantity: 1 },
      payload: (form: ApiRecord) => compact({
        company_id: context.companyId,
        branch_id: context.branchId,
        transfer_date: form.transfer_date,
        from_warehouse_id: toNumber(form.from_warehouse_id),
        to_warehouse_id: toNumber(form.to_warehouse_id),
        reference_number: form.reference_number,
        remarks: form.remarks,
        lines: [{ product_id: toNumber(form.product_id), product_batch_id: toNullableNumber(form.product_batch_id), quantity: toNumber(form.quantity), line_remarks: form.remarks }],
      }),
    },
    adjustment: {
      title: "Stock Adjustments",
      description: "Correct stock differences for damage, expiry, and physical count variance.",
      icon: SlidersHorizontal,
      list: inventoryApi.getStockAdjustments,
      get: inventoryApi.getStockAdjustmentById,
      create: inventoryApi.createStockAdjustment,
      update: inventoryApi.updateStockAdjustment,
      post: inventoryApi.postStockAdjustment,
      cancel: inventoryApi.cancelStockAdjustment,
      numberPath: "adjustment_number",
      datePath: "adjustment_date",
      fields: [
        { name: "adjustment_date", label: "Adjustment Date", type: "date", required: true },
        { name: "warehouse_id", label: "Warehouse", type: "select", required: true, options: warehouseOptions },
        { name: "adjustment_type", label: "Adjustment Type", type: "select", required: true, options: ["increase", "decrease", "damage", "expiry", "correction"].map((value) => ({ label: value, value })) },
        { name: "reason", label: "Reason" },
        { name: "remarks", label: "Notes", type: "textarea", colSpan: true },
        ...baseLineFields,
      ],
      defaults: { adjustment_date: "", warehouse_id: "", adjustment_type: "increase", reason: "", remarks: "", product_id: "", product_batch_id: "", quantity: 1 },
      payload: (form: ApiRecord) => compact({
        company_id: context.companyId,
        branch_id: context.branchId,
        adjustment_date: form.adjustment_date,
        warehouse_id: toNumber(form.warehouse_id),
        adjustment_type: form.adjustment_type,
        reason: form.reason,
        remarks: form.remarks,
        lines: [{
          product_id: toNumber(form.product_id),
          product_batch_id: toNullableNumber(form.product_batch_id),
          adjustment_direction: ["decrease", "damage", "expiry"].includes(String(form.adjustment_type)) ? "out" : "in",
          quantity: toNumber(form.quantity),
          line_reason: form.reason,
          line_remarks: form.remarks,
        }],
      }),
    },
    purchaseReturn: {
      title: "Purchase Returns",
      description: "Return goods to suppliers and reduce stock after posting.",
      icon: RotateCcw,
      list: inventoryApi.getPurchaseReturns,
      get: inventoryApi.getPurchaseReturnById,
      create: inventoryApi.createPurchaseReturn,
      update: inventoryApi.updatePurchaseReturn,
      post: inventoryApi.postPurchaseReturn,
      cancel: inventoryApi.cancelPurchaseReturn,
      numberPath: "purchase_return_number",
      datePath: "return_date",
      fields: [
        { name: "return_date", label: "Return Date", type: "date", required: true },
        { name: "supplier_id", label: "Supplier", type: "select", required: true, options: supplierOptions },
        { name: "warehouse_id", label: "Warehouse", type: "select", required: true, options: warehouseOptions },
        { name: "goods_receipt_note_id", label: "Related GRN", type: "select", options: grnOptions },
        { name: "remarks", label: "Notes", type: "textarea", colSpan: true },
        ...baseLineFields,
      ],
      defaults: { return_date: "", supplier_id: "", warehouse_id: "", goods_receipt_note_id: "", remarks: "", product_id: "", product_batch_id: "", quantity: 1 },
      payload: (form: ApiRecord) => compact({
        company_id: context.companyId,
        branch_id: context.branchId,
        return_date: form.return_date,
        supplier_id: toNumber(form.supplier_id),
        warehouse_id: toNumber(form.warehouse_id),
        goods_receipt_note_id: toNullableNumber(form.goods_receipt_note_id),
        remarks: form.remarks,
        lines: [{ product_id: toNumber(form.product_id), product_batch_id: toNullableNumber(form.product_batch_id), return_quantity: toNumber(form.quantity), return_reason: form.remarks, line_remarks: form.remarks }],
      }),
    },
    salesReturn: {
      title: "Sales Returns",
      description: "Receive returned stock from customers.",
      icon: RotateCcw,
      list: inventoryApi.getSalesReturns,
      get: inventoryApi.getSalesReturnById,
      create: inventoryApi.createSalesReturn,
      update: inventoryApi.updateSalesReturn,
      post: inventoryApi.postSalesReturn,
      cancel: inventoryApi.cancelSalesReturn,
      numberPath: "sales_return_number",
      datePath: "sales_return_date",
      fields: [
        { name: "sales_return_date", label: "Return Date", type: "date", required: true },
        { name: "customer_name", label: "Customer" },
        { name: "sales_invoice_number", label: "Related Invoice" },
        { name: "warehouse_id", label: "Warehouse", type: "select", required: true, options: warehouseOptions },
        { name: "return_condition", label: "Condition", type: "select", required: true, options: ["good", "damaged", "expired"].map((value) => ({ label: value, value })) },
        { name: "return_reason", label: "Reason", required: true },
        { name: "remarks", label: "Notes", type: "textarea", colSpan: true },
        ...baseLineFields,
      ],
      defaults: { sales_return_date: "", customer_name: "", sales_invoice_number: "", warehouse_id: "", return_condition: "good", return_reason: "", remarks: "", product_id: "", product_batch_id: "", quantity: 1 },
      payload: (form: ApiRecord) => compact({
        company_id: context.companyId,
        branch_id: context.branchId,
        sales_return_date: form.sales_return_date,
        customer_name: form.customer_name,
        sales_invoice_number: form.sales_invoice_number,
        warehouse_id: toNumber(form.warehouse_id),
        return_condition: form.return_condition,
        return_reason: form.return_reason,
        remarks: form.remarks,
        lines: [{ product_id: toNumber(form.product_id), product_batch_id: toNullableNumber(form.product_batch_id), return_quantity: toNumber(form.quantity), return_condition: form.return_condition, return_reason: form.return_reason, line_remarks: form.remarks }],
      }),
    },
  } as const;
  return configs[kind];
}

function WorkflowPage({ kind }: { kind: WorkflowKind }) {
  const context = useInventoryContext();
  const references = useReferenceData();
  const config = workflowConfig(kind, references.refs, context);
  const list = useBackendList(config.list, { company_id: context.companyId, branch_id: context.branchId, limit: 1000 }, !!context.companyId);
  const [drawer, setDrawer] = useState<{ open: boolean; mode: DrawerMode; id?: string | number }>({ open: false, mode: "create" });
  const [form, setForm] = useState<ApiRecord>(config.defaults);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const openCreate = () => {
    setErrors({});
    setForm(config.defaults);
    setDrawer({ open: true, mode: "create" });
  };

  const openRecord = async (row: ApiRecord, mode: DrawerMode) => {
    const id = getId(row);
    if (!id) return;
    setSubmitting(true);
    try {
      const response = await config.get(id);
      setForm({ ...config.defaults, ...unwrapData(response) });
      setDrawer({ open: true, mode, id });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const save = async (postAfterSave = false) => {
    if (!requireCompany(context) || !requireBranch(context)) return;
    if (kind === "transfer" && form.from_warehouse_id && form.to_warehouse_id && form.from_warehouse_id === form.to_warehouse_id) {
      setErrors({ to_warehouse_id: "From and To warehouse cannot be the same" });
      return;
    }
    const nextErrors = validateForm(config.fields, form);
    if (toNumber(form.quantity) <= 0) nextErrors.quantity = "Quantity must be greater than 0";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSubmitting(true);
    try {
      const payload = config.payload(form);
      const response = drawer.mode === "edit" && drawer.id ? await config.update(drawer.id, payload) : await config.create(payload);
      const saved = unwrapData(response);
      const savedId = drawer.id || getId(saved);
      if (postAfterSave) {
        if (!savedId) throw new Error("Backend did not return a record id to post.");
        await config.post(savedId);
        toast.success(`${config.title} posted`);
      } else {
        toast.success(drawer.mode === "edit" ? `${config.title} updated` : `${config.title} saved`);
      }
      setDrawer((current) => ({ ...current, open: false }));
      await list.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const postRecord = async (row: ApiRecord) => {
    const id = getId(row);
    if (!id || !window.confirm(`Post ${nameOf(row)}?`)) return;
    await runBackendAction(() => config.post(id), `${config.title} posted`, list.refresh);
  };

  const cancelRecord = async (row: ApiRecord) => {
    const id = getId(row);
    if (!id || !window.confirm(`Deactivate ${nameOf(row)}?`)) return;
    await runBackendAction(() => config.cancel(id, { remarks: "Cancelled from inventory module" }), `${config.title} deactivated`, list.refresh);
  };

  return (
    <InventoryPage
      title={config.title}
      description={config.description}
      icon={config.icon}
      actions={
        <Button onClick={openCreate} className="rounded-lg bg-blue-600 text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          New
        </Button>
      }
    >
      <DataGrid
        loading={list.loading}
        error={list.error}
        data={list.rows}
        columns={[
          { header: "Number", render: (row) => valueOf(row, [config.numberPath, "reference_number", "id"]) },
          { header: "Date", render: (row) => normalizeDate(valueOf(row, [config.datePath], "")) },
          { header: "Warehouse", render: (row) => valueOf(row, ["warehouse.warehouse_name", "warehouse_name", "warehouse_id", "from_warehouse_id"]) },
          { header: "Quantity", render: (row) => valueOf(row, ["total_quantity", "quantity"], "—") },
          { header: "Approval", render: (row) => <StatusBadge status={valueOf(row, ["approval_status"], "draft")} /> },
          { header: "Posted", render: (row) => <StatusBadge status={valueOf(row, ["posted_status"], "draft")} /> },
          {
            header: "Actions",
            render: (row) => <ActionMenu onView={() => openRecord(row, "view")} onEdit={() => openRecord(row, "edit")} onPost={() => postRecord(row)} onDeactivate={() => cancelRecord(row)} />,
          },
        ]}
      />
      <DrawerForm
        open={drawer.open}
        onOpenChange={(open) => setDrawer((current) => ({ ...current, open }))}
        title={drawer.mode === "create" ? `New ${config.title}` : drawer.mode === "edit" ? `Update ${config.title}` : `${config.title} Details`}
        description="Save Draft and Post both call the Go backend. Posting refreshes the list after success."
        fields={config.fields}
        form={form}
        setForm={setForm}
        errors={errors}
        mode={drawer.mode}
        submitting={submitting}
        onSubmit={() => save(false)}
        primaryLabel={drawer.mode === "edit" ? "Update Draft" : "Save Draft"}
        secondaryAction={
          drawer.mode === "view" ? null : (
            <Button type="button" variant="outline" disabled={submitting} onClick={() => save(true)}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Post
            </Button>
          )
        }
      />
    </InventoryPage>
  );
}

export function GRNPage() {
  return <WorkflowPage kind="grn" />;
}

export function OpeningStockPage() {
  return <WorkflowPage kind="opening" />;
}

export function StockTransfersPage() {
  return <WorkflowPage kind="transfer" />;
}

export function StockAdjustmentsPage() {
  return <WorkflowPage kind="adjustment" />;
}

export function PurchaseReturnsPage() {
  return <WorkflowPage kind="purchaseReturn" />;
}

export function SalesReturnsPage() {
  return <WorkflowPage kind="salesReturn" />;
}

function ReportPage({
  title,
  description,
  loader,
  columns,
  icon = BarChart3,
  extraParams = {},
}: {
  title: string;
  description: string;
  loader: (params: ApiRecord) => Promise<any>;
  columns: TableColumn[];
  icon?: React.ComponentType<{ className?: string }>;
  extraParams?: ApiRecord;
}) {
  const context = useInventoryContext();
  const references = useReferenceData();
  const [filters, setFilters] = useState<ApiRecord>({ warehouse_id: "", product_id: "", status: "" });
  const params = { company_id: context.companyId, branch_id: context.branchId, ...extraParams, ...compact(filters) };
  const report = useBackendList(loader, params, !!context.companyId);
  const warehouseOptions = [{ label: "All Warehouses", value: "all" }, ...makeOptions(references.refs.warehouses, ["warehouse_name"])];
  const productOptions = [{ label: "All Products", value: "all" }, ...makeOptions(references.refs.products, ["product_name"])];

  const setFilter = (name: string, value: string) => {
    setFilters((current) => ({ ...current, [name]: value === "all" ? "" : value }));
  };

  return (
    <InventoryPage
      title={title}
      description={description}
      icon={icon}
      actions={<Button variant="outline" onClick={report.refresh}>Refresh</Button>}
    >
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">Warehouse</Label>
            <Select value={filters.warehouse_id || "all"} onValueChange={(value) => setFilter("warehouse_id", value)}>
              <SelectTrigger className="h-9 w-full rounded-lg border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {warehouseOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">Product</Label>
            <Select value={filters.product_id || "all"} onValueChange={(value) => setFilter("product_id", value)}>
              <SelectTrigger className="h-9 w-full rounded-lg border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {productOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <FormField
            field={{ name: "date_from", label: "Date From", type: "date" }}
            value={filters.date_from || ""}
            onChange={setFilter}
          />
          <FormField
            field={{ name: "date_to", label: "Date To", type: "date" }}
            value={filters.date_to || ""}
            onChange={setFilter}
          />
        </CardContent>
      </Card>
      <DataGrid loading={report.loading} error={report.error} data={report.rows} columns={columns} />
    </InventoryPage>
  );
}

export function StockBalanceReportPage() {
  return (
    <ReportPage
      title="Stock Balance"
      description="Current available, reserved, and valued stock by product, batch, and warehouse."
      loader={inventoryApi.getStockBalances}
      columns={[
        { header: "Product", render: (row) => valueOf(row, ["product.product_name", "product_name"]) },
        { header: "Batch", render: (row) => valueOf(row, ["product_batch.batch_number", "batch_number"]) },
        { header: "Warehouse", render: (row) => valueOf(row, ["warehouse.warehouse_name", "warehouse_name"]) },
        { header: "On Hand", render: (row) => valueOf(row, ["quantity_on_hand"]) },
        { header: "Available", render: (row) => valueOf(row, ["quantity_available"]) },
        { header: "Allocated", render: (row) => valueOf(row, ["quantity_allocated"]) },
        { header: "Stock Value", render: (row) => valueOf(row, ["total_stock_value", "stock_value"]) },
      ]}
    />
  );
}

export function StockLedgerReportPage() {
  return (
    <ReportPage
      title="Stock Ledger"
      description="Every stock movement with references, in quantities, out quantities, and running balance."
      loader={inventoryApi.getStockLedgerEntries}
      columns={[
        { header: "Date", render: (row) => normalizeDate(valueOf(row, ["transaction_date", "created_at"], "")) },
        { header: "Product", render: (row) => valueOf(row, ["product.product_name", "product_name"]) },
        { header: "Batch", render: (row) => valueOf(row, ["product_batch.batch_number", "batch_number"]) },
        { header: "Movement Type", render: (row) => valueOf(row, ["movement_type", "source_type"]) },
        { header: "Reference", render: (row) => valueOf(row, ["reference_number", "source_number"]) },
        { header: "In Qty", render: (row) => valueOf(row, ["quantity_in"], "0") },
        { header: "Out Qty", render: (row) => valueOf(row, ["quantity_out"], "0") },
        { header: "Balance", render: (row) => valueOf(row, ["balance_quantity", "running_balance"]) },
      ]}
    />
  );
}

export function ExpiryReportPage() {
  return (
    <ReportPage
      title="Expiry Report"
      description="Track expired and near-expiry pharma batches by product, category, and warehouse."
      loader={inventoryApi.getExpiryReport}
      extraParams={{ days: 90 }}
      columns={[
        { header: "Product", render: (row) => valueOf(row, ["product.product_name", "product_name"]) },
        { header: "Batch", render: (row) => valueOf(row, ["batch_number", "product_batch.batch_number"]) },
        { header: "Expiry Date", render: (row) => normalizeDate(valueOf(row, ["expiry_date", "product_batch.expiry_date"], "")) },
        { header: "Purchase Rate", render: (row) => valueOf(row, ["purchase_rate"], "—") },
        { header: "Selling Price", render: (row) => valueOf(row, ["selling_price"], "—") },
        { header: "Status", render: (row) => <StatusBadge status={row.is_blocked ? "On Hold" : row.batch_status || row.status || "monitor"} /> },
      ]}
    />
  );
}

export function BatchReportPage() {
  return (
    <ReportPage
      title="Batch Report"
      description="Batch movement summary with received quantity, sold quantity, balance, and status."
      loader={inventoryApi.getBatchReport}
      columns={[
        { header: "Product", render: (row) => valueOf(row, ["product.product_name", "product_name", "product_id"]) },
        { header: "Batch Number", render: (row) => valueOf(row, ["batch_number"]) },
        { header: "Manufacture Date", render: (row) => normalizeDate(row.manufacture_date) || "—" },
        { header: "Expiry Date", render: (row) => normalizeDate(row.expiry_date) || "—" },
        { header: "Purchase Rate", render: (row) => valueOf(row, ["purchase_rate"]) },
        { header: "Selling Price", render: (row) => valueOf(row, ["selling_price"]) },
        { header: "Status", render: (row) => <StatusBadge status={row.is_blocked ? "On Hold" : row.batch_status || row.status} /> },
      ]}
    />
  );
}
