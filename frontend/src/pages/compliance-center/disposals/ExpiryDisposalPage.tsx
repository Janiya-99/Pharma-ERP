import React, { useState, useMemo } from "react";
import {
  Trash2,
  FileCheck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Upload,
  Calendar,
  Download,
  Building2,
  UserCheck,
  Shield,
  FileText,
  Plus,
} from "lucide-react";

interface DisposalOrder {
  id: string;
  orderNumber: string;
  productName: string;
  batchNumber: string;
  sku: string;
  warehouse: string;
  quantityExpired: number;
  unitCost: number;
  writeOffValue: number;
  disposalMethod: "BIOMEDICAL_INCINERATION" | "CHEMICAL_NEUTRALIZATION" | "VENDOR_RETURN";
  witnessAuthority: string;
  scheduledDate: string;
  certificateNumber: string;
  status: "AWAITING_WITNESS" | "SCHEDULED_CONFIRMED" | "DESTROYED_VERIFIED";
  notes: string;
}

const initialDisposals: DisposalOrder[] = [
  {
    id: "dsp-001",
    orderNumber: "DISP-2026-041",
    productName: "Insulin Glargine 100 IU/ml (Expired Stock)",
    batchNumber: "INS-4412",
    sku: "PHM-INS-100",
    warehouse: "Cold Storage Depot (Kelaniya)",
    quantityExpired: 1400,
    unitCost: 1800,
    writeOffValue: 2520000,
    disposalMethod: "BIOMEDICAL_INCINERATION",
    witnessAuthority: "Dr. R. Alwis (NMRA Authorized Inspector)",
    scheduledDate: "2026-07-15",
    certificateNumber: "PENDING-WITNESS",
    status: "SCHEDULED_CONFIRMED",
    notes: "Cold chain failure stock transferred to quarantine disposal bay. Incineration booked at Western Province Facility.",
  },
  {
    id: "dsp-002",
    orderNumber: "DISP-2026-040",
    productName: "Amoxicillin Trihydrate 250mg Suspension (Expired)",
    batchNumber: "AMX-1190",
    sku: "PHM-AMX-250",
    warehouse: "Colombo Central Warehouse (HQ)",
    quantityExpired: 3200,
    unitCost: 380,
    writeOffValue: 1216000,
    disposalMethod: "BIOMEDICAL_INCINERATION",
    witnessAuthority: "S. Gunawardena (Public Health Inspector - PHI)",
    scheduledDate: "2026-07-18",
    certificateNumber: "PENDING-WITNESS",
    status: "AWAITING_WITNESS",
    notes: "Expired routine warehouse stock. PHI notification letter dispatched via courier.",
  },
  {
    id: "dsp-003",
    orderNumber: "DISP-2026-039",
    productName: "Ceftriaxone Sodium Injection 1g Vial",
    batchNumber: "CEF-7701",
    sku: "PHM-CEF-100",
    warehouse: "Regional Distribution Center (NY)",
    quantityExpired: 850,
    unitCost: 950,
    writeOffValue: 807500,
    disposalMethod: "VENDOR_RETURN",
    witnessAuthority: "Manufacturer Quality Rep",
    scheduledDate: "2026-06-28",
    certificateNumber: "CERT-DEST-8809",
    status: "DESTROYED_VERIFIED",
    notes: "Voluntary return for vendor destruction. Signed certificate archived in regulatory records.",
  },
];

const ExpiryDisposalPage = () => {
  const [data, setData] = useState<DisposalOrder[]>(initialDisposals);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedMethod, setSelectedMethod] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Modal State for Uploading Certificate
  const [selectedOrder, setSelectedOrder] = useState<DisposalOrder | null>(null);
  const [certNumberInput, setCertNumberInput] = useState<string>("");

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesMethod = selectedMethod === "ALL" || item.disposalMethod === selectedMethod;
      const matchesStatus = selectedStatus === "ALL" || item.status === selectedStatus;
      const matchesSearch =
        item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesMethod && matchesStatus && matchesSearch;
    });
  }, [data, selectedMethod, selectedStatus, searchQuery]);

  const totalPendingValue = useMemo(() => {
    return data
      .filter((d) => d.status !== "DESTROYED_VERIFIED")
      .reduce((sum, d) => sum + d.writeOffValue, 0);
  }, [data]);

  const handleUploadCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !certNumberInput) return;

    setData((prev) =>
      prev.map((item) => {
        if (item.id === selectedOrder.id) {
          return {
            ...item,
            status: "DESTROYED_VERIFIED",
            certificateNumber: certNumberInput.toUpperCase(),
            notes: `${item.notes} [WITNESS CERTIFICATE #${certNumberInput.toUpperCase()} UPLOADED & VERIFIED]`,
          };
        }
        return item;
      })
    );

    setSelectedOrder(null);
    setCertNumberInput("");
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in-50 duration-300">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white shadow-md shadow-purple-600/20">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Compliance Center • Hazardous Waste & Expiry
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Pharmaceutical Expiry & Disposal Register
              </h1>
            </div>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 pl-12">
            Schedule NMRA/PHI witnessed incinerations, track write-off stock valuation, and archive Certificates of Destruction
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button className="flex h-10 items-center gap-2 rounded-xl bg-purple-600 px-5 text-sm font-semibold text-white shadow-md shadow-purple-600/20 hover:bg-purple-700 transition-all">
            <Plus className="h-4 w-4" />
            New Disposal Order
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Disposals</span>
          <p className="mt-2 text-3xl font-extrabold text-purple-600 dark:text-purple-400">
            {data.filter((d) => d.status !== "DESTROYED_VERIFIED").length}
          </p>
          <span className="text-xs text-purple-600 font-semibold mt-1 block">2 active orders</span>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Write-off Value</span>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
            ₨ {(totalPendingValue / 1000000).toFixed(2)}M
          </p>
          <span className="text-xs text-slate-500 font-semibold mt-1 block">Awaiting physical destruction</span>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Witness Schedules Confirmed</span>
          <p className="mt-2 text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {data.filter((d) => d.status === "SCHEDULED_CONFIRMED").length}
          </p>
          <span className="text-xs text-indigo-600 font-semibold mt-1 block">NMRA & PHI officers assigned</span>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Destroyed Year-to-Date</span>
          <p className="mt-2 text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {data.filter((d) => d.status === "DESTROYED_VERIFIED").length}
          </p>
          <span className="text-xs text-emerald-600 font-semibold mt-1 block">Certificates archived</span>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search order #, drug name, or batch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-3.5 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Disposal Methods</option>
            <option value="BIOMEDICAL_INCINERATION">Biomedical Incineration</option>
            <option value="CHEMICAL_NEUTRALIZATION">Chemical Neutralization</option>
            <option value="VENDOR_RETURN">Return to Manufacturer</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-3.5 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="AWAITING_WITNESS">Awaiting Witness Assignment</option>
            <option value="SCHEDULED_CONFIRMED">Scheduled & Confirmed</option>
            <option value="DESTROYED_VERIFIED">Destroyed & Verified</option>
          </select>
        </div>
      </div>

      {/* ── Disposal Orders List ── */}
      <div className="space-y-4">
        {filteredData.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center text-slate-500">
            No expiry disposal orders match your search criteria.
          </div>
        ) : (
          filteredData.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border bg-white dark:bg-slate-900 p-6 shadow-sm transition-all ${
                item.status === "DESTROYED_VERIFIED"
                  ? "border-emerald-200/60 dark:border-emerald-900/40 opacity-85"
                  : "border-slate-200 dark:border-slate-800 hover:border-purple-400"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                {/* Left Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono font-extrabold text-sm rounded-md bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-slate-900 dark:text-white">
                      {item.orderNumber}
                    </span>
                    <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                      Batch #{item.batchNumber}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 dark:bg-purple-950/60 px-2.5 py-0.5 text-xs font-bold text-purple-700 dark:text-purple-300">
                      🔥 {item.disposalMethod.replace("_", " ")}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{item.productName}</h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                      <Building2 className="h-3.5 w-3.5 text-purple-500" /> {item.warehouse}
                    </span>
                    <span>•</span>
                    <span>
                      Expired Qty: <b>{item.quantityExpired.toLocaleString()} units</b>
                    </span>
                    <span>•</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">
                      Write-off Value: ₨ {item.writeOffValue.toLocaleString()}
                    </span>
                  </div>

                  <div className="mt-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3.5 text-xs text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="flex items-center gap-1.5">
                      <UserCheck className="h-4 w-4 text-indigo-600" />
                      <b>Witnessing Authority:</b> {item.witnessAuthority} ({item.scheduledDate})
                    </span>
                    <span className="font-mono font-bold text-slate-600 dark:text-slate-400">
                      Cert #: {item.certificateNumber}
                    </span>
                  </div>
                </div>

                {/* Right Status & Actions */}
                <div className="flex flex-col items-start lg:items-end justify-between gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100 dark:border-slate-800">
                  <div>
                    {item.status === "DESTROYED_VERIFIED" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-3 py-1 text-xs font-bold">
                        <CheckCircle2 className="h-3.5 w-3.5" /> DESTROYED & VERIFIED
                      </span>
                    ) : item.status === "SCHEDULED_CONFIRMED" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 px-3 py-1 text-xs font-bold">
                        <Calendar className="h-3.5 w-3.5" /> WITNESS SCHEDULED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800 px-3 py-1 text-xs font-bold animate-pulse">
                        <Clock className="h-3.5 w-3.5" /> AWAITING WITNESS
                      </span>
                    )}
                  </div>

                  {item.status !== "DESTROYED_VERIFIED" ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedOrder(item)}
                        className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-purple-700 shadow-xs transition-colors"
                      >
                        <Upload className="h-3.5 w-3.5" /> Upload Sign-off Cert
                      </button>
                    </div>
                  ) : (
                    <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors">
                      <Download className="h-3.5 w-3.5 text-indigo-600" /> Download Dossier
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Modal: Upload Sign-off Certificate ── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in-50">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-purple-50 dark:bg-purple-950/50 p-2 text-purple-600 dark:text-purple-400">
                  <Upload className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Upload Certificate of Destruction</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-700 p-1">
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <p><b>Order #:</b> {selectedOrder.orderNumber} ({selectedOrder.productName})</p>
              <p><b>Witness Authority:</b> {selectedOrder.witnessAuthority}</p>
            </div>

            <form onSubmit={handleUploadCertificate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Witness Sign-off / Certificate Number (Required)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CERT-DEST-8809"
                  value={certNumberInput}
                  onChange={(e) => setCertNumberInput(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3.5 text-sm font-mono font-bold text-purple-600 dark:text-purple-400 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-xl bg-slate-100 dark:bg-slate-800 px-5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-purple-600 px-5 py-2 text-xs font-semibold text-white hover:bg-purple-700 shadow-sm"
                >
                  Verify & Archive Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpiryDisposalPage;
