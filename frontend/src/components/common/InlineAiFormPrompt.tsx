import React, { useState } from "react";
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Zap,
  CornerDownLeft,
  RotateCcw,
} from "lucide-react";
import {
  generateAiFormAutoFill,
  FormType,
  AiAutoFillResult,
} from "../../services/geminiService";
import { toast } from "react-hot-toast";

export interface InlineAiFormPromptProps {
  formType: FormType | string;
  title?: string;
  fields?: Array<{ name?: string; key?: string; label: string }>;
  onApply: (data: any) => void;
  onClose?: () => void;
  contextData?: any;
  className?: string;
}

const PRESET_PROMPTS: Record<string, string[]> = {
  product: [
    "Register Paracetamol 500mg Tablets, pack size 10x10 blister pack (100 tabs), medicine type, NMRA registration NMRA/DR/2026/0488, store below 25C, reorder level 500, reorder qty 2000.",
    "Add Amoxicillin + Clavulanic Acid 625mg, trade name Clavamox 625, blister pack of 14 tablets, storage below 25C dry place, reorder level 300, reorder qty 1000.",
    "Register Insulin Glargine 100 IU/ml 3ml Pen, refrigerated cold chain 2C to 8C, strict batch and expiry tracking required, reorder level 100.",
  ],
  product_batch: [
    "New product batch BAT-2026-104 manufactured on 2026-08-01, expiry 2028-07-31, purchase rate 450 LKR, selling price 680 LKR, MRP 750 LKR, status active.",
    "Batch B-2026-881, mfg date 2026-09-15, exp date 2029-09-14, cost 1200 LKR, selling price 1750 LKR, MRP 1900 LKR.",
  ],
  stock_transfer: [
    "Transfer 500 Paracetamol 500mg Tablets from Colombo Central Medical Warehouse to Kandy Central Distribution Warehouse, transfer date today, reference TR-KDY-884, priority replenishment.",
  ],
  stock_adjustment: [
    "Stock write-off adjustment for Colombo Central Medical Warehouse: 25 Amoxicillin 500mg damaged during unloading, write off to inventory damage loss.",
    "Inventory adjustment increase at Kandy Warehouse: Found 40 units Paracetamol 500mg during bi-weekly physical cycle count.",
  ],
  warehouse: [
    "Colombo Central Hub Cold-Chain Warehouse, code WH-COL-01, temperature controlled 2C to 8C, capacity 50,000 cu ft, manager Dr. Perera.",
    "Kandy Regional Distribution Depot, code WH-KDY-02, room temperature pharma storage, 25,000 sq ft.",
  ],
  customer: [
    "Register Asiri Surgical Hospital Galle Branch, customer type hospital, credit limit 5,000,000 LKR with 45 days credit terms, 5% standard discount, email procurement@asiri.lk, phone +94 91 223 8899, Karapitiya Road Galle.",
  ],
  account: [
    "Current Assets account: Petty Cash - Galle Regional Depot, code 100004, asset classification, currency LKR, normal balance debit.",
  ],
};

export const InlineAiFormPrompt: React.FC<InlineAiFormPromptProps> = ({
  formType,
  title,
  fields,
  onApply,
  onClose,
  contextData,
  className = "",
}) => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastExtracted, setLastExtracted] = useState<string[] | null>(null);

  // Normalize form type for preset lookup
  const normalizedType = formType.toLowerCase().replace(/[^a-z0-9_]/g, "_");
  const presets =
    PRESET_PROMPTS[normalizedType] ||
    PRESET_PROMPTS[normalizedType.includes("product") ? "product" : ""] ||
    PRESET_PROMPTS[normalizedType.includes("batch") ? "product_batch" : ""] ||
    PRESET_PROMPTS[normalizedType.includes("warehouse") ? "warehouse" : ""] ||
    PRESET_PROMPTS.product;

  const handleGenerate = async (presetText?: string) => {
    const textToUse = (presetText || prompt).trim();
    if (!textToUse) return;

    setLoading(true);
    setLastExtracted(null);

    try {
      const validFormType = (
        [
          "sales_invoice",
          "customer_receipt",
          "customer",
          "journal_entry",
          "product",
          "grn",
          "sales_order",
          "credit_note",
          "debit_note",
          "product_batch",
          "stock_transfer",
          "stock_adjustment",
          "purchase_return",
          "payment_voucher",
          "receipt_voucher",
          "user",
          "sales_return",
          "opening_stock",
          "bank_account",
          "cheque_book",
          "petty_cash_voucher",
          "fixed_asset",
        ].includes(normalizedType)
          ? normalizedType
          : "product"
      ) as FormType;

      const res: AiAutoFillResult = await generateAiFormAutoFill(
        validFormType,
        textToUse,
        contextData
      );

      if (res.success && res.data) {
        onApply(res.data);
        const keys = Object.keys(res.data).filter(
          (k) => res.data[k] !== undefined && res.data[k] !== null && res.data[k] !== ""
        );
        setLastExtracted(keys);
        toast.success(`✨ Form auto-filled with ${keys.length} extracted values!`);
      } else {
        toast.error(res.error || "Failed to extract values from prompt.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to process prompt with Gemini AI");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`rounded-2xl border border-purple-200/80 bg-gradient-to-b from-purple-50/70 via-indigo-50/30 to-white p-4 sm:p-5 shadow-sm transition-all duration-200 mb-6 ${className}`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="h-4 w-4 animate-pulse text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-slate-900 tracking-tight">
                Gemini 3.6 Flash Form Copilot
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200">
                <Zap className="h-2.5 w-2.5 text-purple-600" />
                Live Auto-Fill
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Type natural language or pick a preset below to auto-fill the form fields.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
            title="Collapse AI Prompt"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Quick Presets */}
      {presets && presets.length > 0 && (
        <div className="mb-3">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <span>Quick Presets:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPrompt(preset);
                  handleGenerate(preset);
                }}
                disabled={loading}
                className="text-left text-xs px-2.5 py-1 rounded-lg border border-purple-200/70 bg-white/90 hover:bg-purple-100/70 hover:border-purple-300 text-slate-700 transition-all duration-150 flex items-center gap-1.5 shadow-2xs cursor-pointer group disabled:opacity-50"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500 group-hover:scale-125 transition-transform" />
                <span className="truncate max-w-[280px] sm:max-w-[360px]">{preset}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Prompt Textarea & Action */}
      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={`Describe ${title ? title.toLowerCase() : "the item"} in plain language (e.g., name, pack size, category, storage condition, reorder level)...`}
          rows={2}
          disabled={loading}
          className="w-full rounded-xl border border-slate-200/90 bg-white p-3 pr-28 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-3 focus:ring-indigo-500/10 shadow-xs resize-none transition-all disabled:opacity-60"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleGenerate();
            }
          }}
        />

        <div className="flex items-center justify-between gap-2 mt-2">
          <div className="flex items-center gap-2">
            {prompt && (
              <button
                type="button"
                onClick={() => {
                  setPrompt("");
                  setLastExtracted(null);
                }}
                className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Clear</span>
              </button>
            )}
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Ctrl+Enter to extract
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleGenerate()}
            disabled={loading || !prompt.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:from-purple-700 hover:to-indigo-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer ml-auto"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Parsing with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>Auto-Fill Form</span>
                <CornerDownLeft className="h-3 w-3 opacity-60" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success feedback */}
      {lastExtracted && lastExtracted.length > 0 && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200/80 px-3 py-2 text-xs text-emerald-800 animate-in fade-in duration-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">Populated fields:</span>
          <span className="truncate text-emerald-700 font-medium">
            {lastExtracted.join(", ")}
          </span>
        </div>
      )}
    </div>
  );
};

export default InlineAiFormPrompt;
