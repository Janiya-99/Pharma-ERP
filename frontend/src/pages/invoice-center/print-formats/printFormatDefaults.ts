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

export type PrintDataFieldPlacement =
  | "header"
  | "details"
  | "line_table"
  | "totals"
  | "footer";

export type PrintDataField = {
  key: string;
  label: string;
  table: string;
  column: string;
  group: string;
  placements: PrintDataFieldPlacement[];
  documentTypes?: string[];
  width?: number;
  alignment?: "left" | "center" | "right";
};

export const printDataFieldCatalog: PrintDataField[] = [
  {
    key: "customer_name",
    label: "Customer Name",
    table: "invoice_center_customers",
    column: "customer_name",
    group: "Customer",
    placements: ["details", "header"],
  },
  {
    key: "customer_code",
    label: "Customer Code",
    table: "invoice_center_customers",
    column: "customer_code",
    group: "Customer",
    placements: ["details", "header"],
  },
  {
    key: "billing_address",
    label: "Billing Address",
    table: "invoice_center_customers",
    column: "billing_address",
    group: "Customer",
    placements: ["details"],
  },
  {
    key: "shipping_address",
    label: "Delivery Address",
    table: "invoice_center_customers",
    column: "shipping_address",
    group: "Customer",
    placements: ["details"],
  },
  {
    key: "payment_terms",
    label: "Payment Terms",
    table: "invoice_center_customers",
    column: "payment_terms",
    group: "Customer",
    placements: ["details", "footer"],
  },
  {
    key: "sales_invoice_number",
    label: "Invoice Number",
    table: "invoice_center_sales_invoices",
    column: "sales_invoice_number",
    group: "Document Header",
    placements: ["header", "details"],
    documentTypes: ["sales_invoice", "proforma_invoice"],
  },
  {
    key: "sales_invoice_date",
    label: "Invoice Date",
    table: "invoice_center_sales_invoices",
    column: "sales_invoice_date",
    group: "Document Header",
    placements: ["header", "details"],
    documentTypes: ["sales_invoice", "proforma_invoice"],
  },
  {
    key: "due_date",
    label: "Due Date",
    table: "invoice_center_sales_invoices",
    column: "due_date",
    group: "Document Header",
    placements: ["details"],
    documentTypes: ["sales_invoice", "proforma_invoice"],
  },
  {
    key: "sales_order_number",
    label: "Sales Order Number",
    table: "invoice_center_sales_orders",
    column: "sales_order_number",
    group: "Document Header",
    placements: ["header", "details"],
    documentTypes: ["sales_order"],
  },
  {
    key: "receipt_number",
    label: "Receipt Number",
    table: "invoice_center_customer_receipts",
    column: "receipt_number",
    group: "Document Header",
    placements: ["header", "details"],
    documentTypes: ["customer_receipt"],
  },
  {
    key: "payment_method",
    label: "Payment Method",
    table: "invoice_center_customer_receipts",
    column: "payment_method",
    group: "Document Header",
    placements: ["details"],
    documentTypes: ["customer_receipt"],
  },
  {
    key: "line_no",
    label: "Line No",
    table: "document_lines",
    column: "line_no",
    group: "Line Items",
    placements: ["line_table"],
    width: 56,
    alignment: "center",
  },
  {
    key: "product_code",
    label: "Product Code",
    table: "inventory_products",
    column: "product_code",
    group: "Line Items",
    placements: ["line_table"],
    width: 110,
  },
  {
    key: "product_name",
    label: "Product Name",
    table: "inventory_products",
    column: "product_name",
    group: "Line Items",
    placements: ["line_table"],
    width: 190,
  },
  {
    key: "generic_name",
    label: "Generic Name",
    table: "inventory_products",
    column: "generic_name",
    group: "Line Items",
    placements: ["line_table"],
    width: 140,
  },
  {
    key: "batch_number",
    label: "Batch Number",
    table: "inventory_product_batches",
    column: "batch_number",
    group: "Line Items",
    placements: ["line_table"],
    width: 110,
  },
  {
    key: "expiry_date",
    label: "Expiry Date",
    table: "inventory_product_batches",
    column: "expiry_date",
    group: "Line Items",
    placements: ["line_table"],
    width: 100,
    alignment: "center",
  },
  {
    key: "quantity",
    label: "Quantity",
    table: "document_lines",
    column: "quantity",
    group: "Line Items",
    placements: ["line_table"],
    width: 90,
    alignment: "right",
  },
  {
    key: "unit_price",
    label: "Unit Price",
    table: "document_lines",
    column: "unit_price",
    group: "Line Items",
    placements: ["line_table"],
    width: 110,
    alignment: "right",
  },
  {
    key: "discount_amount",
    label: "Discount",
    table: "document_lines",
    column: "discount_amount",
    group: "Line Items",
    placements: ["line_table"],
    width: 100,
    alignment: "right",
  },
  {
    key: "tax_amount",
    label: "Tax",
    table: "document_lines",
    column: "tax_amount",
    group: "Line Items",
    placements: ["line_table"],
    width: 90,
    alignment: "right",
  },
  {
    key: "line_total",
    label: "Line Total",
    table: "document_lines",
    column: "line_total",
    group: "Line Items",
    placements: ["line_table"],
    width: 120,
    alignment: "right",
  },
  {
    key: "remarks",
    label: "Remarks",
    table: "document_lines",
    column: "remarks",
    group: "Line Items",
    placements: ["line_table", "footer"],
    width: 150,
  },
  {
    key: "subtotal_amount",
    label: "Subtotal",
    table: "document_totals",
    column: "subtotal_amount",
    group: "Totals",
    placements: ["totals"],
    alignment: "right",
  },
  {
    key: "tax_amount_total",
    label: "Tax Total",
    table: "document_totals",
    column: "tax_amount",
    group: "Totals",
    placements: ["totals"],
    alignment: "right",
  },
  {
    key: "total_amount",
    label: "Total Amount",
    table: "document_totals",
    column: "total_amount",
    group: "Totals",
    placements: ["totals"],
    alignment: "right",
  },
];

export const getPrintDataFields = (documentType: string) =>
  printDataFieldCatalog.filter(
    (field) =>
      !field.documentTypes || field.documentTypes.includes(documentType)
  );

export const getPrintDataField = (key: string, documentType: string) =>
  getPrintDataFields(documentType).find((field) => field.key === key) ||
  printDataFieldCatalog.find((field) => field.key === key);

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
  const fields =
    documentType === "customer_receipt"
      ? receiptColumns
      : documentType === "grn"
      ? grnColumns
      : commonLineColumns;

  return fields.map((field) => ({ ...field }));
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
