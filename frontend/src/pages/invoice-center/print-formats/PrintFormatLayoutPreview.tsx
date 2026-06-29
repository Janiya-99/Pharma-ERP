import type { InvoicePrintFormat } from "../../../types/invoice-center";

type Props = {
  format: InvoicePrintFormat;
};

const sampleLine: Record<string, string> = {
  line_no: "1",
  product_code: "MED-001",
  product_name: "Paracetamol 500mg",
  batch_number: "GRN-B-2408",
  expiry_date: "2027-08-31",
  quantity: "12",
  unit_price: "120.00",
  discount_amount: "0.00",
  tax_amount: "0.00",
  line_total: "1,440.00",
};

export function PrintFormatLayoutPreview({ format }: Props) {
  const visibleFields = [...(format.fields || [])]
    .filter((field) => field.is_visible)
    .sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/75 p-4 shadow-[0_8px_30px_rgba(2,62,138,0.08)] backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-[#111827]">Live Preview</h3>
          <p className="mt-0.5 text-xs text-[#6B7280]">A4 document sample using the current settings.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#374151]">
          {format.orientation}
        </span>
      </div>

      <div className="min-h-[520px] rounded-xl border border-slate-200 bg-slate-50/80 p-3">
        <div className="mx-auto min-h-[490px] max-w-[760px] rounded-lg border border-slate-200 bg-white p-5 text-sm shadow-sm" style={{ fontFamily: format.font_family || "Inter" }}>
      <div className="mb-5 flex items-start justify-between gap-4 border-b pb-4" style={{ borderColor: format.primary_color || "#0077B6" }}>
        <div>
          {format.show_company_name && <div className="text-lg font-bold text-slate-900">OMACX Pharmacy</div>}
          {format.show_branch_details && <div className="mt-1 text-xs text-slate-500">Main Branch • Colombo</div>}
        </div>
        <div className="text-right">
          <div className="text-base font-semibold" style={{ color: format.primary_color || "#0077B6" }}>Sales Invoice</div>
          {format.show_document_status && <div className="text-xs uppercase tracking-wide text-slate-500">Draft</div>}
        </div>
      </div>

      {format.show_customer_details && (
        <div className="mb-4 grid grid-cols-2 gap-4 text-xs text-slate-600">
          <div><span className="font-medium text-slate-900">Customer:</span> ABC Pharmacy</div>
          <div className="text-right"><span className="font-medium text-slate-900">Date:</span> 2026-06-28</div>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full border-collapse text-xs">
          <thead style={{ backgroundColor: format.primary_color || "#0077B6", color: "white" }}>
            <tr>
              {visibleFields.map((field) => (
                <th key={field.field_key} className="px-2 py-2 font-medium" style={{ textAlign: field.alignment }}>
                  {field.field_label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {visibleFields.map((field) => (
                <td key={field.field_key} className="border-t px-2 py-2" style={{ textAlign: field.alignment }}>
                  {sampleLine[field.field_key] || "-"}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {format.terms_and_conditions && <div className="mt-4 text-xs text-slate-500">{format.terms_and_conditions}</div>}
      {format.show_signature_section && <div className="mt-10 flex justify-end text-xs text-slate-500">Authorized Signature</div>}
      {format.footer_note && <div className="mt-4 border-t pt-3 text-center text-xs text-slate-500">{format.footer_note}</div>}
        </div>
      </div>
    </div>
  );
}
