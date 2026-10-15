/**
 * Google Gemini AI Auto-Fill Service
 * Uses Google Gemini 3.6 Flash for intelligent ERP form data extraction from natural language prompts.
 */

const GEMINI_API_KEY =
  import.meta.env.VITE_GEMINI_API_KEY ||
  "AIzaSyA5VhtysziTbVcXgfSLm-epvVwCOk90VaU";

const GEMINI_MODEL = "gemini-3.6-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

export type FormType =
  | "sales_invoice"
  | "customer_receipt"
  | "customer"
  | "journal_entry"
  | "product"
  | "grn"
  | "sales_order"
  | "credit_note"
  | "debit_note"
  | "product_batch"
  | "stock_transfer"
  | "stock_adjustment"
  | "purchase_return"
  | "payment_voucher"
  | "receipt_voucher"
  | "user"
  | "sales_return"
  | "opening_stock"
  | "bank_account"
  | "cheque_book"
  | "petty_cash_voucher"
  | "fixed_asset";

export interface AiAutoFillResult {
  success: boolean;
  data?: any;
  explanation?: string;
  error?: string;
}

const FORM_SCHEMAS: Record<FormType, { description: string; jsonExample: string }> = {
  sales_invoice: {
    description: "Extract sales invoice details including customer name, dates, notes, and line items with product names, quantities, unit prices, and discounts.",
    jsonExample: JSON.stringify({
      customer_name: "Homagama Medical Supplies",
      customer_reference_number: "PO-2026-904",
      invoice_date: "2026-10-15",
      due_date: "2026-11-14",
      remarks: "Urgent wholesale pharmaceutical consignment",
      lines: [
        {
          product_name: "Amoxicillin 500mg",
          quantity: 50,
          unit_price: 1250,
          discount_amount: 1000,
          tax_amount: 0,
          line_remarks: "Batch tracked"
        }
      ]
    }, null, 2)
  },
  sales_order: {
    description: "Extract sales order details including customer name, order date, delivery date, customer PO reference, payment terms, and items.",
    jsonExample: JSON.stringify({
      customer_name: "Asiri Central Hospital PLC",
      order_date: "2026-10-15",
      expected_delivery_date: "2026-10-18",
      customer_po_reference: "ACH-PO-8841",
      payment_terms: "30 Days Credit",
      remarks: "Priority order for theatre pharmaceuticals",
      lines: [
        {
          product_name: "Paracetamol Infusion 100ml",
          quantity: 200,
          unit_price: 650,
          discount_percentage: 5,
          remarks: "Urgent ward supply"
        }
      ]
    }, null, 2)
  },
  customer_receipt: {
    description: "Extract customer payment receipt details including customer name, receipt date, payment method, payment reference/cheque number, receipt amount, and remarks.",
    jsonExample: JSON.stringify({
      customer_name: "Homagama Medical Supplies",
      receipt_date: "2026-10-15",
      payment_method: "bank_transfer",
      payment_reference: "BOC-FT-883921",
      receipt_amount: 650000,
      remarks: "Full settlement for invoice INV-2026-0042"
    }, null, 2)
  },
  credit_note: {
    description: "Extract credit note details including customer name, date, invoice reference number, reason (e.g. sales_return, price_adjustment), and items or adjustment amounts.",
    jsonExample: JSON.stringify({
      customer_name: "Nawaloka Hospitals PLC",
      credit_note_date: "2026-10-15",
      credit_note_type: "sales_return",
      reference_number: "RTN-2026-041",
      reason: "Goods returned due to outer pack damage on transit",
      remarks: "Credit approved by finance controller",
      lines: [
        {
          product_name: "Metformin 500mg Tablets",
          quantity: 20,
          unit_price: 450,
          line_total: 9000,
          description: "Damaged packaging return"
        }
      ]
    }, null, 2)
  },
  debit_note: {
    description: "Extract debit note details including customer name, date, invoice reference, type (e.g. price_adjustment, interest, freight), and amount.",
    jsonExample: JSON.stringify({
      customer_name: "Durdans Hospital",
      debit_note_date: "2026-10-15",
      debit_note_type: "price_adjustment",
      reference_number: "DN-REQ-091",
      reason: "Special cold-chain handling and expedited logistics fee",
      remarks: "Authorized supplementary charge",
      lines: [
        {
          description: "Emergency refrigerated courier dispatch fee",
          quantity: 1,
          unit_price: 15000,
          line_total: 15000
        }
      ]
    }, null, 2)
  },
  customer: {
    description: "Extract new customer / pharmacy / hospital master profile details including business name, trade name, customer type, credit limit, credit terms, email, phone, and address.",
    jsonExample: JSON.stringify({
      customer_name: "Galle Central Care Hospital",
      trade_name: "Central Care Galle",
      customer_type: "hospital",
      currency: "LKR",
      credit_limit: 2500000,
      credit_days: 30,
      payment_terms: "Net 30 Days",
      discount_percentage: 5,
      email: "procurement@centralcare.lk",
      phone: "+94 91 223 4455",
      mobile: "+94 77 123 4567",
      billing_address: "144 Karapitiya Road, Galle, Southern Province",
      shipping_address: "Medical Store Wing B, Karapitiya Hospital Complex, Galle",
      notes: "Tier-1 Tertiary referral hospital with monthly revolving credit facility",
      status: "active"
    }, null, 2)
  },
  journal_entry: {
    description: "Extract double-entry accounting journal details with date, reference number, description, and balanced debit/credit lines.",
    jsonExample: JSON.stringify({
      journal_date: "2026-10-15",
      reference_number: "JV-2026-091",
      description: "Monthly warehouse refrigeration and utility accrual",
      lines: [
        {
          account_name: "Electricity & Utility Expenses",
          line_description: "Cold room power consumption",
          debit_amount: 175000,
          credit_amount: 0
        },
        {
          account_name: "Accrued Expenses Payable",
          line_description: "CEB utility payable accrual",
          debit_amount: 0,
          credit_amount: 175000
        }
      ]
    }, null, 2)
  },
  product: {
    description: "Extract pharmaceutical formulation or inventory product details including trade name, strength, pack size, storage conditions, and tracking rules.",
    jsonExample: JSON.stringify({
      product_code: "MED-AMO-500",
      product_name: "Amoxicillin 500mg Capsules",
      product_type: "medicine",
      strength: "500mg",
      pack_size: "10x10 Blister Pack (100 Caps)",
      nmra_registration_number: "NMRA/DR/2026/0488",
      nmra_expiry_date: "2028-12-31",
      requires_batch_tracking: true,
      requires_expiry_tracking: true,
      storage_condition: "below_25c",
      reorder_level: 500,
      reorder_quantity: 2000,
      status: "active"
    }, null, 2)
  },
  product_batch: {
    description: "Extract batch tracking details including batch number, manufacture date, expiry date, purchase rate, selling price, and supplier.",
    jsonExample: JSON.stringify({
      batch_number: "BAT-2026-104",
      manufacture_date: "2026-08-01",
      expiry_date: "2028-07-31",
      purchase_rate: 450,
      selling_price: 680,
      mrp: 750,
      remarks: "Quality Control passed analytical assay",
      status: "active"
    }, null, 2)
  },
  stock_transfer: {
    description: "Extract stock transfer details including source and destination warehouses, transfer date, reference, reason, and product items.",
    jsonExample: JSON.stringify({
      transfer_date: "2026-10-15",
      from_warehouse_name: "Colombo Central Medical Warehouse",
      to_warehouse_name: "Kandy Central Distribution Warehouse",
      reference_number: "REQ-KDY-884",
      remarks: "Replenishment for Hill Country regional hospitals",
      lines: [
        {
          product_name: "Paracetamol 500mg Tablets",
          quantity: 500,
          remarks: "Fast-moving stock replenishment"
        }
      ]
    }, null, 2)
  },
  stock_adjustment: {
    description: "Extract stock adjustment details including warehouse, adjustment type (increase, decrease, damage, expiry), reason, and product quantities.",
    jsonExample: JSON.stringify({
      adjustment_date: "2026-10-15",
      warehouse_name: "Colombo Central Medical Warehouse",
      adjustment_type: "damage",
      reason: "Carton damage on pallet shift",
      remarks: "Written off and segregated to disposal bin",
      lines: [
        {
          product_name: "Amoxicillin 500mg Capsules",
          quantity: 25,
          unit_cost: 380,
          line_reason: "Damaged ampoules"
        }
      ]
    }, null, 2)
  },
  purchase_return: {
    description: "Extract purchase return details including supplier name, return date, reason, reference, and product items.",
    jsonExample: JSON.stringify({
      supplier_name: "State Pharmaceuticals Corporation of Sri Lanka (SPC)",
      return_date: "2026-10-15",
      reference_number: "PR-SPC-904",
      remarks: "Short expiry delivered (< 6 months remaining shelf-life)",
      lines: [
        {
          product_name: "Insulin Glargine 100 IU/ml",
          quantity: 50,
          unit_cost: 1450,
          return_reason: "Near-expiry batch return"
        }
      ]
    }, null, 2)
  },
  payment_voucher: {
    description: "Extract finance payment voucher details including supplier or payee, payment date, method, bank account, amount, and expense accounts.",
    jsonExample: JSON.stringify({
      payee_name: "Hemas Healthcare Distribution",
      payment_date: "2026-10-15",
      payment_type: "supplier_payment",
      payment_method: "bank_transfer",
      reference_number: "PO-SETTLE-8812",
      description: "Direct bank transfer payment for pharmaceutical bulk shipment",
      total_amount: 1250000,
      lines: [
        {
          account_name: "Trade Creditors",
          line_description: "Invoice settlement Hemas",
          amount: 1250000
        }
      ]
    }, null, 2)
  },
  receipt_voucher: {
    description: "Extract finance receipt voucher details including customer or payer, receipt date, method, deposit bank account, and amount.",
    jsonExample: JSON.stringify({
      payer_name: "Asiri Surgical Hospital PLC",
      receipt_date: "2026-10-15",
      receipt_type: "customer_receipt",
      receipt_method: "bank_transfer",
      reference_number: "ACH-RTGS-9901",
      description: "Electronic RTGS settlement for inpatient pharmaceuticals",
      total_amount: 1850000,
      lines: [
        {
          account_name: "Trade Debtors",
          line_description: "Hospital account settlement",
          amount: 1850000
        }
      ]
    }, null, 2)
  },
  user: {
    description: "Extract system enterprise user details including name, employee code, email, designation, department, and branch.",
    jsonExample: JSON.stringify({
      name: "Dr. Saman Wijesinghe",
      employee_code: "EMP-015",
      email: "saman.w@ceylonmed.lk",
      phone: "+94 77 889 9001",
      department_name: "Quality Assurance & Regulatory",
      designation_name: "Senior QC Compliance Pharmacist",
      default_branch_name: "Colombo Central Hub",
      status: "active"
    }, null, 2)
  },
  grn: {
    description: "Extract goods received note details including supplier name, invoice reference, dates, and received product batches.",
    jsonExample: JSON.stringify({
      supplier_name: "State Pharmaceuticals Manufacturing",
      supplier_invoice_number: "SPMC-INV-8812",
      grn_date: "2026-10-15",
      remarks: "Cold-chain shipment verified with data logger",
      items: [
        {
          product_name: "Paracetamol 500mg Tablets",
          batch_number: "B-2026-1002",
          manufacture_date: "2026-09-01",
          expiry_date: "2029-08-31",
          quantity_received: 5000,
          unit_cost: 4.5
        }
      ]
    }, null, 2)
  },
  sales_return: {
    description: "Extract customer sales return details including customer name, sales invoice number, return reason, return condition, and returned product lines with quantities and prices.",
    jsonExample: JSON.stringify({
      customer_name: "Homagama Medical Supplies",
      customer_contact_number: "+94 11 289 1234",
      sales_invoice_number: "SINV-2026-0042",
      reference_number: "SR-RET-901",
      return_reason: "customer_return",
      return_condition: "saleable",
      remarks: "Returned undamaged stock due to over-ordering by client",
      lines: [
        {
          product_name: "Amoxicillin 500mg",
          return_quantity: 10,
          unit_price: 1250,
          discount_amount: 0,
          tax_amount: 0,
          line_remarks: "Unopened sealed boxes"
        }
      ]
    }, null, 2)
  },
  opening_stock: {
    description: "Extract opening stock entry details including date, reference number, remarks, and line items with product names, batches, expiry dates, quantities, and unit costs.",
    jsonExample: JSON.stringify({
      opening_stock_date: "2026-10-15",
      reference_number: "OP-STOCK-2026-01",
      remarks: "Initial audited warehouse opening balance stock",
      lines: [
        {
          product_name: "Paracetamol 500mg Tablets",
          batch_number: "OP-B26-01",
          expiry_date: "2029-06-30",
          quantity: 2500,
          unit_cost: 4.2,
          line_remarks: "Audited physical count"
        }
      ]
    }, null, 2)
  },
  bank_account: {
    description: "Extract commercial bank account details including bank name, branch name, account name, account number, SWIFT code, and opening balance.",
    jsonExample: JSON.stringify({
      bank_name: "Bank of Ceylon (BOC)",
      bank_branch_name: "Kollupitiya Corporate Branch",
      account_name: "Ceylon Med Global Operations LKR",
      account_number: "7041289552",
      swift_code: "BCEYLKLX",
      bank_code: "7010",
      branch_code: "045",
      opening_balance: 5000000,
      is_default: true,
      status: "active"
    }, null, 2)
  },
  cheque_book: {
    description: "Extract cheque book registration details including bank account name, cheque book series/number, starting cheque number, ending cheque number, and total leaves.",
    jsonExample: JSON.stringify({
      bank_account_name: "Bank of Ceylon (BOC) - 7041289552",
      book_number: "CHQ-BOC-2026-A",
      start_cheque_number: "100201",
      end_cheque_number: "100250",
      number_of_cheques: 50,
      remarks: "Standard corporate payout cheque book for wholesale payments"
    }, null, 2)
  },
  petty_cash_voucher: {
    description: "Extract petty cash voucher details including voucher date, voucher type (expense, advance, refund), payee name, reference number, description, and expense lines.",
    jsonExample: JSON.stringify({
      voucher_date: "2026-10-15",
      voucher_type: "expense",
      payee_name: "Sunil Disinfection & Hygiene Services",
      reference_number: "PCV-EXP-2026-88",
      description: "Emergency cold-room disinfection consumables",
      lines: [
        {
          account_name: "Office Consumables & Sanitation",
          line_description: "Medical grade isopropyl alcohol gallons & PPE gloves",
          amount: 8500
        }
      ]
    }, null, 2)
  },
  fixed_asset: {
    description: "Extract fixed asset details including asset code, asset name, category, serial number, model, purchase date, acquisition cost, residual value, and useful life.",
    jsonExample: JSON.stringify({
      asset_code: "FA-EQ-2026-009",
      asset_name: "Thermo Fisher Scientific Ultra-Low Temperature Freezer (-80C)",
      description: "Specialized cold-chain pharmaceutical storage freezer for vaccines and biologics",
      serial_number: "TFS-ULT-99412",
      model_number: "TSX60086A",
      manufacturer: "Thermo Fisher Scientific",
      purchase_date: "2026-10-15",
      acquisition_cost: 3850000,
      residual_value: 385000,
      useful_life_months: 120,
      depreciation_method: "straight_line",
      status: "active"
    }, null, 2)
  }
};

export async function generateAiFormAutoFill(
  formType: FormType,
  userPrompt: string,
  contextData?: {
    customers?: Array<{ id: number | string; name: string; code?: string }>;
    products?: Array<{ id: number | string; name: string; code?: string; unit_price?: number }>;
    accounts?: Array<{ id: number | string; name: string; code?: string }>;
    warehouses?: Array<{ id: number | string; name: string }>;
  }
): Promise<AiAutoFillResult> {
  try {
    const schema = FORM_SCHEMAS[formType];
    if (!schema) {
      throw new Error(`Unsupported form type: ${formType}`);
    }

    let contextualHint = "";
    if (contextData?.customers && contextData.customers.length > 0) {
      contextualHint += `\nExisting Available Customers (match to closest if mentioned):\n` +
        contextData.customers.slice(0, 40).map(c => `- ID: ${c.id}, Name: "${c.name}", Code: "${c.code || ''}"`).join("\n");
    }
    if (contextData?.products && contextData.products.length > 0) {
      contextualHint += `\nExisting Available Products (match to closest if mentioned):\n` +
        contextData.products.slice(0, 40).map(p => `- ID: ${p.id}, Name: "${p.name}", Code: "${p.code || ''}", Price: ${p.unit_price || 0}`).join("\n");
    }
    if (contextData?.accounts && contextData.accounts.length > 0) {
      contextualHint += `\nExisting Chart of Accounts:\n` +
        contextData.accounts.slice(0, 40).map(a => `- ID: ${a.id}, Name: "${a.name}", Code: "${a.code || ''}"`).join("\n");
    }
    if (contextData?.warehouses && contextData.warehouses.length > 0) {
      contextualHint += `\nAvailable Warehouses:\n` +
        contextData.warehouses.map(w => `- ID: ${w.id}, Name: "${w.name}"`).join("\n");
    }

    const systemPrompt = `You are an expert AI Enterprise ERP Assistant for "Ceylon Med Global Pharma ERP" in Sri Lanka.
Your task is to parse a natural language prompt from an ERP user and accurately auto-fill an ERP form of type: "${formType}".
${schema.description}

Today's Date: 2026-10-15.
Default Currency: LKR (Sri Lankan Rupee).

Available context from ERP master data:${contextualHint}

CRITICAL RULES:
1. Always respond in valid JSON matching the schema below.
2. If amounts, terms, or dates are implied (e.g. "due in 30 days", "paid via BOC transfer"), calculate the dates and standardize the payment method.
3. For payment_method in customer_receipt: must be one of ["cash", "bank_transfer", "cheque", "card", "online", "other"].
4. For customer_type: must be one of ["pharmacy", "hospital", "clinic", "distributor", "other"].
5. If the user mentions existing customers or products from the context, preserve exact names and match the IDs where possible.
6. Provide an "explanation" string field summarizing what was extracted and any smart assumptions made.

Target JSON Output Schema:
{
  "explanation": "Summary of extracted data in 1-2 friendly sentences",
  "data": ${schema.jsonExample}
}`;

    const response = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${systemPrompt}\n\nUSER NATURAL LANGUAGE PROMPT:\n"${userPrompt}"\n\nReturn strictly valid JSON only.`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API HTTP Error:", response.status, errText);
      throw new Error(`Gemini API Error (${response.status}): ${errText}`);
    }

    const resJson = await response.json();
    const candidateText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error("No content generated by Gemini AI");
    }

    const parsed = JSON.parse(candidateText);

    return {
      success: true,
      data: parsed.data || parsed,
      explanation: parsed.explanation || "Form fields extracted successfully using Gemini 3.6 Flash.",
    };
  } catch (err: any) {
    console.error("Failed to generate AI auto-fill:", err);
    return {
      success: false,
      error: err.message || "Failed to process prompt with Gemini AI",
    };
  }
}
