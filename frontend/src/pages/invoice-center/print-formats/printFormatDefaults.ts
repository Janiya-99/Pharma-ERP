import type { InvoicePrintFormat, InvoicePrintFormatField } from "../../../types/invoice-center";

export const documentTypes = [
  { value: "sales_order", label: "Sales Order" },
  { value: "proforma_invoice", label: "Proforma Invoice" },
  { value: "sales_invoice", label: "Sales Invoice" },
  { value: "credit_note", label: "Credit Note" },
  { value: "debit_note", label: "Debit Note" },
  { value: "customer_receipt", label: "Customer Receipt" },
];

export const defaultPrintFields: InvoicePrintFormatField[] = [
  { field_key: "line_no", field_label: "No", is_visible: true, display_order: 1, column_width: 60, alignment: "center" },
  { field_key: "product_code", field_label: "Code", is_visible: true, display_order: 2, column_width: 110, alignment: "left" },
  { field_key: "product_name", field_label: "Product", is_visible: true, display_order: 3, column_width: 220, alignment: "left" },
  { field_key: "batch_number", field_label: "Batch", is_visible: true, display_order: 4, column_width: 110, alignment: "left" },
  { field_key: "expiry_date", field_label: "Expiry", is_visible: true, display_order: 5, column_width: 100, alignment: "center" },
  { field_key: "quantity", field_label: "Qty", is_visible: true, display_order: 6, column_width: 90, alignment: "right" },
  { field_key: "unit_price", field_label: "Unit Price", is_visible: true, display_order: 7, column_width: 110, alignment: "right" },
  { field_key: "discount_amount", field_label: "Discount", is_visible: true, display_order: 8, column_width: 110, alignment: "right" },
  { field_key: "tax_amount", field_label: "Tax", is_visible: true, display_order: 9, column_width: 100, alignment: "right" },
  { field_key: "line_total", field_label: "Total", is_visible: true, display_order: 10, column_width: 120, alignment: "right" },
];

export const createDefaultPrintFormat = (): InvoicePrintFormat => ({
  format_name: "",
  document_type: "sales_invoice",
  branch_id: null,
  paper_size: "A4",
  orientation: "portrait",
  logo_position: "left",
  header_layout: "standard",
  footer_layout: "standard",
  primary_color: "#2563eb",
  font_family: "Inter",
  show_company_logo: true,
  show_company_name: true,
  show_branch_details: true,
  show_customer_details: true,
  show_document_status: true,
  show_payment_terms: true,
  show_bank_details: false,
  show_signature_section: true,
  show_qr_code: false,
  terms_and_conditions: "",
  footer_note: "",
  is_default: false,
  is_active: true,
  fields: defaultPrintFields,
});
