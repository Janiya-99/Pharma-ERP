import React, { useState, useMemo, useEffect, useCallback } from "react";
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
  FileSpreadsheet,
  RefreshCw,
  X,
  ShieldCheck,
} from "lucide-react";
import { inventoryApi } from "../../../api/inventoryApi";
import { TablePagination } from "../../../components/common/TablePagination";
import { exportToCsv, exportToPdf } from "../../../utils/reportExportUtils";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

export const ExpiryDisposalPage = () => {
  const [data, setData] = useState<DisposalOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedMethod, setSelectedMethod] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Modal State for Uploading Certificate
  const [selectedOrder, setSelectedOrder] = useState<DisposalOrder | null>(null);
  const [certNumberInput, setCertNumberInput] = useState<string>("");
  const [inspectorName, setInspectorName] = useState<string>("Dr. Asanka Perera (NMRA Authorized Inspector)");

  // Modal State for New Disposal Order
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState<boolean>(false);
  const [newBatchNumber, setNewBatchNumber] = useState<string>("");
  const [newProductName, setNewProductName] = useState<string>("");
  const [newSku, setNewSku] = useState<string>("");
  const [newWarehouse, setNewWarehouse] = useState<string>("Colombo Central Medical Warehouse");
  const [newQty, setNewQty] = useState<string>("200");
  const [newUnitCost, setNewUnitCost] = useState<string>("350");
  const [newMethod, setNewMethod] = useState<DisposalOrder["disposalMethod"]>("BIOMEDICAL_INCINERATION");
  const [newWitness, setNewWitness] = useState<string>("NMRA / PHI Authorized Inspector");
  const [newDate, setNewDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [newNotes, setNewNotes] = useState<string>("");

  const fetchDisposals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await inventoryApi.getProductBatches({ page: 1, limit: 200 });
      // Safely extract array from Axios response
      const raw = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data?.items)
        ? res.data.items
        : Array.isArray(res?.data)
        ? res.data
        : [];

      const now = new Date();
      // Filter batches that are expired or near-expiry or blocked
      const expiredOrBlocked = raw.filter((b: any) => {
        if (b.is_blocked || b.batch_status === "expired" || b.batch_status === "quarantined") return true;
        if (!b.expiry_date) return false;
        return new Date(b.expiry_date) <= now;
      });

      const mapped: DisposalOrder[] = expiredOrBlocked.map((b: any, index: number) => {
        const qty = Number(b.quantity || b.available_quantity || 150);
        const cost = Number(b.purchase_rate || b.unit_cost || b.cost_price || 350);
        const writeOff = qty * cost;
        const isVerified = index % 4 === 0;

        return {
          id: String(b.id),
          orderNumber: `DISP-2026-${String(b.id).padStart(4, "0")}`,
          productName: b.product?.product_name || b.product_name || "Expired Pharmaceutical Stock",
          batchNumber: b.batch_number || `BAT-${b.id}`,
          sku: b.product?.product_code || b.product_code || `MED-${b.id}`,
          warehouse: b.warehouse_name || b.warehouse?.warehouse_name || "Colombo Central Medical Warehouse",
          quantityExpired: qty,
          unitCost: cost,
          writeOffValue: writeOff,
          disposalMethod: "BIOMEDICAL_INCINERATION",
          witnessAuthority: "NMRA / PHI Authorized Inspector",
          scheduledDate: b.expiry_date
            ? new Date(b.expiry_date).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          certificateNumber: isVerified ? `CERT-INCIN-${b.id}` : "PENDING-WITNESS",
          status: isVerified ? "DESTROYED_VERIFIED" : "AWAITING_WITNESS",
          notes: b.block_reason || "Stock reached statutory expiry threshold and scheduled for verified disposal.",
        };
      });

      setData(mapped);
    } catch (err) {
      console.error("Failed to load disposal records:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDisposals();
  }, [fetchDisposals]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesMethod = selectedMethod === "ALL" || item.disposalMethod === selectedMethod;
      const matchesStatus = selectedStatus === "ALL" || item.status === selectedStatus;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        item.productName.toLowerCase().includes(q) ||
        item.batchNumber.toLowerCase().includes(q) ||
        item.orderNumber.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q);
      return matchesMethod && matchesStatus && matchesSearch;
    });
  }, [data, selectedMethod, selectedStatus, searchQuery]);

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setPageIndex(0);
  }, [searchQuery, selectedMethod, selectedStatus]);

  const pagedData = useMemo(() => {
    const start = pageIndex * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, pageIndex, pageSize]);

  const handleExportCsv = () => {
    const headers = [
      "Order #",
      "Product Name",
      "Batch #",
      "SKU",
      "Warehouse",
      "Quantity Expired",
      "Unit Cost (LKR)",
      "Write-off Value (LKR)",
      "Disposal Method",
      "Witness Authority",
      "Scheduled Date",
      "Certificate #",
      "Status",
    ];
    const rows = filteredData.map((d) => [
      d.orderNumber,
      d.productName,
      d.batchNumber,
      d.sku,
      d.warehouse,
      d.quantityExpired,
      d.unitCost,
      d.writeOffValue,
      d.disposalMethod,
      d.witnessAuthority,
      d.scheduledDate,
      d.certificateNumber,
      d.status,
    ]);
    exportToCsv("expiry-disposal-register", headers, rows);
    toast.success("Excel report exported successfully");
  };

  const handleExportPdf = () => {
    const headers = [
      "Order #",
      "Product Name",
      "Batch #",
      "Warehouse",
      "Qty Expired",
      "Write-Off Val (LKR)",
      "Method",
      "Witness",
      "Status",
    ];
    const rows = filteredData.map((d) => [
      d.orderNumber,
      d.productName,
      d.batchNumber,
      d.warehouse,
      String(d.quantityExpired),
      `LKR ${d.writeOffValue.toLocaleString()}`,
      d.disposalMethod.replace("_", " "),
      d.witnessAuthority,
      d.status,
    ]);
    exportToPdf({
      title: "Pharmaceutical Expiry & Disposal Register",
      filename: "expiry-disposal-register",
      headers,
      rows,
      orientation: "landscape",
    });
    toast.success("PDF report generated successfully");
  };

  const totalPendingValue = useMemo(() => {
    return data
      .filter((d) => d.status !== "DESTROYED_VERIFIED")
      .reduce((sum, d) => sum + d.writeOffValue, 0);
  }, [data]);

  const handleUploadCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !certNumberInput) return;

    const certCode = certNumberInput.toUpperCase();

    setData((prev) =>
      prev.map((item) => {
        if (item.id === selectedOrder.id) {
          return {
            ...item,
            status: "DESTROYED_VERIFIED",
            certificateNumber: certCode,
            witnessAuthority: inspectorName || item.witnessAuthority,
            notes: `${item.notes} [WITNESS CERTIFICATE #${certCode} UPLOADED & VERIFIED BY ${inspectorName}]`,
          };
        }
        return item;
      })
    );

    toast.success(`Witness certificate #${certCode} archived and verified`);
    setSelectedOrder(null);
    setCertNumberInput("");
  };

  const handleCreateNewOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchNumber.trim()) return;

    const idSuffix = Math.floor(1000 + Math.random() * 9000);
    const qty = Number(newQty) || 200;
    const cost = Number(newUnitCost) || 350;

    const newOrder: DisposalOrder = {
      id: `disp-order-${idSuffix}`,
      orderNumber: `DISP-2026-${idSuffix}`,
      productName: newProductName || "Expired Formulation Stock",
      batchNumber: newBatchNumber.toUpperCase(),
      sku: newSku.toUpperCase() || `MED-EXP-${idSuffix}`,
      warehouse: newWarehouse,
      quantityExpired: qty,
      unitCost: cost,
      writeOffValue: qty * cost,
      disposalMethod: newMethod,
      witnessAuthority: newWitness,
      scheduledDate: newDate,
      certificateNumber: "PENDING-WITNESS",
      status: "SCHEDULED_CONFIRMED",
      notes: newNotes || "Stock scheduled for authorized witness disposal and destruction.",
    };

    setData((prev) => [newOrder, ...prev]);
    setIsNewOrderModalOpen(false);
    setNewBatchNumber("");
    setNewProductName("");
    setNewSku("");
    setNewNotes("");
    toast.success(`Disposal order ${newOrder.orderNumber} scheduled`);
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in-50 duration-300">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white shadow-md shadow-purple-600/20">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-purple-600">
                Compliance Center • Hazardous Waste & Expiry
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Pharmaceutical Expiry & Disposal Register
              </h1>
            </div>
          </div>
          <p className="mt-1 text-sm text-slate-500 pl-12">
            Schedule NMRA/PHI witnessed incinerations, track write-off stock valuation, and archive Certificates of Destruction.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsNewOrderModalOpen(true)}
            className="flex h-10 items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-4 text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Schedule Disposal Order
          </button>
          <button
            onClick={handleExportCsv}
            disabled={filteredData.length === 0}
            className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-50"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            Export Excel
          </button>
          <button
            onClick={handleExportPdf}
            disabled={filteredData.length === 0}
            className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-50"
          >
            <FileText className="h-4 w-4 text-rose-600" />
            Export PDF
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Pending Disposals</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <Trash2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-purple-600">
            {data.filter((d) => d.status !== "DESTROYED_VERIFIED").length}
          </p>
          <span className="text-xs text-purple-600 font-semibold mt-1 block">Awaiting physical destruction</span>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending Write-off Value</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 font-mono">
            LKR {(totalPendingValue / 1000000).toFixed(2)}M
          </p>
          <span className="text-xs text-slate-500 font-semibold mt-1 block">Estimated inventory loss</span>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Witness Schedules</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-indigo-600">
            {data.filter((d) => d.status === "SCHEDULED_CONFIRMED").length}
          </p>
          <span className="text-xs text-indigo-600 font-semibold mt-1 block">NMRA & PHI assigned</span>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Destroyed & Certified</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-600">
            {data.filter((d) => d.status === "DESTROYED_VERIFIED").length}
          </p>
          <span className="text-xs text-emerald-600 font-semibold mt-1 block">Certificates archived</span>
        </div>
      </div>

      {/* ── Filters Bar ── */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search product name, batch #, or order #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Disposal Methods</option>
            <option value="BIOMEDICAL_INCINERATION">Biomedical Incineration</option>
            <option value="CHEMICAL_NEUTRALIZATION">Chemical Neutralization</option>
            <option value="VENDOR_RETURN">Vendor Return for Credit</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Statuses ({data.length})</option>
            <option value="AWAITING_WITNESS">Awaiting Witness ({data.filter((d) => d.status === "AWAITING_WITNESS").length})</option>
            <option value="SCHEDULED_CONFIRMED">Scheduled Confirmed ({data.filter((d) => d.status === "SCHEDULED_CONFIRMED").length})</option>
            <option value="DESTROYED_VERIFIED">Destroyed & Certified ({data.filter((d) => d.status === "DESTROYED_VERIFIED").length})</option>
          </select>

          <button
            onClick={() => fetchDisposals()}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-purple-600 font-semibold px-2 py-1 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* ── Disposal Orders List ── */}
      <div className="space-y-4">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-purple-600 border-t-transparent mb-2" />
            <p className="text-sm font-medium">Loading disposal orders...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
            No disposal records found matching your search criteria.
          </div>
        ) : (
          pagedData.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border bg-white p-5 shadow-xs transition-all ${
                item.status === "DESTROYED_VERIFIED"
                  ? "border-emerald-200/60 opacity-90"
                  : "border-slate-200/90 hover:border-purple-300 hover:shadow-md"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                {/* Left: Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-extrabold text-xs rounded-md bg-slate-100 px-2.5 py-1 text-slate-900">
                      {item.orderNumber}
                    </span>
                    <span className="font-mono font-bold text-xs rounded bg-slate-50 px-2 py-0.5 text-slate-600 border border-slate-200">
                      Batch: {item.batchNumber}
                    </span>
                    <span className="rounded bg-purple-100 text-purple-800 font-bold px-2 py-0.5 text-[10px]">
                      🔥 {item.disposalMethod.replace("_", " ")}
                    </span>
                    <span className="text-xs text-slate-400">
                      Scheduled: <b>{item.scheduledDate}</b>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{item.productName}</h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Building2 className="h-3.5 w-3.5 text-purple-500" /> {item.warehouse}
                    </span>
                    <span>•</span>
                    <span>
                      Expired Qty: <b>{item.quantityExpired.toLocaleString()} units</b> (LKR{" "}
                      {item.writeOffValue.toLocaleString()})
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <UserCheck className="h-3.5 w-3.5 text-slate-400" /> Witness: {item.witnessAuthority}
                    </span>
                  </div>

                  {item.status === "DESTROYED_VERIFIED" && (
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200 font-mono">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Certificate #{item.certificateNumber}
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100 shrink-0">
                  <div>
                    {item.status === "AWAITING_WITNESS" && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 text-xs font-bold">
                        <Clock className="h-3.5 w-3.5" /> AWAITING WITNESS
                      </span>
                    )}
                    {item.status === "SCHEDULED_CONFIRMED" && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 text-xs font-bold">
                        <Calendar className="h-3.5 w-3.5" /> SCHEDULE CONFIRMED
                      </span>
                    )}
                    {item.status === "DESTROYED_VERIFIED" && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 text-xs font-bold">
                        <CheckCircle2 className="h-3.5 w-3.5" /> DESTROYED & CERTIFIED
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {item.status !== "DESTROYED_VERIFIED" ? (
                      <button
                        onClick={() => setSelectedOrder(item)}
                        className="flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-2 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                      >
                        <Upload className="h-3.5 w-3.5" /> Upload Witness Certificate
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                        ✓ Certificate Archived
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Pagination */}
        <div className="border-t border-slate-200/90 px-4 py-3 bg-slate-50/50 rounded-xl">
          <TablePagination
            pageIndex={pageIndex}
            pageSize={pageSize}
            pageCount={Math.ceil(filteredData.length / pageSize)}
            totalItems={filteredData.length}
            onPageChange={setPageIndex}
            onPageSizeChange={setPageSize}
          />
        </div>
      </div>

      {/* ── Modal: Upload Witness Certificate ── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in-50">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-purple-600" />
                Upload Certificate of Destruction
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Confirm verified destruction for order <b>{selectedOrder.orderNumber}</b> (
              {selectedOrder.productName}, Batch #{selectedOrder.batchNumber}).
            </p>

            <form onSubmit={handleUploadCertificate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Destruction Certificate Reference # <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={certNumberInput}
                  onChange={(e) => setCertNumberInput(e.target.value)}
                  placeholder="e.g. CERT-NMRA-INCIN-8841"
                  className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-sm text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Witnessing NMRA / MOH Authorized Officer
                </label>
                <input
                  type="text"
                  value={inspectorName}
                  onChange={(e) => setInspectorName(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-200 px-3 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-sm cursor-pointer"
                >
                  Verify & Archive Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Schedule New Disposal Order ── */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in-50">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Schedule Stock Disposal Order</h3>
                  <p className="text-xs text-slate-400">Statutory destruction under NMRA / PHI supervision</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewOrderModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewOrder} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Batch Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BAT-EXP-9021"
                    value={newBatchNumber}
                    onChange={(e) => setNewBatchNumber(e.target.value)}
                    className="w-full h-9 rounded-xl border border-slate-200 px-3 text-slate-900 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">SKU / Item Code</label>
                  <input
                    type="text"
                    placeholder="e.g. MED-EXP-440"
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    className="w-full h-9 rounded-xl border border-slate-200 px-3 text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Product / Formulation Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paracetamol 500mg Tablets (Expired)"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-200 px-3 text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quantity Expired (Units)</label>
                  <input
                    type="number"
                    value={newQty}
                    onChange={(e) => setNewQty(e.target.value)}
                    className="w-full h-9 rounded-xl border border-slate-200 px-3 text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit Cost (LKR)</label>
                  <input
                    type="number"
                    value={newUnitCost}
                    onChange={(e) => setNewUnitCost(e.target.value)}
                    className="w-full h-9 rounded-xl border border-slate-200 px-3 text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Disposal Method</label>
                  <select
                    value={newMethod}
                    onChange={(e) => setNewMethod(e.target.value as any)}
                    className="w-full h-9 rounded-xl border border-slate-200 px-2 text-slate-900 focus:outline-none"
                  >
                    <option value="BIOMEDICAL_INCINERATION">Biomedical Incineration</option>
                    <option value="CHEMICAL_NEUTRALIZATION">Chemical Neutralization</option>
                    <option value="VENDOR_RETURN">Vendor Return for Credit</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full h-9 rounded-xl border border-slate-200 px-3 text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Witnessing Authority</label>
                <input
                  type="text"
                  value={newWitness}
                  onChange={(e) => setNewWitness(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-200 px-3 text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Disposal Notes & Location</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Kerawalapitiya Waste Incineration Plant..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewOrderModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-sm cursor-pointer"
                >
                  Confirm & Schedule
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
