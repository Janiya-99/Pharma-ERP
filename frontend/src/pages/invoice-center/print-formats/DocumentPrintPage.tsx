import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Printer } from "lucide-react";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import { Button } from "../../../components/ui/button";
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
  const [format, setFormat] = useState<InvoicePrintFormat>(
    createDefaultPrintFormat(documentType)
  );
  const [document, setDocument] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    const loader = documentLoaders[documentType];
    if (loader) {
      loader(id)
        .then((response) => setDocument(response.data.data))
        .catch(() => setDocument(null));
    }
  }, [documentType, id]);

  useEffect(() => {
    const branchId = document?.branch_id;
    invoiceCenterApi
      .getDefaultPrintFormat({
        document_type: documentType,
        ...(branchId ? { branch_id: branchId } : {}),
      })
      .then((response) => {
        if (response.data.data)
          setFormat({
            ...createDefaultPrintFormat(documentType),
            ...response.data.data,
          });
        else setFormat(createDefaultPrintFormat(documentType));
      })
      .catch(() => setFormat(createDefaultPrintFormat(documentType)));
  }, [documentType, document?.branch_id]);

  const visibleFields = useMemo(() => {
    return [...(format.fields || [])]
      .filter((field) => field.is_visible)
      .sort((a, b) => a.display_order - b.display_order);
  }, [format.fields]);

  const title =
    documentTypes.find((type) => type.value === documentType)?.label ||
    "Document";
  const lines = document?.lines || document?.allocations || [];

  const valueForField = (line: any, index: number, key: string) => {
    if (key === "line_no") return index + 1;
    if (key === "invoice_number") return line.invoice_number || "INV-000001";
    if (key === "invoice_date") return line.invoice_date || "2026-06-28";
    if (key === "invoice_amount") return line.invoice_amount || "25,000.00";
    if (key === "previous_paid_amount")
      return line.previous_paid_amount || "0.00";
    if (key === "allocated_amount") return line.allocated_amount || "25,000.00";
    if (key === "balance_amount") return line.balance_amount || "0.00";
    if (key === "product_code")
      return line.product?.product_code || line.product_code || "";
    if (key === "product_name")
      return (
        line.product?.product_name ||
        line.product_name ||
        line.description ||
        ""
      );
    if (key === "batch_number")
      return (
        line.batch?.batch_number ||
        line.product_batch?.batch_number ||
        line.batch_number ||
        ""
      );
    if (key === "expiry_date")
      return (
        line.batch?.expiry_date ||
        line.product_batch?.expiry_date ||
        line.expiry_date ||
        ""
      );
    if (key === "received_quantity")
      return line.received_quantity || line.quantity || "100";
    if (key === "accepted_quantity") return line.accepted_quantity || "100";
    if (key === "rejected_quantity") return line.rejected_quantity || "0";
    if (key === "purchase_cost")
      return line.purchase_cost || line.unit_cost || "85.00";
    return line[key] ?? "";
  };

  return (
    <div className="min-h-screen bg-white p-6 text-slate-900 print:p-0">
      <div className="mb-4 flex justify-end print:hidden">
        <Button onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
      </div>
      <main
        className="mx-auto max-w-5xl border bg-white p-8 print:mx-0 print:max-w-none print:border-0"
        style={{ fontFamily: format.font_family || "Inter" }}
      >
        <header
          className="mb-6 flex items-start justify-between border-b pb-4"
          style={{ borderColor: format.primary_color || "#2563eb" }}
        >
          <div>
            {format.show_company_name && (
              <div className="text-xl font-bold">OMACX Pharmacy</div>
            )}
            {format.show_branch_details && (
              <div className="mt-1 text-sm text-slate-500">
                Branch #{document?.branch_id || "-"}
              </div>
            )}
          </div>
          <div className="text-right">
            <h1
              className="text-xl font-semibold"
              style={{ color: format.primary_color || "#2563eb" }}
            >
              {title}
            </h1>
            {format.show_document_status && (
              <div className="text-xs uppercase text-slate-500">
                {document?.posted_status ||
                  document?.approval_status ||
                  "draft"}
              </div>
            )}
          </div>
        </header>

        {format.show_customer_details && (
          <section className="mb-5 grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium">Customer</div>
              <div className="text-slate-600">
                {document?.customer?.customer_name ||
                  document?.customer_name ||
                  "-"}
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">Reference</div>
              <div className="text-slate-600">
                {document?.invoice_number ||
                  document?.sales_order_number ||
                  document?.credit_note_number ||
                  document?.debit_note_number ||
                  document?.receipt_number ||
                  id}
              </div>
            </div>
          </section>
        )}

        <table className="w-full border-collapse text-sm">
          <thead
            style={{
              backgroundColor: format.primary_color || "#2563eb",
              color: "white",
            }}
          >
            <tr>
              {visibleFields.map((field, fieldIndex) => (
                <th
                  key={`${field.field_key}-${fieldIndex}`}
                  className="px-2 py-2 font-medium"
                  style={{ textAlign: field.alignment }}
                >
                  {field.field_label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(lines.length ? lines : [{}]).map((line: any, index: number) => (
              <tr key={line.id || index}>
                {visibleFields.map((field, fieldIndex) => (
                  <td
                    key={`${field.field_key}-${fieldIndex}`}
                    className="border px-2 py-2"
                    style={{
                      textAlign: field.alignment,
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

        <section className="mt-6 flex justify-end">
          <div className="w-60 text-right">
            <div className="text-sm text-slate-500">Total</div>
            <div className="text-xl font-semibold">
              {Number(document?.total_amount || 0).toLocaleString("en-LK", {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>
        </section>

        {format.terms_and_conditions && (
          <p className="mt-6 text-xs text-slate-500">
            {format.terms_and_conditions}
          </p>
        )}
        {format.show_signature_section && (
          <div className="mt-16 text-right text-sm text-slate-500">
            Authorized Signature
          </div>
        )}
        {format.footer_note && (
          <footer className="mt-6 border-t pt-3 text-center text-xs text-slate-500">
            {format.footer_note}
          </footer>
        )}
      </main>
    </div>
  );
}
