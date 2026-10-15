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
  | "grn";

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
