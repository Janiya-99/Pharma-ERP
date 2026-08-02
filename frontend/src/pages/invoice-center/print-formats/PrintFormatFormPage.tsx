import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  Database,
  Eye,
  FileText,
  GripVertical,
  Maximize2,
  Monitor,
  Palette,
  PanelTop,
  PenLine,
  Plus,
  ReceiptText,
  Rows3,
  Save,
  Search,
  Settings2,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { useAuth } from "../../../auth/AuthContext";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Switch } from "../../../components/ui/switch";
import { Textarea } from "../../../components/ui/textarea";
import type {
  InvoicePrintFormat,
  InvoicePrintFormatField,
} from "../../../types/invoice-center";
import { PrintFormatLayoutPreview } from "./PrintFormatLayoutPreview";
import {
  createDefaultPrintFormat,
  documentTypes,
  getPrintDataField,
  getPrintDataFields,
  getDefaultPrintFields,
  headerLayouts,
  paperSizes,
  type PrintDataField,
  type PrintDataFieldPlacement,
  themePresets,
} from "./printFormatDefaults";

const schema = z.object({
  format_name: z.string().min(2, "Template Name is required"),
  document_type: z.string().min(1, "Document Type is required"),
  branch_id: z.any().optional(),
  paper_size: z.string().min(1, "Paper Size is required"),
  orientation: z.enum(["portrait", "landscape"]),
  logo_position: z.string().min(1),
  header_layout: z.string().min(1),
  footer_layout: z.string().min(1),
  primary_color: z.string().min(1),
  font_family: z.string().min(1),
  show_company_logo: z.boolean(),
  show_company_name: z.boolean(),
  show_branch_details: z.boolean(),
  show_customer_details: z.boolean(),
  show_document_status: z.boolean(),
  show_payment_terms: z.boolean(),
  show_bank_details: z.boolean(),
  show_signature_section: z.boolean(),
  show_qr_code: z.boolean(),
  terms_and_conditions: z.string().optional(),
  footer_note: z.string().optional(),
  is_default: z.boolean(),
  is_active: z.boolean(),
  fields: z.array(
    z.object({
      field_key: z.string().min(1),
      field_label: z.string().min(1),
      is_visible: z.boolean(),
      display_order: z.number(),
      column_width: z.number().min(40),
      alignment: z.enum(["left", "center", "right"]),
    })
  ),
});

const detailFieldsByDocument: Record<string, string[]> = {
  sales_invoice: [
    "Customer Name",
    "Customer Code",
    "Billing Address",
    "Delivery Address",
    "Customer Phone",
    "Customer Email",
    "Sales Rep",
    "Route",
    "Payment Terms",
    "Due Date",
    "Reference Number",
    "Customer Pharmacy License Number",
  ],
  customer_receipt: [
    "Customer Name",
    "Customer Code",
    "Receipt Number",
    "Receipt Date",
    "Payment Method",
    "Reference Number",
    "Bank Reference Number",
    "Cheque Number",
    "Allocated Amount",
    "Unallocated Amount",
  ],
  grn: [
    "Supplier Name",
    "Supplier Code",
    "GRN Number",
    "GRN Date",
    "Supplier Invoice Number",
    "Warehouse",
    "Received By",
  ],
  sales_return: [
    "Customer Name",
    "Customer Code",
    "Original Invoice Number",
    "Return Number",
    "Return Date",
    "Return Reason",
  ],
};

const headerSwitches: [keyof InvoicePrintFormat, string][] = [
  ["show_company_logo", "Show Company Logo"],
  ["show_company_name", "Show Company Name"],
  ["show_branch_details", "Show Branch Details"],
  ["show_customer_details", "Show Document Details"],
  ["show_document_status", "Show Document Status"],
  ["show_payment_terms", "Show Payment Terms"],
  ["show_bank_details", "Show Bank / Payment Details"],
  ["show_qr_code", "Show QR Code"],
];

const draftPreviewStorageKey = "invoice-center-print-format-draft-preview";

const placementLabels: Record<PrintDataFieldPlacement, string> = {
  header: "Header",
  details: "Document Details",
  line_table: "Line Table",
  totals: "Totals",
  footer: "Footer",
};

const normalizePrintFields = (
  fields: InvoicePrintFormatField[] | undefined,
  documentType: string
) => {
  const source = fields?.length ? fields : getDefaultPrintFields(documentType);
  const seen = new Map<string, number>();

  return source.map((field, index) => {
    const baseKey = field.field_key || `field_${index + 1}`;
    const count = seen.get(baseKey) || 0;
    seen.set(baseKey, count + 1);

    return {
      ...field,
      field_key: count ? `${baseKey}_${count + 1}` : baseKey,
      display_order: index + 1,
    };
  });
};

const editorTabs = [
  {
    value: "setup",
    label: "Setup",
    description: "Document scope",
    icon: Settings2,
  },
  {
    value: "header",
    label: "Header",
    description: "Logo and company",
    icon: PanelTop,
  },
  {
    value: "details",
    label: "Details",
    description: "Customer fields",
    icon: SlidersHorizontal,
  },
  {
    value: "lines",
    label: "Line Table",
    description: "Columns and order",
    icon: Rows3,
  },
  {
    value: "totals",
    label: "Totals",
    description: "Summary blocks",
    icon: ReceiptText,
  },
  {
    value: "footer",
    label: "Footer",
    description: "Notes and signs",
    icon: PenLine,
  },
  {
    value: "branding",
    label: "Branding",
    description: "Colors and font",
    icon: Palette,
  },
  {
    value: "preview",
    label: "Preview",
    description: "Zoom controls",
    icon: Monitor,
  },
];

export default function PrintFormatFormPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { company, activeBranch } = useAuth();
  const isEdit = Boolean(id);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("setup");
  const [draggingFieldKey, setDraggingFieldKey] = useState<string | null>(null);
  const [fieldSearch, setFieldSearch] = useState("");
  const [selectedPlacement, setSelectedPlacement] =
    useState<PrintDataFieldPlacement>("line_table");
  const [visibleDetails, setVisibleDetails] = useState<Record<string, boolean>>(
    {}
  );
  const [zoom, setZoom] = useState(82);

  const form = useForm<InvoicePrintFormat>({
    resolver: zodResolver(schema),
    defaultValues: createDefaultPrintFormat(
      (location.state as { document_type?: string } | null)?.document_type
    ),
  });
  const {
    control,
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = form;
  const currentFormat = useWatch({ control }) as InvoicePrintFormat;
  const previewFormat = useMemo(
    () => ({
      ...createDefaultPrintFormat(currentFormat.document_type),
      ...currentFormat,
      fields: normalizePrintFields(
        currentFormat.fields,
        currentFormat.document_type
      ),
    }),
    [currentFormat]
  );

  const documentLabel =
    documentTypes.find((type) => type.value === previewFormat.document_type)
      ?.label || "Document";
  const availableDataFields = useMemo(() => {
    const query = fieldSearch.trim().toLowerCase();

    return getPrintDataFields(previewFormat.document_type)
      .filter((field) => field.placements.includes(selectedPlacement))
      .filter((field) => {
        if (!query) return true;
        return [
          field.label,
          field.key,
          field.table,
          field.column,
          field.group,
        ].some((value) => value.toLowerCase().includes(query));
      });
  }, [fieldSearch, previewFormat.document_type, selectedPlacement]);

  useEffect(() => {
    if (!isEdit || !id) return;
    invoiceCenterApi
      .getPrintFormatById(id)
      .then((response) => {
        const data = response.data.data;
        reset({
          ...createDefaultPrintFormat(data.document_type),
          ...data,
          branch_id: data.branch_id || null,
          fields: normalizePrintFields(data.fields, data.document_type),
        });
      })
      .catch((error) => {
        toast.error(
          error?.response?.data?.message || "Failed to load print format"
        );
        navigate("/invoice-center/settings/print-formats");
      });
  }, [id, isEdit, navigate, reset]);

  useEffect(() => {
    const fields =
      detailFieldsByDocument[currentFormat.document_type] ||
      detailFieldsByDocument.sales_invoice;
    setVisibleDetails(Object.fromEntries(fields.map((field) => [field, true])));
  }, [currentFormat.document_type]);

  const onSubmit = async (values: InvoicePrintFormat) => {
    setSaving(true);
    try {
      const payload = {
        ...values,
        branch_id: values.branch_id ? Number(values.branch_id) : null,
        fields: normalizePrintFields(values.fields, values.document_type).map(
          (field, index) => ({
            ...field,
            display_order: index + 1,
          })
        ),
      };
      const response =
        isEdit && id
          ? await invoiceCenterApi.updatePrintFormat(
              id,
              payload as Record<string, unknown>
            )
          : await invoiceCenterApi.createPrintFormat(
              payload as Record<string, unknown>
            );
      toast.success("Print template saved");
      if (values.is_default) {
        const formatId = id || response.data?.data?.id;
        if (formatId) await invoiceCenterApi.setDefaultPrintFormat(formatId);
      }
      navigate("/invoice-center/settings/print-formats");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to save print template"
      );
    } finally {
      setSaving(false);
    }
  };

  const saveAsDefault = () => {
    setValue("is_default", true);
    void handleSubmit(onSubmit)();
  };

  const setDocumentType = (documentType: string) => {
    setValue("document_type", documentType);
    setValue("fields", normalizePrintFields(undefined, documentType));
    setValue("show_bank_details", documentType === "customer_receipt");
  };

  const updateField = (
    index: number,
    patch: Partial<InvoicePrintFormatField>
  ) => {
    const fields = [...(watch("fields") || [])];
    fields[index] = { ...fields[index], ...patch };
    setValue("fields", fields, { shouldDirty: true });
  };

  const isDataFieldUsed = (field: PrintDataField) => {
    if (selectedPlacement === "line_table") {
      return (watch("fields") || []).some(
        (item) => item.field_key === field.key
      );
    }
    return Boolean(visibleDetails[field.label]);
  };

  const addDataField = (field: PrintDataField) => {
    if (selectedPlacement === "line_table") {
      const fields = [...(watch("fields") || [])];
      const existingIndex = fields.findIndex(
        (item) => item.field_key === field.key
      );

      if (existingIndex >= 0) {
        updateField(existingIndex, { is_visible: true });
        toast.success(`${field.label} is visible in the line table`);
        return;
      }

      const nextField: InvoicePrintFormatField = {
        field_key: field.key,
        field_label: field.label,
        is_visible: true,
        display_order: fields.length + 1,
        column_width: field.width || 120,
        alignment: field.alignment || "left",
      };

      setValue("fields", [...fields, nextField], { shouldDirty: true });
      setActiveSection("lines");
      toast.success(`${field.label} added to the line table`);
      return;
    }

    setVisibleDetails((current) => ({
      ...current,
      [field.label]: true,
    }));
    setActiveSection(selectedPlacement === "header" ? "header" : "details");
    toast.success(
      `${field.label} enabled in ${placementLabels[selectedPlacement]}`
    );
  };

  const moveField = (index: number, direction: -1 | 1) => {
    const fields = [...(watch("fields") || [])];
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= fields.length) return;
    const [field] = fields.splice(index, 1);
    fields.splice(nextIndex, 0, field);
    setValue(
      "fields",
      fields.map((item, order) => ({ ...item, display_order: order + 1 })),
      { shouldDirty: true }
    );
  };

  const reorderField = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const fields = [...(watch("fields") || [])];
    if (
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= fields.length ||
      toIndex >= fields.length
    ) {
      return;
    }

    const [field] = fields.splice(fromIndex, 1);
    fields.splice(toIndex, 0, field);
    setValue(
      "fields",
      fields.map((item, order) => ({ ...item, display_order: order + 1 })),
      { shouldDirty: true }
    );
  };

  const applyPreset = (preset: string) => {
    const theme = themePresets.find((item) => item.name === preset);
    if (theme) setValue("primary_color", theme.color);
  };

  const openFullPreview = () => {
    const draftFormat = {
      ...createDefaultPrintFormat(previewFormat.document_type),
      ...previewFormat,
    };

    sessionStorage.setItem(draftPreviewStorageKey, JSON.stringify(draftFormat));

    window.open(
      "/invoice-center/settings/print-formats/draft/preview",
      "_blank"
    );
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="page-content space-y-4 pb-32"
      noValidate
    >
      <div className="sticky top-14 z-30 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Button type="button" variant="outline" size="icon" asChild>
            <Link to="/invoice-center/settings/print-formats" aria-label="Back">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <FileText className="h-5 w-5 text-[#002137]" />
              <h1 className="text-2xl font-semibold tracking-tight text-[#111827]">
                {isEdit ? "Edit Print Template" : "Create Print Template"}
              </h1>
              <Badge variant="secondary">{documentLabel}</Badge>
              <Badge variant={watch("is_active") ? "outline" : "secondary"}>
                {watch("is_active") ? "Active" : "Draft"}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-[#6B7280]">
              Build invoice, receipt, and inventory print formats with live
              preview.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" onClick={openFullPreview}>
            <Maximize2 className="h-4 w-4" />
            Preview Full Page
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={saveAsDefault}
            disabled={saving}
          >
            <Star className="h-4 w-4" />
            Save as Default
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="bg-[#002137] text-white hover:bg-[#003452]"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[238px_minmax(0,1fr)_minmax(390px,0.78fr)]">
        <aside className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm xl:sticky xl:top-32">
          <div className="px-2 pb-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
              Sections
            </p>
            <p className="mt-1 text-sm text-[#475569]">
              Pick one area to edit.
            </p>
          </div>
          <div className="flex flex-col gap-1">
            {editorTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSection === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveSection(tab.value)}
                  aria-pressed={isActive}
                  className={`group relative flex min-h-12 w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm font-semibold transition-all ${
                    isActive
                      ? "border-[#002137] bg-[#002137] text-white shadow-sm"
                      : "border-transparent text-[#475569] hover:border-slate-200 hover:bg-slate-50 hover:text-[#0F172A]"
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-2 h-8 w-1 rounded-r-full bg-[#38BDF8]" />
                  )}
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                      isActive
                        ? "bg-white text-[#002137]"
                        : "bg-slate-100 text-[#64748B] group-hover:bg-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{tab.label}</span>
                    <span
                      className={`mt-0.5 hidden truncate text-xs font-medium xl:block ${
                        isActive ? "text-sky-100" : "text-[#94A3B8]"
                      }`}
                    >
                      {tab.description}
                    </span>
                  </span>
                  {isActive && (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        <div className="min-w-0 space-y-4">
          {activeSection === "setup" && (
            <div>
              <Section
                title="Template Setup"
                description="Choose document scope, paper style, and status. Empty branch means company-wide template."
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    label="Template Name"
                    required
                    error={errors.format_name?.message}
                  >
                    <Input
                      {...register("format_name")}
                      placeholder="Premium Sales Invoice"
                      className={errors.format_name ? "border-red-500" : ""}
                    />
                  </Field>
                  <Field
                    label="Document Type"
                    required
                    error={errors.document_type?.message}
                  >
                    <Select
                      value={watch("document_type")}
                      onValueChange={setDocumentType}
                    >
                      <SelectTrigger
                        className={errors.document_type ? "border-red-500" : ""}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {documentTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Branch">
                    <Input
                      {...register("branch_id")}
                      placeholder="Leave empty for company-wide"
                    />
                  </Field>
                  <Field
                    label="Paper Size"
                    required
                    error={errors.paper_size?.message}
                  >
                    <Select
                      value={watch("paper_size")}
                      onValueChange={(value) => setValue("paper_size", value)}
                    >
                      <SelectTrigger
                        className={errors.paper_size ? "border-red-500" : ""}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {paperSizes.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field
                    label="Orientation"
                    required
                    error={errors.orientation?.message}
                  >
                    <Select
                      value={watch("orientation")}
                      onValueChange={(value) =>
                        setValue(
                          "orientation",
                          value as "portrait" | "landscape"
                        )
                      }
                    >
                      <SelectTrigger
                        className={errors.orientation ? "border-red-500" : ""}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portrait">Portrait</SelectItem>
                        <SelectItem value="landscape">Landscape</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div>
                      <Label>Set as Default</Label>
                      <p className="text-xs text-[#6B7280]">
                        Used automatically for this document type.
                      </p>
                    </div>
                    <Switch
                      checked={watch("is_default")}
                      onCheckedChange={(checked) =>
                        setValue("is_default", checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div>
                      <Label>Template Status</Label>
                      <p className="text-xs text-[#6B7280]">
                        Only active templates can be defaults.
                      </p>
                    </div>
                    <Switch
                      checked={watch("is_active")}
                      onCheckedChange={(checked) =>
                        setValue("is_active", checked)
                      }
                    />
                  </div>
                </div>
              </Section>
            </div>
          )}

          {activeSection === "header" && (
            <div>
              <Section
                title="Header"
                description="Control company, branch, document title, and pharma distribution header details."
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Logo Position">
                    <Select
                      value={watch("logo_position")}
                      onValueChange={(value) =>
                        setValue("logo_position", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Header Layout">
                    <Select
                      value={watch("header_layout")}
                      onValueChange={(value) =>
                        setValue("header_layout", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {headerLayouts.map((layout) => (
                          <SelectItem key={layout} value={layout}>
                            {layout}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  {headerSwitches.map(([key, label]) => (
                    <Toggle
                      key={key}
                      label={label}
                      checked={Boolean(watch(key))}
                      onChange={(checked) => setValue(key, checked)}
                    />
                  ))}
                </div>
                <div className="mt-4 rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 text-sm text-[#374151]">
                  Pharmacy Layout shows company name, pharmacy/distribution
                  license number, branch, document type, document number, and
                  date.
                </div>
              </Section>
            </div>
          )}

          {activeSection === "details" && (
            <div>
              <Section
                title="Document Details"
                description="Choose the information shown above the line table."
              >
                <DataFieldPalette
                  fields={availableDataFields}
                  selectedPlacement={selectedPlacement}
                  fieldSearch={fieldSearch}
                  onPlacementChange={setSelectedPlacement}
                  onSearchChange={setFieldSearch}
                  onAddField={addDataField}
                  isFieldUsed={isDataFieldUsed}
                />
                <div className="grid gap-3 md:grid-cols-2">
                  {Object.keys(visibleDetails).map((field) => (
                    <Toggle
                      key={field}
                      label={field}
                      checked={visibleDetails[field]}
                      onChange={(checked) =>
                        setVisibleDetails((current) => ({
                          ...current,
                          [field]: checked,
                        }))
                      }
                    />
                  ))}
                </div>
              </Section>
            </div>
          )}

          {activeSection === "lines" && (
            <div>
              <Section
                title="Line Table Builder"
                description="Choose visible columns, labels, width, alignment, and order. Width affects the preview."
              >
                <DataFieldPalette
                  fields={availableDataFields}
                  selectedPlacement={selectedPlacement}
                  fieldSearch={fieldSearch}
                  onPlacementChange={setSelectedPlacement}
                  onSearchChange={setFieldSearch}
                  onAddField={addDataField}
                  isFieldUsed={isDataFieldUsed}
                />
                <div className="space-y-3">
                  {(watch("fields") || []).map((field, index) => (
                    <div
                      key={`${field.field_key}-${index}`}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => {
                        const fromIndex = (watch("fields") || []).findIndex(
                          (item) => item.field_key === draggingFieldKey
                        );
                        reorderField(fromIndex, index);
                        setDraggingFieldKey(null);
                      }}
                      className={`grid gap-3 rounded-xl border bg-white p-3 transition-all lg:grid-cols-[42px_120px_minmax(180px,1fr)_100px_130px_92px] ${
                        draggingFieldKey === field.field_key
                          ? "border-[#38BDF8] bg-sky-50/50 shadow-sm"
                          : "border-slate-200 hover:border-[#BFD7EA]"
                      }`}
                    >
                      <div className="flex items-center justify-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          draggable
                          onDragStart={() =>
                            setDraggingFieldKey(field.field_key)
                          }
                          onDragEnd={() => setDraggingFieldKey(null)}
                          className="cursor-grab active:cursor-grabbing"
                          aria-label={`Drag ${field.field_label}`}
                        >
                          <GripVertical className="h-4 w-4" />
                        </Button>
                      </div>
                      <Toggle
                        label="Visible"
                        checked={field.is_visible}
                        onChange={(checked) =>
                          updateField(index, { is_visible: checked })
                        }
                      />
                      <Field label="Column Label">
                        <Input
                          value={field.field_label}
                          onChange={(event) =>
                            updateField(index, {
                              field_label: event.target.value,
                            })
                          }
                        />
                        {(() => {
                          const source = getPrintDataField(
                            field.field_key,
                            previewFormat.document_type
                          );

                          if (!source) return null;

                          return (
                            <p className="mt-1 truncate text-xs text-[#64748B]">
                              {source.table}.{source.column}
                            </p>
                          );
                        })()}
                      </Field>
                      <Field label="Width">
                        <Input
                          type="number"
                          min={40}
                          value={field.column_width}
                          onChange={(event) =>
                            updateField(index, {
                              column_width: Number(event.target.value),
                            })
                          }
                        />
                      </Field>
                      <Field label="Alignment">
                        <Select
                          value={field.alignment}
                          onValueChange={(value) =>
                            updateField(index, {
                              alignment: value as "left" | "center" | "right",
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="left">Left</SelectItem>
                            <SelectItem value="center">Center</SelectItem>
                            <SelectItem value="right">Right</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                      <div className="flex items-end gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          aria-label="Move up"
                          className="h-10 w-10"
                          onClick={() => moveField(index, -1)}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          aria-label="Move down"
                          className="h-10 w-10"
                          onClick={() => moveField(index, 1)}
                          disabled={index === watch("fields").length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Badge
                          variant="outline"
                          className="hidden h-10 items-center justify-center whitespace-nowrap lg:flex"
                        >
                          {index + 1}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            </div>
          )}

          {activeSection === "totals" && (
            <div>
              <Section
                title="Totals"
                description="Configure summary areas. Stored through the selected template style and preview behavior."
              >
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    "Show Subtotal",
                    "Show Discount",
                    "Show Tax",
                    "Show Gross Total",
                    "Show Paid Amount",
                    "Show Balance Amount",
                    "Show Amount In Words",
                    "Show Currency",
                    "Show Total Box Border",
                    "Payment Method Summary",
                  ].map((item, index) => (
                    <Toggle
                      key={item}
                      label={item}
                      checked={index < 8}
                      onChange={() => undefined}
                    />
                  ))}
                </div>
              </Section>
            </div>
          )}

          {activeSection === "footer" && (
            <div>
              <Section
                title="Footer"
                description="Terms, notes, prepared-by checks, signatures, page number, and print date."
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Terms and Conditions Text">
                    <Textarea rows={5} {...register("terms_and_conditions")} />
                  </Field>
                  <Field label="Footer Note Text">
                    <Textarea rows={5} {...register("footer_note")} />
                  </Field>
                  <Toggle
                    label="Show Signature Section"
                    checked={watch("show_signature_section")}
                    onChange={(checked) =>
                      setValue("show_signature_section", checked)
                    }
                  />
                  <Toggle
                    label="Show Prepared By"
                    checked
                    onChange={() => undefined}
                  />
                  <Toggle
                    label="Show Checked By"
                    checked
                    onChange={() => undefined}
                  />
                  <Toggle
                    label="Show Page Number"
                    checked
                    onChange={() => undefined}
                  />
                </div>
              </Section>
            </div>
          )}

          {activeSection === "branding" && (
            <div>
              <Section
                title="Branding"
                description="Keep the print clean: white background, gray borders, navy accents, black text."
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Theme Preset">
                    <Select
                      defaultValue="Premium Navy"
                      onValueChange={applyPreset}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {themePresets.map((preset) => (
                          <SelectItem key={preset.name} value={preset.name}>
                            {preset.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Primary Color">
                    <div className="flex h-10 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3">
                      <input
                        type="color"
                        {...register("primary_color")}
                        className="h-6 w-10 cursor-pointer border-0 bg-transparent p-0"
                      />
                      <span className="text-sm font-medium text-[#1F2937]">
                        {watch("primary_color")}
                      </span>
                    </div>
                  </Field>
                  <Field label="Font Family">
                    <Input {...register("font_family")} />
                  </Field>
                  <Field label="Border Style">
                    <Input value="Soft Gray" readOnly />
                  </Field>
                  <Field label="Table Header Style">
                    <Input value="Navy filled header" readOnly />
                  </Field>
                  <Field label="Watermark Text">
                    <Input placeholder="Optional watermark" />
                  </Field>
                </div>
              </Section>
            </div>
          )}

          {activeSection === "preview" && (
            <div>
              <Section
                title="Preview Controls"
                description="Preview updates live using sample data for the selected document type."
              >
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setZoom((value) => Math.max(60, value - 10))}
                  >
                    Zoom Out
                  </Button>
                  <Badge variant="secondary">{zoom}%</Badge>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setZoom((value) => Math.min(120, value + 10))
                    }
                  >
                    Zoom In
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.print()}
                  >
                    <Eye className="h-4 w-4" /> Print Preview
                  </Button>
                </div>
              </Section>
            </div>
          )}
        </div>

        <aside className="xl:sticky xl:top-32 xl:self-start">
          <PrintFormatLayoutPreview
            format={previewFormat}
            zoom={zoom}
            company={company}
            branch={activeBranch}
          />
        </aside>
      </div>
    </form>
  );
}

const DataFieldPalette = ({
  fields,
  selectedPlacement,
  fieldSearch,
  onPlacementChange,
  onSearchChange,
  onAddField,
  isFieldUsed,
}: {
  fields: PrintDataField[];
  selectedPlacement: PrintDataFieldPlacement;
  fieldSearch: string;
  onPlacementChange: (placement: PrintDataFieldPlacement) => void;
  onSearchChange: (value: string) => void;
  onAddField: (field: PrintDataField) => void;
  isFieldUsed: (field: PrintDataField) => boolean;
}) => {
  const groupedFields = fields.reduce<Record<string, PrintDataField[]>>(
    (groups, field) => {
      groups[field.group] = [...(groups[field.group] || []), field];
      return groups;
    },
    {}
  );

  return (
    <div className="mb-5 rounded-xl border border-slate-200 bg-[#F8FAFC] p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#002137] shadow-sm">
            <Database className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-[#111827]">
              Data Field Library
            </h3>
            <p className="text-sm leading-6 text-[#64748B]">
              Pick database columns and choose where they appear in the print
              template.
            </p>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-[190px_240px]">
          <Select
            value={selectedPlacement}
            onValueChange={(value) =>
              onPlacementChange(value as PrintDataFieldPlacement)
            }
          >
            <SelectTrigger className="bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(placementLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
            <Input
              value={fieldSearch}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search table or column"
              className="bg-white pl-9"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        {Object.entries(groupedFields).map(([group, groupFields]) => (
          <div
            key={group}
            className="rounded-lg border border-slate-200 bg-white p-3"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                {group}
              </p>
              <Badge variant="secondary">{groupFields.length}</Badge>
            </div>
            <div className="space-y-2">
              {groupFields.map((field) => {
                const used = isFieldUsed(field);
                return (
                  <div
                    key={`${field.table}.${field.column}.${field.key}`}
                    className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 ${
                      used
                        ? "border-[#BFD7EA] bg-[#F1F7FB]"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#111827]">
                        {field.label}
                      </p>
                      <p className="truncate text-xs text-[#64748B]">
                        {field.table}.{field.column}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant={used ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => onAddField(field)}
                    >
                      {used ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      {used ? "Used" : "Add"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {!fields.length && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white py-8 text-center text-sm text-[#64748B] xl:col-span-2">
            No columns match this placement or search.
          </div>
        )}
      </div>
    </div>
  );
};

const Section = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) => (
  <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
    <CardHeader className="border-b border-slate-100 pb-4">
      <CardTitle className="text-lg font-semibold text-[#111827]">
        {title}
      </CardTitle>
      <p className="max-w-2xl text-sm leading-6 text-[#64748B]">
        {description}
      </p>
    </CardHeader>
    <CardContent className="pt-5">{children}</CardContent>
  </Card>
);

const Field = ({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) => (
  <div className="space-y-2.5">
    <Label className="text-sm font-medium text-[#1F2937]">
      {label}
      {required && <span className="text-red-500">*</span>}
    </Label>
    {children}
    {error && <p className="text-xs font-medium text-red-500">{error}</p>}
  </div>
);

const Toggle = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <div
    role="button"
    tabIndex={0}
    aria-pressed={checked}
    onClick={() => onChange(!checked)}
    onKeyDown={(event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onChange(!checked);
      }
    }}
    className={`flex min-h-[58px] w-full items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 text-left shadow-[0_1px_0_rgba(15,23,42,0.03)] transition-all ${
      checked
        ? "border-[#002137] bg-[#F1F7FB] ring-1 ring-[#002137]/10"
        : "border-slate-200 bg-white hover:border-[#BFD7EA] hover:bg-slate-50"
    }`}
  >
    <span className="text-sm font-medium leading-5 text-[#1F2937]">
      {label}
    </span>
    <span className="flex items-center gap-2">
      {checked && (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#002137] text-white">
          <Check className="h-3.5 w-3.5" />
        </span>
      )}
      <span
        aria-hidden="true"
        className={`relative h-5 w-9 rounded-full transition-colors ${
          checked ? "bg-[#002137]" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </span>
    </span>
  </div>
);
