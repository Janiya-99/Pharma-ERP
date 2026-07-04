import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GitMerge,
  GripVertical,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  Layers,
  HelpCircle,
} from "lucide-react";

interface ApprovalStage {
  id: string;
  title: string;
  role: string;
  threshold: string;
  slaHours: number;
  description: string;
}

const initialWorkflows: Record<string, ApprovalStage[]> = {
  "PAYMENT_VOUCHER": [
    { id: "stg-1", title: "Stage 1: Departmental Review", role: "Branch Accountant", threshold: "Up to 250,000 LKR", slaHours: 12, description: "Initial invoice verification and budget checking." },
    { id: "stg-2", title: "Stage 2: Financial Audit", role: "Senior Accountant / Finance Mgr", threshold: "Up to 1,500,000 LKR", slaHours: 24, description: "Tax compliance, withholding tax check, and ledger allocation." },
    { id: "stg-3", title: "Stage 3: Executive Authorization", role: "Chief Financial Officer (CFO)", threshold: "Above 1,500,000 LKR", slaHours: 48, description: "Final treasury sign-off and bank disbursement release." },
  ],
  "JOURNAL_ENTRY": [
    { id: "stg-4", title: "Stage 1: Peer Verification", role: "Senior Accountant", threshold: "All Manual Journal Entries", slaHours: 8, description: "Verify debit/credit balance and supporting vouchers." },
    { id: "stg-5", title: "Stage 2: General Ledger Sign-off", role: "Financial Controller", threshold: "Above 500,000 LKR", slaHours: 24, description: "Period closing and financial reporting compliance check." },
  ],
  "CREDIT_LIMIT": [
    { id: "stg-6", title: "Stage 1: Sales & Aging Assessment", role: "Billing Supervisor", threshold: "Up to 20% Limit Override", slaHours: 6, description: "Review customer payment history and outstanding invoices." },
    { id: "stg-7", title: "Stage 2: Risk Committee Sign-off", role: "Managing Director / CFO", threshold: "Above 20% Override", slaHours: 24, description: "Corporate credit risk evaluation and collateral check." },
  ],
  "BATCH_QUARANTINE": [
    { id: "stg-8", title: "Stage 1: Quality Assurance Inspection", role: "Chief Pharmacist", threshold: "All Expired/Recalled Batches", slaHours: 12, description: "Physical inspection and quarantine logging." },
    { id: "stg-9", title: "Stage 2: Regulatory Disposal Approval", role: "Compliance Officer", threshold: "Full Batch Disposal", slaHours: 48, description: "NMRA regulatory compliance documentation and write-off sign-off." },
  ],
};

interface SortableStageProps {
  stage: ApprovalStage;
  index: number;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof ApprovalStage, val: any) => void;
}

const SortableStageItem: React.FC<SortableStageProps> = ({
  stage,
  index,
  onRemove,
  onUpdate,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stage.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-2xl border ${
        isDragging
          ? "border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/80 shadow-xl scale-[1.01]"
          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-indigo-500/40"
      } p-5 transition-all`}
    >
      <div className="flex items-start gap-4">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="mt-1 flex h-10 w-10 shrink-0 cursor-grab items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-950 dark:hover:text-indigo-400 transition-colors active:cursor-grabbing"
          title="Drag to reorder approval stage"
        >
          <GripVertical className="h-5 w-5" />
        </div>

        {/* Stage Content & Form Inputs */}
        <div className="flex-1 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shadow-2xs">
                {index + 1}
              </span>
              <input
                type="text"
                value={stage.title}
                onChange={(e) => onUpdate(stage.id, "title", e.target.value)}
                className="font-bold text-base text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-none transition-colors px-1 py-0.5"
              />
            </div>

            <button
              onClick={() => onRemove(stage.id)}
              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors self-start sm:self-center"
              title="Delete this approval stage"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Assigned Role / Approver Group
              </label>
              <input
                type="text"
                value={stage.role}
                onChange={(e) => onUpdate(stage.id, "role", e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Financial / Scope Threshold
              </label>
              <input
                type="text"
                value={stage.threshold}
                onChange={(e) => onUpdate(stage.id, "threshold", e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 text-xs font-mono font-medium text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                SLA Auto-Escalation Timeout
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="1"
                  max="168"
                  value={stage.slaHours}
                  onChange={(e) => onUpdate(stage.id, "slaHours", Number(e.target.value))}
                  className="h-9 w-24 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 transition-colors"
                />
                <span className="text-xs text-slate-500 font-medium">Hours</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Stage Responsibilities & Verification Rationale
            </label>
            <input
              type="text"
              value={stage.description}
              onChange={(e) => onUpdate(stage.id, "description", e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 text-xs text-slate-600 dark:text-slate-400 focus:border-indigo-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ApprovalSettingsPage = () => {
  const [activeWorkflowKey, setActiveWorkflowKey] = useState<string>("PAYMENT_VOUCHER");
  const [workflows, setWorkflows] = useState<Record<string, ApprovalStage[]>>(initialWorkflows);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const currentStages = workflows[activeWorkflowKey] || [];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setWorkflows((prev) => {
        const list = prev[activeWorkflowKey];
        const oldIndex = list.findIndex((item) => item.id === active.id);
        const newIndex = list.findIndex((item) => item.id === over.id);
        return {
          ...prev,
          [activeWorkflowKey]: arrayMove(list, oldIndex, newIndex),
        };
      });
    }
  };

  const handleAddStage = () => {
    const newStageNumber = currentStages.length + 1;
    const newStage: ApprovalStage = {
      id: `stg-${Date.now()}`,
      title: `Stage ${newStageNumber}: New Verification Level`,
      role: "Select Role / Approver",
      threshold: "Specify Threshold",
      slaHours: 24,
      description: "Define stage responsibilities and audit checks.",
    };
    setWorkflows((prev) => ({
      ...prev,
      [activeWorkflowKey]: [...(prev[activeWorkflowKey] || []), newStage],
    }));
  };

  const handleRemoveStage = (id: string) => {
    setWorkflows((prev) => ({
      ...prev,
      [activeWorkflowKey]: prev[activeWorkflowKey].filter((item) => item.id !== id),
    }));
  };

  const handleUpdateStage = (id: string, field: keyof ApprovalStage, val: any) => {
    setWorkflows((prev) => ({
      ...prev,
      [activeWorkflowKey]: prev[activeWorkflowKey].map((item) =>
        item.id === id ? { ...item, [field]: val } : item
      ),
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    }, 700);
  };

  const workflowLabels: Record<string, { label: string; desc: string }> = {
    "PAYMENT_VOUCHER": { label: "Payment Vouchers & Disbursement", desc: "Treasury release and supplier bill payments" },
    "JOURNAL_ENTRY": { label: "Manual Journal Entry Posting", desc: "General ledger manual adjustments and period close" },
    "CREDIT_LIMIT": { label: "Customer Credit Limit Override", desc: "Sales invoicing exceeding allocated credit ceiling" },
    "BATCH_QUARANTINE": { label: "Batch Recall & Expiry Disposal", desc: "Pharmaceutical quality hold and NMRA write-off" },
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in-50 duration-300">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
              <GitMerge className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Control Center • Workflow Orchestration
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Multi-Stage Approval Workflows
              </h1>
            </div>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 pl-12">
            Configure hierarchical sign-off stages, financial thresholds, and SLA auto-escalation rules
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 px-3.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4" /> Workflows Enforced!
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving Hierarchy..." : "Save Workflows"}
          </button>
        </div>
      </div>

      {/* ── Workflow Selector Strip ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(workflowLabels).map(([key, info]) => {
          const isActive = activeWorkflowKey === key;
          const stageCount = (workflows[key] || []).length;
          return (
            <button
              key={key}
              onClick={() => setActiveWorkflowKey(key)}
              className={`flex flex-col justify-between rounded-xl border p-4 text-left transition-all ${
                isActive
                  ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/60 shadow-md ring-2 ring-indigo-600/20"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`}>
                    {stageCount} {stageCount === 1 ? "Stage" : "Stages"}
                  </span>
                  {isActive && <CheckCircle2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{info.label}</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{info.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Drag and Drop Stage Builder ── */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-600" />
              Configure Hierarchy: {workflowLabels[activeWorkflowKey]?.label}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Drag by the handle on the left to reorder approval priority. Requests escalate sequentially from Stage 1 upwards.
            </p>
          </div>
          <button
            onClick={handleAddStage}
            className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors shadow-2xs shrink-0"
          >
            <Plus className="h-4 w-4" /> Add Approval Stage
          </button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={currentStages.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {currentStages.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    No approval stages defined for this workflow yet.
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Click "Add Approval Stage" above to build your hierarchical sign-off sequence.
                  </p>
                </div>
              ) : (
                currentStages.map((stage, idx) => (
                  <SortableStageItem
                    key={stage.id}
                    stage={stage}
                    index={idx}
                    onRemove={handleRemoveStage}
                    onUpdate={handleUpdateStage}
                  />
                ))
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};

export default ApprovalSettingsPage;
