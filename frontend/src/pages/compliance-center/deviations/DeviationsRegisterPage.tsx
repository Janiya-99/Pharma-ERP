import React, { useState, useMemo } from "react";
import {
  AlertTriangle,
  Search,
  Filter,
  Plus,
  FileSpreadsheet,
  Download,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Building2,
  Calendar,
  Eye,
  RefreshCw,
  Share2,
  X,
  FileText,
  User,
  AlertOctagon,
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

export const DeviationsRegisterPage = () => {
  // Initialize with seeded Deviations
  const [deviationRecords, setDeviationRecords] = useState<RegulatoryRecord[]>(() =>
    DEFAULT_DEVIATIONS_AND_CAPA.filter((item) => item.category === "DEVIATION_REPORT")
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [selectedRecord, setSelectedRecord] = useState<RegulatoryRecord | null>(null);

  // New Deviation Dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSeverity, setNewSeverity] = useState("MAJOR");
  const [newFacility, setNewFacility] = useState("Colombo Central Medical Warehouse (Cold-Chain Hub)");
  const [newActionTaken, setNewActionTaken] = useState("");
  const [newRootCause, setNewRootCause] = useState("");
  const [newLinkedCapa, setNewLinkedCapa] = useState("");
  const [newOfficer, setNewOfficer] = useState("Dr. Nimal Senanayake (Quality Assurance Manager)");

  // Pagination
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const filteredDeviations = useMemo(() => {
    return deviationRecords.filter((item) => {
      const severity = String(item.metadata["Severity Level"] || "MAJOR").toUpperCase();
      const matchesSeverity =
        severityFilter === "ALL" || severity === severityFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        item.subject.toLowerCase().includes(q) ||
        item.recordNumber.toLowerCase().includes(q) ||
        item.performedBy.toLowerCase().includes(q) ||
        item.facility.toLowerCase().includes(q) ||
        String(item.metadata["Immediate Action Taken"] || "").toLowerCase().includes(q) ||
        String(item.metadata["CAPA Reference"] || "").toLowerCase().includes(q);
      return matchesSeverity && matchesSearch;
    });
  }, [deviationRecords, severityFilter, searchQuery]);

  const pagedRecords = useMemo(() => {
    const start = pageIndex * pageSize;
    return filteredDeviations.slice(start, start + pageSize);
  }, [filteredDeviations, pageIndex, pageSize]);

  // KPI Calculations
  const totalCount = deviationRecords.length;
  const criticalCount = deviationRecords.filter(
    (d) => String(d.metadata["Severity Level"]).toUpperCase() === "CRITICAL"
  ).length;
  const majorCount = deviationRecords.filter(
    (d) => String(d.metadata["Severity Level"]).toUpperCase() === "MAJOR"
  ).length;
  const capaLinkedCount = deviationRecords.filter((d) => Boolean(d.metadata["CAPA Reference"])).length;

  const handleExportCsv = () => {
    const headers = [
      "Deviation Ref #",
      "Timestamp",
      "Subject",
      "Severity",
      "Immediate Action Taken",
      "Assigned Lead",
      "Facility",
      "Status",
      "CAPA Reference",
      "SHA-256 Hash",
    ];
    const rows = filteredDeviations.map((r) => [
      r.recordNumber,
      r.timestamp,
      r.subject,
      String(r.metadata["Severity Level"] || "MAJOR"),
      String(r.metadata["Immediate Action Taken"] || "N/A"),
      r.performedBy,
      r.facility,
      r.status,
      String(r.metadata["CAPA Reference"] || "N/A"),
      r.sha256Hash,
    ]);
    exportToCsv("pharmaceutical-deviations-register", headers, rows);
    toast.success("Deviations register exported to CSV successfully");
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
    doc.text("CEYLON MEDEX PHARMACEUTICALS - PHARMACEUTICAL DEVIATIONS DOSSIER", 14, 12);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      `GMP Non-Conformance & Deviation Audit Trail • Generated ${new Date().toISOString()} • NMRA & GDP Compliance`,
      14,
      18
    );

    const rows = filteredDeviations.map((r) => [
      r.recordNumber,
      r.timestamp.slice(0, 16),
      r.subject.slice(0, 50) + (r.subject.length > 50 ? "..." : ""),
      String(r.metadata["Severity Level"] || "MAJOR"),
      r.performedBy,
      String(r.metadata["CAPA Reference"] || "N/A"),
      r.status,
      r.sha256Hash.slice(0, 16) + "...",
    ]);

    autoTable(doc, {
      startY: 32,
      head: [
        [
          "Deviation Ref #",
          "Timestamp",
          "Subject / Incident",
          "Severity",
          "Logged By",
          "CAPA Ref",
          "Status",
          "Hash",
        ],
      ],
      body: rows,
      theme: "grid",
      headStyles: {
        fillColor: [217, 119, 6], // amber-600
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: "bold",
      },
      bodyStyles: {
        fontSize: 7.5,
      },
    });

    doc.save(`DEVIATIONS_REGISTER_EXPORT_${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success("Deviations dossier PDF generated");
  };

  const handleCreateDeviation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const idSuffix = Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC";
    const recNumber = `DEV-2026-${idSuffix}`;
    const hash = generateSha256(`${recNumber}-${newTitle}-${dateStr}-${newOfficer}`);

    const newRecord: RegulatoryRecord = {
      id: `dev-${idSuffix}`,
      recordNumber: recNumber,
      timestamp: dateStr,
      category: "DEVIATION_REPORT",
      subject: `Quality Deviation: ${newTitle}`,
      authority: "Internal Quality Assurance Department",
      facility: newFacility,
      performedBy: newOfficer,
      sha256Hash: hash,
      status: "INVESTIGATION",
      metadata: {
        "Deviation Type": "GMP Environmental / Quality Excursion",
        "Severity Level": newSeverity,
        "Immediate Action Taken": newActionTaken || "Immediate batch isolation and temperature chamber inspection",
        "CAPA Reference": newLinkedCapa || `CAPA-2026-${idSuffix}`,
        "Root Cause Analysis": newRootCause || "Root cause under primary QA investigation",
        "Regulatory Notification": "NMRA Good Distribution Practices (GDP) Cell",
      },
    };

    setDeviationRecords((prev) => [newRecord, ...prev]);
    setIsDialogOpen(false);
    setNewTitle("");
    setNewActionTaken("");
    setNewRootCause("");
    setNewLinkedCapa("");
    toast.success(`Deviation ${recNumber} logged and cryptographically signed`);
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in-50 duration-300">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-600">
                Compliance Center • Pharmacovigilance & Quality Assurance
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Pharmaceutical Deviations Register
              </h1>
            </div>
          </div>
          <p className="mt-1 text-sm text-slate-500 pl-12">
            Log, assess, and investigate critical, major, and minor pharmaceutical deviations, temperature excursions, and GMP non-conformances.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsDialogOpen(true)}
            className="flex h-10 items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-4 text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Log Quality Deviation
          </button>
          <button
            onClick={handleExportCsv}
            disabled={filteredDeviations.length === 0}
            className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <FileSpreadsheet className="h-4 w-4 text-amber-600" />
            Export Excel
          </button>
          <button
            onClick={handleExportPdf}
            className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
          >
            <Download className="h-4 w-4 text-amber-600" />
            Export Dossier (PDF)
          </button>
        </div>
      </div>

      {/* ── Executive KPI Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Deviations */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Deviations</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{totalCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Recorded Incidents</p>
        </div>

        {/* Critical Severity */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Critical Severity</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <AlertOctagon className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600 mt-2">{criticalCount}</p>
          <p className="text-[11px] text-rose-600 font-semibold mt-0.5">Requires Immediate Batch Hold</p>
        </div>

        {/* Major Severity */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Major Incidents</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">{majorCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Under Investigation</p>
        </div>

        {/* CAPA Linkage */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">CAPA Linkage</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">
            {totalCount > 0 ? `${Math.round((capaLinkedCount / totalCount) * 100)}%` : "100%"}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Covered by Preventive Plan</p>
        </div>
      </div>

      {/* ── Filter Toolbar ── */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search deviation title, DEV #, batch, officer, or action..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-1.5">
            {[
              { key: "ALL", label: "All" },
              { key: "CRITICAL", label: "Critical" },
              { key: "MAJOR", label: "Major" },
              { key: "MINOR", label: "Minor" },
            ].map((pill) => (
              <button
                key={pill.key}
                onClick={() => setSeverityFilter(pill.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  severityFilter === pill.key
                    ? "bg-amber-500 text-white shadow-xs"
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
            Showing <strong className="text-slate-800">{filteredDeviations.length}</strong> Deviations
          </span>
        </div>
      </div>

      {/* ── Deviations Data Table ── */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200/90 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3.5">Deviation Ref & Timestamp</th>
                <th className="px-5 py-3.5">Severity & Incident Summary</th>
                <th className="px-5 py-3.5">Immediate Action Taken</th>
                <th className="px-5 py-3.5">Assigned Officer & Scope</th>
                <th className="px-5 py-3.5">CAPA Link</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDeviations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No deviation records found matching your criteria.
                  </td>
                </tr>
              ) : (
                pagedRecords.map((row) => {
                  const severity = String(row.metadata["Severity Level"] || "MAJOR").toUpperCase();
                  return (
                    <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-mono font-bold text-xs text-amber-700">{row.recordNumber}</p>
                        <span className="text-[11px] text-slate-400 font-medium">{row.timestamp}</span>
                      </td>
                      <td className="px-5 py-4 max-w-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              severity === "CRITICAL"
                                ? "bg-rose-100 text-rose-800 border border-rose-300/60"
                                : severity === "MAJOR"
                                ? "bg-amber-100 text-amber-800 border border-amber-300/60"
                                : "bg-blue-100 text-blue-800 border border-blue-300/60"
                            }`}
                          >
                            {severity}
                          </span>
                        </div>
                        <p className="font-bold text-slate-900 text-xs leading-snug">{row.subject}</p>
                      </td>
                      <td className="px-5 py-4 max-w-xs">
                        <p className="text-xs text-slate-700 font-medium line-clamp-2">
                          {String(row.metadata["Immediate Action Taken"] || "Batch stability quarantine enforced.")}
                        </p>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <p className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          {row.performedBy}
                        </p>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Building2 className="h-3 w-3" /> {row.facility}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {row.metadata["CAPA Reference"] ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {String(row.metadata["CAPA Reference"])}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No CAPA Required</span>
                        )}
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
                            <Eye className="h-3.5 w-3.5 text-amber-600" /> Inspect Dossier
                          </button>
                          <button
                            onClick={() => downloadCertifiedPdf(row)}
                            title="Download Certified PDF"
                            className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t border-slate-200/90 px-4 py-3 bg-slate-50/50">
          <TablePagination
            pageIndex={pageIndex}
            pageSize={pageSize}
            pageCount={Math.ceil(filteredDeviations.length / pageSize)}
            totalItems={filteredDeviations.length}
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

      {/* ── Modal: Log Quality Deviation ── */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in-50">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Log Pharmaceutical Quality Deviation</h3>
                  <p className="text-xs text-slate-400">Pharmacovigilance & Good Distribution Practices</p>
                </div>
              </div>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDeviation} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Deviation Subject / Non-Conformance Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Temperature excursion in cold storage room 02 during transformer transfer..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Severity Level</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value)}
                    className="w-full h-9 rounded-xl border border-slate-200 px-2 text-slate-900 focus:outline-none"
                  >
                    <option value="CRITICAL">CRITICAL (Immediate Batch Quarantine)</option>
                    <option value="MAJOR">MAJOR (Investigation Required)</option>
                    <option value="MINOR">MINOR (Documentation Only)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Facility / Warehouse Area</label>
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
                  Immediate Containment Action Taken <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Generator backup initiated, all affected vaccine batches quarantined for QA testing..."
                  value={newActionTaken}
                  onChange={(e) => setNewActionTaken(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-200 px-3 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned QA Lead</label>
                  <input
                    type="text"
                    value={newOfficer}
                    onChange={(e) => setNewOfficer(e.target.value)}
                    className="w-full h-9 rounded-xl border border-slate-200 px-3 text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Initiate CAPA Reference</label>
                  <input
                    type="text"
                    placeholder="e.g. CAPA-2026-0021"
                    value={newLinkedCapa}
                    onChange={(e) => setNewLinkedCapa(e.target.value)}
                    className="w-full h-9 rounded-xl border border-slate-200 px-3 text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Root Cause Investigation Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Summarize initial findings, equipment telemetry, or packaging inspection observations..."
                  value={newRootCause}
                  onChange={(e) => setNewRootCause(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-slate-900 focus:outline-none"
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
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-sm cursor-pointer"
                >
                  Seal & Log Deviation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviationsRegisterPage;
