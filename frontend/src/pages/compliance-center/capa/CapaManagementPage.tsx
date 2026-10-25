import React, { useState, useMemo } from "react";
import {
  CheckSquare,
  Search,
  Filter,
  Plus,
  FileSpreadsheet,
  Download,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  Calendar,
  Eye,
  RefreshCw,
  Share2,
  X,
  FileText,
  User,
  ArrowUpDown,
} from "lucide-react";
import { TablePagination } from "../../../components/common/TablePagination";
import { exportToCsv } from "../../../utils/reportExportUtils";
import { toast } from "sonner";
import {
  RegulatoryRecord,
  DEFAULT_DEVIATIONS_AND_CAPA,
  generateSha256,
  downloadCertifiedPdf,
  InspectionDossierModal,
} from "../records/complianceRecordsShared";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const CapaManagementPage = () => {
  // Initialize with seeded CAPA actions
  const [capaRecords, setCapaRecords] = useState<RegulatoryRecord[]>(() =>
    DEFAULT_DEVIATIONS_AND_CAPA.filter((item) => item.category === "CAPA_ACTION")
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedRecord, setSelectedRecord] = useState<RegulatoryRecord | null>(null);

  // New CAPA Dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newClassification, setNewClassification] = useState("Preventive & Corrective Action");
  const [newSeverity, setNewSeverity] = useState("MAJOR");
  const [newFacility, setNewFacility] = useState("Colombo Central Medical Warehouse");
  const [newLinkedDev, setNewLinkedDev] = useState("");
  const [newRootCause, setNewRootCause] = useState("");
  const [newVerification, setNewVerification] = useState("");
  const [newTargetDate, setNewTargetDate] = useState("2026-11-20");
  const [newOfficer, setNewOfficer] = useState("Dr. Nimal Senanayake (Quality Assurance Manager)");

  // Pagination
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const filteredCapa = useMemo(() => {
    return capaRecords.filter((item) => {
      const matchesStatus =
        statusFilter === "ALL" || item.status === statusFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        item.subject.toLowerCase().includes(q) ||
        item.recordNumber.toLowerCase().includes(q) ||
        item.performedBy.toLowerCase().includes(q) ||
        String(item.metadata["Linked Deviation"] || "").toLowerCase().includes(q) ||
        String(item.metadata["Verification Method"] || "").toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [capaRecords, statusFilter, searchQuery]);

  const pagedRecords = useMemo(() => {
    const start = pageIndex * pageSize;
    return filteredCapa.slice(start, start + pageSize);
  }, [filteredCapa, pageIndex, pageSize]);

  // KPI Calculations
  const totalCount = capaRecords.length;
  const resolvedCount = capaRecords.filter((c) => c.status === "RESOLVED").length;
  const inProgressCount = capaRecords.filter(
    (c) => c.status === "INVESTIGATION" || c.status === "CAPA_INITIATED"
  ).length;

  const handleExportCsv = () => {
    const headers = [
      "CAPA Ref #",
      "Timestamp",
      "Subject",
      "Classification",
      "Assigned Lead",
      "Facility",
      "Target Date",
      "Status",
      "Linked Deviation",
      "SHA-256 Hash",
    ];
    const rows = filteredCapa.map((r) => [
      r.recordNumber,
      r.timestamp,
      r.subject,
      String(r.metadata["CAPA Classification"] || "QMS Action"),
      r.performedBy,
      r.facility,
      String(r.metadata["Target Completion"] || "N/A"),
      r.status,
      String(r.metadata["Linked Deviation"] || "N/A"),
      r.sha256Hash,
    ]);
    exportToCsv("capa-management-register", headers, rows);
    toast.success("CAPA register exported to CSV successfully");
  };

  const handleExportPdf = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 297, 26, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("CEYLON MEDEX PHARMACEUTICALS - CAPA ACTIONS REGISTER", 14, 12);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      `QMS Corrective & Preventive Action Dossier • Generated ${new Date().toISOString()} • NMRA & GDP Compliance`,
      14,
      18
    );

    const rows = filteredCapa.map((r) => [
      r.recordNumber,
      r.timestamp.slice(0, 16),
      r.subject.slice(0, 50) + (r.subject.length > 50 ? "..." : ""),
      String(r.metadata["CAPA Classification"] || "QMS Action"),
      r.performedBy,
      String(r.metadata["Target Completion"] || "N/A"),
      r.status,
      r.sha256Hash.slice(0, 16) + "...",
    ]);

    autoTable(doc, {
      startY: 32,
      head: [
        [
          "CAPA Ref #",
          "Timestamp",
          "Objective / Title",
          "Classification",
          "Assigned Lead",
          "Target Date",
          "Status",
          "Hash",
        ],
      ],
      body: rows,
      theme: "grid",
      headStyles: {
        fillColor: [16, 185, 129], // emerald-600
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: "bold",
      },
      bodyStyles: {
        fontSize: 7.5,
      },
    });

    doc.save(`CAPA_REGISTER_EXPORT_${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success("CAPA dossier PDF generated");
  };

  const handleCreateCapa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const idSuffix = Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC";
    const recNumber = `CAPA-2026-${idSuffix}`;
    const hash = generateSha256(`${recNumber}-${newTitle}-${dateStr}-${newOfficer}`);

    const newRecord: RegulatoryRecord = {
      id: `capa-${idSuffix}`,
      recordNumber: recNumber,
      timestamp: dateStr,
      category: "CAPA_ACTION",
      subject: `CAPA: ${newTitle}`,
      authority: "QA & Compliance Oversight Committee",
      facility: newFacility,
      performedBy: newOfficer,
      sha256Hash: hash,
      status: "RESOLVED",
      metadata: {
        "CAPA Classification": newClassification,
        "Target Completion": newTargetDate,
        "Verification Method": newVerification || "Continuous monitoring assay & secondary audit approval",
        "Linked Deviation": newLinkedDev || "DEV-2026-GENERAL",
        "Assigned Lead": newOfficer,
        "Root Cause Finding": newRootCause || "Root cause documented and addressed via SOP revision",
      },
    };

    setCapaRecords((prev) => [newRecord, ...prev]);
    setIsDialogOpen(false);
    setNewTitle("");
    setNewRootCause("");
    setNewVerification("");
    setNewLinkedDev("");
    toast.success(`CAPA ${recNumber} created and cryptographically signed`);
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in-50 duration-300">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/20">
              <CheckSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Compliance Center • Quality Management System (QMS)
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                CAPA Actions & Preventive Register
              </h1>
            </div>
          </div>
          <p className="mt-1 text-sm text-slate-500 pl-12">
            Track root cause investigations, corrective action plans, preventive protocols, and closure verifications under NMRA & GMP standards.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsDialogOpen(true)}
            className="flex h-10 items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Initiate New CAPA
          </button>
          <button
            onClick={handleExportCsv}
            disabled={filteredCapa.length === 0}
            className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            Export Excel
          </button>
          <button
            onClick={handleExportPdf}
            className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
          >
            <Download className="h-4 w-4 text-emerald-600" />
            Export Dossier (PDF)
          </button>
        </div>
      </div>

      {/* ── Executive KPI Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total CAPAs */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total CAPA Workflows</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckSquare className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{totalCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Active Quality Actions</p>
        </div>

        {/* Resolved Actions */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Resolved & Verified</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">{resolvedCount}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">100% Closure Verification</p>
        </div>

        {/* In Investigation */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Under Investigation</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{inProgressCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Open Root Cause Reviews</p>
        </div>

        {/* Audit Quality SLA */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Audit Proof SLA</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-indigo-600 mt-2">100%</p>
          <p className="text-[11px] text-slate-500 mt-0.5">WORM Cryptographically Sealed</p>
        </div>
      </div>

      {/* ── Filter Toolbar ── */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search CAPA title, ID, assigned lead, or linked deviation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-1.5">
            {[
              { key: "ALL", label: "All" },
              { key: "RESOLVED", label: "Resolved" },
              { key: "INVESTIGATION", label: "Under Review" },
            ].map((pill) => (
              <button
                key={pill.key}
                onClick={() => setStatusFilter(pill.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === pill.key
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-800">{filteredCapa.length}</strong> CAPA Records
          </span>
        </div>
      </div>

      {/* ── CAPA Data Table ── */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200/90 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3.5">CAPA Reference & Date</th>
                <th className="px-5 py-3.5">Objective & Root Cause</th>
                <th className="px-5 py-3.5">Assigned QA Lead & Facility</th>
                <th className="px-5 py-3.5">Target Completion</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCapa.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No CAPA records found matching your criteria.
                  </td>
                </tr>
              ) : (
                pagedRecords.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-mono font-bold text-xs text-emerald-700">{row.recordNumber}</p>
                      <span className="text-[11px] text-slate-400 font-medium">{row.timestamp}</span>
                      {row.metadata["Linked Deviation"] && (
                        <span className="mt-1 inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 font-mono">
                          Linked: {String(row.metadata["Linked Deviation"])}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 max-w-sm">
                      <p className="font-bold text-slate-900 text-xs leading-snug">{row.subject}</p>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        {String(row.metadata["CAPA Classification"] || "Preventive Protocol")}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        {row.performedBy}
                      </p>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Building2 className="h-3 w-3" /> {row.facility}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {String(row.metadata["Target Completion"] || "Open")}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {String(row.metadata["Verification Method"] || "").slice(0, 30)}...
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          row.status === "RESOLVED"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300/60"
                            : "bg-amber-100 text-amber-800 border border-amber-300/60"
                        }`}
                      >
                        <CheckCircle2 className="h-3 w-3" /> {row.status}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 block mt-1">
                        SHA-256: {row.sha256Hash.slice(0, 10)}...
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedRecord(row)}
                          className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5 text-emerald-600" /> Inspect Dossier
                        </button>
                        <button
                          onClick={() => downloadCertifiedPdf(row)}
                          title="Download Certified PDF"
                          className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t border-slate-200/90 px-4 py-3 bg-slate-50/50">
          <TablePagination
            pageIndex={pageIndex}
            pageSize={pageSize}
            pageCount={Math.ceil(filteredCapa.length / pageSize)}
            totalItems={filteredCapa.length}
            onPageChange={setPageIndex}
            onPageSizeChange={setPageSize}
          />
        </div>
      </div>

      {/* ── Inspection Dossier Modal ── */}
      <InspectionDossierModal
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />

      {/* ── Modal: Initiate New CAPA ── */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in-50">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <CheckSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Initiate Corrective & Preventive Action (CAPA)</h3>
                  <p className="text-xs text-slate-400">Quality Management System • Good Manufacturing Practices</p>
                </div>
              </div>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCapa} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  CAPA Objective / Action Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Install redundant IoT temperature sensors & alert gateway on refrigerator 02..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Classification</label>
                  <select
                    value={newClassification}
                    onChange={(e) => setNewClassification(e.target.value)}
                    className="w-full h-9 rounded-xl border border-slate-200 px-2 text-slate-900 focus:outline-none"
                  >
                    <option value="Preventive & Corrective Action">Preventive & Corrective Action</option>
                    <option value="Corrective Action Only">Corrective Action Only</option>
                    <option value="Supplier Quality Audit Action">Supplier Quality Audit Action</option>
                    <option value="Facility Upgrade Protocol">Facility Upgrade Protocol</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Linked Deviation Reference</label>
                  <input
                    type="text"
                    placeholder="e.g. DEV-2026-0042"
                    value={newLinkedDev}
                    onChange={(e) => setNewLinkedDev(e.target.value)}
                    className="w-full h-9 rounded-xl border border-slate-200 px-3 text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Completion Date</label>
                  <input
                    type="date"
                    value={newTargetDate}
                    onChange={(e) => setNewTargetDate(e.target.value)}
                    className="w-full h-9 rounded-xl border border-slate-200 px-3 text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Facility / Warehouse</label>
                  <input
                    type="text"
                    value={newFacility}
                    onChange={(e) => setNewFacility(e.target.value)}
                    className="w-full h-9 rounded-xl border border-slate-200 px-3 text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Root Cause Finding & Corrective Roadmap
                </label>
                <textarea
                  rows={3}
                  placeholder="Summarize root causes discovered, corrective steps, and procedural safeguards..."
                  value={newRootCause}
                  onChange={(e) => setNewRootCause(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Verification Method & Testing Criteria
                </label>
                <input
                  type="text"
                  placeholder="e.g. 72-Hour continuous temperature logger validation assay"
                  value={newVerification}
                  onChange={(e) => setNewVerification(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-200 px-3 text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned QA Lead</label>
                <input
                  type="text"
                  value={newOfficer}
                  onChange={(e) => setNewOfficer(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-200 px-3 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm cursor-pointer"
                >
                  Seal & Issue CAPA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CapaManagementPage;
