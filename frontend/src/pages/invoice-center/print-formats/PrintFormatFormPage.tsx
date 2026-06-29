import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Eye, FileText, Palette, Save, Settings2 } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Separator } from "../../../components/ui/separator";
import { Switch } from "../../../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Textarea } from "../../../components/ui/textarea";
import type { InvoicePrintFormat } from "../../../types/invoice-center";
import { PrintFormatFieldBuilder } from "./PrintFormatFieldBuilder";
import { PrintFormatLayoutPreview } from "./PrintFormatLayoutPreview";
import { createDefaultPrintFormat, documentTypes } from "./printFormatDefaults";

const schema = z.object({
  format_name: z.string().min(2, "Format name is required"),
  document_type: z.string().min(1),
  branch_id: z.any().optional(),
  paper_size: z.string().min(1),
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
  fields: z.array(z.object({
    field_key: z.string().min(1),
    field_label: z.string().min(1),
    is_visible: z.boolean(),
    display_order: z.number(),
    column_width: z.number().min(40),
    alignment: z.enum(["left", "center", "right"]),
  })).min(1),
});

export default function PrintFormatFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [saving, setSaving] = useState(false);

  const form = useForm<InvoicePrintFormat>({
    resolver: zodResolver(schema),
    defaultValues: createDefaultPrintFormat(),
  });
  const { register, control, handleSubmit, reset, setValue, watch } = form;
  const currentFormat = useWatch({ control }) as InvoicePrintFormat;
  const previewFormat = useMemo(() => ({ ...createDefaultPrintFormat(), ...currentFormat }), [currentFormat]);

  useEffect(() => {
    if (!isEdit || !id) return;
    invoiceCenterApi.getPrintFormatById(id).then((response) => {
      reset({ ...createDefaultPrintFormat(), ...response.data.data, branch_id: response.data.data.branch_id || null });
    }).catch((error) => {
      toast.error(error?.response?.data?.message || "Failed to load print format");
      navigate("/invoice-center/settings/print-formats");
    });
  }, [id, isEdit, navigate, reset]);

  const onSubmit = async (values: InvoicePrintFormat) => {
    setSaving(true);
    try {
      const payload = {
        ...values,
        branch_id: values.branch_id ? Number(values.branch_id) : null,
        fields: values.fields.map((field, index) => ({ ...field, display_order: index + 1 })),
      };
      if (isEdit && id) {
        await invoiceCenterApi.updatePrintFormat(id, payload as any);
      } else {
        await invoiceCenterApi.createPrintFormat(payload as any);
      }
      toast.success("Print format saved");
      navigate("/invoice-center/settings/print-formats");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save print format");
    } finally {
      setSaving(false);
    }
  };

  const toggleField = (name: keyof InvoicePrintFormat, checked: boolean) => setValue(name as any, checked);

  const optionToggles: [keyof InvoicePrintFormat, string][] = [
    ["show_company_logo", "Company Logo"],
    ["show_company_name", "Company Name"],
    ["show_branch_details", "Branch Details"],
    ["show_customer_details", "Customer Details"],
    ["show_document_status", "Document Status"],
    ["show_payment_terms", "Payment Terms"],
    ["show_bank_details", "Bank Details"],
    ["show_signature_section", "Signature"],
    ["show_qr_code", "QR Code"],
    ["is_default", "Default Format"],
    ["is_active", "Active"],
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/75 p-4 shadow-[0_8px_30px_rgba(2,62,138,0.08)] backdrop-blur-xl md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Button type="button" variant="outline" size="icon" asChild>
            <Link to="/invoice-center/settings/print-formats" aria-label="Back">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#0077B6]" />
              <h1 className="truncate text-2xl font-semibold tracking-tight text-[#111827]">
                {isEdit ? "Edit Print Format" : "Create Print Format"}
              </h1>
            </div>
            <p className="mt-1 text-sm text-[#6B7280]">
              Configure print layout, visible line columns, and live document preview.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" asChild>
            <Link to="/invoice-center/settings/print-formats">Cancel</Link>
          </Button>
          <Button type="submit" disabled={saving}>
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      <Tabs defaultValue="settings" className="w-full gap-4">
        <TabsList className="w-full justify-start overflow-x-auto bg-white/70">
          <TabsTrigger value="settings" className="min-w-28">
            <Settings2 className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="fields" className="min-w-28">
            <Palette className="h-4 w-4" />
            Fields
          </TabsTrigger>
          <TabsTrigger value="preview" className="min-w-28">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="mt-0 grid gap-4 xl:grid-cols-[minmax(0,1fr)_430px]">
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-[#111827]">Basic Format</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Format Name</Label>
                  <Input {...register("format_name")} />
                </div>
                <div className="space-y-2">
                  <Label>Document Type</Label>
                  <Select value={watch("document_type")} onValueChange={(value) => setValue("document_type", value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{documentTypes.map((type) => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Paper Size</Label>
                  <Select value={watch("paper_size")} onValueChange={(value) => setValue("paper_size", value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["A4", "A5", "Letter", "Thermal_80mm", "Custom"].map((size) => <SelectItem key={size} value={size}>{size}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Orientation</Label>
                  <Select value={watch("orientation")} onValueChange={(value) => setValue("orientation", value as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">Portrait</SelectItem>
                      <SelectItem value="landscape">Landscape</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex h-10 items-center gap-3 rounded-xl border border-slate-300 bg-white/70 px-3">
                    <input
                      type="color"
                      {...register("primary_color")}
                      className="h-6 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
                    />
                    <span className="text-sm font-medium text-[#1F2937]">{watch("primary_color")}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Font Family</Label>
                  <Input {...register("font_family")} />
                </div>
              </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-[#111827]">Visible Sections</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                {optionToggles.map(([key, label]) => (
                  <div key={key} className="flex h-12 items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/70 px-3">
                    <Label className="text-sm font-medium text-[#1F2937]">{label}</Label>
                    <Switch checked={Boolean(watch(key))} onCheckedChange={(checked) => toggleField(key, checked)} />
                  </div>
                ))}
              </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-[#111827]">Footer Text</CardTitle>
              </CardHeader>
              <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Terms and Conditions</Label>
                  <Textarea rows={4} {...register("terms_and_conditions")} />
                </div>
                <div className="space-y-2">
                  <Label>Footer Note</Label>
                  <Textarea rows={4} {...register("footer_note")} />
                </div>
              </div>
              </CardContent>
            </Card>
          </div>
          <div className="xl:sticky xl:top-20 xl:self-start">
            <PrintFormatLayoutPreview format={previewFormat} />
          </div>
        </TabsContent>

        <TabsContent value="fields" className="mt-4">
          <PrintFormatFieldBuilder control={control} register={register} setValue={setValue as any} watch={watch} />
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          <div className="mx-auto max-w-4xl">
            <PrintFormatLayoutPreview format={previewFormat} />
          </div>
        </TabsContent>
      </Tabs>
    </form>
  );
}
