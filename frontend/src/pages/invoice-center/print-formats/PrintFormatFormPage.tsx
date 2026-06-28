import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save } from "lucide-react";
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="icon" asChild>
            <Link to="/invoice-center/settings/print-formats"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{isEdit ? "Edit Print Format" : "Create Print Format"}</h1>
            <p className="text-sm text-slate-500">Layout, defaults, and line-column visibility.</p>
          </div>
        </div>
        <Button type="submit" disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          Save
        </Button>
      </div>

      <Tabs defaultValue="settings">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="fields">Fields</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="mt-4 grid gap-4 lg:grid-cols-[1fr_380px]">
          <Card>
            <CardHeader><CardTitle className="text-base">Format Settings</CardTitle></CardHeader>
            <CardContent className="space-y-5">
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
                  <Input type="color" {...register("primary_color")} />
                </div>
                <div className="space-y-2">
                  <Label>Font Family</Label>
                  <Input {...register("font_family")} />
                </div>
              </div>

              <Separator />

              <div className="grid gap-3 md:grid-cols-2">
                {[
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
                ].map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between rounded-md border p-3">
                    <Label>{label}</Label>
                    <Switch checked={Boolean(watch(key as any))} onCheckedChange={(checked) => toggleField(key as keyof InvoicePrintFormat, checked)} />
                  </div>
                ))}
              </div>

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
          <PrintFormatLayoutPreview format={previewFormat} />
        </TabsContent>

        <TabsContent value="fields" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <PrintFormatFieldBuilder control={control} register={register} setValue={setValue as any} watch={watch} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          <PrintFormatLayoutPreview format={previewFormat} />
        </TabsContent>
      </Tabs>
    </form>
  );
}
