import type { InvoicePrintFormat } from "../../../types/invoice-center";
import { documentTypes } from "./printFormatDefaults";

type Props = {
  format: InvoicePrintFormat;
  zoom?: number;
  company?: Record<string, any> | null;
  branch?: Record<string, any> | null;
};

const sampleLines: Record<string, Record<string, string>> = {
  sales_invoice: {
    line_no: "1",
    product_code: "MED-001",
    product_name: "Paracetamol 500mg",
    generic_name: "Paracetamol",
    manufacturer: "OMACX Pharma",
    batch_number: "B2406",
    expiry_date: "2027-12",
    quantity: "10",
    free_quantity: "1",
    unit: "Box",
    unit_price: "120.00",
    mrp: "135.00",
    discount_amount: "0.00",
    tax_amount: "0.00",
    line_total: "1,200.00",
  },
  customer_receipt: {
    invoice_number: "INV-000001",
    invoice_date: "2026-06-28",
    invoice_amount: "25,000.00",
    previous_paid_amount: "0.00",
    allocated_amount: "25,000.00",
    balance_amount: "0.00",
  },
  grn: {
    line_no: "1",
    product_code: "AMX-001",
    product_name: "Amoxicillin 500mg",
    batch_number: "AMX-2401",
    expiry_date: "2027-05",
    received_quantity: "100",
    accepted_quantity: "98",
    rejected_quantity: "2",
    purchase_cost: "85.00",
    line_total: "8,330.00",
  },
};

const detailText: Record<string, string[]> = {
  sales_invoice: [
    "Customer: ABC Pharmacy",
    "License No: PH-20418",
    "Route: Colombo",
    "Payment Terms: 30 Days",
  ],
  customer_receipt: [
    "Customer: ABC Pharmacy",
    "Payment Method: Bank Transfer",
    "Receipt Amount: 25,000.00",
    "Reference: BT-8291",
  ],
  grn: [
    "Supplier: Pharma Supplier Ltd",
    "Supplier Invoice: SUP-INV-2001",
    "Warehouse: Main Warehouse",
    "Received By: Store Manager",
  ],
};

export function PrintFormatLayoutPreview({
  format,
  zoom = 82,
  company,
  branch,
}: Props) {
  const visibleFields = [...(format.fields || [])]
    .filter((field) => field.is_visible)
    .sort((a, b) => a.display_order - b.display_order);

  const companyName =
    company?.company_name ||
    company?.legal_name ||
    company?.name ||
    "Your Company";
  const companyInitials = companyName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const branchName =
    branch?.branch_name || branch?.name || branch?.branch_code || "Main Branch";
  const branchLocation =
    branch?.city || branch?.address_line_1 || branch?.address || "";
  const licenseNumber =
    company?.license_number ||
    company?.registration_number ||
    company?.tax_number ||
    branch?.license_number ||
    "";

  const documentLabel =
    documentTypes.find((type) => type.value === format.document_type)?.label ||
    "Document";
  const sample = sampleLines[format.document_type] || sampleLines.sales_invoice;
  const details = detailText[format.document_type] || detailText.sales_invoice;
  const isReceipt = format.document_type === "customer_receipt";
  const paperWidth =
    format.paper_size === "Thermal 80mm"
      ? 320
      : format.orientation === "landscape"
      ? 920
      : 680;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-[#111827]">
            Live Preview
          </h3>
          <p className="mt-0.5 text-xs text-[#6B7280]">
            {format.paper_size} / {format.orientation} / {zoom}%
          </p>
        </div>
        <span className="rounded-full bg-[#EEF5FA] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#002137]">
          {documentLabel}
        </span>
      </div>

      <div className="max-h-[calc(100vh-220px)] overflow-auto rounded-lg border border-slate-200 bg-[#F8FAFC] p-4">
        <div
          className="origin-top rounded-lg border border-slate-200 bg-white p-5 text-sm shadow-[0_18px_45px_rgba(15,23,42,0.10)]"
          style={{
            width: paperWidth,
            minHeight: format.paper_size === "Thermal 80mm" ? 620 : 900,
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top left",
            marginBottom: `-${Math.max(0, 100 - zoom) * 5}px`,
            fontFamily: format.font_family || "Inter",
          }}
        >
          <header
            className={`mb-5 flex gap-4 border-b pb-4 ${
              format.logo_position === "center"
                ? "flex-col items-center text-center"
                : "items-start justify-between"
            }`}
            style={{ borderColor: format.primary_color || "#002137" }}
          >
            <div>
              {format.show_company_logo && (
                <div className="mb-2 inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold">
                  {company?.logo_url ? (
                    <img
                      src={company.logo_url}
                      alt={companyName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    companyInitials || "CO"
                  )}
                </div>
              )}
              {format.show_company_name && (
                <div className="text-xl font-bold text-slate-900">
                  {companyName}
                </div>
              )}
              {format.show_branch_details && (
                <div className="mt-1 text-xs text-slate-500">
                  {[branchName, branchLocation, licenseNumber]
                    .filter(Boolean)
                    .join(" • ")}
                </div>
              )}
            </div>
            <div
              className={
                format.logo_position === "center" ? "text-center" : "text-right"
              }
            >
              <div
                className="text-lg font-semibold"
                style={{ color: format.primary_color || "#002137" }}
              >
                {documentLabel}
              </div>
              {format.show_document_status && (
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  Draft
                </div>
              )}
            </div>
          </header>

          {format.show_customer_details && (
            <section className="mb-4 grid grid-cols-2 gap-3 text-xs text-slate-600">
              {details.map((item) => (
                <div key={item}>{item}</div>
              ))}
            </section>
          )}

          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full border-collapse text-xs">
              <thead
                style={{
                  backgroundColor: format.primary_color || "#002137",
                  color: "white",
                }}
              >
                <tr>
                  {visibleFields.map((field, index) => (
                    <th
                      key={`${field.field_key}-${index}`}
                      className="px-2 py-2 font-medium"
                      style={{
                        textAlign: field.alignment,
                        width: field.column_width,
                        minWidth: field.column_width,
                      }}
                    >
                      {field.field_label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {visibleFields.map((field, index) => (
                    <td
                      key={`${field.field_key}-${index}`}
                      className="border-t px-2 py-2"
                      style={{ textAlign: field.alignment }}
                    >
                      {sample[field.field_key] || "-"}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <section className="mt-6 flex justify-end">
            <div className="w-72 rounded-lg border border-slate-200 p-3 text-right">
              <div className="text-xs text-slate-500">
                {isReceipt ? "Receipt Amount" : "Gross Total"}
              </div>
              <div className="text-xl font-semibold text-slate-900">
                {isReceipt ? "25,000.00" : "1,200.00"}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Amount in words: Twenty five thousand rupees only
              </div>
            </div>
          </section>

          {format.terms_and_conditions && (
            <div className="mt-6 text-xs text-slate-500">
              {format.terms_and_conditions}
            </div>
          )}
          {format.show_signature_section && (
            <div className="mt-14 grid grid-cols-3 gap-6 text-center text-xs text-slate-500">
              <div className="border-t pt-2">Prepared By</div>
              <div className="border-t pt-2">Checked By</div>
              <div className="border-t pt-2">Authorized Signature</div>
            </div>
          )}
          {format.footer_note && (
            <footer className="mt-6 border-t pt-3 text-center text-xs text-slate-500">
              {format.footer_note}
            </footer>
          )}
        </div>
      </div>
    </div>
  );
}
