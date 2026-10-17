import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Printer, Sliders } from "lucide-react";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import { Button } from "../../../components/ui/button";
import { useAuth } from "../../../auth/AuthContext";
import type { InvoicePrintFormat } from "../../../types/invoice-center";
import { createDefaultPrintFormat, documentTypes } from "./printFormatDefaults";

type Props = {
  documentType: string;
};

const documentLoaders: Record<string, (id: string) => Promise<any>> = {
  sales_order: (id) => invoiceCenterApi.getSalesOrderById(id),
  sales_invoice: (id) => invoiceCenterApi.getSalesInvoiceById(id),
  credit_note: (id) => invoiceCenterApi.getCreditNoteById(id),
  debit_note: (id) => invoiceCenterApi.getDebitNoteById(id),
  customer_receipt: (id) => invoiceCenterApi.getCustomerReceiptById(id),
};

export default function DocumentPrintPage({ documentType }: Props) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { company: authCompany, activeBranch: authBranch } = useAuth();

  const [format, setFormat] = useState<InvoicePrintFormat>(
    createDefaultPrintFormat(documentType)
  );
  const [availableFormats, setAvailableFormats] = useState<InvoicePrintFormat[]>([]);
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load document data
  useEffect(() => {
    if (!id) return;
    const loader = documentLoaders[documentType];
    if (loader) {
      setLoading(true);
      loader(id)
        .then((response) => setDocument(response.data.data))
        .catch(() => setDocument(null))
        .finally(() => setLoading(false));
    }
  }, [documentType, id]);

  // Load default template and all available templates for this doc type
  useEffect(() => {
    const branchId = document?.branch_id || authBranch?.id;

    // Load available templates
    invoiceCenterApi
      .getPrintFormats({ document_type: documentType, limit: 50 })
      .then((res) => {
        const items = res.data?.data?.items || res.data?.data || [];
        setAvailableFormats(items);
      })
      .catch(() => {});

    // Load active default format
    invoiceCenterApi
      .getDefaultPrintFormat({
        document_type: documentType,
        ...(branchId ? { branch_id: branchId } : {}),
      })
      .then((response) => {
        if (response.data.data) {
          setFormat({
            ...createDefaultPrintFormat(documentType),
            ...response.data.data,
          });
        } else {
          setFormat(createDefaultPrintFormat(documentType));
        }
      })
      .catch(() => setFormat(createDefaultPrintFormat(documentType)));
  }, [documentType, document?.branch_id, authBranch?.id]);

  const visibleFields = useMemo(() => {
    return [...(format.fields || [])]
      .filter((field) => field.is_visible)
      .sort((a, b) => a.display_order - b.display_order);
  }, [format.fields]);

  const title =
    format.format_name ||
    documentTypes.find((type) => type.value === documentType)?.label ||
    "Sales Invoice";

  const lines = document?.lines || document?.allocations || [];

  const formatMoney = (val: any) => {
    const num = Number(val || 0);
    return isNaN(num)
      ? "0.00"
      : num.toLocaleString("en-LK", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
  };

  const valueForField = (line: any, index: number, key: string) => {
    if (key === "line_no") return index + 1;
    if (key === "invoice_number") return line.invoice_number || document?.invoice_number || "INV-000001";
    if (key === "invoice_date") return line.invoice_date || document?.invoice_date?.slice(0, 10) || "";
    if (key === "invoice_amount") return formatMoney(line.invoice_amount || line.total_amount);
    if (key === "previous_paid_amount") return formatMoney(line.previous_paid_amount);
    if (key === "allocated_amount") return formatMoney(line.allocated_amount);
    if (key === "balance_amount") return formatMoney(line.balance_amount);

    if (key === "product_code")
      return line.product?.product_code || line.product_code || "-";
    if (key === "product_name")
      return (
        line.product?.product_name ||
        line.product_name ||
        line.description ||
        "Item"
      );
    if (key === "batch_number")
      return (
        line.batch?.batch_number ||
        line.product_batch?.batch_number ||
        line.batch_number ||
        "-"
      );
    if (key === "expiry_date") {
      const exp = line.batch?.expiry_date || line.product_batch?.expiry_date || line.expiry_date;
      return exp ? String(exp).slice(0, 7) : "-";
    }

    if (key === "quantity") return line.quantity || "1";
    if (key === "received_quantity") return line.received_quantity || line.quantity || "1";
    if (key === "accepted_quantity") return line.accepted_quantity || line.quantity || "1";
    if (key === "rejected_quantity") return line.rejected_quantity || "0";

    if (key === "unit_price") return formatMoney(line.unit_price || line.price);
    if (key === "purchase_cost") return formatMoney(line.purchase_cost || line.unit_cost);
    if (key === "discount_amount") return formatMoney(line.discount_amount);
    if (key === "tax_amount") return formatMoney(line.tax_amount);
    if (key === "line_total" || key === "total") {
      const qty = Number(line.quantity || line.received_quantity || 1);
      const price = Number(line.unit_price || line.purchase_cost || 0);
      const discount = Number(line.discount_amount || 0);
      const tax = Number(line.tax_amount || 0);
      const tot = line.line_total || line.total_amount || (qty * price - discount + tax);
      return formatMoney(tot);
    }

    if (key === "line_remarks" || key === "remarks" || key === "description") {
      return line.line_remarks || line.remarks || line.description || "";
    }

    return line[key] ?? "";
  };

  const companyName =
    document?.company?.company_name ||
    authCompany?.company_name ||
    authCompany?.name ||
    "Pharma Dist Lanka (Pvt) Ltd";

  const branchName =
    document?.branch?.branch_name ||
    authBranch?.branch_name ||
    "Main Branch";

  const branchAddress =
    document?.branch?.address_line_1 ||
    document?.branch?.city ||
    authBranch?.city ||
    "Colombo, Sri Lanka";

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 print:bg-white print:p-0">
      {/* Non-printing Control Toolbar */}
      <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-6 py-3.5 shadow-sm backdrop-blur print:hidden">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div className="text-sm font-semibold text-slate-800">
            Print Preview: {document?.invoice_number || document?.order_number || id}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Template Selection Dropdown */}
          {availableFormats.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Template:</span>
              <select
                value={format.id || ""}
                onChange={(e) => {
                  const selected = availableFormats.find((f) => String(f.id) === e.target.value);
                  if (selected) setFormat(selected);
                }}
                className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {availableFormats.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.format_name} {f.is_default ? "(Default)" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button
            onClick={() => window.print()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print Now
          </Button>
        </div>
      </div>

      {/* Printable Sheet */}
      <div className="p-4 sm:p-8 print:p-0">
        <main
          className="mx-auto max-w-4xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm print:m-0 print:max-w-none print:rounded-none print:border-0 print:p-6 print:shadow-none"
          style={{ fontFamily: format.font_family || "Inter" }}
        >
          {/* Header */}
          <header
            className="mb-6 flex items-start justify-between border-b pb-5"
            style={{ borderColor: format.primary_color || "#4854CC" }}
          >
            <div>
              {format.show_company_name && (
                <div className="text-2xl font-bold tracking-tight text-slate-900">
                  {companyName}
                </div>
              )}
              {format.show_branch_details && (
                <div className="mt-1 text-xs text-slate-600">
                  <p className="font-semibold">{branchName}</p>
                  <p>{branchAddress}</p>
                </div>
              )}
            </div>
            <div className="text-right">
              <h1
                className="text-2xl font-black uppercase tracking-wider"
                style={{ color: format.primary_color || "#4854CC" }}
              >
                {title}
              </h1>
              <div className="mt-1 font-mono text-sm font-bold text-slate-800">
                {document?.invoice_number ||
                  document?.order_number ||
                  document?.receipt_number ||
                  id}
              </div>
              {format.show_document_status && (
                <div className="mt-1 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  {document?.posted_status ||
                    document?.approval_status ||
                    "Draft"}
                </div>
              )}
            </div>
          </header>

          {/* Customer & Date Details */}
          {format.show_customer_details && (
            <section className="mb-6 grid grid-cols-2 gap-6 rounded-lg bg-slate-50/70 p-4 text-xs border border-slate-100">
              <div className="space-y-1">
                <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                  Billed To
                </span>
                <p className="font-bold text-slate-900 text-sm">
                  {document?.customer?.customer_name ||
                    document?.customer_name ||
                    "Valued Customer"}
                </p>
                {document?.customer?.address_line_1 && (
                  <p className="text-slate-600">{document.customer.address_line_1}</p>
                )}
                {document?.customer?.city && (
                  <p className="text-slate-600">{document.customer.city}</p>
                )}
                {document?.customer?.phone && (
                  <p className="text-slate-600">Tel: {document.customer.phone}</p>
                )}
              </div>
              <div className="space-y-1 text-right">
                <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                  Invoice Details
                </span>
                <p className="text-slate-700">
                  <span className="font-medium text-slate-500">Date: </span>
                  <span className="font-semibold text-slate-900">
                    {document?.invoice_date ? document.invoice_date.slice(0, 10) : new Date().toISOString().slice(0, 10)}
                  </span>
                </p>
                {document?.due_date && (
                  <p className="text-slate-700">
                    <span className="font-medium text-slate-500">Due Date: </span>
                    <span className="font-semibold text-slate-900">
                      {document.due_date.slice(0, 10)}
                    </span>
                  </p>
                )}
                {document?.customer_reference_number && (
                  <p className="text-slate-700">
                    <span className="font-medium text-slate-500">PO / Ref: </span>
                    <span className="font-semibold text-slate-900 font-mono">
                      {document.customer_reference_number}
                    </span>
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Line Items Table */}
          <table className="w-full border-collapse text-xs">
            <thead
              style={{
                backgroundColor: format.primary_color || "#4854CC",
                color: "white",
              }}
            >
              <tr>
                {visibleFields.map((field, fieldIndex) => (
                  <th
                    key={`${field.field_key}-${fieldIndex}`}
                    className="px-3 py-2.5 font-bold uppercase tracking-wider text-[11px]"
                    style={{ textAlign: field.alignment || "left" }}
                  >
                    {field.field_label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(lines.length ? lines : [{}]).map((line: any, index: number) => (
                <tr
                  key={line.id || index}
                  className="border-b border-slate-200 even:bg-slate-50/40"
                >
                  {visibleFields.map((field, fieldIndex) => (
                    <td
                      key={`${field.field_key}-${fieldIndex}`}
                      className="px-3 py-2.5 text-slate-800"
                      style={{
                        textAlign: field.alignment || "left",
                        width: field.column_width,
                      }}
                    >
                      {valueForField(line, index, field.field_key)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Section */}
          <section className="mt-6 flex justify-end">
            <div className="w-72 space-y-1.5 rounded-lg bg-slate-50 p-4 border border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-900 font-mono">
                  {formatMoney(document?.subtotal || document?.total_amount)}
                </span>
              </div>
              {Number(document?.discount_amount || 0) > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Discount:</span>
                  <span className="font-semibold text-emerald-600 font-mono">
                    -{formatMoney(document?.discount_amount)}
                  </span>
                </div>
              )}
              {Number(document?.tax_amount || 0) > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Tax (VAT):</span>
                  <span className="font-semibold text-slate-900 font-mono">
                    +{formatMoney(document?.tax_amount)}
                  </span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-bold text-slate-900">
                <span>Total Amount:</span>
                <span
                  className="text-base font-black font-mono"
                  style={{ color: format.primary_color || "#4854CC" }}
                >
                  {formatMoney(document?.total_amount || document?.invoice_amount)} LKR
                </span>
              </div>
            </div>
          </section>

          {/* Remarks & Terms */}
          {document?.remarks && (
            <div className="mt-4 p-3 bg-amber-50/60 border border-amber-200/60 rounded-lg text-xs text-amber-900">
              <span className="font-bold">Remarks: </span>
              <span>{document.remarks}</span>
            </div>
          )}

          {format.terms_and_conditions && (
            <div className="mt-6 border-t border-slate-100 pt-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Terms & Conditions
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500 whitespace-pre-line">
                {format.terms_and_conditions}
              </p>
            </div>
          )}

          {/* Signatures */}
          {format.show_signature_section && (
            <div className="mt-14 flex items-end justify-between pt-6 border-t border-dashed border-slate-200 text-xs text-slate-500">
              <div className="text-center w-48">
                <div className="h-8 border-b border-slate-300" />
                <span className="mt-1 block text-[11px] font-medium">Customer Acknowledgment</span>
              </div>
              <div className="text-center w-48">
                <div className="h-8 border-b border-slate-300" />
                <span className="mt-1 block text-[11px] font-medium">Authorized Signature</span>
              </div>
            </div>
          )}

          {/* Footer Note */}
          {format.footer_note && (
            <footer className="mt-8 border-t border-slate-100 pt-3 text-center text-[10px] text-slate-400">
              {format.footer_note}
            </footer>
          )}
        </main>
      </div>
    </div>
  );
}
