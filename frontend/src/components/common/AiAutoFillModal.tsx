import React, { useState } from "react";
import {
  Sparkles,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  FileSpreadsheet
} from "lucide-react";
import {
  generateAiFormAutoFill,
  FormType,
  AiAutoFillResult
} from "../../services/geminiService";

interface AiAutoFillModalProps {
  isOpen: boolean;
  onClose: () => void;
  formType: FormType;
  title?: string;
  contextData?: {
    customers?: Array<{ id: number | string; name: string; code?: string }>;
    products?: Array<{ id: number | string; name: string; code?: string; unit_price?: number }>;
    accounts?: Array<{ id: number | string; name: string; code?: string }>;
    warehouses?: Array<{ id: number | string; name: string }>;
  };
  onApply: (data: any) => void;
}

const PRESET_PROMPTS: Record<FormType, string[]> = {
  customer: [
    "Register Asiri Surgical Hospital Galle Branch, customer type hospital, credit limit 5,000,000 LKR with 45 days credit terms, 5% standard discount, email procurement@asiri.lk, phone +94 91 223 8899, Karapitiya Road Galle.",
    "New retail pharmacy customer: Royal Health Pharmacy Colombo 07, trade name Royal Meds, credit limit 1,500,000 LKR, 30 days credit, phone 011 269 1122, email orders@royalhealth.lk, Ward Place Colombo 07.",
    "Add Lanka Medi Clinic Kandy, clinic type, cash basis with 500,000 LKR credit limit, 14 days credit terms, Peradeniya Road Kandy, contact Dr. Perera 077 445 5667."
  ],
  sales_invoice: [
    "Invoice for Homagama Medical Supplies, reference PO-2026-904, due in 30 days. Items: 50 Amoxicillin 500mg at 1250 LKR with 1000 LKR discount, and 100 Paracetamol 500mg at 450 LKR. Note: urgent hospital dispatch.",
    "Sales invoice to Asiri Surgical Hospital for 20 Metformin 500mg at 850 LKR each, PO-ASIRI-4401, payable within 45 days, cold chain dispatch.",
    "Bill Central Care Galle for 40 Ciprofloxacin 500mg at 1450 LKR with 5% discount, PO-CCG-882, due on 2026-11-15."
  ],
  customer_receipt: [
    "Payment received from Homagama Medical Supplies for 650,000 LKR paid today via Bank of Ceylon transfer reference BOC-FT-883921 settling invoice INV-2026-0042 in full.",
    "Received 1,200,000 LKR from Asiri Surgical Hospital via cheque CHQ-554109 drawn on Commercial Bank, dated today, part settlement of outstanding AR balance.",
    "Cash settlement of 150,000 LKR from Royal Health Pharmacy for invoice INV-2026-0091, collected by sales rep."
  ],
  journal_entry: [
    "Accrue monthly cold-room warehouse refrigeration electricity expense: 175,000 LKR debit to Electricity & Utility Expenses and 175,000 LKR credit to Accrued Expenses Payable, ref JV-2026-091.",
    "Record bank charges and debit card transaction fees: 12,500 LKR debit to Bank Fees & Financial Charges and 12,500 LKR credit to Bank of Ceylon Current Account.",
    "Monthly depreciation journal: 85,000 LKR debit to Depreciation Expense - Cold Chain Vehicles and 85,000 LKR credit to Accumulated Depreciation - Vehicles."
  ],
  product: [
    "Register Paracetamol 500mg Tablets, pack size 10x10 blister pack (100 tabs), medicine type, NMRA registration NMRA/DR/2026/0488 expiring 2028-12-31, store below 25C, reorder level 500 units, reorder quantity 2000 units.",
    "Add Amoxicillin + Clavulanic Acid 625mg, trade name Clavamox 625, blister pack of 14 tablets, storage below 25C dry place, NMRA registration NMRA/DR/2026/0771, reorder level 300.",
    "Register Insulin Glargine 100 IU/ml 3ml Pen, refrigerated cold chain storage 2C to 8C, NMRA reg NMRA/BIO/2026/0112, strict batch and expiry tracking required."
  ],
  grn: [
    "Receive shipment from State Pharmaceuticals Manufacturing: 5000 units Paracetamol 500mg batch B-2026-1002 mfg 2026-09-01 exp 2029-08-31 at 4.50 LKR each, invoice SPMC-INV-8812.",
    "Goods received note from Astron Limited: 1000 units Amoxicillin 500mg batch AST-26-889 exp 2028-10-15 at 11.20 LKR per unit, invoice AST-9921."
  ],
  sales_order: [
    "Sales order for Asiri Central Hospital PLC, customer PO reference ACH-PO-8841, delivery in 3 days, 30 days credit. Items: 200 Paracetamol Infusion 100ml at 650 LKR with 5% discount, priority ward consignment.",
    "Create sales order for Nawaloka Hospitals PLC, PO reference NW-9021, delivery due 2026-10-20. Items: 150 Amoxicillin 500mg Capsules at 1250 LKR and 80 Metformin 500mg at 450 LKR.",
    "Order from Durdans Hospital, ref DH-ORD-1102, Net 30 days, 100 Ciprofloxacin 500mg at 820 LKR each."
  ],
  credit_note: [
    "Issue sales return credit note to Nawaloka Hospitals PLC for 20 Metformin 500mg at 450 LKR each due to outer packaging damage in transit, reference RTN-2026-041.",
    "Price adjustment credit note for Homagama Medical Supplies for 15,000 LKR due to agreed contractual volume rebate on invoice INV-2026-0042.",
    "Credit note for Asiri Surgical Hospital, return of 10 vials Insulin Glargine 100 IU/ml at 1450 LKR due to temperature excursion during transit."
  ],
  debit_note: [
    "Supplementary debit note to Durdans Hospital for 15,000 LKR for emergency refrigerated courier transport and special cold-chain dry ice handling on delivery DN-REQ-091.",
    "Debit note to Lanka Hospitals for 8,500 LKR covering late payment interest charge on overdue invoice INV-2026-0012.",
    "Price correction debit note to Central Care Galle for 25,000 LKR underbilled freight differential."
  ],
  product_batch: [
    "New product batch BAT-2026-104 manufactured on 2026-08-01, expiry 2028-07-31, purchase rate 450 LKR, selling price 680 LKR, MRP 750 LKR, Passed QA inspection.",
    "Batch B-2026-881, mfg date 2026-09-15, exp date 2029-09-14, cost 1200 LKR, selling price 1750 LKR, MRP 1900 LKR.",
    "Cold chain batch CC-2026-009, mfg 2026-10-01, exp 2027-09-30, cost 3200 LKR, retail price 4500 LKR, storage 2C-8C."
  ],
  stock_transfer: [
    "Transfer 500 Paracetamol 500mg Tablets from Colombo Central Medical Warehouse to Kandy Central Distribution Warehouse, transfer date today, reference REQ-KDY-884, priority replenishment.",
    "Stock transfer of 200 Amoxicillin 500mg from Central Bulk Depot to Galle Regional Depot, ref TR-GAL-019, regular weekly distribution.",
    "Move 100 Insulin Glargine pens from Main Warehouse to Cold Chain Storage Facility, ref CC-MOV-881."
  ],
  stock_adjustment: [
    "Stock write-off adjustment for Colombo Central Medical Warehouse: 25 Amoxicillin 500mg Capsules damaged on pallet shift during unloading, unit cost 380 LKR, write off to inventory damage loss.",
    "Inventory adjustment increase at Kandy Warehouse: Found 40 units Paracetamol 500mg during bi-weekly physical cycle count, unit cost 4.50 LKR.",
    "Stock adjustment for 15 expired Salbutamol Inhalers, write down due to shelf-life expiry, batch EX-2026-09."
  ],
  purchase_return: [
    "Return 50 Insulin Glargine 100 IU/ml to State Pharmaceuticals Corporation of Sri Lanka (SPC) due to delivery with < 6 months remaining shelf-life, unit cost 1450 LKR, ref PR-SPC-904.",
    "Purchase return to Hemas Healthcare: 30 Metformin 500mg damaged seal boxes, ref PR-HEM-102.",
    "Return to Astron Limited: 100 Amoxicillin 500mg batch discrepancy, ref PR-AST-044."
  ],
  payment_voucher: [
    "Supplier payment voucher to Hemas Healthcare Distribution for 1,250,000 LKR via bank transfer from Bank of Ceylon Current Account settling pharmaceutical invoices, ref PO-SETTLE-8812.",
    "Disburse 450,000 LKR to State Pharmaceuticals Corporation via Commercial Bank transfer for batch deliveries.",
    "Utility payment voucher: 185,000 LKR to Ceylon Electricity Board for cold storage warehouse power supply."
  ],
  receipt_voucher: [
    "Customer receipt voucher: 1,850,000 LKR received from Asiri Surgical Hospital PLC via electronic RTGS transfer deposited to Commercial Bank Current Account, ref ACH-RTGS-9901.",
    "Receipt voucher from Nawaloka Hospitals PLC for 950,000 LKR via cheque CHQ-778102 deposited to BOC account.",
    "Direct deposit receipt of 320,000 LKR from Royal Health Pharmacy for invoice settlements."
  ],
  user: [
    "Register Dr. Saman Wijesinghe, employee code EMP-015, email saman.w@ceylonmed.lk, phone +94 77 889 9001, Quality Assurance department, Senior QC Compliance Pharmacist, default branch Colombo Central Hub.",
    "Add new user: Dilani Perera, EMP-016, email dilani.p@ceylonmed.lk, Finance department, Senior Accounts Executive, Head Office Colombo.",
    "Add sales representative: Ruwan Jayasuriya, EMP-017, email ruwan.j@ceylonmed.lk, Sales & Marketing, Kandy Regional Branch."
  ],
  sales_return: [
    "Customer sales return from Homagama Medical Supplies for invoice SINV-2026-0042: return 10 packs Amoxicillin 500mg, unopened sealed boxes, return reason customer_return, condition saleable, unit price 1250 LKR.",
    "Sales return from Lanka Hospitals Pharmacy: 5 units Salbutamol Inhaler, reason defective_packaging, condition damaged, credit note requested.",
    "Return from Asiri Central Hospital: 25 packs Paracetamol 500mg Tablets, invoice SINV-2026-0038, overstock return, condition saleable."
  ],
  opening_stock: [
    "Opening stock initial audit entry: 2500 Paracetamol 500mg Tablets, batch OP-B26-01, expiry 2029-06-30, unit cost 4.20 LKR, reference OP-STOCK-2026-01.",
    "Opening inventory count: 800 Amoxicillin 500mg, batch OP-AMX-001, expiry 2028-12-31, unit cost 1150 LKR, audited physical stock.",
    "Opening balance: 150 Insulin Glargine 100 IU/ml pens, batch OP-INS-02, expiry 2027-10-31, unit cost 1400 LKR, verified cold storage."
  ],
  bank_account: [
    "Bank of Ceylon (BOC) Kollupitiya Corporate Branch, Account: Ceylon Med Global Operations LKR, Number: 7041289552, SWIFT: BCEYLKLX, opening balance 5,000,000 LKR, set as primary default account.",
    "Commercial Bank of Ceylon PLC, Foreign Trade Branch Colombo 01, Account: Ceylon Med Import Escrow, Number: 1009847120, SWIFT: COMBCEYL, opening balance 12,500,000 LKR.",
    "Hatton National Bank (HNB), Cinnamon Gardens Branch, Account: Ceylon Med Operations, Number: 0039485712, SWIFT: HNBLLKLX, opening balance 3,500,000 LKR."
  ],
  cheque_book: [
    "Register Bank of Ceylon 50-leaf cheque book CHQ-BOC-2026-A, start number 100201 to 100250 for corporate supplier payouts.",
    "Commercial Bank cheque book CB-2026-B, start cheque 554101 to 554200 (100 cheques), main disbursement account.",
    "HNB 25-leaf emergency cheque book HNB-EMG-01, start cheque 300101 to 300125."
  ],
  petty_cash_voucher: [
    "Petty cash voucher for 8,500 LKR paid to Sunil Disinfection Services for medical-grade cold room sanitizing supplies, voucher type expense, ref PCV-EXP-88.",
    "Emergency petty cash expense of 4,200 LKR for urgent DHL courier dispatch of laboratory sample to NWSDB lab, payee DHL Express.",
    "Petty cash advance of 15,000 LKR to driver Kasun Bandara for fuel and expressway tolls during inter-warehouse cold-chain transfer."
  ],
  fixed_asset: [
    "Register new asset: Thermo Fisher Scientific Ultra-Low Temperature Freezer (-80C), asset code FA-EQ-2026-009, model TSX60086A, serial TFS-ULT-99412, acquisition cost 3,850,000 LKR, 10 years useful life, straight-line depreciation.",
    "Purchase asset: Toyota HiAce Cold-Chain Refrigerated Van, asset code FA-VH-2026-003, acquisition cost 16,500,000 LKR, residual value 2,000,000 LKR, useful life 60 months, straight-line depreciation.",
    "Office IT Asset: Dell PowerEdge R750xs Server for ERP Core Host, asset code FA-IT-2026-012, cost 2,450,000 LKR, useful life 36 months."
  ]
};

export const AiAutoFillModal: React.FC<AiAutoFillModalProps> = ({
  isOpen,
  onClose,
  formType,
  title,
  contextData,
  onApply,
}) => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiAutoFillResult | null>(null);
  const [applied, setApplied] = useState(false);

  if (!isOpen) return null;

  const presets = PRESET_PROMPTS[formType] || [];

  const handleGenerate = async (customPrompt?: string) => {
    const promptToUse = customPrompt || prompt;
    if (!promptToUse.trim()) return;

    setLoading(true);
    setResult(null);
    setApplied(false);

    try {
      const res = await generateAiFormAutoFill(formType, promptToUse, contextData);
      setResult(res);
    } catch (err: any) {
      setResult({
        success: false,
        error: err.message || "Failed to communicate with Gemini AI",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePresetClick = (preset: string) => {
    setPrompt(preset);
    handleGenerate(preset);
  };

  const handleApply = () => {
    if (!result?.data) return;
    onApply(result.data);
    setApplied(true);
    setTimeout(() => {
      onClose();
      setApplied(false);
      setResult(null);
      setPrompt("");
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with vibrant modern AI gradient */}
        <div className="relative bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 px-6 py-5 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md shadow-inner">
              <Sparkles className="h-5 w-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold tracking-tight">
                  {title || "Gemini AI Form Auto-Fill"}
                </h3>
                <span className="rounded-full bg-amber-400/25 px-2 py-0.5 text-[11px] font-semibold text-amber-200 border border-amber-300/30">
                  Gemini 3.6 Flash
                </span>
              </div>
              <p className="text-xs text-indigo-100">
                Type natural language or paste notes to automatically parse and populate fields
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Prompt Presets */}
          {presets.length > 0 && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                Quick Test Presets (Click to instant fill)
              </label>
              <div className="flex flex-col gap-2">
                {presets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePresetClick(preset)}
                    className="text-left p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 text-xs text-slate-700 transition-all duration-150 flex items-start gap-2 group"
                  >
                    <span className="rounded bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 text-[10px] shrink-0 mt-0.5 group-hover:bg-indigo-200">
                      Preset {idx + 1}
                    </span>
                    <span className="line-clamp-2">{preset}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* User Prompt Input */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block">
              Natural Language Prompt or Freeform Notes
            </label>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Register new hospital customer Asiri Galle with 5M credit limit, 45 days credit, Karapitiya Galle..."
                rows={4}
                className="w-full rounded-xl border border-slate-200 p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 shadow-sm resize-none"
              />
            </div>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                AI matches existing customers, items, and computes dates automatically
              </span>
              <button
                type="button"
                onClick={() => handleGenerate()}
                disabled={loading || !prompt.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Extracting with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Extract Form Data</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Result Preview */}
          {result && (
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 shadow-sm animate-in fade-in duration-150">
              {result.success ? (
                <div>
                  <div className="flex items-center justify-between bg-emerald-50 border-b border-emerald-100 px-4 py-3">
                    <div className="flex items-center gap-2 text-emerald-800 text-xs font-semibold">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Data Extracted Successfully</span>
                    </div>
                    <span className="text-[11px] text-emerald-700 font-medium">Ready to Apply</span>
                  </div>
                  {result.explanation && (
                    <div className="p-3.5 bg-white text-xs text-slate-600 border-b border-slate-100 italic">
                      💡 {result.explanation}
                    </div>
                  )}
                  <div className="p-3.5 max-h-48 overflow-y-auto bg-slate-900 text-slate-100 font-mono text-xs rounded-b-xl">
                    <pre>{JSON.stringify(result.data, null, 2)}</pre>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Gemini Extraction Error</p>
                    <p className="mt-0.5">{result.error || "Could not parse form data."}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          {result?.success && (
            <button
              type="button"
              onClick={handleApply}
              disabled={applied}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition-all disabled:opacity-50"
            >
              {applied ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Applied!</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Apply Extracted Data to Form</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiAutoFillModal;
