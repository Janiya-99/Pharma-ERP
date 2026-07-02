import type {
  InvoicePrintFormat,
  InvoicePrintFormatField,
} from "../../../types/invoice-center";

export const documentTypes = [
  { value: "sales_order", label: "Sales Order" },
  { value: "proforma_invoice", label: "Proforma Invoice" },
  { value: "sales_invoice", label: "Sales Invoice" },
  { value: "credit_note", label: "Credit Note" },
  { value: "debit_note", label: "Debit Note" },
  { value: "customer_receipt", label: "Customer Receipt" },
  { value: "grn", label: "GRN" },
  { value: "purchase_return", label: "Purchase Return" },
  { value: "sales_return", label: "Sales Return" },
  { value: "stock_transfer", label: "Stock Transfer" },
  { value: "stock_adjustment", label: "Stock Adjustment" },
];

export const paperSizes = ["A4", "A5", "Letter", "Thermal 80mm", "Custom"];
export const headerLayouts = ["Classic", "Modern", "Compact", "Pharmacy"];
export const themePresets = [
  { name: "Classic Blue", color: "#003B73" },
  { name: "Minimal Black", color: "#111827" },
  { name: "Pharma Clean", color: "#006D77" },
  { name: "Premium Navy", color: "#002137" },
  { name: "Thermal Simple", color: "#1F2937" },
];

const commonLineColumns: InvoicePrintFormatField[] = [
  ["line_no", "Line No", 56, "center"],
  ["product_code", "Product Code", 110, "left"],
  ["product_name", "Product Name", 190, "left"],
  ["generic_name", "Generic Name", 140, "left"],
  ["manufacturer", "Manufacturer", 140, "left"],
  ["description", "Description", 180, "left"],
  ["batch_number", "Batch Number", 110, "left"],
  ["expiry_date", "Expiry Date", 100, "center"],
  ["quantity", "Quantity", 90, "right"],
  ["free_quantity", "Free Qty", 80, "right"],
  ["unit", "Unit", 70, "center"],
  ["unit_price", "Unit Price", 110, "right"],
  ["mrp", "MRP", 90, "right"],
  ["discount_amount", "Discount", 100, "right"],
  ["tax_amount", "Tax", 90, "right"],
  ["line_total", "Line Total", 120, "right"],
  ["remarks", "Remarks", 150, "left"],
].map(([field_key, field_label, column_width, alignment], index) => ({
  field_key: String(field_key),
  field_label: String(field_label),
  is_visible: [
    "line_no",
    "product_code",
    "product_name",
    "batch_number",
    "expiry_date",
    "quantity",
    "unit_price",
    "discount_amount",
    "tax_amount",
    "line_total",
  ].includes(String(field_key)),
  display_order: index + 1,
  column_width: Number(column_width),
  alignment: alignment as "left" | "center" | "right",
}));

const receiptColumns: InvoicePrintFormatField[] = [
  ["invoice_number", "Invoice Number", 140, "left"],
  ["invoice_date", "Invoice Date", 110, "center"],
  ["invoice_amount", "Invoice Amount", 130, "right"],
  ["previous_paid_amount", "Previous Paid", 130, "right"],
  ["allocated_amount", "Allocated Amount", 140, "right"],
  ["balance_amount", "Balance Amount", 130, "right"],
].map(([field_key, field_label, column_width, alignment], index) => ({
  field_key: String(field_key),
  field_label: String(field_label),
  is_visible: true,
  display_order: index + 1,
  column_width: Number(column_width),
  alignment: alignment as "left" | "center" | "right",
}));

const grnColumns: InvoicePrintFormatField[] = [
  ["line_no", "Line No", 56, "center"],
  ["product_code", "Product Code", 110, "left"],
  ["product_name", "Product Name", 190, "left"],
  ["batch_number", "Batch Number", 110, "left"],
  ["expiry_date", "Expiry Date", 100, "center"],
  ["received_quantity", "Received Qty", 110, "right"],
  ["accepted_quantity", "Accepted Qty", 110, "right"],
  ["rejected_quantity", "Rejected Qty", 110, "right"],
  ["purchase_cost", "Purchase Cost", 120, "right"],
  ["line_total", "Line Total", 120, "right"],
].map(([field_key, field_label, column_width, alignment], index) => ({
  field_key: String(field_key),
  field_label: String(field_label),
  is_visible: true,
  display_order: index + 1,
  column_width: Number(column_width),
  alignment: alignment as "left" | "center" | "right",
}));

export const getDefaultPrintFields = (documentType: string) => {
  if (documentType === "customer_receipt") return receiptColumns;
  if (documentType === "grn") return grnColumns;
  return commonLineColumns;
};

export const createDefaultPrintFormat = (
  documentType = "sales_invoice"
): InvoicePrintFormat => ({
  format_name: "",
  document_type: documentType,
  branch_id: null,
  paper_size: "A4",
  orientation: "portrait",
  logo_position: "left",
  header_layout: "Pharmacy",
  footer_layout: "standard",
  primary_color: "#002137",
  font_family: "Inter",
  show_company_logo: true,
  show_company_name: true,
  show_branch_details: true,
  show_customer_details: true,
  show_document_status: true,
  show_payment_terms: true,
  show_bank_details: documentType === "customer_receipt",
  show_signature_section: true,
  show_qr_code: false,
  terms_and_conditions: "",
  footer_note: "Thank you for your business.",
  is_default: false,
  is_active: true,
  fields: getDefaultPrintFields(documentType),
});
