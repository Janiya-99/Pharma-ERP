import React, { useState } from "react";
import {
  Sparkles,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Copy,
  Check,
  Zap,
} from "lucide-react";
import {
  generateAiFormAutoFill,
  FormType,
  AiAutoFillResult,
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
    "Add Lanka Medi Clinic Kandy, clinic type, cash basis with 500,000 LKR credit limit, 14 days credit terms, Peradeniya Road Kandy, contact Dr. Perera 077 445 5667.",
  ],
  product: [
    "Register Paracetamol 500mg Tablets, pack size 10x10 blister pack (100 tabs), medicine type, NMRA registration NMRA/DR/2026/0488, store below 25C, reorder level 500, reorder qty 2000.",
    "Add Amoxicillin + Clavulanic Acid 625mg, trade name Clavamox 625, blister pack of 14 tablets, storage below 25C dry place, reorder level 300.",
    "Register Insulin Glargine 100 IU/ml 3ml Pen, refrigerated cold chain 2C to 8C, strict batch and expiry tracking required.",
  ],
  sales_invoice: [
    "Invoice for Homagama Medical Supplies, reference PO-2026-904, due in 30 days. Items: 50 Amoxicillin 500mg at 1250 LKR with 1000 LKR discount, and 100 Paracetamol 500mg at 450 LKR. Note: urgent hospital dispatch.",
    "Sales invoice to Asiri Surgical Hospital for 20 Metformin 500mg at 850 LKR each, PO-ASIRI-4401, payable within 45 days, cold chain dispatch.",
    "Bill Central Care Galle for 40 Ciprofloxacin 500mg at 1450 LKR with 5% discount, PO-CCG-882, due on 2026-11-15.",
  ],
  customer_receipt: [
    "Payment received from Homagama Medical Supplies for 650,000 LKR paid today via Bank of Ceylon transfer reference BOC-FT-883921 settling invoice INV-2026-0042 in full.",
    "Received 1,200,000 LKR from Asiri Surgical Hospital via cheque CHQ-554109 drawn on Commercial Bank, dated today, part settlement of outstanding AR balance.",
    "Cash settlement of 150,000 LKR from Royal Health Pharmacy for invoice INV-2026-0091, collected by sales rep.",
  ],
  journal_entry: [
    "Accrue monthly cold-room warehouse refrigeration electricity expense: 175,000 LKR debit to Electricity & Utility Expenses and 175,000 LKR credit to Accrued Expenses Payable, ref JV-2026-091.",
    "Record bank charges and debit card transaction fees: 12,500 LKR debit to Bank Fees & Financial Charges and 12,500 LKR credit to Bank of Ceylon Current Account.",
    "Monthly depreciation journal: 85,000 LKR debit to Depreciation Expense - Cold Chain Vehicles and 85,000 LKR credit to Accumulated Depreciation - Vehicles.",
  ],
  grn: [
    "Receive shipment from State Pharmaceuticals Manufacturing: 5000 units Paracetamol 500mg batch B-2026-1002 mfg 2026-09-01 exp 2029-08-31 at 4.50 LKR each, invoice SPMC-INV-8812.",
    "Goods received note from Astron Limited: 1000 units Amoxicillin 500mg batch AST-26-889 exp 2028-10-15 at 11.20 LKR per unit, invoice AST-9921.",
  ],
  sales_order: [
    "Sales order for Asiri Central Hospital PLC, customer PO reference ACH-PO-8841, delivery in 3 days, 30 days credit. Items: 200 Paracetamol Infusion 100ml at 650 LKR with 5% discount, priority ward consignment.",
    "Create sales order for Nawaloka Hospitals PLC, PO reference NW-9021, delivery due 2026-10-20. Items: 150 Amoxicillin 500mg Capsules at 1250 LKR and 80 Metformin 500mg at 450 LKR.",
  ],
  credit_note: [
    "Issue sales return credit note to Nawaloka Hospitals PLC for 20 Metformin 500mg at 450 LKR each due to outer packaging damage in transit, reference RTN-2026-041.",
    "Price adjustment credit note for Homagama Medical Supplies for 15,000 LKR due to agreed contractual volume rebate on invoice INV-2026-0042.",
  ],
  debit_note: [
    "Supplementary debit note to Durdans Hospital for 15,000 LKR for emergency refrigerated courier transport and special cold-chain dry ice handling on delivery DN-REQ-091.",
    "Debit note to Lanka Hospitals for 8,500 LKR covering late payment interest charge on overdue invoice INV-2026-0012.",
  ],
  product_batch: [
    "New product batch BAT-2026-104 manufactured on 2026-08-01, expiry 2028-07-31, purchase rate 450 LKR, selling price 680 LKR, MRP 750 LKR, Passed QA inspection.",
    "Batch B-2026-881, mfg date 2026-09-15, exp date 2029-09-14, cost 1200 LKR, selling price 1750 LKR, MRP 1900 LKR.",
  ],
  stock_transfer: [
    "Transfer 500 Paracetamol 500mg Tablets from Colombo Central Medical Warehouse to Kandy Central Distribution Warehouse, transfer date today, reference REQ-KDY-884, priority replenishment.",
    "Stock transfer of 200 Amoxicillin 500mg from Central Bulk Depot to Galle Regional Depot, ref TR-GAL-019.",
  ],
  stock_adjustment: [
    "Stock write-off adjustment for Colombo Central Medical Warehouse: 25 Amoxicillin 500mg Capsules damaged on pallet shift during unloading, unit cost 380 LKR, write off to inventory damage loss.",
    "Inventory adjustment increase at Kandy Warehouse: Found 40 units Paracetamol 500mg during bi-weekly physical cycle count, unit cost 4.50 LKR.",
  ],
  purchase_return: [
    "Return 50 Insulin Glargine 100 IU/ml to State Pharmaceuticals Corporation of Sri Lanka (SPC) due to delivery with < 6 months remaining shelf-life, unit cost 1450 LKR, ref PR-SPC-904.",
  ],
  payment_voucher: [
    "Supplier payment voucher to Hemas Healthcare Distribution for 1,250,000 LKR via bank transfer from Bank of Ceylon Current Account settling pharmaceutical invoices, ref PO-SETTLE-8812.",
  ],
  receipt_voucher: [
    "Customer receipt voucher: 1,850,000 LKR received from Asiri Surgical Hospital PLC via electronic RTGS transfer deposited to Commercial Bank Current Account, ref ACH-RTGS-9901.",
  ],
  user: [
    "Register Dr. Saman Wijesinghe, employee code EMP-015, email saman.w@ceylonmed.lk, phone +94 77 889 9001, Quality Assurance department, Senior QC Compliance Pharmacist, default branch Colombo Central Hub.",
  ],
  sales_return: [
    "Customer sales return from Homagama Medical Supplies for invoice SINV-2026-0042: return 10 packs Amoxicillin 500mg, unopened sealed boxes, return reason customer_return, condition saleable, unit price 1250 LKR.",
  ],
  opening_stock: [
    "Opening stock initial audit entry: 2500 Paracetamol 500mg Tablets, batch OP-B26-01, expiry 2029-06-30, unit cost 4.20 LKR, reference OP-STOCK-2026-01.",
  ],
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
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"fill" | "summary">("fill");

  if (!isOpen) return null;

  const presets = PRESET_PROMPTS[formType] || [];

  const handlePresetClick = (text: string) => {
    setPrompt(text);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult(null);
    setApplied(false);
    try {
      const res = await generateAiFormAutoFill(formType, prompt, contextData);
      setResult(res);
    } catch (err: any) {
      setResult({
        success: false,
        data: {},
        error: err.message || "Failed to process prompt with Gemini AI",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (result && result.success && result.data) {
      onApply(result.data);
      setApplied(true);
      setTimeout(() => {
        onClose();
        setApplied(false);
        setResult(null);
        setPrompt("");
      }, 700);
    }
  };

  const handleCopyJson = () => {
    if (result?.data) {
      navigator.clipboard.writeText(JSON.stringify(result.data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200/90 flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sleek Modern Header with Ambient Glow */}
        <div className="relative border-b border-slate-100 bg-gradient-to-r from-purple-50/80 via-indigo-50/50 to-white px-5 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-indigo-500/25">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  {title || "Gemini AI Form Assistant"}
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 px-2.5 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200/60">
                  <Zap className="h-3 w-3 text-purple-600" />
                  Gemini 3.6 Flash
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Type natural language or paste notes to auto-fill fields instantly
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex items-center gap-2 px-5 sm:px-6 pt-3 pb-1 border-b border-slate-100 bg-slate-50/40">
          <button
            type="button"
            onClick={() => setActiveTab("fill")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "fill"
                ? "bg-white text-indigo-700 shadow-2xs border border-slate-200/80"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            <span>Auto-Fill Form</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("summary")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "summary"
                ? "bg-white text-purple-700 shadow-2xs border border-slate-200/80"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileText className="h-3.5 w-3.5 text-purple-600" />
            <span>AI Summarizer & Doc</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {activeTab === "fill" ? (
            <>
              {/* Presets Chips */}
              {presets.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-purple-500" />
                      Quick Presets (Click to Fill)
                    </label>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {presets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handlePresetClick(preset)}
                        className="text-left px-3 py-2 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-purple-50/80 hover:border-purple-300 text-xs text-slate-700 transition-all duration-150 flex items-start gap-2.5 group cursor-pointer"
                      >
                        <span className="rounded-md bg-purple-100 text-purple-700 font-extrabold px-1.5 py-0.5 text-[10px] shrink-0 mt-0.5 group-hover:bg-purple-200">
                          #{idx + 1}
                        </span>
                        <span className="line-clamp-2 leading-relaxed">{preset}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Natural Language Prompt Input */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                  Natural Language Prompt or Freeform Notes
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Paracetamol 500mg Tablets, pack size 100 tabs, NMRA registered, room temperature storage, reorder level 500 units..."
                  rows={4}
                  className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/30 p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 shadow-xs resize-none transition-all"
                />

                {/* HIGHLIGHTED EXTRACT BUTTON */}
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                    Extracts pharmaceutical & fiscal values automatically
                  </span>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={loading || !prompt.trim()}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:from-purple-700 hover:to-indigo-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer ml-auto"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Parsing with Gemini AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 text-amber-300" />
                        <span>Extract Form Data</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Result Preview Box */}
              {result && (
                <div className="rounded-2xl border border-slate-200/90 overflow-hidden bg-white shadow-sm animate-in fade-in duration-150">
                  {result.success ? (
                    <div>
                      <div className="flex items-center justify-between bg-emerald-50/80 border-b border-emerald-100 px-4 py-2.5">
                        <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <span>Extracted Successfully ({Object.keys(result.data || {}).length} fields detected)</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyJson}
                          className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                        >
                          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                          <span>{copied ? "Copied" : "Copy JSON"}</span>
                        </button>
                      </div>

                      {result.explanation && (
                        <div className="px-4 py-2.5 bg-slate-50/60 text-xs text-slate-600 border-b border-slate-100 italic">
                          💡 {result.explanation}
                        </div>
                      )}

                      {/* Key-Value Quick Summary Badges */}
                      <div className="p-3 bg-white flex flex-wrap gap-1.5 max-h-36 overflow-y-auto border-b border-slate-100">
                        {Object.entries(result.data || {})
                          .filter(([_, v]) => typeof v !== "object" && v !== undefined && v !== null && v !== "")
                          .map(([key, val]) => (
                            <span
                              key={key}
                              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700"
                            >
                              <span className="text-slate-400 capitalize">{key.replace(/_/g, " ")}:</span>
                              <span className="font-bold text-slate-900 truncate max-w-[150px]">{String(val)}</span>
                            </span>
                          ))}
                      </div>

                      {/* Code block */}
                      <div className="p-3 max-h-36 overflow-y-auto bg-slate-950 text-slate-100 font-mono text-[11px] rounded-b-2xl">
                        <pre className="whitespace-pre-wrap">{JSON.stringify(result.data, null, 2)}</pre>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2.5">
                      <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Gemini Extraction Error</p>
                        <p className="mt-0.5 text-rose-600">{result.error || "Could not parse form data."}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* AI Summary & Documentation Tab */
            <div className="space-y-3">
              <div className="p-4 rounded-2xl border border-purple-200/70 bg-purple-50/50">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-purple-700" />
                  <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                    AI Master Data Documentation Helper
                  </h4>
                </div>
                <p className="text-xs text-purple-800 leading-relaxed">
                  Paste supplier packing lists, manufacturer technical specifications, or customer contracts to generate structured summaries, compliance audit logs, and catalog documentation.
                </p>
              </div>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Paste raw text, product certificate, or transaction notes to summarize..."
                rows={5}
                className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/30 p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-500/10 shadow-xs resize-none"
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={loading || !prompt.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:from-purple-700 hover:to-indigo-700 active:scale-[0.98] transition-all cursor-pointer"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  <span>Summarize & Extract</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-100 bg-slate-50/80 px-5 sm:px-6 py-3.5 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          {result?.success && (
            <button
              type="button"
              onClick={handleApply}
              disabled={applied}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98] transition-all cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{applied ? "Applied!" : "Apply to Form"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiAutoFillModal;
