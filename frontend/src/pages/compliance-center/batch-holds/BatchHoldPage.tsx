import React, { useState, useMemo } from "react";
import {
  Pill,
  AlertTriangle,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  Unlock,
  Trash2,
  FileText,
  Building2,
  User,
  Plus,
  RefreshCw,
  Download,
} from "lucide-react";

interface BatchHoldItem {
  id: string;
  batchNumber: string;
  productName: string;
  sku: string;
  warehouse: string;
  quantityHeld: number;
  unitPrice: number;
  totalValue: number;
  holdReason: "TEMP_EXCURSION" | "QC_ASSAY_FAIL" | "PACKAGING_DEFECT" | "CUSTOMS_PENDING";
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  quarantinedBy: string;
  quarantineDate: string;
  status: "QUARANTINED" | "INVESTIGATION_IN_PROGRESS" | "RELEASED" | "MARKED_FOR_DISPOSAL";
  notes: string;
}

const initialBatchHolds: BatchHoldItem[] = [
  {
    id: "hold-001",
    batchNumber: "AMX-9021",
    productName: "Amoxicillin 500mg Capsules (10x10 Blister)",
    sku: "PHM-AMX-500",
    warehouse: "Colombo Central Warehouse (Bin #Q-01)",
    quantityHeld: 5000,
    unitPrice: 420,
    totalValue: 2100000,
    holdReason: "QC_ASSAY_FAIL",
    severity: "CRITICAL",
    quarantinedBy: "Dr. K. Silva (Head of QC)",
    quarantineDate: "2026-07-02",
    status: "INVESTIGATION_IN_PROGRESS",
    notes: "Dissolution rate 78% (Spec min 80%). Re-testing 20 samples in analytical lab.",
  },
  {
    id: "hold-002",
    batchNumber: "INS-4412",
    productName: "Insulin Glargine 100 IU/ml Prefilled Pen",
    sku: "PHM-INS-100",
    warehouse: "Cold Storage Depot (Kelaniya - Cold Room A)",
    quantityHeld: 850,
    unitPrice: 1800,
    totalValue: 1530000,
    holdReason: "TEMP_EXCURSION",
    severity: "CRITICAL",
    quarantinedBy: "Automated IoT Logger #TH-09",
    quarantineDate: "2026-07-01",
    status: "QUARANTINED",
    notes: "Temperature spike to 11.4°C recorded for 3 hours during transport from airport.",
  },
  {
    id: "hold-003",
    batchNumber: "PCM-1102",
    productName: "Paracetamol Paediatric Syrup 120mg/5ml",
    sku: "PHM-PCM-120",
    warehouse: "Regional Distribution Center (NY)",
    quantityHeld: 2400,
    unitPrice: 150,
    totalValue: 360000,
    holdReason: "PACKAGING_DEFECT",
    severity: "MEDIUM",
    quarantinedBy: "S. Perera (Warehouse Mgr)",
    quarantineDate: "2026-06-28",
    status: "QUARANTINED",
    notes: "Tamper-evident seal alignment issue reported on 12 outer cartons.",
  },
  {
    id: "hold-004",
    batchNumber: "AZI-8801",
    productName: "Azithromycin 500mg Film-Coated Tablets",
    sku: "PHM-AZI-500",
    warehouse: "Colombo Central Warehouse (Customs Bay)",
    quantityHeld: 10000,
    unitPrice: 320,
    totalValue: 3200000,
    holdReason: "CUSTOMS_PENDING",
    severity: "MEDIUM",
    quarantinedBy: "NMRA Customs Inspector",
    quarantineDate: "2026-06-25",
    status: "RELEASED",
    notes: "Sample assay cleared by NMRA National Control Laboratory. Batch unrestricted.",
  },
];

const BatchHoldPage = () => {
  const [data, setData] = useState<BatchHoldItem[]>(initialBatchHolds);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedReason, setSelectedReason] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Modal State for Releasing / Disposing
  const [selectedBatch, setSelectedBatch] = useState<BatchHoldItem | null>(null);
  const [modalAction, setModalAction] = useState<"RELEASE" | "DISPOSE" | null>(null);
  const [overrideReason, setOverrideReason] = useState<string>("");

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesReason = selectedReason === "ALL" || item.holdReason === selectedReason;
      const matchesStatus = selectedStatus === "ALL" || item.status === selectedStatus;
      const matchesSearch =
        item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesReason && matchesStatus && matchesSearch;
    });
  }, [data, selectedReason, selectedStatus, searchQuery]);

  const totalQuarantinedValue = useMemo(() => {
    return data
      .filter((b) => b.status === "QUARANTINED" || b.status === "INVESTIGATION_IN_PROGRESS")
      .reduce((sum, b) => sum + b.totalValue, 0);
  }, [data]);

  const handleConfirmAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch || !modalAction) return;

    setData((prev) =>
      prev.map((item) => {
        if (item.id === selectedBatch.id) {
          return {
            ...item,
            status: modalAction === "RELEASE" ? "RELEASED" : "MARKED_FOR_DISPOSAL",
            notes: `${item.notes} [${modalAction === "RELEASE" ? "QC RELEASED" : "MARKED FOR DISPOSAL"}: ${overrideReason}]`,
          };
        }
        return item;
      })
    );

    setSelectedBatch(null);
    setModalAction(null);
    setOverrideReason("");
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in-50 duration-300">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80  pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
              <Pill className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-600 ">
                Compliance Center • Quality Assurance
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900  sm:text-3xl">
                Batch Quarantine & Quality Hold Register
              </h1>
            </div>
          </div>
          <p className="mt-1 text-sm text-slate-500  pl-12">
            Monitor pharmaceutical batches held in quarantine due to cold chain excursions, QC assay failures, or NMRA checks
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          <button className="flex h-10 items-center gap-2 rounded-xl border border-slate-200  bg-white  px-4 text-sm font-semibold text-slate-700  hover:bg-slate-50 transition-all shadow-xs">
            <Download className="h-4 w-4 text-slate-500" />
            Export Quarantine Log
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200  bg-white  p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Quarantined Batches</span>
          <p className="mt-2 text-3xl font-extrabold text-amber-600 ">
            {data.filter((b) => b.status === "QUARANTINED" || b.status === "INVESTIGATION_IN_PROGRESS").length}
          </p>
          <span className="text-xs text-amber-600 font-semibold mt-1 block">Blocked from sales & ERP dispatch</span>
        </div>
        <div className="rounded-xl border border-slate-200  bg-white  p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Frozen Stock Value</span>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 ">
            ₨ {(totalQuarantinedValue / 1000000).toFixed(2)}M
          </p>
          <span className="text-xs text-slate-500 font-semibold mt-1 block">Across 3 warehouse bins</span>
        </div>
        <div className="rounded-xl border border-slate-200  bg-white  p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Under Lab Investigation</span>
          <p className="mt-2 text-3xl font-extrabold text-indigo-600 ">
            {data.filter((b) => b.status === "INVESTIGATION_IN_PROGRESS").length}
          </p>
          <span className="text-xs text-indigo-600 font-semibold mt-1 block">Analytical lab re-testing</span>
        </div>
        <div className="rounded-xl border border-slate-200  bg-white  p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Released This Month</span>
          <p className="mt-2 text-3xl font-extrabold text-emerald-600 ">
            {data.filter((b) => b.status === "RELEASED").length}
          </p>
          <span className="text-xs text-emerald-600 font-semibold mt-1 block">QC assay cleared</span>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200  bg-white  p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search drug name, batch #, or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200  bg-slate-50/50  pl-10 pr-4 text-sm text-slate-900  placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
            className="h-10 rounded-xl border border-slate-200  bg-white  px-3.5 text-xs font-semibold text-slate-700  focus:outline-none"
          >
            <option value="ALL">All Hold Reasons</option>
            <option value="TEMP_EXCURSION">Cold Chain / Temp Excursion</option>
            <option value="QC_ASSAY_FAIL">Failed QC Assay / Potency</option>
            <option value="PACKAGING_DEFECT">Packaging / Blister Defect</option>
            <option value="CUSTOMS_PENDING">Pending Customs Clearance</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 rounded-xl border border-slate-200  bg-white  px-3.5 text-xs font-semibold text-slate-700  focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="QUARANTINED">Quarantined (Active Hold)</option>
            <option value="INVESTIGATION_IN_PROGRESS">Under Lab Investigation</option>
            <option value="RELEASED">Released / Unrestricted</option>
            <option value="MARKED_FOR_DISPOSAL">Marked for Incineration</option>
          </select>
        </div>
      </div>

      {/* ── Quarantined Batches List / Table ── */}
      <div className="space-y-4">
        {filteredData.length === 0 ? (
          <div className="rounded-2xl border border-slate-200  bg-white  p-12 text-center text-slate-500">
            No batch hold records match your search criteria.
          </div>
        ) : (
          filteredData.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border bg-white  p-6 shadow-sm transition-all ${
                item.status === "RELEASED"
                  ? "border-emerald-200/60  opacity-85"
                  : item.status === "MARKED_FOR_DISPOSAL"
                  ? "border-rose-200  bg-rose-50/10"
                  : "border-slate-200  hover:border-amber-400"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                {/* Left: Batch Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono font-extrabold text-sm rounded-md bg-slate-100  px-2.5 py-1 text-slate-900 ">
                      Batch #{item.batchNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-400">SKU: {item.sku}</span>
                    {item.severity === "CRITICAL" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-800   font-bold px-2.5 py-0.5 text-[10px]">
                        <ShieldAlert className="h-3 w-3" /> CRITICAL SEVERITY
                      </span>
                    )}
                    {item.holdReason === "TEMP_EXCURSION" && (
                      <span className="rounded bg-sky-100  text-sky-800  font-bold px-2 py-0.5 text-[10px]">
                        ❄️ Cold Chain Excursion
                      </span>
                    )}
                    {item.holdReason === "QC_ASSAY_FAIL" && (
                      <span className="rounded bg-amber-100  text-amber-800  font-bold px-2 py-0.5 text-[10px]">
                        🧪 QC Assay Variation
                      </span>
                    )}
                    {item.holdReason === "PACKAGING_DEFECT" && (
                      <span className="rounded bg-purple-100  text-purple-800  font-bold px-2 py-0.5 text-[10px]">
                        📦 Packaging Seal Defect
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 ">{item.productName}</h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500  pt-1">
                    <span className="flex items-center gap-1 font-semibold text-slate-700 ">
                      <Building2 className="h-3.5 w-3.5 text-amber-500" /> {item.warehouse}
                    </span>
                    <span>•</span>
                    <span>
                      Held Qty: <b>{item.quantityHeld.toLocaleString()} units</b> (₨ {item.totalValue.toLocaleString()})
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" /> Quarantined by: <b>{item.quarantinedBy}</b> ({item.quarantineDate})
                    </span>
                  </div>

                  {/* Notes / Evidence */}
                  <div className="mt-3 rounded-xl bg-slate-50  p-3.5 text-xs text-slate-700  border border-slate-100 ">
                    <span className="font-bold text-slate-900 ">Investigation Status & Notes: </span>
                    {item.notes}
                  </div>
                </div>

                {/* Right: Status & Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100 ">
                  <div>
                    {item.status === "QUARANTINED" && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700   border border-amber-200  px-3 py-1 text-xs font-bold">
                        <Clock className="h-3.5 w-3.5" /> QUARANTINED (LOCKED)
                      </span>
                    )}
                    {item.status === "INVESTIGATION_IN_PROGRESS" && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 text-indigo-700   border border-indigo-200  px-3 py-1 text-xs font-bold animate-pulse">
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" /> LAB TESTING IN PROGRESS
                      </span>
                    )}
                    {item.status === "RELEASED" && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700   border border-emerald-200  px-3 py-1 text-xs font-bold">
                        <CheckCircle2 className="h-3.5 w-3.5" /> RELEASED BY QC
                      </span>
                    )}
                    {item.status === "MARKED_FOR_DISPOSAL" && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700   border border-rose-200  px-3 py-1 text-xs font-bold">
                        <XCircle className="h-3.5 w-3.5" /> MARKED FOR INCINERATION
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {(item.status === "QUARANTINED" || item.status === "INVESTIGATION_IN_PROGRESS") && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedBatch(item);
                          setModalAction("RELEASE");
                        }}
                        className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs transition-colors"
                      >
                        <Unlock className="h-3.5 w-3.5" /> QC Release Batch
                      </button>
                      <button
                        onClick={() => {
                          setSelectedBatch(item);
                          setModalAction("DISPOSE");
                        }}
                        className="flex items-center gap-1.5 rounded-xl border border-rose-200  bg-rose-50  px-3.5 py-2 text-xs font-semibold text-rose-700  hover:bg-rose-100 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Dispose Stock
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Modal: QC Override / Release / Dispose ── */}
      {selectedBatch && modalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in-50">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200  bg-white  p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100  pb-4">
              <div className="flex items-center gap-2.5">
                <div className={`rounded-lg p-2 ${modalAction === "RELEASE" ? "bg-emerald-50 text-emerald-600 " : "bg-rose-50 text-rose-600 "}`}>
                  {modalAction === "RELEASE" ? <Unlock className="h-5 w-5" /> : <Trash2 className="h-5 w-5" />}
                </div>
                <h3 className="text-lg font-bold text-slate-900 ">
                  {modalAction === "RELEASE" ? "Authorize QC Batch Release" : "Mark Batch for Incineration"}
                </h3>
              </div>
              <button onClick={() => { setSelectedBatch(null); setModalAction(null); }} className="text-slate-400 hover:text-slate-700 p-1">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs bg-slate-50  p-3.5 rounded-xl border border-slate-100 ">
              <p><b>Target Batch:</b> #{selectedBatch.batchNumber} ({selectedBatch.productName})</p>
              <p><b>Current Location:</b> {selectedBatch.warehouse}</p>
              <p><b>Hold Reason:</b> {selectedBatch.holdReason} ({selectedBatch.quarantinedBy})</p>
            </div>

            <form onSubmit={handleConfirmAction} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  {modalAction === "RELEASE" ? "QC Assay / Release Justification (Required)" : "Disposal Authorization Rationale (Required)"}
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder={
                    modalAction === "RELEASE"
                      ? "e.g. Re-tested 20 samples in lab. Assayed potency 99.4%, within NMRA pharmacopeia spec. Safe for release."
                      : "e.g. Temperature excursion confirmed > 15°C for 6 hours. Product potency degraded. Approved for incineration under NMRA witness."
                  }
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-200  bg-slate-50  p-3.5 text-xs text-slate-900  focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 ">
                <button
                  type="button"
                  onClick={() => { setSelectedBatch(null); setModalAction(null); }}
                  className="rounded-xl bg-slate-100  px-5 py-2 text-xs font-semibold text-slate-700  hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`rounded-xl px-5 py-2 text-xs font-semibold text-white shadow-sm ${
                    modalAction === "RELEASE" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  {modalAction === "RELEASE" ? "Confirm & Unrestrict Stock" : "Confirm Disposal Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchHoldPage;
