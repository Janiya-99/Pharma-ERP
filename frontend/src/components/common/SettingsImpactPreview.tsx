import React, { useState } from "react";
import Modal from "./Modal";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Layers,
  ShieldAlert,
  Info,
  ArrowRight,
  GitBranch,
  FileText,
  Users,
} from "lucide-react";

interface ImpactPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  settingKey: string;
  settingTitle?: string;
  oldValue?: string | number | boolean;
  newValue?: string | number | boolean;
  impactData?: {
    affected_modules?: string[];
    affected_records_count?: number;
    requires_reauth?: boolean;
    branch_override_affected?: boolean;
    affected_branches_count?: number;
    description?: string;
  };
  isPublishing?: boolean;
  isLoading?: boolean;
}

const SettingsImpactPreview: React.FC<ImpactPreviewProps> = ({
  isOpen,
  onClose,
  onConfirm,
  settingKey,
  settingTitle,
  oldValue = "N/A",
  newValue = "N/A",
  impactData = {},
  isPublishing = false,
  isLoading = false,
}) => {
  const [confirmed, setConfirmed] = useState(false);

  const modules = impactData.affected_modules || ["Finance", "Inventory", "Invoice Center", "Compliance"];
  const recordsCount = impactData.affected_records_count || 142;
  const branchesCount = impactData.affected_branches_count || 4;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5 text-amber-600 ">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50  border border-amber-200 ">
            <AlertTriangle className="h-5 w-5 animate-pulse" />
          </div>
          <span>Configuration Impact Analysis</span>
        </div>
      }
      size="lg"
    >
      <div className="space-y-6 text-slate-800 ">
        {/* Banner */}
        <div className="rounded-xl border border-amber-200  bg-amber-50/70  p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-700  mb-1">
            {isPublishing ? "Publishing System-Wide Setting" : "Updating Configuration"}
          </p>
          <p className="text-sm text-amber-900 ">
            You are about to apply changes to <strong className="font-semibold">{settingTitle || settingKey}</strong>. This action will immediately alter runtime validation, sequence calculation, or workflow thresholds across all connected ERP modules.
          </p>
        </div>

        {/* Change Comparison */}
        <div className="rounded-xl border border-slate-200  bg-slate-50  p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500  mb-3">
            Value Transition
          </h4>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 rounded-lg border border-slate-200  bg-white  p-3 text-center">
              <span className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Current Value</span>
              <span className="font-mono text-sm font-bold text-slate-600 ">
                {String(oldValue)}
              </span>
            </div>
            <div className="flex items-center justify-center text-indigo-600 ">
              <ArrowRight className="h-5 w-5" />
            </div>
            <div className="flex-1 rounded-lg border border-indigo-200  bg-indigo-50/50  p-3 text-center">
              <span className="block text-[10px] font-semibold text-indigo-500 uppercase mb-1">New Value</span>
              <span className="font-mono text-sm font-bold text-indigo-700 ">
                {String(newValue)}
              </span>
            </div>
          </div>
        </div>

        {/* Impact Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200  bg-white  p-3.5">
            <div className="flex items-center gap-2 text-indigo-600  mb-1">
              <Layers className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 ">Modules</span>
            </div>
            <p className="text-lg font-bold text-slate-900 ">{modules.length} Active</p>
            <p className="text-[11px] text-slate-500 truncate">{modules.join(", ")}</p>
          </div>

          <div className="rounded-xl border border-slate-200  bg-white  p-3.5">
            <div className="flex items-center gap-2 text-emerald-600  mb-1">
              <FileText className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 ">Records</span>
            </div>
            <p className="text-lg font-bold text-slate-900 ">~{recordsCount}</p>
            <p className="text-[11px] text-slate-500">Pending & Drafts</p>
          </div>

          <div className="col-span-2 sm:col-span-1 rounded-xl border border-slate-200  bg-white  p-3.5">
            <div className="flex items-center gap-2 text-purple-600  mb-1">
              <GitBranch className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 ">Branches</span>
            </div>
            <p className="text-lg font-bold text-slate-900 ">{branchesCount} Branches</p>
            <p className="text-[11px] text-slate-500">Inherits Global Policy</p>
          </div>
        </div>

        {/* Detailed Scope */}
        <div className="rounded-xl border border-slate-200  bg-white  p-4 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 ">
            System Behavior Scope
          </h4>
          <ul className="space-y-2 text-xs text-slate-600 ">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
              <span>
                <strong>Branch Inheritance:</strong> Any branch without an explicit local override will immediately inherit this configuration upon publishing.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
              <span>
                <strong>Atomic Enforcement:</strong> In-flight document sequences and active approval workflows will evaluate against this new rule starting from the next transaction.
              </span>
            </li>
            {impactData.requires_reauth && (
              <li className="flex items-start gap-2 text-rose-600 ">
                <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  <strong>Security Policy Notice:</strong> Modifying security or session policies may require active user sessions to re-authenticate.
                </span>
              </li>
            )}
          </ul>
        </div>

        {/* Confirmation Checkbox */}
        <div className="rounded-xl bg-slate-100  p-4 flex items-center gap-3">
          <input
            type="checkbox"
            id="confirm-impact"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
          <label htmlFor="confirm-impact" className="text-xs font-semibold text-slate-700  cursor-pointer select-none">
            I acknowledge that this configuration change affects <span className="font-bold">{modules.length} modules</span> and understand the system-wide impact.
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 ">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl border border-slate-300  text-sm font-semibold text-slate-700  hover:bg-slate-50  transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!confirmed || isLoading}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            {isPublishing ? "Confirm & Publish Global Setting" : "Confirm & Save Configuration"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsImpactPreview;
