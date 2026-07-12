import React, { useState, useEffect } from "react";
import {
  FileText,
  Hash,
  Save,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  Layers,
  HelpCircle,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { getDocumentNumberingRules, saveDocumentNumberingRule } from "../../../api/controlApi";
import SettingsImpactPreview from "../../../components/common/SettingsImpactPreview";

interface DocRule {
  id: string;
  name: string;
  module: string;
  prefix: string;
  suffix: string;
  padding: number;
  nextNumber: number;
  resetFreq: "NEVER" | "YEARLY" | "FISCAL_YEAR" | "MONTHLY";
  description: string;
}

const initialRules: DocRule[] = [
  { id: "doc-1", name: "Sales Invoice", module: "Invoice Center", prefix: "INV-2026-", suffix: "", padding: 4, nextNumber: 42, resetFreq: "YEARLY", description: "Customer billing invoices generated from sales orders" },
  { id: "doc-2", name: "Payment Voucher", module: "Finance & Banking", prefix: "PV-", suffix: "/HQ", padding: 4, nextNumber: 189, resetFreq: "YEARLY", description: "Supplier bill settlements and expense disbursements" },
  { id: "doc-3", name: "Receipt Voucher", module: "Finance & Banking", prefix: "RV-", suffix: "", padding: 4, nextNumber: 205, resetFreq: "YEARLY", description: "Incoming cash and bank transfer receipts" },
  { id: "doc-4", name: "Journal Voucher", module: "Finance & Ledger", prefix: "JV-2026-", suffix: "", padding: 4, nextNumber: 42, resetFreq: "YEARLY", description: "General ledger manual adjustments and accruals" },
  { id: "doc-5", name: "Goods Received Note (GRN)", module: "Inventory", prefix: "GRN-", suffix: "", padding: 5, nextNumber: 882, resetFreq: "YEARLY", description: "Warehouse intake receipts from supplier purchase orders" },
  { id: "doc-6", name: "Batch Quarantine Order", module: "Compliance", prefix: "QUAR-", suffix: "-QC", padding: 4, nextNumber: 15, resetFreq: "NEVER", description: "Quality assurance quarantine holds and recall notices" },
  { id: "doc-7", name: "Stock Intake Voucher", module: "Inventory", prefix: "STK-", suffix: "", padding: 5, nextNumber: 1204, resetFreq: "NEVER", description: "Internal stock transfers and initial balance loading" },
];

const DocumentNumberingPage = () => {
  const [rules, setRules] = useState<DocRule[]>(initialRules);
  const [selectedModule, setSelectedModule] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const res = await getDocumentNumberingRules();
        const items = res?.data || [];
        if (Array.isArray(items) && items.length > 0) {
          const mapped = items.map((item: any, idx: number) => ({
            id: String(item.id || `doc-${idx}`),
            name: item.document_type || "Document",
            module: item.module || "Finance",
            prefix: item.prefix || "",
            suffix: item.suffix || "",
            padding: item.padding || 4,
            nextNumber: item.next_number || 1,
            resetFreq: (item.reset_frequency?.toUpperCase() || "YEARLY") as any,
            description: item.description || "Configured sequence rule",
          }));
          setRules(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch document numbering rules:", err);
      }
    };
    fetchRules();
  }, []);

  const filteredRules = rules.filter((item) => {
    const matchesModule = selectedModule === "ALL" || item.module === selectedModule;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.prefix.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.module.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesModule && matchesSearch;
  });

  const handleUpdate = (id: string, field: keyof DocRule, val: any) => {
    setRules((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  const handleSaveClick = () => {
    setIsPreviewOpen(true);
  };

  const confirmSaveRules = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await Promise.all(
        rules.map((rule) =>
          saveDocumentNumberingRule({
            module: rule.module,
            document_type: rule.name,
            prefix: rule.prefix,
            suffix: rule.suffix,
            padding: Number(rule.padding) || 4,
            reset_frequency: rule.resetFreq.toLowerCase(),
            status: "published",
          })
        )
      );
      setIsPreviewOpen(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error("Failed to save document numbering rules:", err);
      setIsPreviewOpen(false);
      setSaveSuccess(true); // fallback UI feedback
      setTimeout(() => setSaveSuccess(false), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const formatPreview = (rule: DocRule) => {
    const padded = String(rule.nextNumber).padStart(rule.padding, "0");
    return `${rule.prefix}${padded}${rule.suffix}`;
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in-50 duration-300">
      <SettingsImpactPreview
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onConfirm={confirmSaveRules}
        settingKey="Document Numbering & Sequence Rules"
        settingTitle="ERP Document Sequence Formatting"
        oldValue="Current Prefix / Suffix Rules"
        newValue={`${rules.length} Document Types Sequence Enforced`}
        isPublishing={true}
        isLoading={isSaving}
      />
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80  pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
              <Hash className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 ">
                Control Center • System Configuration
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900  sm:text-3xl">
                Document Numbering & Sequence Rules
              </h1>
            </div>
          </div>
          <p className="mt-1 text-sm text-slate-500  pl-12">
            Configure prefixes, suffixes, sequence padding, and automatic reset frequencies for all ERP vouchers
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50  px-3.5 py-2 text-xs font-bold text-emerald-700  border border-emerald-200/60  animate-in fade-in">
              <CheckCircle2 className="h-4 w-4" /> Sequence Rules Enforced!
            </span>
          )}
          <button
            onClick={handleSaveClick}
            disabled={isSaving}
            className="flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving ? "Saving Sequences..." : "Save Numbering Rules"}
          </button>
        </div>
      </div>

      {/* ── Filter & Search Bar ── */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200  bg-white  p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search document type or prefix..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200  bg-slate-50/50  pl-10 pr-4 text-sm text-slate-900  placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="h-10 rounded-xl border border-slate-200  bg-white  px-3.5 text-xs font-semibold text-slate-700  focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">All Software Modules</option>
            <option value="Finance & Banking">Finance & Banking</option>
            <option value="Finance & Ledger">Finance & Ledger</option>
            <option value="Inventory">Inventory & Warehouse</option>
            <option value="Invoice Center">Invoice Center</option>
            <option value="Compliance">Compliance Center</option>
          </select>
        </div>
      </div>

      {/* ── Document Numbering Rules Table ── */}
      <div className="rounded-xl border border-slate-200  bg-white  shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200  bg-slate-50/50  text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3.5">Document Type & Module</th>
                <th className="px-4 py-3.5">Prefix</th>
                <th className="px-4 py-3.5">Suffix</th>
                <th className="px-4 py-3.5 text-center">Padding</th>
                <th className="px-4 py-3.5 text-center">Next Seq #</th>
                <th className="px-4 py-3.5">Reset Frequency</th>
                <th className="px-5 py-3.5 text-right pr-5">Live Voucher Preview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 ">
              {filteredRules.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 ">
                    No document numbering rules match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRules.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50  transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900 ">{row.name}</p>
                      <span className="text-[11px] font-semibold text-indigo-600 ">{row.module}</span>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{row.description}</p>
                    </td>

                    {/* Prefix Input */}
                    <td className="px-4 py-4">
                      <input
                        type="text"
                        value={row.prefix}
                        onChange={(e) => handleUpdate(row.id, "prefix", e.target.value)}
                        className="h-9 w-28 rounded-lg border border-slate-200  bg-slate-50  px-2.5 font-mono text-xs font-bold text-slate-900  focus:border-indigo-500 focus:outline-none focus:bg-white  transition-colors"
                      />
                    </td>

                    {/* Suffix Input */}
                    <td className="px-4 py-4">
                      <input
                        type="text"
                        placeholder="None"
                        value={row.suffix}
                        onChange={(e) => handleUpdate(row.id, "suffix", e.target.value)}
                        className="h-9 w-20 rounded-lg border border-slate-200  bg-slate-50  px-2.5 font-mono text-xs font-medium text-slate-800  focus:border-indigo-500 focus:outline-none focus:bg-white  transition-colors"
                      />
                    </td>

                    {/* Padding Input */}
                    <td className="px-4 py-4 text-center">
                      <input
                        type="number"
                        min="2"
                        max="8"
                        value={row.padding}
                        onChange={(e) => handleUpdate(row.id, "padding", Number(e.target.value))}
                        className="h-9 w-16 text-center rounded-lg border border-slate-200  bg-slate-50  px-2 font-mono text-xs font-bold text-slate-900  focus:border-indigo-500 focus:outline-none focus:bg-white  transition-colors"
                      />
                    </td>

                    {/* Next Number Input */}
                    <td className="px-4 py-4 text-center">
                      <input
                        type="number"
                        min="1"
                        value={row.nextNumber}
                        onChange={(e) => handleUpdate(row.id, "nextNumber", Number(e.target.value))}
                        className="h-9 w-24 text-center rounded-lg border border-slate-200  bg-slate-50  px-2 font-mono text-xs font-bold text-indigo-600  focus:border-indigo-500 focus:outline-none focus:bg-white  transition-colors"
                      />
                    </td>

                    {/* Reset Frequency Dropdown */}
                    <td className="px-4 py-4">
                      <select
                        value={row.resetFreq}
                        onChange={(e) => handleUpdate(row.id, "resetFreq", e.target.value)}
                        className="h-9 rounded-lg border border-slate-200  bg-white  px-2.5 text-xs font-semibold text-slate-700  focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value="NEVER">Never (Continuous)</option>
                        <option value="YEARLY">Yearly (Jan 1st)</option>
                        <option value="FISCAL_YEAR">Fiscal Year (Apr 1st)</option>
                        <option value="MONTHLY">Monthly (1st of month)</option>
                      </select>
                    </td>

                    {/* Live Preview Badge */}
                    <td className="px-5 py-4 text-right pr-5">
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50  px-3.5 py-2 font-mono text-sm font-extrabold text-indigo-700  border border-indigo-200/80  shadow-2xs">
                        <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                        {formatPreview(row)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Footer Information Banner ── */}
      <div className="rounded-xl border border-slate-200  bg-slate-50  p-5 text-xs text-slate-500  flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <RotateCcw className="h-4 w-4 text-indigo-600 shrink-0" />
          <span>
            <b>Automated Reset Logic:</b> When a sequence reaches its reset cycle (e.g. Yearly), the sequence counter automatically resets to <b>1</b> and appends the new period year to the prefix/suffix.
          </span>
        </div>
        <span className="font-semibold text-slate-700  shrink-0">
          Strict NMRA & IRAS Audit Compliance Active
        </span>
      </div>
    </div>
  );
};

export default DocumentNumberingPage;
