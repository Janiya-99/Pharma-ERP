import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Eye,
  FileText,
  Maximize2,
  Save,
  Star,
} from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import { Textarea } from "../../../components/ui/textarea";
import type {
  InvoicePrintFormat,
  InvoicePrintFormatField,
} from "../../../types/invoice-center";
import { PrintFormatLayoutPreview } from "./PrintFormatLayoutPreview";
import {
  createDefaultPrintFormat,
  documentTypes,
  getDefaultPrintFields,
  headerLayouts,
  paperSizes,
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

export default function PrintFormatFormPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [saving, setSaving] = useState(false);
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
  const { control, handleSubmit, register, reset, setValue, watch } = form;
  const currentFormat = useWatch({ control }) as InvoicePrintFormat;
  const previewFormat = useMemo(
    () => ({
      ...createDefaultPrintFormat(currentFormat.document_type),
      ...currentFormat,
    }),
    [currentFormat]
  );

  const documentLabel =
    documentTypes.find((type) => type.value === previewFormat.document_type)
      ?.label || "Document";

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
      detailFieldsByDocument[watch("document_type")] ||
      detailFieldsByDocument.sales_invoice;
    setVisibleDetails(Object.fromEntries(fields.map((field) => [field, true])));
  }, [watch("document_type")]);

  const onSubmit = async (values: InvoicePrintFormat) => {
    setSaving(true);
    try {
      const payload = {
        ...values,
        branch_id: values.branch_id ? Number(values.branch_id) : null,
        fields: values.fields.map((field, index) => ({
          ...field,
          display_order: index + 1,
        })),
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
    setValue("fields", getDefaultPrintFields(documentType));
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

  const applyPreset = (preset: string) => {
    const theme = themePresets.find((item) => item.name === preset);
    if (theme) setValue("primary_color", theme.color);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="page-content space-y-4 pb-32"
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
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              window.open(
                location.pathname.replace(/\/edit$/, "/preview"),
                "_blank"
              )
            }
          >
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

      <div className="grid gap-4 xl:grid-cols-[minmax(0,65fr)_minmax(360px,35fr)]">
        <Tabs defaultValue="setup" className="min-w-0">
          <TabsList className="grid h-auto grid-cols-2 gap-2 bg-white/80 p-2 md:grid-cols-4 xl:grid-cols-8">
            {[
              "setup",
              "header",
              "details",
              "lines",
              "totals",
              "footer",
              "branding",
              "preview",
            ].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="rounded-xl capitalize"
              >
                {tab === "lines" ? "Line Table" : tab}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="setup" className="mt-4">
            <Section
              title="Template Setup"
              description="Choose document scope, paper style, and status. Empty branch means company-wide template."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Template Name" required>
                  <Input
                    {...register("format_name")}
                    placeholder="Premium Sales Invoice"
                  />
                </Field>
                <Field label="Document Type" required>
                  <Select
                    value={watch("document_type")}
                    onValueChange={setDocumentType}
                  >
                    <SelectTrigger>
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
                <Field label="Paper Size" required>
                  <Select
                    value={watch("paper_size")}
                    onValueChange={(value) => setValue("paper_size", value)}
                  >
                    <SelectTrigger>
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
                <Field label="Orientation" required>
                  <Select
                    value={watch("orientation")}
                    onValueChange={(value) =>
                      setValue("orientation", value as "portrait" | "landscape")
                    }
                  >
                    <SelectTrigger>
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
          </TabsContent>

          <TabsContent value="header" className="mt-4">
            <Section
              title="Header"
              description="Control company, branch, document title, and pharma distribution header details."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Logo Position">
                  <Select
                    value={watch("logo_position")}
                    onValueChange={(value) => setValue("logo_position", value)}
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
                    onValueChange={(value) => setValue("header_layout", value)}
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
          </TabsContent>

          <TabsContent value="details" className="mt-4">
            <Section
              title="Document Details"
              description="Choose the information shown above the line table."
            >
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
          </TabsContent>

          <TabsContent value="lines" className="mt-4">
            <Section
              title="Line Table Builder"
              description="Choose visible columns, labels, width, alignment, and order. Width affects the preview."
            >
              <div className="space-y-3">
                {(watch("fields") || []).map((field, index) => (
                  <div
                    key={field.field_key}
                    className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 lg:grid-cols-[48px_1fr_100px_130px_92px]"
                  >
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => moveField(index, -1)}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => moveField(index, 1)}
                        disabled={index === watch("fields").length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-[120px_1fr]">
                      <Toggle
                        label="Visible"
                        checked={field.is_visible}
                        onChange={(checked) =>
                          updateField(index, { is_visible: checked })
                        }
                      />
                      <Input
                        value={field.field_label}
                        onChange={(event) =>
                          updateField(index, {
                            field_label: event.target.value,
                          })
                        }
                      />
                    </div>
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
                    <Badge variant="outline" className="justify-center">
                      Order {index + 1}
                    </Badge>
                  </div>
                ))}
              </div>
            </Section>
          </TabsContent>

          <TabsContent value="totals" className="mt-4">
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
          </TabsContent>

          <TabsContent value="footer" className="mt-4">
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
          </TabsContent>

          <TabsContent value="branding" className="mt-4">
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
          </TabsContent>

          <TabsContent value="preview" className="mt-4">
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
                  onClick={() => setZoom((value) => Math.min(120, value + 10))}
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
          </TabsContent>
        </Tabs>

        <aside className="xl:sticky xl:top-32 xl:self-start">
          <PrintFormatLayoutPreview format={previewFormat} zoom={zoom} />
        </aside>
      </div>
    </form>
  );
}

const Section = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) => (
  <Card className="rounded-2xl border-slate-200 bg-white/80 shadow-sm">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg font-semibold text-[#111827]">
        {title}
      </CardTitle>
      <p className="text-sm text-[#6B7280]">{description}</p>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

const Field = ({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium text-[#1F2937]">
      {label}
      {required && <span className="text-red-500">*</span>}
    </Label>
    {children}
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
  <div className="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2">
    <Label className="text-sm font-medium text-[#1F2937]">{label}</Label>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);
