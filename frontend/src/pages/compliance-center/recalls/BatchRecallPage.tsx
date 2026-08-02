import React, { useState, useMemo } from "react";
import {
  RotateCcw,
  AlertTriangle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Plus,
  Download,
  Send,
  Building2,
  Users,
  Package,
  FileText,
  RefreshCw,
} from "lucide-react";

interface RecallNotice {
  id: string;
  recallNumber: string;
  productName: string;
  batchNumber: string;
  sku: string;
  recallClass: "CLASS_I" | "CLASS_II" | "CLASS_III";
  initiator: "NMRA_MANDATE" | "MANUFACTURER_VOLUNTARY" | "INTERNAL_QC";
  issueDate: string;
  totalDistributed: number;
  recoveredQty: number;
  notifiedCustomers: number;
  totalCustomers: number;
  status: "OPEN_URGENT" | "RECOVERY_IN_PROGRESS" | "CLOSED_VERIFIED";
  reason: string;
}

const initialRecalls: RecallNotice[] = [
  {
    id: "rec-001",
    recallNumber: "RCL-2026-004",
    productName: "Paracetamol Paediatric Syrup 120mg/5ml (100ml Bottle)",
    batchNumber: "PCM-1102",
    sku: "PHM-PCM-120",
    recallClass: "CLASS_II",
    initiator: "MANUFACTURER_VOLUNTARY",
    issueDate: "2026-07-01",
    totalDistributed: 5000,
    recoveredQty: 4100,
    notifiedCustomers: 48,
    totalCustomers: 50,
    status: "RECOVERY_IN_PROGRESS",
    reason: "Potential crystallization of active ingredient reported in cold climates. Reversible hazard.",
  },
  {
    id: "rec-002",
    recallNumber: "RCL-2026-003",
    productName: "Ciprofloxacin IV Infusion 200mg/100ml (Glass Vial)",
    batchNumber: "CIP-8819",
    sku: "PHM-CIP-200",
    recallClass: "CLASS_I",
    initiator: "NMRA_MANDATE",
    issueDate: "2026-06-20",
    totalDistributed: 1200,
    recoveredQty: 1200,
    notifiedCustomers: 18,
    totalCustomers: 18,
    status: "CLOSED_VERIFIED",
    reason: "Particulate matter observed in routine hospital sterility sampling. Serious health risk alert.",
  },
  {
    id: "rec-003",
    recallNumber: "RCL-2026-002",
    productName: "Omeprazole 20mg Enteric-Coated Capsules",
    batchNumber: "OMP-3301",
    sku: "PHM-OMP-020",
    recallClass: "CLASS_III",
    initiator: "INTERNAL_QC",
    issueDate: "2026-06-15",
    totalDistributed: 10000,
    recoveredQty: 8950,
    notifiedCustomers: 110,
    totalCustomers: 112,
    status: "RECOVERY_IN_PROGRESS",
    reason: "Minor carton printing discrepancy (incorrect barcode digit). Product potency and safety unaffected.",
  },
];

const BatchRecallPage = () => {
  const [data, setData] = useState<RecallNotice[]>(initialRecalls);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Modal State for logging recovery
  const [selectedRecall, setSelectedRecall] = useState<RecallNotice | null>(null);
  const [additionalQty, setAdditionalQty] = useState<string>("");

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesClass = selectedClass === "ALL" || item.recallClass === selectedClass;
      const matchesStatus = selectedStatus === "ALL" || item.status === selectedStatus;
      const matchesSearch =
        item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.recallNumber.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesClass && matchesStatus && matchesSearch;
    });
  }, [data, selectedClass, selectedStatus, searchQuery]);

  const handleLogRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecall || !additionalQty) return;
    const added = parseInt(additionalQty, 10);
    if (isNaN(added) || added <= 0) return;

    setData((prev) =>
      prev.map((item) => {
        if (item.id === selectedRecall.id) {
          const newQty = Math.min(item.totalDistributed, item.recoveredQty + added);
          return {
            ...item,
            recoveredQty: newQty,
            status: newQty >= item.totalDistributed ? "CLOSED_VERIFIED" : item.status,
          };
        }
        return item;
      })
    );

    setSelectedRecall(null);
    setAdditionalQty("");
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in-50 duration-300">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80  pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white shadow-md shadow-rose-600/20">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-rose-600 ">
                Compliance Center • Emergency Response
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900  sm:text-3xl">
                Product Recalls & Field Alerts Register
              </h1>
            </div>
          </div>
          <p className="mt-1 text-sm text-slate-500  pl-12">
            Manage Class I/II/III drug recalls, track recovery percentages from hospitals & pharmacies, and broadcast NMRA alerts
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button className="flex h-10 items-center gap-2 rounded-xl bg-rose-600 px-5 text-sm font-semibold text-white shadow-md shadow-rose-600/20 hover:bg-rose-700 transition-all">
            <Plus className="h-4 w-4" />
            Initiate Recall Notice
          </button>
        </div>
      </div>

      {/* ── KPI Summary Cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200  bg-white  p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Active Recalls</span>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 ">
            {data.filter((r) => r.status !== "CLOSED_VERIFIED").length}
          </p>
          <span className="text-xs text-rose-600 font-semibold mt-1 block">2 open notices</span>
        </div>
        <div className="rounded-xl border border-slate-200  bg-white  p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Class I Critical Alerts</span>
          <p className="mt-2 text-3xl font-extrabold text-rose-600 ">
            {data.filter((r) => r.recallClass === "CLASS_I").length}
          </p>
          <span className="text-xs text-slate-400 font-medium mt-1 block">100% recovered & closed</span>
        </div>
        <div className="rounded-xl border border-slate-200  bg-white  p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Units in Field vs Recovered</span>
          <p className="mt-2 text-3xl font-extrabold text-indigo-600 ">
            {data.reduce((sum, r) => sum + r.recoveredQty, 0).toLocaleString()} /{" "}
            {data.reduce((sum, r) => sum + r.totalDistributed, 0).toLocaleString()}
          </p>
          <span className="text-xs text-emerald-600 font-semibold mt-1 block">88.5% overall recovery rate</span>
        </div>
        <div className="rounded-xl border border-slate-200  bg-white  p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Notified Customers</span>
          <p className="mt-2 text-3xl font-extrabold text-emerald-600 ">
            {data.reduce((sum, r) => sum + r.notifiedCustomers, 0)} / {data.reduce((sum, r) => sum + r.totalCustomers, 0)}
          </p>
          <span className="text-xs text-slate-400 font-medium mt-1 block">Hospitals, clinics & wholesalers</span>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200  bg-white  p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search recall #, drug name, or batch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200  bg-slate-50/50  pl-10 pr-4 text-sm text-slate-900  placeholder:text-slate-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="h-10 rounded-xl border border-slate-200  bg-white  px-3.5 text-xs font-semibold text-slate-700  focus:outline-none"
          >
            <option value="ALL">All Recall Classes</option>
            <option value="CLASS_I">Class I (Serious Health Hazard)</option>
            <option value="CLASS_II">Class II (Reversible Hazard)</option>
            <option value="CLASS_III">Class III (Unlikely Hazard)</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 rounded-xl border border-slate-200  bg-white  px-3.5 text-xs font-semibold text-slate-700  focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN_URGENT">Open Urgent Notice</option>
            <option value="RECOVERY_IN_PROGRESS">Recovery In Progress</option>
            <option value="CLOSED_VERIFIED">Closed & Verified</option>
          </select>
        </div>
      </div>

      {/* ── Recalls List ── */}
      <div className="space-y-4">
        {filteredData.length === 0 ? (
          <div className="rounded-2xl border border-slate-200  bg-white  p-12 text-center text-slate-500">
            No product recall records match your search criteria.
          </div>
        ) : (
          filteredData.map((item) => {
            const recoveryPct = Math.round((item.recoveredQty / item.totalDistributed) * 100);
            return (
              <div
                key={item.id}
                className={`rounded-2xl border bg-white  p-6 shadow-sm transition-all ${
                  item.status === "CLOSED_VERIFIED"
                    ? "border-emerald-200/60  opacity-85"
                    : "border-slate-200  hover:border-rose-400"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  {/* Left: Recall Details */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono font-extrabold text-sm rounded-md bg-slate-100  px-2.5 py-1 text-slate-900 ">
                        {item.recallNumber}
                      </span>
                      <span className="font-mono font-bold text-xs text-indigo-600 ">
                        Batch #{item.batchNumber}
                      </span>
                      {item.recallClass === "CLASS_I" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-800   font-bold px-2.5 py-0.5 text-[10px] animate-pulse">
                          <ShieldAlert className="h-3 w-3" /> CLASS I (CRITICAL HAZARD)
                        </span>
                      )}
                      {item.recallClass === "CLASS_II" && (
                        <span className="rounded bg-amber-100  text-amber-800  font-bold px-2.5 py-0.5 text-[10px]">
                          ⚠️ CLASS II (REVERSIBLE HAZARD)
                        </span>
                      )}
                      {item.recallClass === "CLASS_III" && (
                        <span className="rounded bg-sky-100  text-sky-800  font-bold px-2.5 py-0.5 text-[10px]">
                          ℹ️ CLASS III (MINOR DEFECT)
                        </span>
                      )}
                      <span className="text-xs text-slate-400 font-medium">• Initiator: <b>{item.initiator.replace("_", " ")}</b></span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 ">{item.productName}</h3>

                    <p className="text-xs text-slate-600  bg-slate-50  p-3 rounded-xl border border-slate-100 ">
                      <span className="font-bold text-slate-900 ">Recall Justification: </span>
                      {item.reason}
                    </p>

                    {/* Progress Bar & Telemetry */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-700 ">
                          Stock Recovery: <b>{item.recoveredQty.toLocaleString()}</b> / {item.totalDistributed.toLocaleString()} units
                        </span>
                        <span className={recoveryPct >= 100 ? "text-emerald-600 font-bold" : "text-indigo-600 font-bold"}>
                          {recoveryPct}% Recovered
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 ">
                        <div
                          className={`h-full transition-all duration-500 ${
                            recoveryPct >= 100 ? "bg-emerald-500" : "bg-rose-500"
                          }`}
                          style={{ width: `${Math.min(recoveryPct, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> Customer Broadcasts: <b>{item.notifiedCustomers}/{item.totalCustomers} notified</b>
                        </span>
                        <span>Issued: {item.issueDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col items-start lg:items-end justify-between gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100 ">
                    <div>
                      {item.status === "CLOSED_VERIFIED" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700   border border-emerald-200  px-3 py-1 text-xs font-bold">
                          <CheckCircle2 className="h-3.5 w-3.5" /> RECALL CLOSED & ARCHIVED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700   border border-amber-200  px-3 py-1 text-xs font-bold animate-pulse">
                          <Clock className="h-3.5 w-3.5" /> RECOVERY IN PROGRESS
                        </span>
                      )}
                    </div>

                    {item.status !== "CLOSED_VERIFIED" && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedRecall(item)}
                          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs transition-colors"
                        >
                          <Package className="h-3.5 w-3.5" /> Log Recovered Stock
                        </button>
                        <button className="flex items-center gap-1.5 rounded-xl border border-slate-200  bg-white  px-3.5 py-2 text-xs font-semibold text-slate-700  hover:bg-slate-50 transition-colors">
                          <Send className="h-3.5 w-3.5 text-indigo-600" /> Broadcast Alert
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Modal: Log Recovered Stock ── */}
      {selectedRecall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in-50">
          <div className="w-full max-w-md rounded-2xl border border-slate-200  bg-white  p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100  pb-4">
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-indigo-50  p-2 text-indigo-600 ">
                  <Package className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 ">Log Recovered Recall Stock</h3>
              </div>
              <button onClick={() => setSelectedRecall(null)} className="text-slate-400 hover:text-slate-700 p-1">
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs bg-slate-50  p-3.5 rounded-xl border border-slate-100 ">
              <p><b>Recall #:</b> {selectedRecall.recallNumber} (Batch #{selectedRecall.batchNumber})</p>
              <p><b>Current Recovery:</b> {selectedRecall.recoveredQty} / {selectedRecall.totalDistributed} units</p>
            </div>

            <form onSubmit={handleLogRecovery} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Additional Units Recovered from Field
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedRecall.totalDistributed - selectedRecall.recoveredQty}
                  placeholder="e.g. 250"
                  value={additionalQty}
                  onChange={(e) => setAdditionalQty(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200  bg-slate-50  px-3.5 text-sm font-bold text-slate-900  focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 ">
                <button
                  type="button"
                  onClick={() => setSelectedRecall(null)}
                  className="rounded-xl bg-slate-100  px-5 py-2 text-xs font-semibold text-slate-700  hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm"
                >
                  Update Recovery Count
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchRecallPage;
